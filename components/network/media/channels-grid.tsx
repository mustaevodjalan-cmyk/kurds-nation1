"use client";

import { useState } from "react";
import { Heart, Play } from "lucide-react";
import type { MediaVideo } from "@/lib/media-api";
import type { MediaStrings } from "@/lib/media-i18n";
import { MEDIA_THUMBNAILS } from "@/lib/media-thumbnails";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { HlsPlayer } from "./hls-player";
import { VideoComments } from "./message-panels";
import { LikeButton, ShareButton } from "./video-actions";

type ChannelsGridProps = {
  strings: MediaStrings;
  videos: MediaVideo[];
  ownerToken: string | null;
  onToggleLike: (videoId: string) => Promise<boolean>;
};

export function ChannelsGrid({ strings: s, videos, ownerToken, onToggleLike }: ChannelsGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = videos.find((v) => v.id === selectedId) ?? null;

  return (
    <>
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <li key={video.id}>
            <button
              type="button"
              onClick={() => setSelectedId(video.id)}
              className="group block w-full text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun rounded-2xl"
            >
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                {MEDIA_THUMBNAILS[video.id] && (
                  <img
                    src={MEDIA_THUMBNAILS[video.id]}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" aria-hidden="true" />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sun/90 text-ink shadow-lg">
                    <Play className="h-6 w-6 fill-current ms-0.5" aria-hidden="true" />
                  </span>
                </span>
                {video.durationLabel && (
                  <span className="absolute bottom-2 end-2 rounded-md bg-ink/85 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-100">
                    {video.durationLabel}
                  </span>
                )}
              </div>
              <div className="mt-3 space-y-1">
                <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-100 group-hover:text-sun">
                  {video.title}
                </h3>
                <p className="text-sm text-slate-400">{video.creator}</p>
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                  {video.likes.toLocaleString()}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-white/10 bg-slate-950 p-0 text-slate-100 sm:rounded-2xl">
          {selected && (
            <div className="flex flex-col">
              <HlsPlayer
                src={selected.hlsUrl}
                poster={MEDIA_THUMBNAILS[selected.id]}
                label={selected.title}
                errorText={s.streamError}
                className="aspect-video w-full"
              />
              <div className="space-y-5 p-6">
                <div className="space-y-2">
                  <DialogTitle className="text-2xl font-bold leading-snug text-slate-50">{selected.title}</DialogTitle>
                  <DialogDescription className="text-sm text-slate-400">
                    <span className="font-semibold text-ice">{selected.creator}</span>
                    <span className="mx-2">·</span>
                    {selected.description}
                  </DialogDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <LikeButton
                    liked={selected.liked}
                    likes={selected.likes}
                    disabled={ownerToken === null}
                    likedLabel={s.liked}
                    label={s.like}
                    onToggle={() => onToggleLike(selected.id)}
                  />
                  <ShareButton title={selected.title} label={s.share} copiedLabel={s.shareCopied} />
                </div>
                <div className="space-y-3 border-t border-white/10 pt-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{s.comments}</h4>
                  <div className="flex h-72 flex-col">
                    <VideoComments key={selected.id} strings={s} videoId={selected.id} ownerToken={ownerToken} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
