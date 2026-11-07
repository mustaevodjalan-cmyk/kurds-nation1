"use client";

import { useState } from "react";
import type { DashboardStrings } from "@/lib/dashboard-i18n";
import type { Region } from "@/lib/registry";
import { MAP_HEIGHT, MAP_WIDTH, projectPoint, WORLD_BORDER_PATH, WORLD_LAND_PATH } from "@/lib/world-geo";

const DOT_STEP = 10;

type HubLabel = keyof Pick<DashboardStrings, "mapHomeland" | "mapEurope" | "mapCis">;

type Hub = {
  id: string;
  label: HubLabel;
  color: string;
  ringRadius: number;
  regions: Region[];
  sites: [lat: number, lon: number][];
};

const HUBS: Hub[] = [
  {
    id: "homeland",
    label: "mapHomeland",
    color: "#3de6ff",
    ringRadius: 22,
    regions: ["bakur", "rojava", "basur", "rojhilat"],
    sites: [
      [38.0, 41.0],
      [36.5, 40.5],
      [35.5, 44.0],
      [35.5, 47.0],
    ],
  },
  {
    id: "europe",
    label: "mapEurope",
    color: "#a78bfa",
    ringRadius: 16,
    regions: ["europe"],
    sites: [
      [51.2, 10.4],
      [60.1, 18.6],
      [46.6, 2.2],
    ],
  },
  {
    id: "cis",
    label: "mapCis",
    color: "#ff3b4a",
    ringRadius: 12,
    regions: ["cis"],
    sites: [
      [40.2, 44.5],
      [55.7, 37.6],
      [43.2, 76.9],
    ],
  },
];

type DiasporaHeatmapProps = {
  dash: DashboardStrings;
  regions: Partial<Record<Region, number>>;
};

function clusterTotal(hub: Hub, regions: Partial<Record<Region, number>>): number {
  return hub.regions.reduce((sum, region) => sum + (regions[region] ?? 0), 0);
}

function Pulse({ x, y, color, radius, delay }: { x: number; y: number; color: string; radius: number; delay: number }) {
  return (
    <g filter="url(#nn-glow)">
      {[0, 1].map((ring) => (
        <circle key={ring} cx={x} cy={y} r={radius} fill="none" stroke={color} strokeWidth="1.5">
          <animate
            attributeName="r"
            values={`${radius * 0.35};${radius * 1.7}`}
            dur="2.8s"
            begin={`${delay + ring * 1.4}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.9;0"
            dur="2.8s"
            begin={`${delay + ring * 1.4}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
      <circle cx={x} cy={y} r={2.5} fill={color} />
    </g>
  );
}

export function DiasporaHeatmap({ dash: d, regions }: DiasporaHeatmapProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = HUBS.find((hub) => hub.id === activeId) ?? null;
  const anchor = active ? projectPoint(...active.sites[0]) : null;

  return (
    <div className="relative">
      <div className="relative aspect-[2/1] w-full overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_center,_#111a2e_0%,_#070b14_75%)]">
        <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="h-full w-full" role="img" aria-label={d.mapTitle}>
          <defs>
            <filter id="nn-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id="nn-dots" width={DOT_STEP} height={DOT_STEP} patternUnits="userSpaceOnUse">
              <circle cx={DOT_STEP / 2} cy={DOT_STEP / 2} r="1" fill="#2a3a52" />
            </pattern>
            <clipPath id="nn-land">
              <path d={WORLD_LAND_PATH} />
            </clipPath>
          </defs>

          <path d={WORLD_LAND_PATH} fill="#0c1526" />
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#nn-dots)" clipPath="url(#nn-land)" />
          <path
            d={WORLD_BORDER_PATH}
            fill="none"
            stroke="#3b4d6b"
            strokeWidth="0.6"
            strokeLinejoin="round"
            opacity="0.7"
          />
          <path d={WORLD_LAND_PATH} fill="none" stroke="#3de6ff" strokeOpacity="0.18" strokeWidth="1" />

          {HUBS.map((hub) => {
            const selected = activeId === hub.id;
            return (
              <g
                key={hub.id}
                role="button"
                tabIndex={0}
                aria-label={`${d[hub.label]}: ${clusterTotal(hub, regions)} ${d.mapCitizens}`}
                className="cursor-pointer focus:outline-none"
                onMouseEnter={() => setActiveId(hub.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(hub.id)}
                onBlur={() => setActiveId(null)}
                opacity={active && !selected ? 0.55 : 1}
              >
                {hub.sites.map(([lat, lon], index) => {
                  const [x, y] = projectPoint(lat, lon);
                  return (
                    <g key={`${lat}-${lon}`}>
                      <circle cx={x} cy={y} r={hub.ringRadius * 1.6} fill="transparent" />
                      <Pulse x={x} y={y} color={hub.color} radius={hub.ringRadius} delay={index * 0.5} />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {active && anchor && (
          <div
            role="status"
            className="pointer-events-none absolute z-10 w-60 -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in-95 duration-200 rounded-xl border bg-ink/90 p-3 text-xs backdrop-blur"
            style={{
              left: `${(anchor[0] / MAP_WIDTH) * 100}%`,
              top: `${(anchor[1] / MAP_HEIGHT) * 100}%`,
              marginTop: "-16px",
              borderColor: `${active.color}66`,
              boxShadow: `0 0 28px -6px ${active.color}`,
            }}
          >
            <p className="font-semibold text-slate-100">{d[active.label]}</p>
            <p className="mt-1 font-mono text-lg font-bold" style={{ color: active.color }}>
              {clusterTotal(active, regions).toLocaleString()}
              <span className="ms-1.5 text-xs font-normal text-slate-300">{d.mapCitizens}</span>
            </p>
            <ul className="mt-2 space-y-0.5 text-slate-400">
              {active.regions.map((region) => (
                <li key={region} className="flex justify-between">
                  <span>{d.regionNames[region]}</span>
                  <span className="font-mono text-slate-200">{(regions[region] ?? 0).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {HUBS.map((hub) => (
            <li key={hub.id} className="inline-flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: hub.color, boxShadow: `0 0 10px ${hub.color}` }}
                aria-hidden="true"
              />
              {d[hub.label]}
            </li>
          ))}
        </ul>
        <span>{d.mapNote}</span>
      </div>
    </div>
  );
}
