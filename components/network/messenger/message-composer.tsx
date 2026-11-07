"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import type { Lang } from "@/lib/i18n";

type MessageComposerProps = {
  lang: Lang;
  disabled: boolean;
  placeholder: string;
  sendLabel: string;
  onSend: (text: string) => Promise<void>;
};

export function MessageComposer({ lang, disabled, placeholder, sendLabel, onSend }: MessageComposerProps) {
  const [draft, setDraft] = useState("");
  const empty = !draft.trim();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled || empty) return;
    const text = draft;
    setDraft("");
    void onSend(text);
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-3 border-t border-white/10 bg-ink/40 px-4 py-3">
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        dir={lang === "ckb" ? "rtl" : "ltr"}
        lang={lang}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:border-ice/60 focus:outline-none focus:ring-2 focus:ring-ice/40 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || empty}
        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-sun px-4 py-3 text-sm font-bold text-ink transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        <span>{sendLabel}</span>
      </button>
    </form>
  );
}
