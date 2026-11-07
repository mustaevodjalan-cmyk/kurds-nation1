"use client";

import { useState } from "react";
import { Lock, Scale, Unlock } from "lucide-react";
import type { MySeat } from "@/lib/justice-api";
import type { JusticeStrings } from "@/lib/justice-i18n";
import type { Verdict } from "@/lib/verdict-commitment";
import { cn } from "@/lib/utils";

const MIN_STAKE = 10;
const MAX_STAKE = 1000;
const DEFAULT_STAKE = 50;

type Props = {
  strings: JusticeStrings;
  seat: MySeat;
  balance: number | null;
  sealedCount: number;
  revealedCount: number;
  totalJurors: number;
  resolved: boolean;
  verdict: Verdict | null;
  busy: boolean;
  onSeal: (verdict: Verdict, stake: number) => void;
  onReveal: () => void;
};

function fill(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
}

export function JurorSeatPanel({
  strings: s,
  seat,
  balance,
  sealedCount,
  revealedCount,
  totalJurors,
  resolved,
  verdict,
  busy,
  onSeal,
  onReveal,
}: Props) {
  const [choice, setChoice] = useState<Verdict | null>(null);
  const [stakeText, setStakeText] = useState(String(DEFAULT_STAKE));

  const stake = Number(stakeText);
  const stakeValid = Number.isInteger(stake) && stake >= MIN_STAKE && stake <= MAX_STAKE;
  const affordable = balance === null || stake <= balance;
  const canSeal = choice !== null && stakeValid && affordable && !busy;
  const allSealed = sealedCount === totalJurors;

  const verdictLabel = (v: Verdict) => (v === "buyer" ? s.verdictBuyer : s.verdictSeller);

  return (
    <div className="mt-5 rounded-xl border border-sun/30 bg-ink/60 p-5">
      <div className="mb-2 flex items-center gap-2">
        <Scale className="h-4 w-4 text-sun" aria-hidden="true" />
        <p className="text-xs font-bold uppercase tracking-wider text-sun">{s.seatTitle}</p>
      </div>

      {resolved ? (
        <div className="space-y-2 text-sm">
          {verdict && <p className="font-semibold text-slate-100">{fill(s.verdictWon, { verdict: verdictLabel(verdict) })}</p>}
          <p className={cn("font-medium", seat.payout && seat.payout > 0 ? "text-jade" : "text-flame")}>
            {seat.payout && seat.payout > 0
              ? fill(s.payoutLabel, { n: seat.payout.toLocaleString() })
              : s.stakeLost}
          </p>
        </div>
      ) : !seat.committed ? (
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-slate-400">{s.seatHint}</p>
          <div role="radiogroup" aria-label={s.seatTitle} className="grid grid-cols-2 gap-2">
            {(["buyer", "seller"] as Verdict[]).map((v) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={choice === v}
                onClick={() => setChoice(v)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm font-semibold transition",
                  choice === v
                    ? "border-sun bg-sun/15 text-sun shadow-[0_0_18px_-8px_rgba(255,201,51,0.9)]"
                    : "border-white/10 text-slate-300 hover:border-white/25",
                )}
              >
                {verdictLabel(v)}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{s.stakeLabel}</span>
            <input
              inputMode="numeric"
              value={stakeText}
              onChange={(e) => setStakeText(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full rounded-lg border border-white/10 bg-ink/70 px-3 py-2.5 text-sm text-slate-100 focus:border-sun/60 focus:outline-none focus:ring-2 focus:ring-sun/30"
            />
            <span className={cn("mt-1 block text-xs", stakeValid && affordable ? "text-slate-500" : "text-flame")}>
              {!affordable && balance !== null ? `${s.balanceLabel}: ${balance.toLocaleString()} $ROJ` : s.stakeHint}
            </span>
          </label>
          <button
            type="button"
            disabled={!canSeal}
            onClick={() => choice && onSeal(choice, stake)}
            className="inline-flex items-center gap-2 rounded-lg bg-sun px-4 py-2.5 text-sm font-bold text-ink shadow-[0_0_24px_-6px_rgba(255,201,51,0.7)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            {busy ? s.sealing : s.sealButton}
          </button>
        </div>
      ) : !seat.revealed ? (
        <div className="space-y-4">
          <p className="inline-flex items-center gap-2 text-sm text-slate-300">
            <Lock className="h-4 w-4 text-sun" aria-hidden="true" />
            {allSealed ? "" : s.sealedWaiting}
          </p>
          {allSealed && (
            <button
              type="button"
              disabled={busy}
              onClick={onReveal}
              className="inline-flex items-center gap-2 rounded-lg border border-ice/50 bg-ice/10 px-4 py-2.5 text-sm font-bold text-ice transition hover:bg-ice/20 disabled:opacity-40"
            >
              <Unlock className="h-4 w-4" aria-hidden="true" />
              {busy ? s.revealing : s.revealButton}
            </button>
          )}
        </div>
      ) : (
        <p className="inline-flex items-center gap-2 text-sm text-slate-300">
          <Unlock className="h-4 w-4 text-ice" aria-hidden="true" />
          {s.revealedWaiting}
        </p>
      )}

      {!resolved && (
        <div className="mt-5 flex gap-4 border-t border-white/5 pt-4 text-xs font-semibold text-slate-400">
          <span>{fill(s.progressSealed, { n: sealedCount, total: totalJurors })}</span>
          <span>{fill(s.progressRevealed, { n: revealedCount, total: totalJurors })}</span>
        </div>
      )}
    </div>
  );
}
