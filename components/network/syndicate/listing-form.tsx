"use client";

import { useState, type FormEvent } from "react";
import { REGIONS, type Region } from "@/lib/registry";
import type { ListingDraft, ListingKind } from "@/lib/syndicate-api";
import type { SyndicateStrings } from "@/lib/syndicate-i18n";
import type { DashboardStrings } from "@/lib/dashboard-i18n";
import { cn } from "@/lib/utils";

const INPUT =
  "w-full rounded-lg border border-white/10 bg-ink/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-ice/60 focus:outline-none focus:ring-2 focus:ring-ice/30";

type Props = {
  strings: SyndicateStrings;
  regionNames: DashboardStrings["regionNames"];
  submitting: boolean;
  submitError: "failed" | "rate_limited" | null;
  onSubmit: (draft: ListingDraft) => Promise<void>;
};

export function ListingForm({ strings: s, regionNames, submitting, submitError, onSubmit }: Props) {
  const [kind, setKind] = useState<ListingKind>("job");
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [region, setRegion] = useState<Region>("basur");
  const [description, setDescription] = useState("");

  const valid =
    title.trim().length >= 3 &&
    organization.trim().length >= 2 &&
    description.trim().length >= 10;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid || submitting) return;
    await onSubmit({
      kind,
      title: title.trim(),
      organization: organization.trim(),
      region,
      description: description.trim(),
    });
    setTitle("");
    setDescription("");
  };

  const kinds: { value: ListingKind; label: string }[] = [
    { value: "job", label: s.kindJob },
    { value: "b2b", label: s.kindB2B },
  ];

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{s.fieldKind}</legend>
        <div className="inline-flex rounded-full border border-white/10 bg-ink/60 p-1">
          {kinds.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => setKind(k.value)}
              aria-pressed={kind === k.value}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition",
                kind === k.value ? "bg-ice text-ink" : "text-slate-300 hover:text-slate-100",
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{s.fieldTitle}</span>
        <input className={INPUT} value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{s.fieldOrganization}</span>
        <input className={INPUT} value={organization} maxLength={60} onChange={(e) => setOrganization(e.target.value)} />
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

      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{s.fieldDescription}</span>
        <textarea
          className={cn(INPUT, "min-h-[96px] resize-y")}
          value={description}
          maxLength={1000}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      {submitError && (
        <p role="alert" className="text-sm text-flame sm:col-span-2">
          {submitError === "rate_limited" ? s.errorRateLimited : s.postError}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={!valid || submitting}
          className="rounded-lg bg-jade px-5 py-2.5 text-sm font-bold text-ink shadow-[0_0_24px_-6px_rgba(25,211,107,0.7)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? s.submitting : s.submit}
        </button>
      </div>
    </form>
  );
}
