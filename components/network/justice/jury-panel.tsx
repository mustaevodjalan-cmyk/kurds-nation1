"use client";

import { Scale } from "lucide-react";
import type { Juror } from "@/lib/justice-api";
import type { JusticeStrings } from "@/lib/justice-i18n";
import { cn } from "@/lib/utils";

type Props = {
  strings: JusticeStrings;
  jurors: Juror[];
};

export function JuryPanel({ strings: s, jurors }: Props) {
  const slots = [1, 2, 3];

  return (
    <div className="mt-5 rounded-xl border border-ice/25 bg-ink/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Scale className="h-4 w-4 text-ice" aria-hidden="true" />
        <p className="text-xs font-bold uppercase tracking-wider text-ice">{s.juryTitle}</p>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-slate-400">{s.juryHint}</p>
      <ul className="grid grid-cols-3 gap-2">
        {slots.map((slot) => {
          const juror = jurors.find((j) => j.slot === slot);
          return (
            <li
              key={slot}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-2 py-3",
                juror
                  ? "border border-ice/40 bg-ice/10 shadow-[0_0_18px_-8px_rgba(61,230,255,0.9)]"
                  : "border border-dashed border-white/15",
              )}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {s.juror} {slot}
              </span>
              {juror ? (
                <>
                  <span className="font-mono text-base font-bold tracking-widest text-ice">{juror.label}</span>
                  <span className={cn("text-[11px] font-semibold", juror.revealed ? "text-jade" : juror.committed ? "text-sun" : "text-slate-500")}>
                    {juror.revealed ? s.jurorRevealed : juror.committed ? s.jurorSealed : s.juryPending}
                  </span>
                </>
              ) : (
                <span className="text-center text-xs text-slate-500">{s.juryPending}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
