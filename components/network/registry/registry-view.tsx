"use client";

import type { RegistryState } from "@/hooks/use-registry";
import type { DashboardStrings } from "@/lib/dashboard-i18n";
import type { RegistryStrings } from "@/lib/registry-i18n";
import { DialectBreakdown, RegionBreakdown, TotalCounter } from "@/components/network/registry/stat-cards";
import { DiasporaHeatmap } from "@/components/network/registry/diaspora-heatmap";
import { LedgerFeed } from "@/components/network/registry/ledger-feed";
import { Panel } from "@/components/network/registry/panel";

type RegistryViewProps = {
  strings: RegistryStrings;
  dash: DashboardStrings;
  registry: RegistryState;
};

export function RegistryView({ strings: m, dash: d, registry }: RegistryViewProps) {
  const { stats, recent, status, refresh } = registry;

  return (
    <section aria-labelledby="registry-title" className="space-y-6 py-10">
      <div>
        <h2 id="registry-title" className="text-2xl font-bold sm:text-3xl">
          {m.registryTitle}
        </h2>
        <p className="mt-2 text-sm text-slate-400">{m.registrySubtitle}</p>
      </div>

      {stats ? (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <TotalCounter total={stats.total} strings={m} />
            <div className="lg:col-span-2">
              <RegionBreakdown regions={stats.regions} strings={m} />
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <DialectBreakdown dialects={stats.dialects} strings={m} />
            <div className="lg:col-span-2">
              <LedgerFeed entries={recent} strings={m} />
            </div>
          </div>
          <Panel className="space-y-5">
            <div>
              <h3 className="text-lg font-bold">{d.mapTitle}</h3>
              <p className="mt-1 text-sm text-slate-400">{d.mapSubtitle}</p>
            </div>
            <DiasporaHeatmap dash={d} regions={stats.regions} />
          </Panel>
        </>
      ) : status === "error" ? (
        <Panel className="flex flex-col items-center gap-4 py-12 text-center">
          <p role="alert" className="text-sm text-flame">
            {m.loadError}
          </p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded-xl border border-ice/50 bg-ice/10 px-5 py-2.5 text-sm font-semibold text-ice transition hover:bg-ice/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice"
          >
            {m.retry}
          </button>
        </Panel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3" aria-hidden="true">
          <Panel className="h-44 animate-pulse" />
          <Panel className="h-44 animate-pulse lg:col-span-2" />
        </div>
      )}
    </section>
  );
}
