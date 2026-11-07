"use client";

import { useEffect, useRef } from "react";
import { Coins, Lock, Sparkles } from "lucide-react";
import type { Strings } from "@/lib/i18n";
import type { Passport } from "@/hooks/use-passport";
import type { CitizenRank } from "@/lib/roj-api";
import type { DashboardStrings } from "@/lib/dashboard-i18n";
import { formatCitizenNumber } from "@/lib/registry";
import type { RegistryStrings } from "@/lib/registry-i18n";
import { shortAddress } from "@/lib/wallet";
import { cn } from "@/lib/utils";
import { QrCode } from "@/components/network/qr-code";
import { SunMark } from "./sun-mark";

type PassportCardProps = {
  t: Strings;
  registry: RegistryStrings;
  dash: DashboardStrings;
  account: string | null;
  passport: Passport | null;
  balance: number | null;
  rank: CitizenRank | null;
  scanKey: number;
};

export function PassportCard({ t, registry, dash, account, passport, balance, rank, scanKey }: PassportCardProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!stage || !card) return;

    const onMove = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.transform = `rotateY(${((x - 0.5) * 14).toFixed(2)}deg) rotateX(${((0.5 - y) * 12).toFixed(2)}deg)`;
      card.style.setProperty("--mx", (x * 100).toFixed(0) + "%");
      card.style.setProperty("--my", (y * 100).toFixed(0) + "%");
    };
    const onLeave = () => {
      card.style.transform = "";
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const holderLabel = passport ? registry.aliasLabel : t.holder;
  const holderValue = passport
    ? passport.alias
    : account
      ? shortAddress(account)
      : "•••• •••• ••••";
  const keeper = passport !== null && rank === "history_keeper";
  const rankLabel = keeper ? dash.rankKeeper : dash.rankNovice;

  return (
    <div ref={stageRef} className="mx-auto w-full max-w-md [perspective:1000px]">
      <div
        ref={cardRef}
        className={cn(
          "relative aspect-[1.586] min-h-[15rem] w-full overflow-hidden rounded-3xl border bg-gradient-to-br from-white/15 to-white/[0.04] p-6 pb-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)] backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-500 [transform-style:preserve-3d]",
          keeper
            ? "border-sun/70 shadow-[0_0_70px_-12px_rgba(255,201,51,0.6),0_30px_80px_-20px_rgba(0,0,0,.8)]"
            : "border-white/20",
        )}
      >
        <div aria-hidden="true" className="holo absolute -inset-10 -z-10 opacity-70" />
        <div aria-hidden="true" className="shine pointer-events-none absolute inset-0" />
        <div key={scanKey} aria-hidden="true" className={cn("scan", scanKey > 0 && "go")} />
        {keeper && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-sun/20 via-transparent to-transparent" />
        )}

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wide text-slate-200">{t.brand}</p>
              <p className="mt-1 text-xl font-bold">{t.cardTitle}</p>
            </div>
            <SunMark className="h-14 w-14 shrink-0" lit={passport !== null} />
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-slate-400">{holderLabel}</p>
              <p className="addr mt-0.5 truncate text-base tracking-widest">{holderValue}</p>
              {passport && (
                <p className="mt-2 font-mono text-sm tracking-wider text-ice">
                  #{formatCitizenNumber(passport.citizenNumber)}
                </p>
              )}
            </div>
            <div className="h-[5.5rem] w-[5.5rem] shrink-0">
              {passport ? (
                <QrCode
                  value={`NN-CITIZEN:${passport.citizenNumber}`}
                  label={`${registry.scanHint}: #${formatCitizenNumber(passport.citizenNumber)}`}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-white/25 text-slate-500">
                  <Lock className="h-5 w-5" aria-hidden="true" />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-medium text-slate-100">
              <span className={cn("h-2 w-2 rounded-full", passport ? "bg-jade" : "bg-flame")} />
              <span>{passport ? registry.verified : t.locked}</span>
            </span>
            {passport && balance !== null && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sun/50 bg-sun/10 px-2.5 py-1 font-mono text-xs font-semibold text-sun">
                  <Coins className="h-3.5 w-3.5" aria-hidden="true" />
                  {balance} {dash.balanceLabel}
                </span>
                {rank && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-colors duration-500",
                      keeper ? "bg-sun text-ink" : "border border-ice/50 text-ice",
                    )}
                  >
                    {keeper && <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}
                    {rankLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex h-1.5">
          <i className="flex-1 bg-flame" />
          <i className="flex-1 bg-white" />
          <i className="flex-1 bg-jade" />
        </div>
      </div>
    </div>
  );
}
