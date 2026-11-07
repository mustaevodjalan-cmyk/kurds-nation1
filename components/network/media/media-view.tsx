"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { MediaState } from "@/hooks/use-media";
import type { MediaStrings } from "@/lib/media-i18n";
import { cn } from "@/lib/utils";
import { ChannelsGrid } from "./channels-grid";
import { type DonateOutcome } from "./donate-panel";
import { LiveStreamsView } from "./live-streams-view";
import { ShortsFeed } from "./shorts-feed";

type Section = "shorts" | "channels" | "live";

type MediaViewProps = {
  strings: MediaStrings;
  ownerToken: string | null;
  media: MediaState;
  balance: number | null;
  onBalanceChange: (balance: number) => void;
};

export function MediaView({ strings: s, ownerToken, media, balance, onBalanceChange }: MediaViewProps) {
  const [section, setSection] = useState<Section>("shorts");
  const { videos, status, reload, toggleLike, donate } = media;

  const shorts = useMemo(() => videos.filter((v) => v.kind === "short"), [videos]);
  const longs = useMemo(() => videos.filter((v) => v.kind === "long"), [videos]);
  const streams = useMemo(() => videos.filter((v) => v.kind === "live"), [videos]);

  const sections: { value: Section; label: string }[] = [
    { value: "shorts", label: s.sectionShorts },
    { value: "channels", label: s.sectionChannels },
    { value: "live", label: s.sectionLive },
  ];

  const handleDonate = async (videoId: string, amount: number): Promise<DonateOutcome> => {
    try {
      const result = await donate(videoId, amount);
      onBalanceChange(result.balance);
      return "ok";
    } catch (err) {
      return err instanceof Error && err.message.includes("insufficient") ? "insufficient" : "error";
    }
  };

  return (
    <section className="space-y-8 py-8">
      <header className="space-y-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-flame/40 bg-flame/10 px-3 py-1 text-xs font-semibold tracking-wide text-flame">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-flame" aria-hidden="true" />
          {s.liveNow}
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-slate-50">{s.title}</h2>
        <p className="max-w-xl text-sm leading-relaxed text-slate-400">{s.subtitle}</p>
      </header>

      <div role="tablist" aria-label={s.title} className="flex flex-wrap gap-2">
        {sections.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={section === item.value}
            onClick={() => setSection(item.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun",
              section === item.value
                ? "border-sun bg-sun text-ink"
                : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:text-slate-100",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {status === "loading" && (
        <div className="grid gap-4 sm:grid-cols-2" aria-busy="true">
          {[0, 1].map((i) => (
            <div key={i} className="aspect-video animate-pulse rounded-2xl border border-white/5 bg-white/5" />
          ))}
        </div>
      )}

      {status === "error" && (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl border border-flame/40 bg-flame/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-flame">{s.loadError}</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="inline-flex items-center gap-2 rounded-lg border border-flame/50 px-3 py-2 text-xs font-bold text-flame transition hover:bg-flame/20"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            {s.retry}
          </button>
        </div>
      )}

      {status === "ready" && section === "shorts" &&
        (shorts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-400">{s.empty}</p>
        ) : (
          <ShortsFeed strings={s} shorts={shorts} ownerToken={ownerToken} onToggleLike={toggleLike} />
        ))}

      {status === "ready" && section === "channels" &&
        (longs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-400">{s.empty}</p>
        ) : (
          <ChannelsGrid strings={s} videos={longs} ownerToken={ownerToken} onToggleLike={toggleLike} />
        ))}

      {status === "ready" && section === "live" &&
        (streams.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-400">{s.empty}</p>
        ) : (
          <LiveStreamsView
            strings={s}
            streams={streams}
            ownerToken={ownerToken}
            balance={balance}
            onToggleLike={toggleLike}
            onDonate={handleDonate}
          />
        ))}
    </section>
  );
}
