/*
# Create encrypted lobby messages table

1. New Tables
- `messages`
  - `id` (uuid, primary key)
  - `sender_id` (uuid): random per-browser pseudonym, not linked to any identity
  - `lang` (text): one of ku, ckb, ru, en
  - `cipher` (text): base64 AES-GCM ciphertext of the message body
  - `iv` (text): base64 12-byte nonce for the ciphertext
  - `created_at` (timestamptz, default now)
  - `expires_at` (timestamptz, default now + 5 minutes): disappearing messages, enforced by the server

2. Security
- Enable RLS on `messages`.
- Readers see only rows that have not expired (SELECT policy on expires_at).
- Anonymous and signed-in clients may insert rows; they cannot set expires_at, update, or delete rows.
- Only the columns the app needs are readable or writable.
- `purge_expired_messages()` deletes expired rows; it is the only delete path and only removes expired data.
- No IP address, email, or personal identifier is stored.

3. Realtime
- `messages` is added to the realtime publication so inserts are pushed to connected clients.

4. Notes
- Message bodies are encrypted in the browser before insert; the database never sees plaintext.
- Expired rows are hidden by policy immediately and physically removed by the purge function.
*/

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  lang text NOT NULL CHECK (lang IN ('ku', 'ckb', 'ru', 'en')),
  cipher text NOT NULL CHECK (char_length(cipher) BETWEEN 1 AND 16000),
  iv text NOT NULL CHECK (char_length(iv) = 16),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '5 minutes')
);

CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages (created_at DESC);
CREATE INDEX IF NOT EXISTS messages_expires_at_idx ON public.messages (expires_at);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.messages FROM anon, authenticated;
GRANT SELECT (id, sender_id, lang, cipher, iv, created_at, expires_at) ON public.messages TO anon, authenticated;
GRANT INSERT (sender_id, lang, cipher, iv) ON public.messages TO anon, authenticated;

DROP POLICY IF EXISTS "select_live_messages" ON public.messages;
CREATE POLICY "select_live_messages" ON public.messages FOR SELECT
  TO anon, authenticated USING (expires_at > now());

DROP POLICY IF EXISTS "insert_messages" ON public.messages;
CREATE POLICY "insert_messages" ON public.messages FOR INSERT
  TO anon, authenticated WITH CHECK (expires_at > now());

CREATE OR REPLACE FUNCTION public.purge_expired_messages()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH removed AS (
    DELETE FROM public.messages WHERE expires_at <= now() RETURNING 1
  )
  SELECT count(*)::integer FROM removed;
$$;

REVOKE EXECUTE ON FUNCTION public.purge_expired_messages() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_expired_messages() TO anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;
