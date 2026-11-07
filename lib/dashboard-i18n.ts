import type { Lang } from "./i18n";
import type { Region } from "./registry";

export type DashboardStrings = {
  balanceLabel: string;
  rankNovice: string;
  rankKeeper: string;
  quizTitle: string;
  quizSubtitle: string;
  quizLocked: string;
  quizAnswered: string;
  quizCorrect: string;
  quizWrong: string;
  quizReward: string;
  quizTomorrow: string;
  quizError: string;
  quizRetry: string;
  mapTitle: string;
  mapSubtitle: string;
  mapCitizens: string;
  mapHomeland: string;
  mapEurope: string;
  mapCis: string;
  mapNote: string;
  regionNames: Record<Region, string>;
};

export const DASHBOARD_I18N: Record<Lang, DashboardStrings> = {
  ku: {
    balanceLabel: "$ROJ",
    rankNovice: "Nûbe",
    rankKeeper: "Parastvanê Dîrokê",
    quizTitle: "Quîza Rojane ya Dîrokê",
    quizSubtitle: "Bersiva rast bide û +10 $ROJ bistîne",
    quizLocked: "Pasaportê çalak bike da ku quîzê bilîzî",
    quizAnswered: "Îro bersiv hatiye dayîn. Sibê vegere.",
    quizCorrect: "Rast! Te +10 $ROJ stand.",
    quizWrong: "Ne rast e. Bersiva rast jêrîn e.",
    quizReward: "+10 $ROJ",
    quizTomorrow: "Quîza nû sibê tê",
    quizError: "Quîz nehat barkirin",
    quizRetry: "Dîsa biceribîne",
    mapTitle: "Nexşeya Diaspora",
    mapSubtitle: "Civaka me li çar aliyên cîhanê",
    mapCitizens: "Hemwelatiyên digital ên pejirandî",
    mapHomeland: "Rojhilata Navîn (Welat)",
    mapEurope: "Ewropaya Rojava",
    mapCis: "KDU & Asyaya Navîn",
    mapNote: "Hejmarên zindî ji tomara neteweyî",
    regionNames: { bakur: "Bakur", rojava: "Rojava", basur: "Başûr", rojhilat: "Rojhilat", europe: "Ewropa", cis: "KDU" },
  },
  ckb: {
    balanceLabel: "$ROJ",
    rankNovice: "نوێکار",
    rankKeeper: "پاسەوانی مێژوو",
    quizTitle: "پرسیاری ڕۆژانەی مێژوو",
    quizSubtitle: "وەڵامی دروست بدەوە و +10 $ROJ وەرگرە",
    quizLocked: "پاسپۆرتەکەت چالاک بکە بۆ بەشداری",
    quizAnswered: "ئەمڕۆ وەڵامت داوەتەوە. سبەی بگەڕێوە.",
    quizCorrect: "دروستە! +10 $ROJ وەرگرت.",
    quizWrong: "نادروستە. وەڵامی دروست لە خوارەوەیە.",
    quizReward: "+10 $ROJ",
    quizTomorrow: "پرسیاری نوێ سبەی دێت",
    quizError: "پرسیارەکە بار نەکرا",
    quizRetry: "دووبارە هەوڵ بدەرەوە",
    mapTitle: "نەخشەی دیاسپۆرا",
    mapSubtitle: "کۆمەڵگاکەمان لە چوار لای جیهان",
    mapCitizens: "هاوڵاتی دیجیتاڵی پشتڕاستکراو",
    mapHomeland: "ڕۆژهەڵاتی ناوین (نیشتمان)",
    mapEurope: "ئەوروپای ڕۆژئاوا",
    mapCis: "KDU و ئاسیای ناوەڕاست",
    mapNote: "ژمارەی ڕاستەوخۆ لە تۆماری نەتەوەیی",
    regionNames: { bakur: "باکوور", rojava: "ڕۆژئاوا", basur: "باشوور", rojhilat: "ڕۆژهەڵات", europe: "ئەوروپا", cis: "KDU" },
  },
  ru: {
    balanceLabel: "$ROJ",
    rankNovice: "Новичок",
    rankKeeper: "Хранитель истории",
    quizTitle: "Ежедневная викторина",
    quizSubtitle: "Ответьте верно и получите +10 $ROJ",
    quizLocked: "Активируйте паспорт, чтобы участвовать",
    quizAnswered: "Сегодня вы уже ответили. Возвращайтесь завтра.",
    quizCorrect: "Верно! Вам начислено +10 $ROJ.",
    quizWrong: "Неверно. Правильный ответ выделен ниже.",
    quizReward: "+10 $ROJ",
    quizTomorrow: "Новый вопрос появится завтра",
    quizError: "Не удалось загрузить викторину",
    quizRetry: "Повторить",
    mapTitle: "Карта диаспоры",
    mapSubtitle: "Наше сообщество на четырёх континентах",
    mapCitizens: "Верифицированных цифровых граждан",
    mapHomeland: "Ближний Восток (Родина)",
    mapEurope: "Западная Европа",
    mapCis: "СНГ и Центральная Азия",
    mapNote: "Живые цифры из реестра нации",
    regionNames: { bakur: "Бакур", rojava: "Рожава", basur: "Басур", rojhilat: "Рожхилат", europe: "Европа", cis: "СНГ" },
  },
  en: {
    balanceLabel: "$ROJ",
    rankNovice: "Novice",
    rankKeeper: "History Keeper",
    quizTitle: "Daily Lore Quiz",
    quizSubtitle: "Answer correctly to earn +10 $ROJ",
    quizLocked: "Activate your passport to play",
    quizAnswered: "You answered today. Come back tomorrow.",
    quizCorrect: "Correct! +10 $ROJ added to your balance.",
    quizWrong: "Not quite. The correct answer is highlighted.",
    quizReward: "+10 $ROJ",
    quizTomorrow: "A new question arrives tomorrow",
    quizError: "Could not load the quiz",
    quizRetry: "Try again",
    mapTitle: "Diaspora Map",
    mapSubtitle: "Our community across four continents",
    mapCitizens: "Verified Digital Citizens",
    mapHomeland: "Middle East Homeland",
    mapEurope: "Western Europe",
    mapCis: "CIS & Central Asia",
    mapNote: "Live counts from the national registry",
    regionNames: { bakur: "Bakur", rojava: "Rojava", basur: "Başûr", rojhilat: "Rojhilat", europe: "Europe", cis: "CIS" },
  },
};
