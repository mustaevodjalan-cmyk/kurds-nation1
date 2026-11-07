"use client";

import { useState } from "react";
import { ChevronDown, Coins, Gavel, Plus, RefreshCw, X } from "lucide-react";
import type { useJustice } from "@/hooks/use-justice";
import type { DashboardStrings } from "@/lib/dashboard-i18n";
import type { DisputeStatus } from "@/lib/justice-api";
import type { JusticeStrings } from "@/lib/justice-i18n";
import { cn } from "@/lib/utils";
import { DisputeForm } from "./dispute-form";
import { JurorSeatPanel } from "./juror-seat-panel";
import { JuryPanel } from "./jury-panel";

type Props = {
  strings: JusticeStrings;
  regionNames: DashboardStrings["regionNames"];
  hasPassport: boolean;
  justice: ReturnType<typeof useJustice>;
};

const STATUS_STYLE: Record<DisputeStatus, string> = {
  open: "border-jade/40 bg-jade/10 text-jade",
  in_review: "border-sun/40 bg-sun/10 text-sun",
  resolved: "border-ice/40 bg-ice/10 text-ice",
};

export function JusticeView({ strings: s, regionNames, hasPassport, justice }: Props) {
  const [composing, setComposing] = useState(false);
  const [openJuryId, setOpenJuryId] = useState<string | null>(null);
  const {
    disputes,
    jurors,
    seats,
    balance,
    status,
    submitting,
    submitError,
    submitted,
    submit,
    reload,
    actionBusy,
    actionError,
    seal,
    reveal,
  } = justice;

  const statusLabel: Record<DisputeStatus, string> = {
    open: s.statusOpen,
    in_review: s.statusInReview,
    resolved: s.statusResolved,
  };

  return (
    <section className="space-y-8 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-sun/40 bg-sun/10 px-3 py-1 text-xs font-semibold tracking-wide text-sun">
            <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
            {s.title}
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-50">{s.title}</h2>
          <p className="max-w-xl text-sm leading-relaxed text-slate-400">{s.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setComposing((v) => !v)}
          aria-expanded={composing}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-sun/50 bg-sun/10 px-4 py-2.5 text-sm font-semibold text-sun transition hover:bg-sun/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun sm:self-auto"
        >
          {composing ? <X className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
          {composing ? s.fileClose : s.fileToggle}
        </button>
      </header>

      {composing && (
        <div className="rounded-2xl border border-sun/30 bg-slate-900/70 p-6 shadow-[0_0_40px_-18px_rgba(255,201,51,0.6)] backdrop-blur">
          {hasPassport ? (
            <>
              {submitted && (
                <p role="status" className="mb-4 rounded-lg border border-jade/40 bg-jade/10 px-4 py-2.5 text-sm font-medium text-jade">
                  {s.filed}
                </p>
              )}
              <DisputeForm
                strings={s}
                regionNames={regionNames}
                submitting={submitting}
                submitError={submitError}
                onSubmit={submit}
              />
            </>
          ) : (
            <p className="text-sm text-slate-300">{s.locked}</p>
          )}
        </div>
      )}

      {actionError && (
        <p role="alert" className="rounded-lg border border-flame/40 bg-flame/10 px-4 py-2.5 text-sm font-medium text-flame">
          {actionError === "rate_limited" ? s.errorRateLimited : s.actionError}
        </p>
      )}

      {status === "loading" && (
        <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
          {[0, 1].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-white/5 bg-white/5" />
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

      {status === "ready" && disputes.length === 0 && (
        <p className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-400">{s.empty}</p>
      )}

      {status === "ready" && disputes.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {disputes.map((d) => {
            const panelJurors = jurors.filter((j) => j.disputeId === d.id);
            const mySeat = seats.find((seat) => seat.disputeId === d.id);
            const expanded = openJuryId === d.id;
            const isArbitration = d.kind === "arbitration";
            const sealedCount = panelJurors.filter((j) => j.committed).length;
            const revealedCount = panelJurors.filter((j) => j.revealed).length;
            return (
              <li key={d.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur transition duration-300 hover:border-sun/40">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs font-bold uppercase tracking-wide",
                      isArbitration ? "border-ice/40 bg-ice/10 text-ice" : "border-sun/40 bg-sun/10 text-sun",
                    )}
                  >
                    {isArbitration ? s.kindArbitration : s.kindAgreement}
                  </span>
                  <span className={cn("rounded-md border px-2 py-1 text-xs font-semibold", STATUS_STYLE[d.status])}>
                    {statusLabel[d.status]}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold leading-snug text-slate-50">{d.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{d.summary}</p>

                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1">
                    <Coins className="h-3.5 w-3.5 text-sun" aria-hidden="true" />
                    {s.escrowLabel}: {d.amountRoj.toLocaleString()} $ROJ
                  </span>
                  <span className="rounded-md border border-white/10 px-2 py-1">{regionNames[d.region]}</span>
                </div>

                {isArbitration && (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenJuryId(expanded ? null : d.id)}
                      aria-expanded={expanded}
                      className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-ice transition hover:text-ice/80"
                    >
                      <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} aria-hidden="true" />
                      {expanded ? s.hideJury : s.viewJury}
                    </button>
                    {expanded && <JuryPanel strings={s} jurors={panelJurors} />}
                  </>
                )}

                {mySeat && (
                  <JurorSeatPanel
                    strings={s}
                    seat={mySeat}
                    balance={balance}
                    sealedCount={sealedCount}
                    revealedCount={revealedCount}
                    totalJurors={panelJurors.length}
                    resolved={d.status === "resolved"}
                    verdict={d.verdict}
                    busy={actionBusy}
                    onSeal={(verdict, stake) => void seal(d.id, verdict, stake)}
                    onReveal={() => void reveal(d.id)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
