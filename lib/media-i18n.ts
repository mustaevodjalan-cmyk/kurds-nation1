import type { Lang } from "./i18n";

export type MediaStrings = {
  title: string;
  subtitle: string;
  sectionShorts: string;
  sectionChannels: string;
  sectionLive: string;
  like: string;
  liked: string;
  share: string;
  shareCopied: string;
  comments: string;
  commentsEmpty: string;
  commentPlaceholder: string;
  send: string;
  chatTitle: string;
  chatEmpty: string;
  chatPlaceholder: string;
  viewers: string;
  donate: string;
  donateAmount: string;
  donateBalance: string;
  donateSuccess: string;
  donateTotal: string;
  passportRequired: string;
  loadError: string;
  retry: string;
  empty: string;
  streamError: string;
  errorInsufficient: string;
  errorGeneric: string;
  liveBadge: string;
  liveNow: string;
  close: string;
};

export const MEDIA_I18N: Record<Lang, MediaStrings> = {
  ku: {
    title: "Torê Media",
    subtitle: "Vîdyo, kanal û weşanên zindî ji civata Torê.",
    sectionShorts: "Shorts",
    sectionChannels: "Kanal",
    sectionLive: "Zindî",
    like: "Hez bike",
    liked: "Hez kirî",
    share: "Parve bike",
    shareCopied: "Lînk hat kopîkirin",
    comments: "Şîrove",
    commentsEmpty: "Hîn şîrove tune. Ya yekem tu be!",
    commentPlaceholder: "Şîroveya xwe binivîse…",
    send: "Bişîne",
    chatTitle: "Chata zindî",
    chatEmpty: "Hîn peyam tune.",
    chatPlaceholder: "Peyamekê binivîse…",
    viewers: "temaşevan",
    donate: "Bi $ROJ piştgirî bike",
    donateAmount: "Mîqdar",
    donateBalance: "Balansa te",
    donateSuccess: "Spas! Bexşîn hat şandin.",
    donateTotal: "Tevahî $ROJ",
    passportRequired: "Ji bo hezkirin, şîrove û bexşînê pasaporta xwe çêke.",
    loadError: "Vîdyo nehatin barkirin.",
    retry: "Dîsa biceribîne",
    empty: "Hîn tiştek tune.",
    streamError: "Ev weşan niha nayê lîstin.",
    errorInsufficient: "Balansa te ji bo vê mîqdarê têr nake.",
    errorGeneric: "Çewtî çêbû. Dîsa biceribîne.",
    liveBadge: "ZINDÎ",
    liveNow: "Niha zindî",
    close: "Bigire",
  },
  ckb: {
    title: "Torê Media",
    subtitle: "ڤیدیۆ، کەناڵ و ڕاستەوخۆکانی کۆمەڵگای تۆرێ.",
    sectionShorts: "کورت",
    sectionChannels: "کەناڵەکان",
    sectionLive: "ڕاستەوخۆ",
    like: "پەسەندکردن",
    liked: "پەسەندکراو",
    share: "هاوبەشکردن",
    shareCopied: "بەستەر کۆپی کرا",
    comments: "لێدوانەکان",
    commentsEmpty: "هێشتا لێدوان نییە. یەکەم کەس بە!",
    commentPlaceholder: "لێدوانەکەت بنووسە…",
    send: "ناردن",
    chatTitle: "چاتی ڕاستەوخۆ",
    chatEmpty: "هێشتا نامە نییە.",
    chatPlaceholder: "نامەیەک بنووسە…",
    viewers: "بینەر",
    donate: "پشتگیری بکە بە $ROJ",
    donateAmount: "بڕ",
    donateBalance: "باڵانسی تۆ",
    donateSuccess: "سوپاس! بەخشینەکەت نێردرا.",
    donateTotal: "کۆی $ROJ",
    passportRequired: "بۆ پەسەندکردن، لێدوان و بەخشین پاسپۆرتەکەت دروست بکە.",
    loadError: "ڤیدیۆکان بار نەکران.",
    retry: "دووبارە هەوڵ بدەرەوە",
    empty: "هێشتا هیچ نییە.",
    streamError: "ئەم ڕاستەوخۆیە ئێستا پیشان نادرێت.",
    errorInsufficient: "باڵانسەکەت بۆ ئەم بڕە بەس ناکات.",
    errorGeneric: "هەڵەیەک ڕوویدا. دووبارە هەوڵ بدەرەوە.",
    liveBadge: "ڕاستەوخۆ",
    liveNow: "ئێستا ڕاستەوخۆ",
    close: "داخستن",
  },
  ru: {
    title: "Torê Media",
    subtitle: "Видео, каналы и прямые эфиры сообщества Torê.",
    sectionShorts: "Shorts",
    sectionChannels: "Каналы",
    sectionLive: "Прямой эфир",
    like: "Нравится",
    liked: "Вам нравится",
    share: "Поделиться",
    shareCopied: "Ссылка скопирована",
    comments: "Комментарии",
    commentsEmpty: "Комментариев пока нет. Будьте первым!",
    commentPlaceholder: "Напишите комментарий…",
    send: "Отправить",
    chatTitle: "Чат эфира",
    chatEmpty: "Сообщений пока нет.",
    chatPlaceholder: "Написать в чат…",
    viewers: "смотрят",
    donate: "Поддержать $ROJ",
    donateAmount: "Сумма",
    donateBalance: "Ваш баланс",
    donateSuccess: "Спасибо! Пожертвование отправлено.",
    donateTotal: "Всего $ROJ",
    passportRequired: "Создайте паспорт, чтобы ставить лайки, комментировать и поддерживать авторов.",
    loadError: "Не удалось загрузить видео.",
    retry: "Повторить",
    empty: "Пока ничего нет.",
    streamError: "Этот эфир сейчас недоступен.",
    errorInsufficient: "Недостаточно $ROJ на балансе.",
    errorGeneric: "Что-то пошло не так. Попробуйте снова.",
    liveBadge: "LIVE",
    liveNow: "Идёт в эфире",
    close: "Закрыть",
  },
  en: {
    title: "Torê Media",
    subtitle: "Videos, channels and live streams from the Torê community.",
    sectionShorts: "Shorts",
    sectionChannels: "Channels",
    sectionLive: "Live Streams",
    like: "Like",
    liked: "Liked",
    share: "Share",
    shareCopied: "Link copied",
    comments: "Comments",
    commentsEmpty: "No comments yet. Be the first!",
    commentPlaceholder: "Write a comment…",
    send: "Send",
    chatTitle: "Live chat",
    chatEmpty: "No messages yet.",
    chatPlaceholder: "Send a message…",
    viewers: "watching",
    donate: "Donate $ROJ",
    donateAmount: "Amount",
    donateBalance: "Your balance",
    donateSuccess: "Thank you! Your donation was sent.",
    donateTotal: "Total $ROJ",
    passportRequired: "Create your passport to like, comment and donate.",
    loadError: "Couldn't load videos.",
    retry: "Try again",
    empty: "Nothing here yet.",
    streamError: "This stream can't be played right now.",
    errorInsufficient: "Not enough $ROJ in your balance.",
    errorGeneric: "Something went wrong. Try again.",
    liveBadge: "LIVE",
    liveNow: "Live now",
    close: "Close",
  },
};
