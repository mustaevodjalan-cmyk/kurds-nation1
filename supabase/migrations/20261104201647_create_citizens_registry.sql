/*
# Create citizens registry

Plain-English summary: adds a public registry of citizens who issue a digital passport in the app. Each citizen gets a sequential ID number, a chosen alias, a region and a primary dialect. Anyone can view the registry and its statistics. Only the browser that issued a passport (holding its secret owner token) can remove that entry again.

## 1. New objects
- `citizen_number_seq`: sequence that gives each new citizen the next ID number.
- `citizens` table:
  - `id` (uuid, primary key)
  - `citizen_number` (bigint, unique, from the sequence)
  - `alias` (text, 3 to 24 characters)
  - `region` (text, one of bakur, rojava, basur, rojhilat, europe, cis)
  - `dialect` (text, one of kurmanci, sorani, zazaki, kelhuri, hewrami)
  - `owner_token` (uuid, unique, secret; known only to the issuing browser)
  - `created_at` (timestamp)
- `registry_stats()`: returns total count and counts per region and dialect.
- `wipe_citizen(p_owner_token)`: deletes the citizen entry that matches the token.

## 2. Security
- Row level security is enabled on `citizens`.
- Read access is granted column by column, excluding `owner_token`, so the secret is never returned to the browser.
- Insert access is granted only on the columns the app sets. The ID number is filled automatically.
- There is no direct update or delete policy. Removal happens only through `wipe_citizen`, which requires the matching owner token.
- Both functions are granted to the anonymous and signed-in roles because the app has no sign-in screen.

## 3. Notes
1. The registry is intentionally public, so the select and insert policies use `true`. Data checks (alias length, allowed regions and dialects) are enforced by the table itself.
2. Statements are idempotent, so the migration can be re-run safely.
*/

CREATE SEQUENCE IF NOT EXISTS public.citizen_number_seq START WITH 1;

CREATE TABLE IF NOT EXISTS public.citizens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_number bigint NOT NULL UNIQUE DEFAULT nextval('public.citizen_number_seq'),
  alias text NOT NULL CHECK (char_length(alias) BETWEEN 3 AND 24),
  region text NOT NULL CHECK (region IN ('bakur', 'rojava', 'basur', 'rojhilat', 'europe', 'cis')),
  dialect text NOT NULL CHECK (dialect IN ('kurmanci', 'sorani', 'zazaki', 'kelhuri', 'hewrami')),
  owner_token uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS citizens_created_at_idx ON public.citizens (created_at DESC);

ALTER TABLE public.citizens ENABLE ROW LEVEL SECURITY;

GRANT SELECT (id, citizen_number, alias, region, dialect, created_at) ON public.citizens TO anon, authenticated;
GRANT INSERT (alias, region, dialect, owner_token) ON public.citizens TO anon, authenticated;
GRANT USAGE ON SEQUENCE public.citizen_number_seq TO anon, authenticated;

DROP POLICY IF EXISTS "select_citizens" ON public.citizens;
CREATE POLICY "select_citizens" ON public.citizens FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_citizens" ON public.citizens;
CREATE POLICY "insert_citizens" ON public.citizens FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.registry_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM public.citizens),
    'regions', COALESCE(
      (SELECT jsonb_object_agg(region, n) FROM (SELECT region, count(*) AS n FROM public.citizens GROUP BY region) r),
      '{}'::jsonb
    ),
    'dialects', COALESCE(
      (SELECT jsonb_object_agg(dialect, n) FROM (SELECT dialect, count(*) AS n FROM public.citizens GROUP BY dialect) d),
      '{}'::jsonb
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION public.registry_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registry_stats() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.wipe_citizen(p_owner_token uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH removed AS (
    DELETE FROM public.citizens WHERE owner_token = p_owner_token RETURNING id
  )
  SELECT EXISTS (SELECT 1 FROM removed);
$$;

REVOKE EXECUTE ON FUNCTION public.wipe_citizen(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wipe_citizen(uuid) TO anon, authenticated;
