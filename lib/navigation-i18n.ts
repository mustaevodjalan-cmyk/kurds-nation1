import type { Lang } from "./i18n";

export type NavigationStrings = {
  passport: string;
  messenger: string;
  registry: string;
  syndicate: string;
  justice: string;
  wipeLabel: string;
  wipeHint: string;
};

export const NAVIGATION_I18N: Record<Lang, NavigationStrings> = {
  ku: {
    passport: "Pasport",
    messenger: "Peyam",
    registry: "Tomar",
    syndicate: "Hevkarî",
    justice: "Dîwan",
    wipeLabel: "NN_WIPE",
    wipeHint: "Hemû peyam, pasport û daneyên li ser vê cîhazê jê dibin",
  },
  ckb: {
    passport: "پاسپۆرت",
    messenger: "نامە",
    registry: "تۆمارگا",
    syndicate: "هەڤکاری",
    justice: "دیوان",
    wipeLabel: "NN_WIPE",
    wipeHint: "هەموو نامە، پاسپۆرت و زانیارییەکانی ئەم ئامێرە دەسڕێنەوە",
  },
  ru: {
    passport: "Паспорт",
    messenger: "Мессенджер",
    registry: "Реестр",
    syndicate: "Hevkarî",
    justice: "Правосудие",
    wipeLabel: "NN_WIPE",
    wipeHint: "Удалит все сообщения, паспорт и данные на этом устройстве",
  },
  en: {
    passport: "Passport",
    messenger: "Messenger",
    registry: "Registry",
    syndicate: "Syndicate",
    justice: "Justice",
    wipeLabel: "NN_WIPE",
    wipeHint: "Erases all messages, your passport and local data on this device",
  },
};
