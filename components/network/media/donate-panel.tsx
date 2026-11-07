"use client";

import { useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import type { MediaStrings } from "@/lib/media-i18n";
import { cn } from "@/lib/utils";

export type DonateOutcome = "ok" | "insufficient" | "error";

const AMOUNTS = [10, 50, 100, 500] as const;

type DonatePanelProps = {
  strings: MediaStrings;
  balance: number | null;
  total: number;
  disabled: boolean;
  onDonate: (amount: number) => Promise<DonateOutcome>;
};

export function DonatePanel({ strings: s, balance, total, disabled, onDonate }: DonatePanelProps) {
  const [amount, setAmount] = useState<number>(AMOUNTS[0]);
  const [sending, setSending] = useState(false);
  const [outcome, setOutcome] = useState<DonateOutcome | "success" | null>(null);

  const handleDonate = async () => {
    if (sending) return;
    setSending(true);
    setOutcome(null);
    const result = await onDonate(amount);
    setOutcome(result === "ok" ? "success" : result);
    setSending(false);
  };

  const message =
    outcome === "success" ? s.donateSuccess : outcome === "insufficient" ? s.errorInsufficient : outcome === "error" ? s.errorGeneric : null;

  return (
    <div className="space-y-4 rounded-2xl border border-sun/30 bg-sun/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-200">
          {s.donateBalance}: <span className="tabular-nums text-sun">{balance === null ? "—" : balance.toLocaleString()}</span>
        </span>
        <span className="text-slate-400">
          {s.donateTotal}: <span className="font-semibold tabular-nums text-slate-200">{total.toLocaleString()}</span>
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{s.donateAmount}</p>
        <div role="radiogroup" aria-label={s.donateAmount} className="flex flex-wrap gap-2">
          {AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={amount === value}
              onClick={() => setAmount(value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold tabular-nums transition active:scale-95",
                amount === value
                  ? "border-sun bg-sun text-ink"
                  : "border-white/15 bg-white/5 text-slate-200 hover:border-sun/60",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => void handleDonate()}
        disabled={disabled || sending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sun px-5 py-3 text-sm font-bold text-ink shadow-[0_0_30px_-10px_rgba(255,201,51,0.8)] transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Coins className="h-4 w-4" aria-hidden="true" />}
        {s.donate} · {amount}
      </button>

      {message && (
        <p
          role="status"
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium",
            outcome === "success" ? "bg-jade/10 text-jade" : "bg-flame/10 text-flame",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}
