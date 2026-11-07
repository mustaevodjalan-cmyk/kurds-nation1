"use client";

import { useEffect, useRef, useState } from "react";
import type Hls from "hls.js";
import { cn } from "@/lib/utils";

type HlsPlayerProps = {
  src: string;
  poster?: string;
  paused?: boolean;
  muted?: boolean;
  fit?: "contain" | "cover";
  label: string;
  errorText: string;
  className?: string;
};

export function HlsPlayer({
  src,
  poster,
  paused = false,
  muted = false,
  fit = "contain",
  label,
  errorText,
  className,
}: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setFailed(false);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return () => {
        video.removeAttribute("src");
        video.load();
      };
    }

    let cancelled = false;
    let hls: Hls | null = null;
    void import("hls.js")
      .then(({ default: HlsClass }) => {
        if (cancelled) return;
        if (!HlsClass.isSupported()) {
          setFailed(true);
          return;
        }
        const instance = new HlsClass();
        instance.on(HlsClass.Events.ERROR, (_event, data) => {
          if (data.fatal) setFailed(true);
        });
        instance.loadSource(src);
        instance.attachMedia(video);
        hls = instance;
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) {
      video.pause();
      return;
    }
    void video.play().catch(() => undefined);
  }, [paused, src]);

  return (
    <div className={cn("relative overflow-hidden bg-black", className)}>
      <video
        ref={videoRef}
        className={cn("h-full w-full", fit === "cover" ? "object-cover" : "object-contain")}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        muted={muted}
        autoPlay={!paused}
        aria-label={label}
      />
      {failed && (
        <div
          role="alert"
          className="absolute inset-0 flex items-center justify-center bg-ink/90 p-6 text-center text-sm font-medium text-slate-200"
        >
          {errorText}
        </div>
      )}
    </div>
  );
}
