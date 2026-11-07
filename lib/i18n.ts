export type Lang = "ku" | "ckb" | "ru" | "en";

export const LANGS: Lang[] = ["ku", "ckb", "ru", "en"];

export type MessageKey = "noWallet" | "rejected" | "error" | "connectedMsg";

export type Strings = {
  dir: "ltr" | "rtl";
  brand: string;
  title: string;
  lead: string;
  connect: string;
  connecting: string;
  disconnect: string;
  demo: string;
  tip: string;
  noWallet: string;
  rejected: string;
  error: string;
  connectedMsg: string;
  online: string;
  offline: string;
  cardTitle: string;
  holder: string;
  network: string;
  passport: string;
  locked: string;
  active: string;
  pFound: string;
  pNone: string;
  pDemo: string;
  pError: string;
  features: [string, string][];
};

/* Translations: have native speakers review ku / ckb before release. */
export const I18N: Record<Lang, Strings> = {
  ku: {
    dir: "ltr",
    brand: "Neteweya Torê",
    title: "Welatê dîjîtal ê Kurdan",
    lead: "Nasname, peyam û ziman, bê sînor û bê astengî.",
    connect: "Pasaporta dîjîtal / Cuzdanê girê bide",
    connecting: "Tê girêdan…",
    disconnect: "Ji vir qut bike",
    demo: "Demo bibîne",
    tip: "Ji bo pasaportê navnîşanek nû bi kar bîne, ne cuzdana xwe ya kevn.",
    noWallet: "Cuzdanek nehat dîtin. MetaMask an cuzdanek din saz bike û dîsa biceribîne.",
    rejected: "Girêdan hate red kirin. Dikarî dîsa biceribînî.",
    error: "Tiştek şaş çû. Dîsa biceribîne.",
    connectedMsg: "Cuzdan girêdayî ye.",
    online: "Înternet heye",
    offline: "Înternet tune, sepan bi daneyên cîhazê dixebite",
    cardTitle: "Pasaporta Dîjîtal",
    holder: "Xwedî",
    network: "Tor",
    passport: "Pasaport",
    locked: "Girtî",
    active: "Çalak",
    pFound: "Pasaport hat dîtin",
    pNone: "Hê pasaport tune",
    pDemo: "Demo, peymana pasaportê nehatiye danîn",
    pError: "Kontrol nehat kirin",
    features: [
      ["Pasaporta dîjîtal", "Nasnameya te bê eşkerekirina navê te yê rastîn, bi delîla ZK."],
      ["Peyamên şîfrekirî", "Tenê tu û wergir dikarin peyamê bixwînin."],
      ["Pira ziman", "Her kes bi zaravayê xwe dixwîne: Kurmancî û Soranî di yek çatê de."],
      ["Bê înternet", "Piştî barkirina yekem, sepan li ser cîhaza te jî dixebite."],
    ],
  },
  ckb: {
    dir: "rtl",
    brand: "نەتەوەی تۆڕ",
    title: "وڵاتی دیجیتاڵی کورد",
    lead: "ناسنامە، نامە و زمان، بێ سنوور و بێ بەربەست.",
    connect: "پاسپۆرتی دیجیتاڵ / جزدان پەیوەست بکە",
    connecting: "پەیوەست دەکرێت…",
    disconnect: "لێرە دایببڕە",
    demo: "دیمۆ ببینە",
    tip: "بۆ پاسپۆرت ناونیشانێکی نوێ بەکاربهێنە، نەک جزدانە کۆنەکەت.",
    noWallet: "هیچ جزدانێک نەدۆزرایەوە. MetaMask یان جزدانێکی تر دابمەزرێنە و دووبارە هەوڵ بدەرەوە.",
    rejected: "پەیوەندی ڕەتکرایەوە. دەتوانیت دووبارە هەوڵ بدەیتەوە.",
    error: "هەڵەیەک ڕوویدا. دووبارە هەوڵ بدەرەوە.",
    connectedMsg: "جزدان پەیوەست کرا.",
    online: "ئینتەرنێت هەیە",
    offline: "ئینتەرنێت نییە، ئەپەکە بە داتای ئامێرەکەت کار دەکات",
    cardTitle: "پاسپۆرتی دیجیتاڵ",
    holder: "خاوەن",
    network: "تۆڕ",
    passport: "پاسپۆرت",
    locked: "داخراو",
    active: "چالاک",
    pFound: "پاسپۆرت دۆزرایەوە",
    pNone: "هێشتا پاسپۆرتت نییە",
    pDemo: "دیمۆ، گرێبەستی پاسپۆرت ڕێک نەخراوە",
    pError: "پشکنین سەرکەوتوو نەبوو",
    features: [
      ["پاسپۆرتی دیجیتاڵ", "ناسنامەکەت بێ ئاشکراکردنی ناوی ڕاستەقینە، بە بەڵگەی ZK."],
      ["نامەی کۆدکراو", "تەنها تۆ و وەرگر دەتوانن نامەکە بخوێننەوە."],
      ["پردی زمان", "هەموو کەسێک بە شێوەزاری خۆی دەخوێنێتەوە: کرمانجی و سۆرانی لە یەک چاتدا."],
      ["بێ ئینتەرنێت", "دوای یەکەم بارکردن، ئەپەکە لەسەر ئامێرەکەتیش کار دەکات."],
    ],
  },
  ru: {
    dir: "ltr",
    brand: "Сетевая нация",
    title: "Цифровое государство курдов",
    lead: "Идентичность, общение и язык без границ и барьеров.",
    connect: "Подключить цифровой паспорт / Wallet",
    connecting: "Подключение…",
    disconnect: "Отключиться здесь",
    demo: "Посмотреть демо",
    tip: "Для паспорта используйте новый адрес, а не свой старый кошелёк.",
    noWallet: "Кошелёк не найден. Установите MetaMask или другой кошелёк и попробуйте снова.",
    rejected: "Подключение отклонено. Можно попробовать ещё раз.",
    error: "Что-то пошло не так. Попробуйте ещё раз.",
    connectedMsg: "Кошелёк подключён.",
    online: "Интернет есть",
    offline: "Интернета нет, приложение работает на данных устройства",
    cardTitle: "Цифровой паспорт",
    holder: "Владелец",
    network: "Сеть",
    passport: "Паспорт",
    locked: "Закрыт",
    active: "Активен",
    pFound: "Паспорт найден",
    pNone: "Паспорта пока нет",
    pDemo: "Демо, контракт паспорта не настроен",
    pError: "Не удалось проверить",
    features: [
      ["Цифровой паспорт", "Ваша идентичность без раскрытия настоящего имени, с помощью ZK-доказательства."],
      ["Зашифрованные сообщения", "Прочитать сообщение могут только вы и получатель."],
      ["Языковой мост", "Каждый читает на своём диалекте: курманджи и сорани в одном чате."],
      ["Без интернета", "После первой загрузки приложение работает на вашем устройстве и без сети."],
    ],
  },
  en: {
    dir: "ltr",
    brand: "Network Nation",
    title: "The digital homeland of the Kurds",
    lead: "Identity, messaging and language, without borders or barriers.",
    connect: "Connect digital passport / Wallet",
    connecting: "Connecting…",
    disconnect: "Forget wallet here",
    demo: "Try demo",
    tip: "Use a fresh address for your passport, not your old wallet.",
    noWallet: "No wallet found. Install MetaMask or another wallet and try again.",
    rejected: "Connection was declined. You can try again.",
    error: "Something went wrong. Please try again.",
    connectedMsg: "Wallet connected.",
    online: "Online",
    offline: "Offline, the app is running from data on your device",
    cardTitle: "Digital Passport",
    holder: "Holder",
    network: "Network",
    passport: "Passport",
    locked: "Locked",
    active: "Active",
    pFound: "Passport found",
    pNone: "No passport yet",
    pDemo: "Demo, passport contract not configured",
    pError: "Could not check",
    features: [
      ["Digital passport", "Prove your identity without revealing your real name, using a ZK proof."],
      ["Encrypted messages", "Only you and the recipient can read a message."],
      ["Language bridge", "Everyone reads in their own dialect: Kurmanji and Sorani in one chat."],
      ["Works offline", "After the first load, the app runs on your device even without a network."],
    ],
  },
};

export function isLang(value: string | null): value is Lang {
  return value !== null && (LANGS as string[]).includes(value);
}

export function detectLang(languages: readonly string[]): Lang {
  const pick = (l: string): Lang | null => {
    const v = l.toLowerCase();
    if (v.startsWith("ckb")) return "ckb";
    if (v.startsWith("ru")) return "ru";
    if (v.startsWith("en")) return "en";
    if (v.startsWith("ku")) return "ku";
    return null;
  };
  return languages.map(pick).find((l): l is Lang => l !== null) ?? "ku";
}
