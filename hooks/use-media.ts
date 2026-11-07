"use client";

import { useCallback, useEffect, useState } from "react";
import { donateRoj, fetchMediaCatalog, toggleMediaLike, type MediaVideo } from "@/lib/media-api";

export type MediaStatus = "loading" | "ready" | "error";

export function useMedia(ownerToken: string | null) {
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [status, setStatus] = useState<MediaStatus>("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setVideos(await fetchMediaCatalog(ownerToken));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [ownerToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleLike = useCallback(
    async (videoId: string): Promise<boolean> => {
      if (!ownerToken) return false;
      try {
        const result = await toggleMediaLike(ownerToken, videoId);
        setVideos((list) =>
          list.map((v) => (v.id === videoId ? { ...v, liked: result.liked, likes: result.likes } : v)),
        );
        return true;
      } catch {
        return false;
      }
    },
    [ownerToken],
  );

  const donate = useCallback(
    async (videoId: string, amount: number): Promise<{ balance: number }> => {
      if (!ownerToken) throw new Error("passport required");
      const result = await donateRoj(ownerToken, videoId, amount);
      setVideos((list) =>
        list.map((v) => (v.id === videoId ? { ...v, donatedRoj: result.donatedRoj } : v)),
      );
      return { balance: result.balance };
    },
    [ownerToken],
  );

  return { videos, status, reload: load, toggleLike, donate };
}

export type MediaState = ReturnType<typeof useMedia>;
