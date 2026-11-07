"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMediaCatalog, toggleMediaLike, type MediaVideo } from "@/lib/media-api";

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

  const applyDonation = useCallback((videoId: string, donatedRoj: number) => {
    setVideos((list) => list.map((v) => (v.id === videoId ? { ...v, donatedRoj } : v)));
  }, []);

  return { videos, status, reload: load, toggleLike, applyDonation };
}
