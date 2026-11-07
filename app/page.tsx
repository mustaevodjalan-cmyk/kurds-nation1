"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useWallet } from "@/hooks/use-wallet";
import { useMessenger } from "@/hooks/use-messenger";
import { usePassport } from "@/hooks/use-passport";
import { useCitizenDashboard } from "@/hooks/use-citizen-dashboard";
import { useRegistry } from "@/hooks/use-registry";
import { useSyndicate } from "@/hooks/use-syndicate";
import { useJustice } from "@/hooks/use-justice";
import { useMedia } from "@/hooks/use-media";
import { DASHBOARD_I18N } from "@/lib/dashboard-i18n";
import { JUSTICE_I18N } from "@/lib/justice-i18n";
import { MEDIA_I18N } from "@/lib/media-i18n";
import { MESSENGER_I18N } from "@/lib/messenger-i18n";
import { NAVIGATION_I18N } from "@/lib/navigation-i18n";
import { REGISTRY_I18N } from "@/lib/registry-i18n";
import { SYNDICATE_I18N } from "@/lib/syndicate-i18n";
import { cn } from "@/lib/utils";
import { HomeView } from "@/components/network/home-view";
import { JusticeView } from "@/components/network/justice/justice-view";
import { LanguageSwitcher } from "@/components/network/language-switcher";
import { MediaView } from "@/components/network/media/media-view";
import { MessengerView } from "@/components/network/messenger/messenger-view";
import { NetworkStatus } from "@/components/network/network-status";
import { RegistryView } from "@/components/network/registry/registry-view";
import { SunMark } from "@/components/network/sun-mark";
import { SyndicateView } from "@/components/network/syndicate/syndicate-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TAB_TRIGGER =
  "rounded-full px-4 py-2 text-sm font-semibold text-slate-300 hover:text-slate-100 data-[state=active]:text-ink data-[state=active]:shadow-none sm:px-5";

export default function Home() {
  const { lang, changeLang, t } = useLanguage();
  const wallet = useWallet();
  const messenger = useMessenger();
  const passport = usePassport();
  const citizen = useCitizenDashboard(passport.ownerToken);
  const registry = useRegistry();
  const syndicate = useSyndicate(passport.ownerToken);
  const justice = useJustice(passport.ownerToken);
  const media = useMedia(passport.ownerToken);
  const [wiping, setWiping] = useState(false);
  const m = MESSENGER_I18N[lang];
  const r = REGISTRY_I18N[lang];
  const d = DASHBOARD_I18N[lang];
  const nav = NAVIGATION_I18N[lang];
  const sy = SYNDICATE_I18N[lang];
  const j = JUSTICE_I18N[lang];
  const me = MEDIA_I18N[lang];

  const handleWipe = async () => {
    if (wiping) return;
    setWiping(true);
    messenger.wipe();
    await passport.wipe();
    setWiping(false);
  };

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -start-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-flame/20 blur-[120px]" />
        <div className="absolute -bottom-40 -end-40 h-[30rem] w-[30rem] rounded-full bg-jade/20 blur-[130px]" />
        <div className="grid-bg absolute inset-0" />
      </div>

      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5">
        <div className="flex items-center gap-3">
          <SunMark className="h-9 w-9" lit />
          <span className="text-lg font-semibold tracking-wide">{t.brand}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void handleWipe()}
            disabled={wiping}
            title={nav.wipeHint}
            aria-label={`${nav.wipeLabel}: ${nav.wipeHint}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-flame/50 bg-flame/10 px-3 py-2 text-xs font-bold tracking-wide text-flame transition hover:bg-flame/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {nav.wipeLabel}
          </button>
          <LanguageSwitcher lang={lang} onChange={changeLang} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        <Tabs defaultValue="passport">
          <TabsList className="mx-auto flex h-auto w-fit flex-wrap justify-center gap-1 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur">
            <TabsTrigger value="passport" className={cn(TAB_TRIGGER, "data-[state=active]:bg-sun")}>
              {nav.passport}
            </TabsTrigger>
            <TabsTrigger value="registry" className={cn(TAB_TRIGGER, "data-[state=active]:bg-jade")}>
              {nav.registry}
            </TabsTrigger>
            <TabsTrigger value="messenger" className={cn(TAB_TRIGGER, "data-[state=active]:bg-ice")}>
              {nav.messenger}
            </TabsTrigger>
            <TabsTrigger value="justice" className={cn(TAB_TRIGGER, "data-[state=active]:bg-flame")}>
              {nav.justice}
            </TabsTrigger>
            <TabsTrigger value="syndicate" className={cn(TAB_TRIGGER, "data-[state=active]:bg-sun")}>
              {nav.syndicate}
            </TabsTrigger>
            <TabsTrigger value="media" className={cn(TAB_TRIGGER, "data-[state=active]:bg-flame")}>
              {nav.media}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="passport" className="mt-0">
            <HomeView t={t} registry={r} dash={d} wallet={wallet} passport={passport} citizen={citizen} />
          </TabsContent>
          <TabsContent value="registry" className="mt-0">
            <RegistryView strings={r} dash={d} registry={registry} />
          </TabsContent>
          <TabsContent value="messenger" className="mt-0 pb-10">
            <MessengerView lang={lang} strings={m} chat={messenger} onWipe={handleWipe} />
          </TabsContent>
          <TabsContent value="justice" className="mt-0 pb-10">
            <JusticeView
              strings={j}
              regionNames={d.regionNames}
              hasPassport={passport.ownerToken !== null}
              justice={justice}
            />
          </TabsContent>
          <TabsContent value="syndicate" className="mt-0 pb-10">
            <SyndicateView
              strings={sy}
              regionNames={d.regionNames}
              hasPassport={passport.ownerToken !== null}
              syndicate={syndicate}
            />
          </TabsContent>
          <TabsContent value="media" className="mt-0 pb-10">
            <MediaView
              strings={me}
              ownerToken={passport.ownerToken}
              media={media}
              balance={citizen.dashboard?.balance ?? null}
              onBalanceChange={citizen.applyBalance}
            />
          </TabsContent>
        </Tabs>
      </main>

      <NetworkStatus t={t} />
    </>
  );
}
