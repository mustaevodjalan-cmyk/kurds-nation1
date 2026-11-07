import type { Strings } from "@/lib/i18n";
import type { DashboardStrings } from "@/lib/dashboard-i18n";
import type { RegistryStrings } from "@/lib/registry-i18n";
import type { WalletState } from "@/hooks/use-wallet";
import type { PassportState } from "@/hooks/use-passport";
import type { CitizenDashboardState } from "@/hooks/use-citizen-dashboard";
import { FeatureList } from "@/components/network/feature-list";
import { PassportCard } from "@/components/network/passport-card";
import { PassportSection } from "@/components/network/passport/passport-section";
import { DailyQuiz } from "@/components/network/quiz/daily-quiz";
import { WalletPanel } from "@/components/network/wallet-panel";

type HomeViewProps = {
  t: Strings;
  registry: RegistryStrings;
  dash: DashboardStrings;
  wallet: WalletState;
  passport: PassportState;
  citizen: CitizenDashboardState;
};

export function HomeView({ t, registry, dash, wallet, passport, citizen }: HomeViewProps) {
  const active = passport.passport !== null;

  return (
    <>
      <section className="grid items-center gap-12 py-10 lg:grid-cols-2 lg:py-20">
        <div>
          <h1 className="text-4xl font-bold leading-tight sm:text-6xl">{t.title}</h1>
          <p className="mt-5 max-w-[34ch] text-lg text-slate-300">{t.lead}</p>

          <WalletPanel
            t={t}
            account={wallet.account}
            chainId={wallet.chainId}
            passport={wallet.passport}
            demo={wallet.demo}
            busy={wallet.busy}
            message={wallet.message}
            onConnect={wallet.connect}
            onDisconnect={wallet.disconnect}
            onDemo={wallet.enterDemo}
          />

          <p className="mt-6 max-w-[46ch] text-sm text-slate-400">{t.tip}</p>
        </div>

        <PassportCard
          t={t}
          registry={registry}
          dash={dash}
          account={wallet.account}
          passport={passport.passport}
          balance={citizen.dashboard?.balance ?? null}
          rank={citizen.dashboard?.rank ?? null}
          scanKey={wallet.scanKey}
        />
      </section>

      <PassportSection strings={registry} passport={passport} />

      <div className="mx-auto mt-10 w-full max-w-3xl">
        <DailyQuiz strings={dash} state={citizen} active={active} />
      </div>

      <FeatureList features={t.features} />
    </>
  );
}
