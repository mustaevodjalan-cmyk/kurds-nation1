"use client";

import { useState } from "react";
import { Radio } from "lucide-react";
import type { MediaVideo } from "@/lib/media-api";
import type { MediaStrings } from "@/lib/media-i18n";
import { MEDIA_THUMBNAILS } from "@/lib/media-thumbnails";
import { cn } from "@/lib/utils";
import { DonatePanel, type DonateOutcome } from "./donate-panel";
import { HlsPlayer } from "./hls-player";
import { LiveChat } from "./message-panels";
import { LikeButton, ShareButton } from "./video-actions";

type LiveStreamsViewProps = {
  strings: MediaStrings;
  streams: MediaVideo[];
  ownerToken: string | null;
  balance: number | null;
  onToggleLike: (videoId: string) => Promise<boolean>;
  onDonate: (videoId: string, amount: number) => Promise<DonateOutcome>;
};

export function LiveStreamsView({
  strings: s,
  streams,
  ownerToken,
  balance,
  onToggleLike,
  onDonate,
}: LiveStreamsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = streams.find((v) => v.id === selectedId) ?? streams[0] ?? null;

  if (!selected) return null;
  const hasPassport = ownerToken !== null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-5">
        <HlsPlayer
          key={selected.id}
          src={selected.hlsUrl}
          poster={MEDIA_THUMBNAILS[selected.id]}
          label={selected.title}
          errorText={s.streamError}
          className="aspect-video w-full rounded-2xl border border-white/10"
        />

        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-md bg-flame px-2.5 py-1 text-xs font-bold tracking-wider text-ink">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink" aria-hidden="true" />
            {s.liveBadge}
          </span>
          <h2 className="text-2xl font-bold leading-snug text-slate-50">{selected.title}</h2>
          <p className="text-sm text-slate-400">
            <span className="font-semibold text-ice">{selected.creator}</span>
            <span className="mx-2">·</span>
            {selected.viewers.toLocaleString()} {s.viewers}
          </p>
          <p className="text-sm leading-relaxed text-slate-400">{selected.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <LikeButton
            liked={selected.liked}
            likes={selected.likes}
            disabled={!hasPassport}
            likedLabel={s.liked}
            label={s.like}
            onToggle={() => onToggleLike(selected.id)}
          />
          <ShareButton title={selected.title} label={s.share} copiedLabel={s.shareCopied} />
        </div>

        {!hasPassport && (
          <p className="rounded-xl border border-dashed border-white/10 p-3 text-xs text-slate-400">{s.passportRequired}</p>
        )}

        <DonatePanel
          key={selected.id}
          strings={s}
          balance={balance}
          total={selected.donatedRoj}
          disabled={!hasPassport}
          onDonate={(amount) => onDonate(selected.id, amount)}
        />

        <div className="space-y-3 pt-2">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Radio className="h-3.5 w-3.5" aria-hidden="true" />
            {s.liveNow}
          </h3>
          <ul className="grid gap-3 sm:grid-cols-3">
            {streams.map((stream) => (
              <li key={stream.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(stream.id)}
                  aria-pressed={stream.id === selected.id}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl border p-2 text-start transition",
                    stream.id === selected.id
                      ? "border-flame/60 bg-flame/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25",
                  )}
                >
                  {MEDIA_THUMBNAILS[stream.id] && (
                    <img
                      src={MEDIA_THUMBNAILS[stream.id]}
                      alt=""
                      loading="lazy"
                      className="h-14 w-24 shrink-0 rounded-md object-cover"
                    />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-100">{stream.title}</span>
                    <span className="block text-xs text-slate-400">{stream.viewers.toLocaleString()} {s.viewers}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <aside className="flex h-[min(70svh,640px)] min-h-[420px] flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur">
        <h3 className="mb-3 border-b border-white/10 pb-3 text-sm font-semibold text-slate-200">{s.chatTitle}</h3>
        <LiveChat key={selected.id} strings={s} videoId={selected.id} ownerToken={ownerToken} />
      </aside>
    </div>
  );
}
