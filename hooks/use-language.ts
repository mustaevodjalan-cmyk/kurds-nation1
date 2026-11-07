"use client";

import { useCallback, useEffect, useState } from "react";
import { I18N, detectLang, isLang, type Lang } from "@/lib/i18n";
import { readStorage, writeStorage } from "@/lib/safe-storage";

const LANG_KEY = "nn.lang";

export function useLanguage() {
  const [lang, setLang] = useState<Lang>("ku");

  useEffect(() => {
    const saved = readStorage(LANG_KEY);
    setLang(isLang(saved) ? saved : detectLang(navigator.languages ?? [navigator.language]));
  }, []);

  useEffect(() => {
    const t = I18N[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
    document.title = t.brand;
  }, [lang]);

  const changeLang = useCallback((next: Lang) => {
    setLang(next);
    writeStorage(LANG_KEY, next);
  }, []);

  return { lang, changeLang, t: I18N[lang] };
}
