import type { Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Lang; label: string; size: "sm" | "base" }[] = [
  { value: "ku", label: "Kurmancî", size: "sm" },
  { value: "ckb", label: "سۆرانی", size: "base" },
  { value: "ru", label: "Русский", size: "sm" },
  { value: "en", label: "English", size: "sm" },
];

type LanguageSwitcherProps = {
  lang: Lang;
  onChange: (lang: Lang) => void;
};

export function LanguageSwitcher({ lang, onChange }: LanguageSwitcherProps) {
  return (
    <form
      aria-label="Zarava / شێوەزار / Язык / Language"
      onSubmit={(e) => e.preventDefault()}
      className="flex rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur"
    >
      {OPTIONS.map((option) => (
        <label key={option.value} className="cursor-pointer">
          <input
            className="peer sr-only"
            type="radio"
            name="lang"
            value={option.value}
            checked={lang === option.value}
            onChange={() => onChange(option.value)}
          />
          <span
            lang={option.value}
            className={cn(
              "block rounded-full px-3 py-1.5 font-medium text-slate-300 transition hover:text-white peer-checked:bg-sun peer-checked:text-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ice",
              option.size === "base" ? "text-base" : "text-sm",
            )}
          >
            {option.label}
          </span>
        </label>
      ))}
    </form>
  );
}
