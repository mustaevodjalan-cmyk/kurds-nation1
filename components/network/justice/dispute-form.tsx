"use client";

import { useState, type FormEvent } from "react";
import { REGIONS, type Region } from "@/lib/registry";
import type { DisputeDraft, DisputeKind } from "@/lib/justice-api";
import type { JusticeStrings } from "@/lib/justice-i18n";
import type { DashboardStrings } from "@/lib/dashboard-i18n";
import { cn } from "@/lib/utils";

const INPUT =
  "w-full rounded-lg border border-white/10 bg-ink/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-sun/60 focus:outline-none focus:ring-2 focus:ring-sun/30";

type Props = {
  strings: JusticeStrings;
  regionNames: DashboardStrings["regionNames"];
  submitting: boolean;
  submitError: "failed" | "rate_limited" | null;
  onSubmit: (draft: DisputeDraft) => Promise<void>;
};

export function DisputeForm({ strings: s, regionNames, submitting, submitError, onSubmit }: Props) {
  const [kind, setKind] = useState<DisputeKind>("arbitration");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [amount, setAmount] = useState("");
  const [region, setRegion] = useState<Region>("basur");

  const amountValue = Number(amount);
  const valid =
    title.trim().length >= 3 &&
    summary.trim().length >= 10 &&
    Number.isInteger(amountValue) &&
    amountValue >= 1 &&
    amountValue <= 100000;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid || submitting) return;
    await onSubmit({
      kind,
      title: title.trim(),
      summary: summary.trim(),
      amountRoj: amountValue,
      region,
    });
    setTitle("");
    setSummary("");
    setAmount("");
  };

  const kinds: { value: DisputeKind; label: string }[] = [
    { value: "agreement", label: s.kindAgreement },
    { value: "arbitration", label: s.kindArbitration },
  ];

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <fieldset className="sm:col-span-2">
        <div className="inline-flex flex-wrap gap-1 rounded-xl border border-white/10 bg-ink/60 p-1">
          {kinds.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => setKind(k.value)}
              aria-pressed={kind === k.value}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-semibold transition",
                kind === k.value ? "bg-sun text-ink" : "text-slate-300 hover:text-slate-100",
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">{s.kindHint}</p>
      </fieldset>

      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{s.fieldTitle}</span>
        <input className={INPUT} value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{s.fieldSummary}</span>
        <textarea
          className={cn(INPUT, "min-h-[96px] resize-y")}
          value={summary}
          maxLength={1000}
          onChange={(e) => setSummary(e.target.value)}
        />
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{s.fieldAmount}</span>
        <input
          className={INPUT}
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
        />
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{s.fieldRegion}</span>
        <select className={INPUT} value={region} onChange={(e) => setRegion(e.target.value as Region)}>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {regionNames[r]}
            </option>
          ))}
        </select>
      </label>

      <p className="text-xs text-slate-500 sm:col-span-2">{s.escrowNote}</p>

      {submitError && (
        <p role="alert" className="text-sm text-flame sm:col-span-2">
          {submitError === "rate_limited" ? s.errorRateLimited : s.fileError}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={!valid || submitting}
          className="rounded-lg bg-sun px-5 py-2.5 text-sm font-bold text-ink shadow-[0_0_24px_-6px_rgba(255,201,51,0.7)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? s.submitting : s.submit}
        </button>
      </div>
    </form>
  );
}
