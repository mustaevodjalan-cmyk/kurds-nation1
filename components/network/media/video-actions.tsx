"use client";

import { useState } from "react";
import { Check, Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  liked: boolean;
  likes: number;
  disabled: boolean;
  likedLabel: string;
  label: string;
  onToggle: () => Promise<boolean>;
};

export function LikeButton({ liked, likes, disabled, likedLabel, label, onToggle }: LikeButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    await onToggle();
    setBusy(false);
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={disabled || busy}
      aria-pressed={liked}
      aria-label={liked ? likedLabel : label}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun",
        liked
          ? "border-flame/60 bg-flame/15 text-flame"
          : "border-white/15 bg-white/5 text-slate-100 hover:border-flame/50 hover:text-flame",
      )}
    >
      <Heart className={cn("h-4 w-4 transition", liked && "fill-current")} aria-hidden="true" />
      <span>{liked ? likedLabel : label}</span>
      <span className="tabular-nums text-slate-400">{likes.toLocaleString()}</span>
    </button>
  );
}

type ShareButtonProps = {
  title: string;
  label: string;
  copiedLabel: string;
};

export function ShareButton({ title, label, copiedLabel }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-ice/50 hover:text-ice active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice"
    >
      {copied ? <Check className="h-4 w-4 text-jade" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
      <span role="status">{copied ? copiedLabel : label}</span>
    </button>
  );
}
