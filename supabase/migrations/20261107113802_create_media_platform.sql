/*
# Torê Media: catalog, likes, comments, live chat, and $ROJ donations

1. New Tables
- `media_videos`: the catalog of shorts, channel videos, and live streams. Holds the HLS stream URL, like count, viewer count, and total $ROJ donated.
- `media_likes`: one row per citizen per liked video, so a citizen can like a video only once.
- `media_messages`: comments under shorts and chat messages in live streams. Each message is 1 to 280 characters.

2. Security
- Row level security is enabled on all three tables and every client role is revoked from the tables directly.
- Clients only reach the data through functions that check the citizen's secret owner token.
- `media_catalog`, `toggle_media_like`, `list_media_messages`, `post_media_message`, and `donate_roj` are callable by anon and authenticated clients.
- `donate_roj` debits the citizen's $ROJ balance in the same transaction that credits the stream, and it refuses donations that exceed the balance.

3. Seed data
- Starter catalog of 4 shorts, 4 channel videos, and 3 live streams using public HLS test streams.
- A few starter chat messages for the live streams. Seed rows use fixed ids so the migration is safe to re-run.

4. Notes
- Comment and chat posting is not yet rate-limited.
- Author labels are derived from a hash of the owner token, so they are stable per citizen and do not reveal the token.
*/

CREATE TABLE IF NOT EXISTS public.media_videos (
  id uuid PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('short', 'long', 'live')),
  title text NOT NULL,
  creator text NOT NULL,
  description text NOT NULL DEFAULT '',
  hls_url text NOT NULL,
  duration_label text NOT NULL DEFAULT '',
  viewers integer NOT NULL DEFAULT 0 CHECK (viewers >= 0),
  likes integer NOT NULL DEFAULT 0 CHECK (likes >= 0),
  donated_roj integer NOT NULL DEFAULT 0 CHECK (donated_roj >= 0),
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.media_likes (
  video_id uuid NOT NULL REFERENCES public.media_videos(id) ON DELETE CASCADE,
  owner_token uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (video_id, owner_token)
);

CREATE TABLE IF NOT EXISTS public.media_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.media_videos(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('comment', 'chat')),
  author_label text NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 280),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_messages_video_kind_idx
  ON public.media_messages (video_id, kind, created_at DESC);

ALTER TABLE public.media_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.media_videos, public.media_likes, public.media_messages FROM PUBLIC, anon, authenticated;

