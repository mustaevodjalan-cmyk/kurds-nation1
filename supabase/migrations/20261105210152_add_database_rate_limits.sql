/*
# Database-level abuse protection (rate limits)

Plain-English summary
Limits how often a single client (identified only by a salted hash of its network address) can register citizens, send messages, file disputes, post listings, and seal jury verdicts. Enforcement happens in the database, so it cannot be bypassed from the browser.

1. New private tables (locked to everyone except database functions)
- `private_config`: key/value store holding one random secret, `pepper`, generated once. Re-running this migration never rotates it.
- `rate_events`: one row per counted action (bucket name, hashed client key, timestamp). Old rows are pruned automatically after two days per client and bucket.

2. New helper functions (not callable by app users)
- `client_key()`: derives the caller key from the `cf-connecting-ip` header, else the first `x-forwarded-for` address, else 'unknown'. The result is `sha256(ip || pepper)`. The raw IP is never stored or logged.
- `check_rate(bucket, max, window)`: counts recent events for the caller in that bucket. If the count has reached the limit it raises `rate_limited`; otherwise it records one event.

3. Limits applied
- Citizen registration: 3 per 24 hours (trigger on `citizens` inserts).
- Messages: 20 per minute (trigger on `messages` inserts).
- open_dispute: 3 per 24 hours.
- post_listing: 5 per 24 hours.
- commit_jury_verdict: 20 per hour.

4. Text length limits
- Titles, summaries and descriptions on listings and disputes already had length checks (title up to 120, description and summary up to 1000). No change was needed.

5. Security
- `private_config` and `rate_events`: RLS enabled, no policies, all privileges revoked from anon and authenticated.
- Helper and trigger functions are SECURITY DEFINER with a fixed search_path, and EXECUTE is revoked from PUBLIC, anon and authenticated.
- The three existing functions are replaced with the same signatures, so their existing grants are unchanged. Their bodies are otherwise identical; only the rate check was added at the top.

Important notes
- If the platform does not forward a client address header, every such client shares the 'unknown' bucket. Production traffic through the normal gateway forwards the header.
- The advisory lock in check_rate serializes concurrent checks for the same client and bucket so bursts cannot slip past the limit.
*/

CREATE TABLE IF NOT EXISTS public.private_config (
  key text PRIMARY KEY,
  value text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.rate_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bucket text NOT NULL,
  key_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_events_bucket_key_created_idx
  ON public.rate_events (bucket, key_hash, created_at);

ALTER TABLE public.private_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.private_config FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.rate_events FROM PUBLIC, anon, authenticated;

INSERT INTO public.private_config (key, value)
VALUES (
  'pepper',
  encode(sha256(convert_to(gen_random_uuid()::text || gen_random_uuid()::text, 'utf8')), 'hex')
)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.client_key()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_headers json;
  v_ip text;
  v_pepper text;
BEGIN
  v_headers := NULLIF(current_setting('request.headers', true), '')::json;
  v_ip := COALESCE(
    NULLIF(trim(v_headers->>'cf-connecting-ip'), ''),
    NULLIF(trim(split_part(v_headers->>'x-forwarded-for', ',', 1)), ''),
    'unknown'
  );
  SELECT value INTO v_pepper FROM public.private_config WHERE key = 'pepper';
  RETURN encode(sha256(convert_to(v_ip || v_pepper, 'utf8')), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION public.check_rate(p_bucket text, p_max integer, p_window interval)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key text := public.client_key();
  v_count integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_bucket || ':' || v_key));

  DELETE FROM public.rate_events
  WHERE bucket = p_bucket AND key_hash = v_key AND created_at < now() - interval '2 days';

  SELECT count(*) INTO v_count FROM public.rate_events
  WHERE bucket = p_bucket AND key_hash = v_key AND created_at > now() - p_window;
  IF v_count >= p_max THEN
    RAISE EXCEPTION 'rate_limited';
  END IF;

  INSERT INTO public.rate_events (bucket, key_hash) VALUES (p_bucket, v_key);
END;
$$;

CREATE OR REPLACE FUNCTION public.limit_citizen_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.check_rate('citizen_insert', 3, interval '24 hours');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.limit_message_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.check_rate('message_insert', 20, interval '1 minute');
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.client_key() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_rate(text, integer, interval) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.limit_citizen_insert() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.limit_message_insert() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS limit_citizen_insert_trg ON public.citizens;
CREATE TRIGGER limit_citizen_insert_trg
BEFORE INSERT ON public.citizens
FOR EACH ROW EXECUTE FUNCTION public.limit_citizen_insert();

DROP TRIGGER IF EXISTS limit_message_insert_trg ON public.messages;
CREATE TRIGGER limit_message_insert_trg
BEFORE INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.limit_message_insert();

