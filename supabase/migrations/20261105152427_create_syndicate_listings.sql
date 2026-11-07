/*
# Kurdish Economic Syndicate: job and B2B listings

1. New Table
- `listings`: id, kind ('job' or 'b2b'), title, organization (display name chosen by the poster), region, description, trusted (National Trust Badge, set only by curation), citizen_number (nullable; the poster's public citizen number, never the owner token), created_at.

2. Security
- RLS enabled. Anyone may read listings. No client may insert, update, or delete directly.
- post_listing(p_owner_token, ...) is SECURITY DEFINER: it requires a registered citizen and allows at most 5 posts per citizen per 24 hours.
- trusted is never selectable for writes; it is not granted to any client role.

3. Seed
- Three curated example listings with no poster.
*/

CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('job', 'b2b')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  organization text NOT NULL CHECK (char_length(organization) BETWEEN 2 AND 60),
  region text NOT NULL CHECK (region IN ('bakur', 'rojava', 'basur', 'rojhilat', 'europe', 'cis')),
  description text NOT NULL CHECK (char_length(description) BETWEEN 10 AND 1000),
  trusted boolean NOT NULL DEFAULT false,
  citizen_number bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listings_created_at_idx ON public.listings (created_at DESC);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.listings FROM anon, authenticated;
GRANT SELECT (id, kind, title, organization, region, description, trusted, created_at) ON public.listings TO anon, authenticated;

DROP POLICY IF EXISTS "select_listings" ON public.listings;
CREATE POLICY "select_listings" ON public.listings FOR SELECT
  TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.post_listing(
  p_owner_token uuid,
  p_kind text,
  p_title text,
  p_organization text,
  p_region text,
  p_description text
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
$$;

REVOKE EXECUTE ON FUNCTION public.post_listing(uuid, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.post_listing(uuid, text, text, text, text, text) TO anon, authenticated;

INSERT INTO public.listings (kind, title, organization, region, description, trusted) VALUES
  ('job', 'Frontend Developer (remote, Kurmancî and English)', 'Hewlêr Digital Works', 'basur',
   'Build multilingual product interfaces for a Kurdish-owned software studio. Fully remote, flexible hours.', true),
  ('b2b', 'Solar microgrid components supplier sought', 'Rojava Solar Initiative', 'rojava',
   'Seeking verified suppliers of inverters and battery storage for community microgrids in northern Syria.', true),
  ('job', 'Translator for legal and commercial documents', 'Dîwana Gel Pilot', 'europe',
   'Certified translation between Kurmancî, Soranî and German for cross-border trade contracts.', false);
