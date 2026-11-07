import type { Lang } from "./i18n";

export type SyndicateStrings = {
  title: string;
  subtitle: string;
  filterAll: string;
  filterJobs: string;
  filterB2B: string;
  kindJob: string;
  kindB2B: string;
  trustBadge: string;
  trustHint: string;
  multiplierNote: string;
  postToggle: string;
  postClose: string;
  postLocked: string;
  fieldKind: string;
  fieldTitle: string;
  fieldOrganization: string;
  fieldRegion: string;
  fieldDescription: string;
  submit: string;
  submitting: string;
  posted: string;
  postError: string;
  errorRateLimited: string;
  loadError: string;
  retry: string;
  empty: string;
  liveLabel: string;
};

export const SYNDICATE_I18N: Record<Lang, SyndicateStrings> = {
  ku: {
    title: "Hevkarî",
    subtitle: "Peywendiyên karsazî û kar ji bo hemwelatiyên Kurdistanê û diaspora",
    filterAll: "Hemû",
    filterJobs: "Kar",
    filterB2B: "B2B",
    kindJob: "Kar",
    kindB2B: "B2B",
    trustBadge: "Nîşana Qeweta Netewî",
    trustHint: "Ev karsaz ji aliyê tîmê Hevkarî ve hatiye pejirandin.",
    multiplierNote: "Karsazên bi nîşanê, ji bo her hemwelatiyek ku dixebitîne, pirjimara $ROJ digirin.",
    postToggle: "Agahiyek bişîne",
    postClose: "Girtin",
    postLocked: "Ji bo weşandinê pasport çalak bike.",
    fieldKind: "Cure",
    fieldTitle: "Sernav",
    fieldOrganization: "Navê rêxistin an kesê weşander",
    fieldRegion: "Herêm",
    fieldDescription: "Danasîn",
    submit: "Bişîne",
    submitting: "Tê şandin…",
    posted: "Agahî hate weşandin.",
    postError: "Agahî nehat weşandin. Dîsa biceribîne.",
    errorRateLimited: "Gelek caran hat ceribandin. Piştî demekê dîsa biceribînin.",
    loadError: "Lîsteya kar nehat barkirin.",
    retry: "Dîsa biceribîne",
    empty: "Niha agahî tune ne.",
    liveLabel: "Zindî",
  },
  ckb: {
    title: "هەڤکاری",
    subtitle: "پەیوەندی بازرگانی و کار بۆ هاوڵاتیانی کوردستان و دیاسپۆرا",
    filterAll: "هەموو",
    filterJobs: "کار",
    filterB2B: "B2B",
    kindJob: "کار",
    kindB2B: "B2B",
    trustBadge: "نیشانەی متمانەی نەتەوەیی",
    trustHint: "ئەم کارگەیە لەلایەن تیمی هەڤکاری پەسەندکراوە.",
    multiplierNote: "کارگە نیشاندارەکان بۆ هەر هاوڵاتییەک کە بەکاری دەهێنن، پێوەرێکی $ROJ وەردەگرن.",
    postToggle: "ڕاگەیاندنێک بنێرە",
    postClose: "داخستن",
    postLocked: "بۆ بڵاوکردنەوە پاسپۆرتەکەت چالاک بکە.",
    fieldKind: "جۆر",
    fieldTitle: "ناونیشان",
    fieldOrganization: "ناوی ڕێکخراو یان کەسی بڵاوکەرەوە",
    fieldRegion: "ناوچە",
    fieldDescription: "ڕونکردنەوە",
    submit: "بینێرە",
    submitting: "دەنێردرێت…",
    posted: "ڕاگەیاندنەکە بڵاوکرایەوە.",
    postError: "ڕاگەیاندنەکە بڵاونەکرایەوە. دووبارە هەوڵ بدەرەوە.",
    errorRateLimited: "هەوڵی زۆر درا. تکایە دواتر دووبارە هەوڵ بدەرەوە.",
    loadError: "لیستی کارەکان باربکرێت نەکرا.",
    retry: "دووبارە هەوڵ بدەرەوە",
    empty: "ئێستا هیچ ڕاگەیاندنێک نییە.",
    liveLabel: "ڕاستەوخۆ",
  },
  ru: {
    title: "Hevkarî",
    subtitle: "Работа и B2B-партнёрства для курдского бизнеса и граждан диаспоры",
    filterAll: "Все",
    filterJobs: "Вакансии",
    filterB2B: "B2B",
    kindJob: "Вакансия",
    kindB2B: "B2B",
    trustBadge: "Национальный знак доверия",
    trustHint: "Этот бизнес проверен командой Hevkarî.",
    multiplierNote: "Компании со знаком получают множитель $ROJ за каждого нанятого гражданина.",
    postToggle: "Разместить объявление",
    postClose: "Закрыть",
    postLocked: "Активируйте паспорт, чтобы публиковать объявления.",
    fieldKind: "Тип",
    fieldTitle: "Заголовок",
    fieldOrganization: "Организация или имя автора",
    fieldRegion: "Регион",
    fieldDescription: "Описание",
    submit: "Опубликовать",
    submitting: "Публикация…",
    posted: "Объявление опубликовано.",
    postError: "Не удалось опубликовать. Попробуйте ещё раз.",
    errorRateLimited: "Слишком много попыток. Попробуйте позже.",
    loadError: "Не удалось загрузить объявления.",
    retry: "Повторить",
    empty: "Пока объявлений нет.",
    liveLabel: "Онлайн",
  },
  en: {
    title: "Hevkarî",
    subtitle: "Jobs and B2B partnerships for Kurdish businesses and citizens in the diaspora",
    filterAll: "All",
    filterJobs: "Jobs",
    filterB2B: "B2B",
    kindJob: "Job",
    kindB2B: "B2B",
    trustBadge: "National Trust Badge",
    trustHint: "This business has been verified by the Hevkarî desk.",
    multiplierNote: "Badge holders earn a $ROJ multiplier for every citizen they hire.",
    postToggle: "Post a listing",
    postClose: "Close",
    postLocked: "Activate your passport to publish listings.",
    fieldKind: "Type",
    fieldTitle: "Title",
    fieldOrganization: "Organization or poster name",
    fieldRegion: "Region",
    fieldDescription: "Description",
    submit: "Publish",
    submitting: "Publishing…",
    posted: "Listing published.",
    postError: "Could not publish the listing. Try again.",
    errorRateLimited: "Too many attempts. Please try again later.",
    loadError: "Could not load listings.",
    retry: "Try again",
    empty: "No listings yet.",
    liveLabel: "Live",
  },
};