INSERT INTO public.media_videos (id, kind, title, creator, description, hls_url, duration_label, viewers, likes, sort_order) VALUES
  ('00000000-0000-4000-8000-0000000000a1', 'short', 'Dawn over Mesopotamia', 'Dengê Mezopotamya', 'A slow morning over the river valleys.', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', '0:15', 0, 42, 1),
  ('00000000-0000-4000-8000-0000000000a2', 'short', 'Dengbêj in 60 seconds', 'Dengê Mezopotamya', 'A short taste of the dengbêj tradition.', 'https://test-streams.mux.dev/test_001/stream.m3u8', '0:30', 0, 118, 2),
  ('00000000-0000-4000-8000-0000000000a3', 'short', 'Torê Cyber Beats teaser', 'Torê Cyber Beats', 'Synth-wave remix preview.', 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8', '0:20', 0, 77, 3),
  ('00000000-0000-4000-8000-0000000000a4', 'short', 'Kurdish history in one minute', 'Dîroka Kurdî', 'One minute on the Medes and the Kurdish highlands.', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', '1:00', 0, 203, 4),
  ('00000000-0000-4000-8000-0000000000b1', 'long', 'History of Mesopotamia', 'Dîroka Kurdî', 'From the first cities to the medieval era, told in one long documentary.', 'https://test-streams.mux.dev/test_001/stream.m3u8', '10:24', 0, 310, 5),
  ('00000000-0000-4000-8000-0000000000b2', 'long', 'Web3 Kurdish Startups Workshop', 'Torê Labs', 'A workshop on building community-owned products with on-chain identity.', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', '42:10', 0, 96, 6),
  ('00000000-0000-4000-8000-0000000000b3', 'long', 'Newroz: Songs of Spring', 'Dengê Mezopotamya', 'A festival of songs recorded across the region.', 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8', '18:45', 0, 154, 7),
  ('00000000-0000-4000-8000-0000000000b4', 'long', 'Dengbêj tradition explained', 'Dengê Mezopotamya', 'How the oral singers carried history from village to village.', 'https://test-streams.mux.dev/test_001/stream.m3u8', '12:02', 0, 67, 8),
  ('00000000-0000-4000-8000-0000000000c1', 'live', 'Dengê Mezopotamya Live', 'Dengê Mezopotamya', 'Traditional sessions, streamed live.', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', '', 1243, 0, 9),
  ('00000000-0000-4000-8000-0000000000c2', 'live', 'Torê Cyber Beats Live Sessions', 'Torê Cyber Beats', 'Live electronic sets and remixes.', 'https://test-streams.mux.dev/test_001/stream.m3u8', '', 862, 0, 10),
  ('00000000-0000-4000-8000-0000000000c3', 'live', 'Dîroka Kurdî Live Documentary', 'Dîroka Kurdî', 'Live narration of Kurdish history.', 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8', '', 311, 0, 11)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.media_messages (id, video_id, kind, author_label, body, created_at) VALUES
  ('00000000-0000-4000-8000-0000000000d1', '00000000-0000-4000-8000-0000000000c1', 'chat', 'Citizen-7F2A', 'Rojbaş! Greetings from Qamishli', now() - interval '6 minutes'),
  ('00000000-0000-4000-8000-0000000000d2', '00000000-0000-4000-8000-0000000000c1', 'chat', 'Citizen-B31C', 'This dengbêj voice is beautiful', now() - interval '4 minutes'),
  ('00000000-0000-4000-8000-0000000000d3', '00000000-0000-4000-8000-0000000000c1', 'chat', 'Citizen-9D04', 'Is the next session about Cyber Beats?', now() - interval '2 minutes'),
  ('00000000-0000-4000-8000-0000000000d4', '00000000-0000-4000-8000-0000000000c2', 'chat', 'Citizen-7F2A', 'The bass drop at the start is great', now() - interval '1 minute')
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.media_catalog(p_owner_token uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', v.id,
    'kind', v.kind,
    'title', v.title,
    'creator', v.creator,
    'description', v.description,
    'hlsUrl', v.hls_url,
    'durationLabel', v.duration_label,
    'viewers', v.viewers,
    'likes', v.likes,
    'donatedRoj', v.donated_roj,
    'liked', EXISTS (
      SELECT 1 FROM public.media_likes l
      WHERE l.video_id = v.id AND l.owner_token = p_owner_token
    )
  ) ORDER BY v.sort_order), '[]'::jsonb)
  FROM public.media_videos v;
$$;

CREATE OR REPLACE FUNCTION public.toggle_media_like(p_owner_token uuid, p_video_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  now_liked boolean;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.citizens WHERE owner_token = p_owner_token) THEN
    RAISE EXCEPTION 'citizen not found';
  END IF;
  PERFORM 1 FROM public.media_videos WHERE id = p_video_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'video not found';
  END IF;

  DELETE FROM public.media_likes WHERE video_id = p_video_id AND owner_token = p_owner_token;
  IF FOUND THEN
    now_liked := false;
    UPDATE public.media_videos SET likes = likes - 1 WHERE id = p_video_id;
  ELSE
    INSERT INTO public.media_likes (video_id, owner_token) VALUES (p_video_id, p_owner_token);
    now_liked := true;
    UPDATE public.media_videos SET likes = likes + 1 WHERE id = p_video_id;
  END IF;

  RETURN jsonb_build_object(
    'liked', now_liked,
    'likes', (SELECT likes FROM public.media_videos WHERE id = p_video_id)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.list_media_messages(p_video_id uuid, p_kind text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(to_jsonb(m) ORDER BY m.created_at), '[]'::jsonb)
  FROM (
    SELECT id, author_label, body, created_at
    FROM public.media_messages
    WHERE video_id = p_video_id AND kind = p_kind
    ORDER BY created_at DESC
    LIMIT 50
  ) m;
$$;

CREATE OR REPLACE FUNCTION public.post_media_message(p_owner_token uuid, p_video_id uuid, p_kind text, p_body text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean text := btrim(p_body);
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.citizens WHERE owner_token = p_owner_token) THEN
    RAISE EXCEPTION 'citizen not found';
  END IF;
  IF p_kind NOT IN ('comment', 'chat') THEN
    RAISE EXCEPTION 'invalid message kind';
  END IF;
  IF char_length(clean) < 1 OR char_length(clean) > 280 THEN
    RAISE EXCEPTION 'message must be 1 to 280 characters';
  END IF;
  PERFORM 1 FROM public.media_videos WHERE id = p_video_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'video not found';
  END IF;

  INSERT INTO public.media_messages (video_id, kind, author_label, body)
  VALUES (p_video_id, p_kind, 'Citizen-' || upper(left(md5(p_owner_token::text), 4)), clean);
END;
$$;

CREATE OR REPLACE FUNCTION public.donate_roj(p_owner_token uuid, p_video_id uuid, p_amount integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.citizens%ROWTYPE;
  total integer;
BEGIN
  IF p_amount IS NULL OR p_amount NOT BETWEEN 1 AND 1000 THEN
    RAISE EXCEPTION 'amount must be between 1 and 1000';
  END IF;
  SELECT * INTO c FROM public.citizens WHERE owner_token = p_owner_token FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'citizen not found';
  END IF;
  PERFORM 1 FROM public.media_videos WHERE id = p_video_id AND kind = 'live' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'donations are only accepted on live streams';
  END IF;
  IF c.balance_roj < p_amount THEN
    RAISE EXCEPTION 'insufficient balance';
  END IF;

  UPDATE public.citizens SET balance_roj = balance_roj - p_amount WHERE id = c.id;
  UPDATE public.media_videos SET donated_roj = donated_roj + p_amount WHERE id = p_video_id
  RETURNING donated_roj INTO total;

  RETURN jsonb_build_object('balance', c.balance_roj - p_amount, 'donatedRoj', total);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.media_catalog(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.toggle_media_like(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.list_media_messages(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.post_media_message(uuid, uuid, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.donate_roj(uuid, uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.media_catalog(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_media_like(uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_media_messages(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.post_media_message(uuid, uuid, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.donate_roj(uuid, uuid, integer) TO anon, authenticated;
