"use client";

import type { FormEvent } from "react";
import { Fingerprint } from "lucide-react";
import { ALIAS_MAX_LENGTH, ALIAS_MIN_LENGTH, DIALECTS, REGIONS, type Dialect, type Region } from "@/lib/registry";
import type { RegistryStrings } from "@/lib/registry-i18n";
import type { PassportDraft } from "@/hooks/use-passport";
import { cn } from "@/lib/utils";

export type ValidDraft = { alias: string; region: Region; dialect: Dialect };

function readValidDraft(draft: PassportDraft): ValidDraft | null {
  const alias = draft.alias.trim();
  if (alias.length < ALIAS_MIN_LENGTH || alias.length > ALIAS_MAX_LENGTH) return null;
  if (!draft.region || !draft.dialect) return null;
  return { alias, region: draft.region, dialect: draft.dialect };
}

type ChoiceOption<T extends string> = { value: T; label: string };

function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: ChoiceOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-sm font-medium transition duration-200 active:scale-[0.97]",
                selected
                  ? "border-sun bg-sun/15 text-sun shadow-[0_0_20px_-6px_rgba(255,201,51,0.6)]"
                  : "border-white/15 bg-white/5 text-slate-200 hover:border-white/35 hover:bg-white/10",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type PassportIssueFormProps = {
  strings: RegistryStrings;
  draft: PassportDraft;
  onChange: (draft: PassportDraft) => void;
  onSubmit: (valid: ValidDraft) => void;
};

export function PassportIssueForm({ strings: m, draft, onChange, onSubmit }: PassportIssueFormProps) {
  const valid = readValidDraft(draft);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (valid) onSubmit(valid);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label htmlFor="passport-alias" className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
          {m.aliasLabel}
        </label>
        <input
          id="passport-alias"
          value={draft.alias}
          onChange={(event) => onChange({ ...draft, alias: event.target.value })}
          maxLength={ALIAS_MAX_LENGTH}
          placeholder={m.aliasPlaceholder}
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:border-ice/60 focus:outline-none focus:ring-2 focus:ring-ice/40"
        />
        <p className="mt-1.5 flex justify-between text-xs text-slate-400">
          <span>{m.aliasHint}</span>
          <span className="font-mono">
            {draft.alias.trim().length}/{ALIAS_MAX_LENGTH}
          </span>
        </p>
      </div>

      <ChoiceGroup
        label={m.regionLabel}
        options={REGIONS.map((region) => ({ value: region, label: m.regionNames[region] }))}
        value={draft.region}
        onChange={(region) => onChange({ ...draft, region })}
      />

      <ChoiceGroup
        label={m.dialectLabel}
        options={DIALECTS.map((dialect) => ({ value: dialect, label: m.dialectNames[dialect] }))}
        value={draft.dialect}
        onChange={(dialect) => onChange({ ...draft, dialect })}
      />

      <button
        type="submit"
        disabled={!valid}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sun px-5 py-3.5 text-sm font-bold tracking-wide text-ink shadow-[0_0_30px_-8px_rgba(255,201,51,0.7)] transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        <Fingerprint className="h-5 w-5" aria-hidden="true" />
        {m.mintButton}
      </button>
    </form>
  );
}
