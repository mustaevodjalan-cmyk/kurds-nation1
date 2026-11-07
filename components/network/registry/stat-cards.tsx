"use client";

import { useCountUp } from "@/hooks/use-count-up";
import { DIALECTS, REGIONS, isHomeland, type Dialect, type Region } from "@/lib/registry";
import type { RegistryStats } from "@/lib/registry-api";
import type { RegistryStrings } from "@/lib/registry-i18n";
import { cn } from "@/lib/utils";
import { Panel } from "@/components/network/registry/panel";

const formatCount = (value: number) => value.toLocaleString("en-US");

function percentOf(part: number, whole: number): number {
  return whole > 0 ? (part / whole) * 100 : 0;
}

function ProgressBar({ label, count, percent, tone }: { label: string; count: number; percent: number; tone: string }) {
  return (
    <li>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
        <span className="text-slate-200">{label}</span>
        <span className="font-mono text-xs text-slate-400">
          {formatCount(count)} · {Math.round(percent)}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        className="h-2 overflow-hidden rounded-full bg-white/10"
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", tone)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </li>
  );
}

export function TotalCounter({ total, strings: m }: { total: number; strings: RegistryStrings }) {
  const value = useCountUp(total);

  return (
    <Panel className="flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{m.totalLabel}</p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-jade/40 bg-jade/10 px-2.5 py-1 text-[11px] font-bold tracking-wider text-jade">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jade opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-jade" />
          </span>
          {m.live}
        </span>
      </div>
      <p className="mt-8 font-mono text-5xl font-bold tabular-nums text-sun sm:text-6xl">{formatCount(value)}</p>
    </Panel>
  );
}

export function RegionBreakdown({ regions, strings: m }: { regions: RegistryStats["regions"]; strings: RegistryStrings }) {
  const counts = REGIONS.map((region: Region) => ({ region, count: regions[region] ?? 0 }));
  const homelandCount = counts.filter((c) => isHomeland(c.region)).reduce((sum, c) => sum + c.count, 0);
  const diasporaCount = counts.filter((c) => !isHomeland(c.region)).reduce((sum, c) => sum + c.count, 0);
  const total = homelandCount + diasporaCount;
  const homelandPercent = percentOf(homelandCount, total);
  const diasporaPercent = percentOf(diasporaCount, total);

  return (
    <Panel>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">{m.regionsTitle}</h3>

      <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <div className="bg-jade transition-[width] duration-700 ease-out" style={{ width: `${homelandPercent}%` }} />
        <div className="bg-ice transition-[width] duration-700 ease-out" style={{ width: `${diasporaPercent}%` }} />
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-jade" aria-hidden="true" />
          <dt className="text-slate-300">{m.homeland}</dt>
          <dd className="ms-auto font-mono text-xs text-slate-400">
            {formatCount(homelandCount)} · {Math.round(homelandPercent)}%
          </dd>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ice" aria-hidden="true" />
          <dt className="text-slate-300">{m.diaspora}</dt>
          <dd className="ms-auto font-mono text-xs text-slate-400">
            {formatCount(diasporaCount)} · {Math.round(diasporaPercent)}%
          </dd>
        </div>
      </dl>

      <ul className="mt-6 space-y-4">
        {counts.map(({ region, count }) => (
          <ProgressBar
            key={region}
            label={m.regionNames[region]}
            count={count}
            percent={percentOf(count, total)}
            tone={isHomeland(region) ? "bg-jade" : "bg-ice"}
          />
        ))}
      </ul>
    </Panel>
  );
}

export function DialectBreakdown({ dialects, strings: m }: { dialects: RegistryStats["dialects"]; strings: RegistryStrings }) {
  const counts = DIALECTS.map((dialect: Dialect) => ({ dialect, count: dialects[dialect] ?? 0 }));
  const total = counts.reduce((sum, c) => sum + c.count, 0);

  return (
    <Panel>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">{m.dialectsTitle}</h3>
      <ul className="mt-6 space-y-4">
        {counts.map(({ dialect, count }) => (
          <ProgressBar
            key={dialect}
            label={m.dialectNames[dialect]}
            count={count}
            percent={percentOf(count, total)}
            tone="bg-sun"
          />
        ))}
      </ul>
    </Panel>
  );
}
