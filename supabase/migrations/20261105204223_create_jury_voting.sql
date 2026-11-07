/*
# Jury voting: sealed verdicts and $ROJ staking

1. Table changes
- disputes: verdict ('buyer' or 'seller', set only at resolution) and resolved_at.
- dispute_jurors: verdict_commit (a SHA-256 hash of verdict plus a secret salt), revealed_verdict (kept private until resolution), revealed_at, committed_at, stake_roj (staked $ROJ), payout_roj (set at resolution).

2. How a case is decided
- Commit: each seated juror seals a hash of their verdict and stakes between 10 and 1000 $ROJ. The stake is taken from their balance immediately.
- Reveal: once all jurors have sealed, each juror reveals verdict and salt. The database checks the reveal against the sealed hash.
- Resolution: when every juror has revealed, the majority verdict wins. Losing stakes are split equally among the winners, and any remainder goes to the first winner. Winners get their own stake back plus their share.
- Total $ROJ is conserved: nothing is minted or burned.

3. Security
- Clients can read verdict commitments, reveal timestamps, stakes and payouts. They cannot read revealed verdicts or juror identities.
- commit_jury_verdict, reveal_jury_verdict and my_jury_seats are SECURITY DEFINER and authorize the caller only by owner token. The caller must hold a seat on that case.
- resolve_jury_case is internal and not callable by clients.
- Staking is limited by a balance check, so balances cannot go negative.

4. Notes
- Verdicts are sealed by hash commitments, not by encryption. Hidden until reveal.
- A juror who never reveals blocks resolution. No timeout is applied yet.
*/

ALTER TABLE public.disputes
  ADD COLUMN IF NOT EXISTS verdict text CHECK (verdict IN ('buyer', 'seller')),
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz;

ALTER TABLE public.dispute_jurors
  ADD COLUMN IF NOT EXISTS verdict_commit text CHECK (verdict_commit IS NULL OR verdict_commit ~ '^[0-9a-f]{64}$'),
  ADD COLUMN IF NOT EXISTS revealed_verdict text CHECK (revealed_verdict IN ('buyer', 'seller')),
  ADD COLUMN IF NOT EXISTS committed_at timestamptz,
  ADD COLUMN IF NOT EXISTS revealed_at timestamptz,
  ADD COLUMN IF NOT EXISTS stake_roj integer NOT NULL DEFAULT 0 CHECK (stake_roj >= 0),
  ADD COLUMN IF NOT EXISTS payout_roj integer CHECK (payout_roj >= 0);

