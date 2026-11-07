import type { Strings, MessageKey } from "@/lib/i18n";
import { chainName, shortAddress, type PassportStatus } from "@/lib/wallet";
import { cn } from "@/lib/utils";

const PASSPORT_LABEL: Record<PassportStatus, keyof Strings> = {
  demo: "pDemo",
  found: "pFound",
  none: "pNone",
  error: "pError",
};

type WalletPanelProps = {
  t: Strings;
  account: string | null;
  chainId: number | null;
  passport: PassportStatus | null;
  demo: boolean;
  busy: boolean;
  message: MessageKey | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onDemo: () => void;
};

export function WalletPanel({
  t,
  account,
  chainId,
  passport,
  demo,
  busy,
  message,
  onConnect,
  onDisconnect,
  onDemo,
}: WalletPanelProps) {
  const connected = account !== null;
  const messageIsError = message !== null && message !== "connectedMsg";

  return (
    <>
      <div className="mt-9 flex flex-col items-start gap-3">
        <button
          type="button"
          onClick={() => {
            if (!connected) onConnect();
          }}
          disabled={busy}
          className={cn(
            "inline-flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-start text-base font-bold text-ink transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-progress disabled:opacity-60 sm:w-auto",
            connected
              ? "bg-jade shadow-[0_0_34px_-6px_rgba(25,211,107,.7)]"
              : "bg-sun shadow-[0_0_34px_-6px_rgba(255,201,51,.7)]",
          )}
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="6" width="18" height="13" rx="3" />
            <path d="M16 12.5h2" />
            <path d="M3 10h18" />
          </svg>
          <span>{busy ? t.connecting : t.connect}</span>
        </button>
        {connected && (
          <button
            type="button"
            onClick={onDisconnect}
            className="px-1 text-sm text-slate-400 underline underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice"
          >
            {t.disconnect}
          </button>
        )}
      </div>

      <p role="status" aria-live="polite" className={cn("mt-4 min-h-[1.5rem] text-sm", messageIsError ? "text-flame" : "text-slate-300")}>
        {message ? t[message] : ""}
      </p>
      {message === "noWallet" && (
        <button
          type="button"
          onClick={onDemo}
          className="text-sm text-ice underline underline-offset-4 hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice"
        >
          {t.demo}
        </button>
      )}

      {connected && (
        <dl className="mt-6 grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-s-2 border-jade ps-4 text-sm">
          <dt className="text-slate-400">{t.holder}</dt>
          <dd className="addr">{shortAddress(account)}</dd>
          <dt className="text-slate-400">{t.network}</dt>
          <dd>{demo ? "Demo" : chainName(chainId)}</dd>
          <dt className="text-slate-400">{t.passport}</dt>
          <dd>{passport ? t[PASSPORT_LABEL[passport]] : ""}</dd>
        </dl>
      )}
    </>
  );
}
