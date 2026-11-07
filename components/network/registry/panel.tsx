import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/15 bg-white/[0.04] p-6 shadow-[0_0_50px_-24px_rgba(61,230,255,0.35)] backdrop-blur-xl sm:p-7",
        className,
      )}
    >
      {children}
    </div>
  );
}
