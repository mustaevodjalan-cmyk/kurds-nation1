"use client";

import { ShieldCheck } from "lucide-react";
import { formatCitizenNumber } from "@/lib/registry";
import type { RegistryStrings } from "@/lib/registry-i18n";
import type { PassportState } from "@/hooks/use-passport";
import { PassportIssueForm } from "@/components/network/passport/issue-form";
import { MintOverlay } from "@/components/network/passport/mint-overlay";

type PassportSectionProps = {
  strings: RegistryStrings;
  passport: PassportState;
};

export function PassportSection({ strings: m, passport }: PassportSectionProps) {
  const errorText =
    passport.error === "mint"
      ? m.errorMint
      : passport.error === "rate_limited"
        ? m.errorRateLimited
        : passport.error === "wipe"
          ? m.errorWipe
          : null;

  return (
    <section
      aria-labelledby="passport-section-title"
      className="relative mx-auto mt-6 max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04] p-6 shadow-[0_0_60px_-24px_rgba(25,211,107,0.35)] backdrop-blur-xl sm:p-8"
    >
      {passport.status === "active" && passport.passport ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-jade" aria-hidden="true" />
            <h2 id="passport-section-title" className="text-xl font-bold">
              {m.verified}
            </h2>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-400">{m.aliasLabel}</dt>
              <dd className="mt-1 text-base font-semibold text-slate-100">{passport.passport.alias}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-400">{m.citizenIdLabel}</dt>
              <dd className="mt-1 font-mono text-base text-ice">#{formatCitizenNumber(passport.passport.citizenNumber)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-400">{m.regionLabel}</dt>
              <dd className="mt-1 text-base text-slate-100">{m.regionNames[passport.passport.region]}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-400">{m.dialectLabel}</dt>
              <dd className="mt-1 text-base text-slate-100">
                {m.dialectNames[passport.passport.dialect]}
              </dd>
            </div>
          </dl>
          <p className="text-sm text-slate-400">{m.issuedNote}</p>
          {errorText && <ErrorLine text={errorText} />}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 id="passport-section-title" className="text-xl font-bold">
              {m.issueTitle}
            </h2>
            <p className="mt-2 text-sm text-slate-400">{m.issueHint}</p>
          </div>
          <PassportIssueForm
            strings={m}
            draft={passport.draft}
            onChange={passport.setDraft}
            onSubmit={(valid) => void passport.mint(valid)}
          />
          {errorText && <ErrorLine text={errorText} />}
        </div>
      )}

      {passport.status === "minting" && <MintOverlay steps={m.mintSteps} />}
    </section>
  );
}

function ErrorLine({ text }: { text: string }) {
  return (
    <p role="alert" className="rounded-xl border border-flame/50 bg-flame/10 px-4 py-3 text-sm text-flame">
      {text}
    </p>
  );
}
