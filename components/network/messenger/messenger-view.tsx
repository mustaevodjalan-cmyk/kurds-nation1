"use client";

import { useEffect, useRef } from "react";
import { Hash, Lock, Timer } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { CHANNEL_IDS, type ChannelId } from "@/lib/channels";
import type { MessengerStrings } from "@/lib/messenger-i18n";
import type { ChatState } from "@/hooks/use-messenger";
import { WIPE_COMMAND } from "@/hooks/use-messenger";
import { cn } from "@/lib/utils";
import { MessageBubble } from "@/components/network/messenger/message-bubble";
import { MessageComposer } from "@/components/network/messenger/message-composer";

type MessengerViewProps = {
  lang: Lang;
  strings: MessengerStrings;
  chat: ChatState;
  onWipe: () => Promise<void>;
};

function ChannelNav({
  active,
  label,
  onSelect,
}: {
  active: ChannelId;
  label: string;
  onSelect: (id: ChannelId) => void;
}) {
  return (
    <nav
      aria-label={label}
      className="flex gap-1 overflow-x-auto border-b border-white/10 p-2 sm:w-44 sm:shrink-0 sm:flex-col sm:overflow-y-auto sm:border-b-0 sm:border-r sm:p-3"
    >
      {CHANNEL_IDS.map((id) => {
        const selected = id === active;
        return (
          <button
            key={id}
            type="button"
            aria-current={selected ? "true" : undefined}
            onClick={() => onSelect(id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice",
              selected
                ? "bg-ice/15 font-semibold text-ice shadow-[inset_0_0_0_1px_rgba(61,230,255,0.45)]"
                : "text-slate-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <Hash className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{id}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function MessengerView({ lang, strings: m, chat, onWipe }: MessengerViewProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const ready = chat.status === "ready";
  const statusText = ready
    ? m.secured
    : chat.status === "rate_limited"
      ? m.rateLimited
      : chat.status === "failed"
        ? m.failed
        : m.securing;

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [chat.messages.length, chat.channel]);

  return (
    <section
      aria-labelledby="messenger-title"
      className="mx-auto flex h-[72vh] min-h-[32rem] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04] shadow-[0_0_60px_-20px_rgba(61,230,255,0.35)] backdrop-blur-xl"
    >
      <header className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div className="min-w-0">
          <h2 id="messenger-title" className="text-lg font-bold">
            {m.title}
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">{m.subtitle}</p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-5 py-3 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-jade/40 bg-jade/10 px-3 py-1 font-medium text-jade">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          {m.e2ee}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sun/40 bg-sun/10 px-3 py-1 font-medium text-sun">
          <Timer className="h-3.5 w-3.5" aria-hidden="true" />
          {m.disappearing}
        </span>
        <span className="inline-flex items-center gap-2 text-slate-400 sm:ms-auto">
          <span
            aria-hidden="true"
            className={cn(
              "h-2 w-2 rounded-full",
              ready ? "bg-jade" : chat.status === "failed" || chat.status === "rate_limited" ? "bg-flame" : "animate-pulse bg-sun",
            )}
          />
          {statusText}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <ChannelNav active={chat.channel} label={m.channels} onSelect={chat.selectChannel} />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div ref={listRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
            {chat.messages.length === 0 ? (
              <p className="pt-16 text-center text-sm text-slate-400">{m.empty}</p>
            ) : (
              chat.messages.map((message) => (
                <MessageBubble key={message.id} message={message} now={chat.now} viewerLang={lang} strings={m} />
              ))
            )}
          </div>

          <MessageComposer
            lang={lang}
            disabled={!ready}
            placeholder={m.placeholder}
            sendLabel={m.send}
            onSend={(text) => (text.trim() === WIPE_COMMAND ? onWipe() : chat.send(text, lang))}
          />
        </div>
      </div>
    </section>
  );
}
