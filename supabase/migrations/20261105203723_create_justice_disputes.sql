/*
# Dîwana Gel: disputes, smart-contract agreements and anonymous juries

1. New Tables
- `disputes`: id, kind ('agreement' for a smart-contract style agreement, 'arbitration' for a community arbitration request), title, summary, amount_roj (escrowed $ROJ amount), region, status ('open', 'in_review', 'resolved'), citizen_number (the filer's public citizen number, nullable for curated cases), created_at.
- `dispute_jurors`: dispute_id, slot (1 to 3), juror_label (short public code, for example "A7F3"), citizen_number (kept server-side, never readable by clients).

2. Security
- Both tables have RLS enabled. Clients may only read public columns; citizen_number on dispute_jurors is never granted.
- No client can insert, update or delete directly.
- open_dispute(p_owner_token, ...) is SECURITY DEFINER. It requires a registered citizen, allows at most 3 filings per citizen per 24 hours, and for arbitration selects exactly 3 jurors, preferring the highest passport rank (History Keeper first), excluding the filer, with random tie-breaking.

3. Seed
- One sample arbitration case in review with three anonymous jurors, so the jury panel can be seen before real citizens file cases.

4. Notes
- Escrowed $ROJ is recorded as an amount only. No tokens are moved or locked by this migration.
*/

CREATE TABLE IF NOT EXISTS public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('agreement', 'arbitration')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  summary text NOT NULL CHECK (char_length(summary) BETWEEN 10 AND 1000),
  amount_roj integer NOT NULL CHECK (amount_roj BETWEEN 1 AND 100000),
  region text NOT NULL CHECK (region IN ('bakur', 'rojava', 'basur', 'rojhilat', 'europe', 'cis')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved')),
  citizen_number bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dispute_jurors (
  dispute_id uuid NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  slot smallint NOT NULL CHECK (slot BETWEEN 1 AND 3),
  juror_label text NOT NULL,
  citizen_number bigint,
  PRIMARY KEY (dispute_id, slot)
);

CREATE INDEX IF NOT EXISTS disputes_created_at_idx ON public.disputes (created_at DESC);
CREATE INDEX IF NOT EXISTS disputes_citizen_idx ON public.disputes (citizen_number, created_at DESC);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_jurors ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.disputes FROM anon, authenticated;
REVOKE ALL ON public.dispute_jurors FROM anon, authenticated;
GRANT SELECT (id, kind, title, summary, amount_roj, region, status, created_at) ON public.disputes TO anon, authenticated;
GRANT SELECT (dispute_id, slot, juror_label) ON public.dispute_jurors TO anon, authenticated;

DROP POLICY IF EXISTS "select_disputes" ON public.disputes;
CREATE POLICY "select_disputes" ON public.disputes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "select_dispute_jurors" ON public.dispute_jurors;
CREATE POLICY "select_dispute_jurors" ON public.dispute_jurors FOR SELECT
  TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.open_dispute(
  p_owner_token uuid,
  p_kind text,
  p_title text,
  p_summary text,
  p_amount_roj integer,
  p_region text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_citizen bigint;
  v_recent integer;
  v_id uuid;
BEGIN
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
$$;

REVOKE EXECUTE ON FUNCTION public.open_dispute(uuid, text, text, text, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.open_dispute(uuid, text, text, text, integer, text) TO anon, authenticated;

INSERT INTO public.disputes (kind, title, summary, amount_roj, region, status)
VALUES (
  'arbitration',
  'Sample: 40 solar inverters, Rojava to Başûr',
  'The buyer reports that 12 of 40 inverters arrived with failed firmware. The seller points to a signed delivery note listing all units as working. Both parties hold escrowed $ROJ pending the jury decision.',
  2500,
  'rojava',
  'in_review'
);

INSERT INTO public.dispute_jurors (dispute_id, slot, juror_label)
SELECT id, 1, 'A7F3' FROM public.disputes WHERE title = 'Sample: 40 solar inverters, Rojava to Başûr'
UNION ALL
SELECT id, 2, 'C21D' FROM public.disputes WHERE title = 'Sample: 40 solar inverters, Rojava to Başûr'
UNION ALL
SELECT id, 3, 'E90B' FROM public.disputes WHERE title = 'Sample: 40 solar inverters, Rojava to Başûr'
ON CONFLICT DO NOTHING;
