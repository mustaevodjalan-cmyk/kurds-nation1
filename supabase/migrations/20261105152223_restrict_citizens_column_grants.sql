/*
# Restrict citizens table privileges to the columns the app uses

1. Problem
- anon and authenticated held table-wide SELECT, INSERT, UPDATE, and DELETE on citizens.
- That exposed owner_token (the secret that deletes a citizen) and let clients insert arbitrary balance_roj or rank values.

2. Fix
- Revoke all table privileges from anon and authenticated.
- Re-grant SELECT only on public columns (citizen_number, alias, region, dialect, created_at).
- Re-grant INSERT only on the registration columns (alias, region, dialect, owner_token).
- Balance, rank, and quiz state are changed only through SECURITY DEFINER functions.

3. Data
- No rows or columns are changed or removed.
*/

REVOKE ALL ON public.citizens FROM anon, authenticated;
GRANT SELECT (citizen_number, alias, region, dialect, created_at) ON public.citizens TO anon, authenticated;
GRANT INSERT (alias, region, dialect, owner_token) ON public.citizens TO anon, authenticated;
