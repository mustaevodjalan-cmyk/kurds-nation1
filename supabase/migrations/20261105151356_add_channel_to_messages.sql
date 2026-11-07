/*
# Add channels to messages

1. Changes
- `messages.channel` (text, default 'general'): one of general, history-culture, tech-startups, eco-municipalism.
- Existing rows are assigned to `general`.
- Index on (channel, created_at) for per-channel history.

2. Security
- Clients may choose a channel on insert and read it on select; policies are unchanged.
*/

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'general'
  CHECK (channel IN ('general', 'history-culture', 'tech-startups', 'eco-municipalism'));

GRANT SELECT (channel) ON public.messages TO anon, authenticated;
GRANT INSERT (channel) ON public.messages TO anon, authenticated;

CREATE INDEX IF NOT EXISTS messages_channel_created_idx ON public.messages (channel, created_at DESC);
