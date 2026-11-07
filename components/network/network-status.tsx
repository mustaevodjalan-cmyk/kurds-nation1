"use client";

import { useEffect, useState } from "react";
import type { Strings } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function NetworkStatus({ t }: { t: Strings }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <footer className="mx-auto mt-14 max-w-6xl border-t border-white/10 px-5 py-5 text-sm text-slate-400">
      <span className={cn("me-2 inline-block h-2 w-2 rounded-full", online ? "bg-jade" : "bg-flame")} />
      <span>{online ? t.online : t.offline}</span>
    </footer>
  );
}
