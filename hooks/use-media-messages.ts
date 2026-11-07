"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMediaMessages, postMediaMessage, type MediaMessage, type MessageKind } from "@/lib/media-api";

export type MessagesStatus = "loading" | "ready" | "error";

export function useMediaMessages(
  videoId: string,
  kind: MessageKind,
  ownerToken: string | null,
  pollMs?: number,
) {
  const [messages, setMessages] = useState<MediaMessage[]>([]);
  const [status, setStatus] = useState<MessagesStatus>("loading");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    try {
      setMessages(await fetchMediaMessages(videoId, kind));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [videoId, kind]);

  useEffect(() => {
    void load();
    if (!pollMs) return;
    const id = window.setInterval(() => void load(), pollMs);
    return () => window.clearInterval(id);
  }, [load, pollMs]);

  const post = useCallback(
    async (body: string): Promise<boolean> => {
      if (!ownerToken) return false;
      setPosting(true);
      try {
        await postMediaMessage(ownerToken, videoId, kind, body);
        await load();
        return true;
      } catch {
        return false;
      } finally {
        setPosting(false);
      }
    },
    [ownerToken, videoId, kind, load],
  );

  return { messages, status, posting, post };
}
