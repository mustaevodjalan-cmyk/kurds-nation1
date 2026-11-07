import { Sparkles, Timer } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { viewFor } from "@/lib/dialect-bridge";
import type { MessengerStrings } from "@/lib/messenger-i18n";
import type { ChatMessage } from "@/hooks/use-messenger";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  message: ChatMessage;
  now: number;
  viewerLang: Lang;
  strings: MessengerStrings;
};

function formatCountdown(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function MessageBubble({ message, now, viewerLang, strings: m }: MessageBubbleProps) {
  const view = viewFor(message.text, message.lang, viewerLang);
  const mine = message.author === "me";
  const dir = view.lang === "ckb" ? "rtl" : "ltr";
  const remaining = formatCountdown(Math.max(0, message.expiresAt - now));

  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[85%] flex-col gap-1.5 sm:max-w-[70%]", mine ? "items-end" : "items-start")}>
        <div
          dir={dir}
          lang={view.lang}
          className={cn(
            "break-words rounded-2xl border px-4 py-2.5 text-start text-[15px] leading-relaxed shadow-lg",
            mine
              ? "rounded-br-md border-sun/40 bg-sun text-ink"
              : "rounded-bl-md border-ice/20 bg-white/[0.07] text-slate-100",
          )}
        >
          {view.text}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          {view.translated && (
            <span className="inline-flex items-center gap-1 rounded-full border border-ice/40 bg-ice/10 px-2 py-0.5 font-medium text-ice">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {m.translated}
            </span>
          )}
          <span className="inline-flex items-center gap-1 font-mono">
            <Timer className="h-3 w-3" aria-hidden="true" />
            {m.expiresIn.replace("{time}", remaining)}
          </span>
        </div>
      </div>
    </div>
  );
}
