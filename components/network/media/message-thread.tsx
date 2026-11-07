"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import type { MediaMessage } from "@/lib/media-api";
import type { MessagesStatus } from "@/hooks/use-media-messages";
import { cn } from "@/lib/utils";

type MessageThreadProps = {
  messages: MediaMessage[];
  status: MessagesStatus;
  canPost: boolean;
  posting: boolean;
  onPost: (body: string) => Promise<boolean>;
  emptyText: string;
  placeholder: string;
  sendLabel: string;
  lockedText: string;
  errorText: string;
  loadErrorText: string;
  variant: "comments" | "chat";
};

export function MessageThread({
  messages,
  status,
  canPost,
  posting,
  onPost,
  emptyText,
  placeholder,
  sendLabel,
  lockedText,
  errorText,
  loadErrorText,
  variant,
}: MessageThreadProps) {
  const [draft, setDraft] = useState("");
  const [failed, setFailed] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || posting) return;
    setFailed(false);
    const ok = await onPost(body);
    if (ok) setDraft("");
    else setFailed(true);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div
        role="log"
        aria-live="polite"
        className={cn(
          "min-h-0 flex-1 space-y-3 overflow-y-auto pe-1",
          variant === "chat" ? "rounded-xl bg-ink/60 p-3" : "",
        )}
      >
        {status === "loading" && <p className="text-sm text-slate-400">…</p>}
        {status === "error" && <p className="text-sm text-flame">{loadErrorText}</p>}
        {status === "ready" && messages.length === 0 && (
          <p className="text-sm text-slate-400">{emptyText}</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="text-sm leading-relaxed">
            <span className="font-semibold text-ice">{m.authorLabel}</span>
            <span className="ms-2 break-words text-slate-200">{m.body}</span>
          </div>
        ))}
      </div>

      {canPost ? (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={280}
              placeholder={placeholder}
              aria-label={placeholder}
              className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-ice/60 focus:outline-none focus:ring-2 focus:ring-ice/40"
            />
            <button
              type="submit"
              disabled={posting || draft.trim().length === 0}
              aria-label={sendLabel}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ice text-ink transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
            </button>
          </div>
          {failed && (
            <p role="alert" className="text-xs text-flame">
              {errorText}
            </p>
          )}
        </form>
      ) : (
        <p className="rounded-xl border border-dashed border-white/10 p-3 text-xs text-slate-400">{lockedText}</p>
      )}
    </div>
  );
}
