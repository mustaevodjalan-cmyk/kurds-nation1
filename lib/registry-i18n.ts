import type { Lang } from "./i18n";
import type { Dialect, Region } from "./registry";

export type RegistryStrings = {
  issueTitle: string;
  issueHint: string;
  aliasLabel: string;
  aliasPlaceholder: string;
  aliasHint: string;
  regionLabel: string;
  dialectLabel: string;
  mintButton: string;
  mintSteps: string[];
  verified: string;
  citizenIdLabel: string;
  issuedNote: string;
  scanHint: string;
  errorMint: string;
  errorRateLimited: string;
  errorWipe: string;
  regionNames: Record<Region, string>;
  dialectNames: Record<Dialect, string>;
  registryTitle: string;
  registrySubtitle: string;
  live: string;
  totalLabel: string;
  homeland: string;
  diaspora: string;
  regionsTitle: string;
  dialectsTitle: string;
  feedTitle: string;
  feedEmpty: string;
  feedEntry: string;
  minutesAgo: string;
  hoursAgo: string;
  justNow: string;
  loadError: string;
  retry: string;
};

/* Placeholders: {number} = citizen ID, {region} = region name, {n} = count. */
export const REGISTRY_I18N: Record<Lang, RegistryStrings> = {
  ku: {
    issueTitle: "Pasporta xwe derxe",
    issueHint: "Bi navekî nenas (alias) tomar bibe. Navê rastîn ne hewce ye.",
    aliasLabel: "Nav / Alias",
    aliasPlaceholder: "mînak: Zîlan_07",
    aliasHint: "3 heta 24 tîp",
    regionLabel: "Herêm / Diaspora",
    dialectLabel: "Devoka sereke",
    mintButton: "Mint Digital Passport",
    mintSteps: [
      "Cryptographic ZK-Proof tê çêkirin...",
      "Nasname di ledgerê de tê girtin...",
      "Li ser torê tê belavkirin...",
    ],
    verified: "Çalak / Pejirandî",
    citizenIdLabel: "Nasnameya hemwelatî",
    issuedNote: "Pasport hat derxistin. Bi NN_WIPE jê tê birin.",
    scanHint: "Ji bo pejirandinê skan bike",
    errorMint: "Derxistina pasportê bi ser neket. Dîsa biceribîne.",
    errorRateLimited: "Gelek caran hat ceribandin. Piştî demekê dîsa biceribînin.",
    errorWipe: "Jêbirina tomarê bi ser neket. Dîsa biceribîne.",
    regionNames: { bakur: "Bakur", rojava: "Rojava", basur: "Başûr", rojhilat: "Rojhilat", europe: "Ewropa", cis: "CIS" },
    dialectNames: { kurmanci: "Kurmancî", sorani: "Soranî", zazaki: "Zazakî", kelhuri: "Kelhûrî", hewrami: "Hewramî" },
    registryTitle: "Tomar",
    registrySubtitle: "Ledgera zindî ya hemwelatiyên torê",
    live: "ZİNDÎ",
    totalLabel: "Hemwelatiyên tomarkirî",
    homeland: "Welat (Herêm)",
    diaspora: "Diaspora",
    regionsTitle: "Belavbûna li gor herêman",
    dialectsTitle: "Belavbûna li gor devokan",
    feedTitle: "Ledgera zindî",
    feedEmpty: "Hê tomarkirin tune ne.",
    feedEntry: "Hemwelatî {number} ji {region} tomar bû",
    minutesAgo: "{n} xulek berê",
    hoursAgo: "{n} saet berê",
    justNow: "niha",
    loadError: "Ledger nehat barkirin.",
    retry: "Dîsa biceribîne",
  },
  ckb: {
    issueTitle: "پاسپۆرتەکەت دەربێنە",
    issueHint: "بە ناوێکی نەناسراو (ئەلیاس) تۆمار بکە. ناوی ڕاستەقینە پێویست نییە.",
    aliasLabel: "ناو / ئەلیاس",
    aliasPlaceholder: "نموونە: Zîlan_07",
    aliasHint: "لە ٣ تا ٢٤ پیت",
    regionLabel: "ناوچە / دیاسپۆرا",
    dialectLabel: "زاراوەی سەرەکی",
    mintButton: "پاسپۆرتی دیجیتاڵ دروست بکە",
    mintSteps: [
      "ZK-Proof ی کریپتۆگرافی دروست دەکرێت...",
      "ناسنامە لە لیدجەردا تۆمار دەکرێت...",
      "لەسەر تۆڕ بڵاو دەکرێتەوە...",
    ],
    verified: "چالاک / پشتڕاستکراوە",
    citizenIdLabel: "ناسنامەی هاوڵاتی",
    issuedNote: "پاسپۆرت دەرچوو. بە NN_WIPE دەسڕێتەوە.",
    scanHint: "بۆ پشتڕاستکردنەوە سکان بکە",
    errorMint: "دەرچوونی پاسپۆرت سەرنەکەوت. دووبارە هەوڵ بدەرەوە.",
    errorRateLimited: "هەوڵی زۆر درا. تکایە دواتر دووبارە هەوڵ بدەرەوە.",
    errorWipe: "سڕینەوەی تۆمار سەرنەکەوت. دووبارە هەوڵ بدەرەوە.",
    regionNames: { bakur: "باکوور", rojava: "ڕۆژاوا", basur: "باشوور", rojhilat: "ڕۆژهەڵات", europe: "ئەوروپا", cis: "CIS" },
    dialectNames: { kurmanci: "کورمانجی", sorani: "سۆرانی", zazaki: "زازاکی", kelhuri: "کەلهووری", hewrami: "هەورامی" },
    registryTitle: "تۆمارگا",
    registrySubtitle: "لیدجەری زیندووی هاوڵاتییانی تۆڕ",
    live: "ڕاستەوخۆ",
    totalLabel: "هاوڵاتییە تۆمارکراوەکان",
    homeland: "نیشتمان (ناوچە)",
    diaspora: "دیاسپۆرا",
    regionsTitle: "دابەشبوون بەپێی ناوچە",
    dialectsTitle: "دابەشبوون بەپێی زاراوە",
    feedTitle: "لیدجەری زیندوو",
    feedEmpty: "هێشتا تۆمارێک نییە.",
    feedEntry: "هاوڵاتی {number} لە {region} تۆمارکرا",
    minutesAgo: "{n} خولەک لەمەوبەر",
    hoursAgo: "{n} کاتژمێر لەمەوبەر",
    justNow: "ئێستا",
    loadError: "لیدجەر بار نەکرا.",
    retry: "دووبارە هەوڵ بدەرەوە",
  },
  ru: {
    issueTitle: "Выпустите цифровой паспорт",
    issueHint: "Выберите псевдоним. Настоящее имя не требуется.",
    aliasLabel: "Псевдоним",
    aliasPlaceholder: "например, Zilan_07",
    aliasHint: "От 3 до 24 символов",
    regionLabel: "Регион / диаспора",
    dialectLabel: "Основной диалект",
    mintButton: "Mint Digital Passport",
    mintSteps: [
      "Generating Cryptographic ZK-Proof...",
      "Sealing identity to the ledger...",
      "Broadcasting to the network...",
    ],
    verified: "Активен / Подтверждён",
    citizenIdLabel: "ID гражданина",
    issuedNote: "Паспорт выпущен. Сбросить его можно командой NN_WIPE.",
    scanHint: "Сканируйте для проверки",
    errorMint: "Не удалось выпустить паспорт. Попробуйте ещё раз.",
    errorRateLimited: "Слишком много попыток. Попробуйте позже.",
    errorWipe: "Не удалось удалить запись реестра. Попробуйте ещё раз.",
    regionNames: { bakur: "Bakur", rojava: "Rojava", basur: "Başûr", rojhilat: "Rojhilat", europe: "Европа", cis: "СНГ" },
    dialectNames: { kurmanci: "Kurmancî", sorani: "Soranî", zazaki: "Zazakî", kelhuri: "Kelhûrî", hewrami: "Hewramî" },
    registryTitle: "Реестр",
    registrySubtitle: "Живой реестр граждан сети",
    live: "LIVE",
    totalLabel: "Зарегистрированных граждан",
    homeland: "Родина (регион)",
    diaspora: "Диаспора",
    regionsTitle: "Распределение по регионам",
    dialectsTitle: "Распределение по диалектам",
    feedTitle: "Живая лента реестра",
    feedEmpty: "Регистраций пока нет.",
    feedEntry: "Гражданин {number} зарегистрирован из {region}",
    minutesAgo: "{n} мин назад",
    hoursAgo: "{n} ч назад",
    justNow: "только что",
    loadError: "Не удалось загрузить реестр.",
    retry: "Повторить",
  },
  en: {
    issueTitle: "Issue your digital passport",
    issueHint: "Pick an alias. No real name is required.",
    aliasLabel: "Alias",
    aliasPlaceholder: "e.g. Zilan_07",
    aliasHint: "3–24 characters",
    regionLabel: "Region / diaspora",
    dialectLabel: "Primary dialect",
    mintButton: "Mint Digital Passport",
    mintSteps: [
      "Generating Cryptographic ZK-Proof...",
      "Sealing identity to the ledger...",
      "Broadcasting to the network...",
    ],
    verified: "Active / Verified",
    citizenIdLabel: "Citizen ID",
    issuedNote: "Your passport is issued. NN_WIPE resets it.",
    scanHint: "Scan to verify",
    errorMint: "Could not issue your passport. Try again.",
    errorRateLimited: "Too many attempts. Please try again later.",
    errorWipe: "Could not remove your registry entry. Try again.",
    regionNames: { bakur: "Bakur", rojava: "Rojava", basur: "Başûr", rojhilat: "Rojhilat", europe: "Europe", cis: "CIS" },
    dialectNames: { kurmanci: "Kurmancî", sorani: "Soranî", zazaki: "Zazakî", kelhuri: "Kelhûrî", hewrami: "Hewramî" },
    registryTitle: "Registry",
    registrySubtitle: "Live ledger of network citizens",
    live: "LIVE",
    totalLabel: "Registered citizens",
    homeland: "Homeland",
    diaspora: "Diaspora",
    regionsTitle: "Distribution by region",
    dialectsTitle: "Distribution by dialect",
    feedTitle: "Live ledger feed",
    feedEmpty: "No registrations yet.",
    feedEntry: "Citizen {number} registered from {region}",
    minutesAgo: "{n} min ago",
    hoursAgo: "{n} h ago",
    justNow: "just now",
    loadError: "Could not load the registry.",
    retry: "Retry",
  },
};
