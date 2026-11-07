import type { Lang } from "./i18n";

/* Mock glossary: Kurmancî (Latin) and Soranî (Arabic script) pairs. Stands in for a real translation service. */
const GLOSSARY: [string, string][] = [
  ["silav", "سڵاو"],
  ["tu çawa yî", "تۆ چۆنی"],
  ["spas", "سوپاس"],
  ["ez baş im", "من باشم"],
  ["bi xêr hatî", "بەخێر هاتیت"],
  ["ez hez dikim", "من حەز دەکەم"],
  ["ez dixwazim", "من دەمەوێت"],
  ["ev çi ye", "ئەمە چییە"],
  ["em li welat in", "ئێمە لە وڵاتین"],
  ["ez", "من"],
  ["tu", "تۆ"],
  ["em", "ئێمە"],
  ["ew", "ئەو"],
  ["û", "و"],
  ["erê", "بەڵێ"],
  ["na", "نەخێر"],
  ["baş", "باش"],
  ["xweş", "خۆش"],
  ["azadî", "ئازادی"],
  ["ziman", "زمان"],
  ["zarav", "شێوەزار"],
  ["welat", "وڵات"],
  ["gel", "گەل"],
  ["dost", "هاوڕێ"],
  ["peyam", "نامە"],
  ["malbat", "خێزان"],
  ["roj", "ڕۆژ"],
  ["şev", "شەو"],
  ["av", "ئاو"],
  ["nan", "نان"],
  ["kengê", "کەی"],
  ["li kû", "لە کوێ"],
];

const toSorani = new Map<string, string>(
  GLOSSARY.map(([ku, ckb]) => [ku.toLowerCase(), ckb] as [string, string]),
);
const toKurmanji = new Map<string, string>(
  GLOSSARY.map(([ku, ckb]) => [ckb, ku] as [string, string]),
);
const MAX_PHRASE_WORDS = Math.max(
  ...GLOSSARY.map(([ku, ckb]) => Math.max(ku.split(" ").length, ckb.split(" ").length)),
);

const LEADING_PUNCTUATION = /^[.,!?;:"'()«»…،؟-]*/;
const TRAILING_PUNCTUATION = /[.,!?;:"'()«»…،؟-]*$/;

function splitEdges(raw: string) {
  const lead = raw.match(LEADING_PUNCTUATION)?.[0] ?? "";
  const rest = raw.slice(lead.length);
  const trail = rest.match(TRAILING_PUNCTUATION)?.[0] ?? "";
  return { lead, core: rest.slice(0, rest.length - trail.length).toLowerCase(), trail };
}

export function translateText(text: string, target: Lang): string {
  if (target !== "ku" && target !== "ckb") return text;
  const dictionary = target === "ckb" ? toSorani : toKurmanji;
  const tokens = text.split(" ");
  const out: string[] = [];
  let i = 0;

  while (i < tokens.length) {
    let matched = false;
    for (let len = Math.min(MAX_PHRASE_WORDS, tokens.length - i); len >= 1; len--) {
      const parts = tokens.slice(i, i + len).map(splitEdges);
      const translation = dictionary.get(parts.map((p) => p.core).join(" "));
      if (translation === undefined) continue;
      out.push(parts[0].lead + translation + parts[len - 1].trail);
      i += len;
      matched = true;
      break;
    }
    if (!matched) {
      out.push(tokens[i]);
      i += 1;
    }
  }

  return out.join(" ");
}

export type DialectView = {
  text: string;
  lang: Lang;
  translated: boolean;
};

export function viewFor(text: string, originalLang: Lang, viewerLang: Lang): DialectView {
  const isDialect = (l: Lang) => l === "ku" || l === "ckb";
  const unchanged = { text, lang: originalLang, translated: false };
  if (originalLang === viewerLang || !isDialect(originalLang) || !isDialect(viewerLang)) return unchanged;

  const translated = translateText(text, viewerLang);
  if (translated === text) return unchanged;
  return { text: translated, lang: viewerLang, translated: true };
}
