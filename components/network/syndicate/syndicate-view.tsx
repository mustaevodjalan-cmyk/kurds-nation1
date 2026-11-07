"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Briefcase, Building2, Plus, RefreshCw, X } from "lucide-react";
import type { useSyndicate } from "@/hooks/use-syndicate";
import type { DashboardStrings } from "@/lib/dashboard-i18n";
import type { ListingKind } from "@/lib/syndicate-api";
import type { SyndicateStrings } from "@/lib/syndicate-i18n";
import { cn } from "@/lib/utils";
import { ListingForm } from "./listing-form";

type Filter = "all" | ListingKind;

type Props = {
  strings: SyndicateStrings;
  regionNames: DashboardStrings["regionNames"];
  hasPassport: boolean;
  syndicate: ReturnType<typeof useSyndicate>;
};

export function SyndicateView({ strings: s, regionNames, hasPassport, syndicate }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [composing, setComposing] = useState(false);
  const { listings, status, submitting, submitError, submitted, submit, reload } = syndicate;

  const visible = useMemo(
    () => (filter === "all" ? listings : listings.filter((l) => l.kind === filter)),
    [listings, filter],
  );

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: s.filterAll },
    { value: "job", label: s.filterJobs },
    { value: "b2b", label: s.filterB2B },
  ];

  return (
    <section className="space-y-8 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-jade/40 bg-jade/10 px-3 py-1 text-xs font-semibold tracking-wide text-jade">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-jade" aria-hidden="true" />
            {s.liveLabel}
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-50">{s.title}</h2>
          <p className="max-w-xl text-sm leading-relaxed text-slate-400">{s.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setComposing((v) => !v)}
          aria-expanded={composing}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-ice/50 bg-ice/10 px-4 py-2.5 text-sm font-semibold text-ice transition hover:bg-ice/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice sm:self-auto"
        >
          {composing ? <X className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
          {composing ? s.postClose : s.postToggle}
        </button>
      </header>

      {composing && (
        <div className="rounded-2xl border border-ice/30 bg-slate-900/70 p-6 shadow-[0_0_40px_-18px_rgba(61,230,255,0.6)] backdrop-blur">
          {hasPassport ? (
            <>
              {submitted && (
                <p role="status" className="mb-4 rounded-lg border border-jade/40 bg-jade/10 px-4 py-2.5 text-sm font-medium text-jade">
                  {s.posted}
                </p>
              )}
              <ListingForm
                strings={s}
                regionNames={regionNames}
                submitting={submitting}
                submitError={submitError}
                onSubmit={submit}
              />
            </>
          ) : (
            <p className="text-sm text-slate-300">{s.postLocked}</p>
          )}
        </div>
      )}

      <div role="tablist" aria-label={s.title} className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold transition",
              filter === f.value
                ? "border-sun bg-sun text-ink"
                : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:text-slate-100",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {status === "loading" && (
        <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-white/5 bg-white/5" />
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

      {status === "ready" && visible.length === 0 && (
        <p className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-400">{s.empty}</p>
      )}

      {status === "ready" && visible.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {visible.map((l) => (
            <li
              key={l.id}
              className={cn(
                "group relative overflow-hidden rounded-2xl border bg-slate-900/60 p-6 backdrop-blur transition duration-300 hover:-translate-y-0.5",
                l.trusted
                  ? "border-sun/50 shadow-[0_0_32px_-14px_rgba(255,201,51,0.7)] hover:shadow-[0_0_44px_-12px_rgba(255,201,51,0.9)]"
                  : "border-white/10 hover:border-ice/40",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wide",
                    l.kind === "job" ? "bg-ice/15 text-ice" : "bg-flame/15 text-flame",
                  )}
                >
                  {l.kind === "job" ? <Briefcase className="h-3.5 w-3.5" aria-hidden="true" /> : <Building2 className="h-3.5 w-3.5" aria-hidden="true" />}
                  {l.kind === "job" ? s.kindJob : s.kindB2B}
                </span>
                <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-300">{regionNames[l.region]}</span>
              </div>

              <h3 className="mt-4 text-lg font-semibold leading-snug text-slate-50">{l.title}</h3>
              <p className="mt-1 text-sm font-medium text-slate-300">{l.organization}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{l.description}</p>

              {l.trusted && (
                <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-sun/30 bg-sun/10 p-3">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-sun" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-bold text-sun">{s.trustBadge}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-300">
                      {s.trustHint} {s.multiplierNote}
                    </p>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
