"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import type { MediaVideo } from "@/lib/media-api";
import type { MediaStrings } from "@/lib/media-i18n";
import { cn } from "@/lib/utils";
import { HlsPlayer } from "./hls-player";
import { LikeButton, ShareButton } from "./video-actions";
import { VideoComments } from "./message-panels";

const ACTIVE_RATIO = 0.6;

type ShortsFeedProps = {
  strings: MediaStrings;
  shorts: MediaVideo[];
  ownerToken: string | null;
  onToggleLike: (videoId: string) => Promise<boolean>;
};

export function ShortsFeed({ strings: s, shorts, ownerToken, onToggleLike }: ShortsFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const idsKey = useMemo(() => shorts.map((v) => v.id).join(","), [shorts]);

  useEffect(() => {
    const root = feedRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= ACTIVE_RATIO) {
            setActiveId((entry.target as HTMLElement).dataset.shortId ?? null);
          }
        }
      },
      { root, threshold: [ACTIVE_RATIO] },
    );
    root.querySelectorAll("[data-short-id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [idsKey]);

  return (
    <div
      ref={feedRef}
      className="h-[min(76svh,760px)] min-h-[520px] snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-3xl border border-white/10 bg-slate-950/60 scroll-smooth"
    >
      {shorts.map((video) => (
        <article
          key={video.id}
          data-short-id={video.id}
          className="flex h-full w-full snap-start flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:justify-center sm:gap-6 sm:p-6"
        >
          <HlsPlayer
            src={video.hlsUrl}
            paused={activeId !== video.id}
            muted
            fit="cover"
            label={video.title}
            errorText={s.streamError}
            className="h-[62%] w-full shrink-0 rounded-2xl sm:h-full sm:w-auto sm:aspect-[9/16]"
          />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-end gap-4 sm:w-72 sm:flex-none">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-ice">{video.creator}</p>
              <h3 className="text-xl font-bold leading-snug text-slate-50">{video.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{video.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <LikeButton
                liked={video.liked}
                likes={video.likes}
                disabled={ownerToken === null}
                likedLabel={s.liked}
                label={s.like}
                onToggle={() => onToggleLike(video.id)}
              />
              <ShareButton title={video.title} label={s.share} copiedLabel={s.shareCopied} />
            </div>

            <div className="flex min-h-0 max-h-[40%] flex-col gap-3 sm:max-h-[45%]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{s.comments}</h4>
              <VideoComments key={video.id} strings={s} videoId={video.id} ownerToken={ownerToken} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
