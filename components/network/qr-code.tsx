"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCode({ value, label }: { value: string; label: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      margin: 1,
      width: 256,
      errorCorrectionLevel: "M",
      color: { dark: "#070b14", light: "#ffffff" },
    })
      .then((url: string) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!src) return <div aria-hidden="true" className="h-full w-full animate-pulse rounded bg-white/30" />;
  return <img src={src} alt={label} className="h-full w-full rounded bg-white p-0.5" />;
}