CREATE OR REPLACE FUNCTION public.open_dispute(p_owner_token uuid, p_kind text, p_title text, p_summary text, p_amount_roj integer, p_region text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_citizen bigint;
v_recent integer;
v_id uuid;
BEGIN
PERFORM public.check_rate('open_dispute', 3, interval '24 hours');

SELECT citizen_number INTO v_citizen FROM public.citizens WHERE owner_token = p_owner_token;
IF NOT FOUND THEN
RAISE EXCEPTION 'citizen not found';
END IF;

SELECT count(*) INTO v_recent FROM public.disputes
WHERE citizen_number = v_citizen AND created_at > now() - interval '24 hours';
IF v_recent >= 3 THEN
RAISE EXCEPTION 'daily filing limit reached';
END IF;

INSERT INTO public.disputes (kind, title, summary, amount_roj, region, citizen_number)
VALUES (p_kind, p_title, p_summary, p_amount_roj, p_region, v_citizen)
RETURNING id INTO v_id;

IF p_kind = 'arbitration' THEN
INSERT INTO public.dispute_jurors (dispute_id, slot, juror_label, citizen_number)
SELECT v_id,
row_number() OVER (ORDER BY random())::smallint,
upper(left(md5(v_id::text || c.citizen_number::text), 4)),
c.citizen_number
FROM (
SELECT citizen_number
FROM public.citizens
WHERE citizen_number <> v_citizen
ORDER BY (rank = 'history_keeper') DESC, random()
LIMIT 3
) c;

IF (SELECT count(*) FROM public.dispute_jurors WHERE dispute_id = v_id) < 3 THEN
RAISE EXCEPTION 'not enough citizens to seat a jury';
END IF;
END IF;

RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.post_listing(p_owner_token uuid, p_kind text, p_title text, p_organization text, p_region text, p_description text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_citizen bigint;
v_recent integer;
v_id uuid;
BEGIN
PERFORM public.check_rate('post_listing', 5, interval '24 hours');

SELECT citizen_number INTO v_citizen FROM public.citizens WHERE owner_token = p_owner_token;
IF NOT FOUND THEN
RAISE EXCEPTION 'citizen not found';
END IF;

SELECT count(*) INTO v_recent FROM public.listings
WHERE citizen_number = v_citizen AND created_at > now() - interval '24 hours';
IF v_recent >= 5 THEN
RAISE EXCEPTION 'daily posting limit reached';
END IF;

INSERT INTO public.listings (kind, title, organization, region, description, citizen_number)
VALUES (p_kind, p_title, p_organization, p_region, p_description, v_citizen)
RETURNING id INTO v_id;
RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.commit_jury_verdict(p_owner_token uuid, p_dispute_id uuid, p_commitment text, p_stake integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_citizen bigint;
v_balance integer;
v_kind text;
v_status text;
v_seat public.dispute_jurors%ROWTYPE;
BEGIN
PERFORM public.check_rate('commit_jury_verdict', 20, interval '1 hour');

SELECT citizen_number, balance_roj INTO v_citizen, v_balance
FROM public.citizens WHERE owner_token = p_owner_token FOR UPDATE;
IF NOT FOUND THEN
RAISE EXCEPTION 'citizen not found';
END IF;

SELECT kind, status INTO v_kind, v_status
FROM public.disputes WHERE id = p_dispute_id FOR UPDATE;
IF NOT FOUND THEN
RAISE EXCEPTION 'case not found';
END IF;
IF v_kind <> 'arbitration' OR v_status = 'resolved' THEN
RAISE EXCEPTION 'voting is closed for this case';
END IF;

SELECT * INTO v_seat FROM public.dispute_jurors
WHERE dispute_id = p_dispute_id AND citizen_number = v_citizen FOR UPDATE;
IF NOT FOUND THEN
RAISE EXCEPTION 'only seated jurors can vote';
END IF;
IF v_seat.verdict_commit IS NOT NULL THEN
RAISE EXCEPTION 'verdict already sealed';
END IF;
IF p_stake < 10 OR p_stake > 1000 THEN
RAISE EXCEPTION 'stake must be between 10 and 1000 $ROJ';
END IF;
IF v_balance < p_stake THEN
RAISE EXCEPTION 'not enough $ROJ to stake';
END IF;

UPDATE public.citizens SET balance_roj = balance_roj - p_stake WHERE citizen_number = v_citizen;
UPDATE public.dispute_jurors
SET verdict_commit = p_commitment, stake_roj = p_stake, committed_at = now()
WHERE dispute_id = p_dispute_id AND slot = v_seat.slot;
END;
$function$;
