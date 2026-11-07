"use client";

import { Lock } from "lucide-react";
import { formatCitizenNumber } from "@/lib/registry";
import type { CitizenRecord } from "@/lib/registry-api";
import type { RegistryStrings } from "@/lib/registry-i18n";
import { Panel } from "@/components/network/registry/panel";

function formatAgo(createdAt: string, now: number, m: RegistryStrings): string {
  const seconds = Math.max(0, Math.floor((now - Date.parse(createdAt)) / 1000));
  if (seconds < 60) return m.justNow;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return m.minutesAgo.replace("{n}", String(minutes));
  return m.hoursAgo.replace("{n}", String(Math.floor(minutes / 60)));
}

export function LedgerFeed({ entries, strings: m }: { entries: CitizenRecord[]; strings: RegistryStrings }) {
  const now = Date.now();

  return (
    <Panel>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">{m.feedTitle}</h3>
      {entries.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">{m.feedEmpty}</p>
      ) : (
        <ol className="mt-4 divide-y divide-white/10">
          {entries.map((entry) => (
            <li key={entry.citizenNumber} className="flex items-center gap-3 py-3">
              <Lock className="h-4 w-4 shrink-0 text-jade" aria-hidden="true" />
              <p className="min-w-0 flex-1 truncate text-sm text-slate-200">
                {m.feedEntry
                  .replace("{number}", `#${formatCitizenNumber(entry.citizenNumber)}`)
                  .replace("{region}", m.regionNames[entry.region])}
              </p>
              <time dateTime={entry.createdAt} className="shrink-0 text-xs text-slate-400">
                {formatAgo(entry.createdAt, now, m)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