GRANT SELECT (verdict, resolved_at) ON public.disputes TO anon, authenticated;
GRANT SELECT (verdict_commit, committed_at, revealed_at, stake_roj, payout_roj) ON public.dispute_jurors TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.resolve_jury_case(p_dispute_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_buyer integer;
  v_seller integer;
  v_winner text;
  v_winners integer;
  v_loser_pool integer;
  v_share integer;
  v_remainder integer;
  v_first_winner smallint;
BEGIN
  SELECT count(*) FILTER (WHERE revealed_verdict = 'buyer'),
         count(*) FILTER (WHERE revealed_verdict = 'seller')
    INTO v_buyer, v_seller
    FROM public.dispute_jurors WHERE dispute_id = p_dispute_id;

  v_winner := CASE WHEN v_buyer > v_seller THEN 'buyer' ELSE 'seller' END;

  SELECT count(*) FILTER (WHERE revealed_verdict = v_winner),
         COALESCE(sum(stake_roj) FILTER (WHERE revealed_verdict IS DISTINCT FROM v_winner), 0)
    INTO v_winners, v_loser_pool
    FROM public.dispute_jurors WHERE dispute_id = p_dispute_id;

  v_share := v_loser_pool / v_winners;
  v_remainder := v_loser_pool - v_share * v_winners;

  SELECT min(slot) INTO v_first_winner
    FROM public.dispute_jurors
    WHERE dispute_id = p_dispute_id AND revealed_verdict = v_winner;

  UPDATE public.dispute_jurors j
  SET payout_roj = CASE
    WHEN j.revealed_verdict = v_winner
      THEN j.stake_roj + v_share + CASE WHEN j.slot = v_first_winner THEN v_remainder ELSE 0 END
    ELSE 0
  END
  WHERE j.dispute_id = p_dispute_id;

  UPDATE public.citizens c
  SET balance_roj = c.balance_roj + j.payout_roj
  FROM public.dispute_jurors j
  WHERE j.dispute_id = p_dispute_id
    AND j.citizen_number = c.citizen_number
    AND j.payout_roj > 0;

  UPDATE public.disputes
  SET status = 'resolved', verdict = v_winner, resolved_at = now()
  WHERE id = p_dispute_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.resolve_jury_case(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.commit_jury_verdict(
  p_owner_token uuid,
  p_dispute_id uuid,
  p_commitment text,
  p_stake integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_citizen bigint;
  v_balance integer;
  v_kind text;
  v_status text;
  v_seat public.dispute_jurors%ROWTYPE;
BEGIN
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
$$;

REVOKE EXECUTE ON FUNCTION public.commit_jury_verdict(uuid, uuid, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.commit_jury_verdict(uuid, uuid, text, integer) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.reveal_jury_verdict(
  p_owner_token uuid,
  p_dispute_id uuid,
  p_verdict text,
  p_salt text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_citizen bigint;
  v_kind text;
  v_status text;
  v_seat public.dispute_jurors%ROWTYPE;
  v_pending integer;
  v_total integer;
  v_revealed integer;
BEGIN
  SELECT citizen_number INTO v_citizen FROM public.citizens WHERE owner_token = p_owner_token;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'citizen not found';
  END IF;

  SELECT kind, status INTO v_kind, v_status
  FROM public.disputes WHERE id = p_dispute_id FOR UPDATE;
  IF NOT FOUND OR v_kind <> 'arbitration' OR v_status = 'resolved' THEN
    RAISE EXCEPTION 'voting is closed for this case';
  END IF;

  SELECT * INTO v_seat FROM public.dispute_jurors
  WHERE dispute_id = p_dispute_id AND citizen_number = v_citizen FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'only seated jurors can reveal';
  END IF;
  IF v_seat.verdict_commit IS NULL THEN
    RAISE EXCEPTION 'seal your verdict first';
  END IF;
  IF v_seat.revealed_at IS NOT NULL THEN
    RAISE EXCEPTION 'verdict already revealed';
  END IF;
  IF p_verdict NOT IN ('buyer', 'seller') THEN
    RAISE EXCEPTION 'invalid verdict';
  END IF;
  IF encode(sha256(convert_to(p_verdict || ':' || p_salt, 'UTF8')), 'hex') <> v_seat.verdict_commit THEN
    RAISE EXCEPTION 'reveal does not match the sealed verdict';
  END IF;

  SELECT count(*) FILTER (WHERE verdict_commit IS NULL),
         count(*),
         count(*) FILTER (WHERE revealed_at IS NOT NULL)
    INTO v_pending, v_total, v_revealed
    FROM public.dispute_jurors WHERE dispute_id = p_dispute_id;
  IF v_pending > 0 THEN
    RAISE EXCEPTION 'all jurors must seal before reveals open';
  END IF;

  UPDATE public.dispute_jurors
  SET revealed_verdict = p_verdict, revealed_at = now()
  WHERE dispute_id = p_dispute_id AND slot = v_seat.slot;

  IF v_revealed + 1 = v_total THEN
    PERFORM public.resolve_jury_case(p_dispute_id);
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reveal_jury_verdict(uuid, uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reveal_jury_verdict(uuid, uuid, text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.my_jury_seats(p_owner_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_citizen bigint;
  v_balance integer;
  v_seats jsonb;
BEGIN
  SELECT citizen_number, balance_roj INTO v_citizen, v_balance
  FROM public.citizens WHERE owner_token = p_owner_token;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'disputeId', j.dispute_id,
           'slot', j.slot,
           'committed', j.verdict_commit IS NOT NULL,
           'revealed', j.revealed_at IS NOT NULL,
           'stake', j.stake_roj,
           'payout', j.payout_roj
         ) ORDER BY j.dispute_id), '[]'::jsonb)
    INTO v_seats
    FROM public.dispute_jurors j
    WHERE j.citizen_number = v_citizen;

  RETURN jsonb_build_object('balance', v_balance, 'seats', v_seats);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.my_jury_seats(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_jury_seats(uuid) TO anon, authenticated;
