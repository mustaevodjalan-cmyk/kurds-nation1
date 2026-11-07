import type { Lang } from "./i18n";

export type JusticeStrings = {
  title: string;
  subtitle: string;
  fileToggle: string;
  fileClose: string;
  locked: string;
  kindAgreement: string;
  kindArbitration: string;
  kindHint: string;
  fieldTitle: string;
  fieldSummary: string;
  fieldAmount: string;
  fieldRegion: string;
  submit: string;
  submitting: string;
  filed: string;
  fileError: string;
  loadError: string;
  retry: string;
  empty: string;
  statusOpen: string;
  statusInReview: string;
  statusResolved: string;
  escrowLabel: string;
  juryTitle: string;
  juryHint: string;
  juror: string;
  juryPending: string;
  jurorSealed: string;
  jurorRevealed: string;
  viewJury: string;
  hideJury: string;
  escrowNote: string;
  seatTitle: string;
  seatHint: string;
  verdictBuyer: string;
  verdictSeller: string;
  stakeLabel: string;
  stakeHint: string;
  sealButton: string;
  sealing: string;
  sealedWaiting: string;
  revealButton: string;
  revealing: string;
  revealedWaiting: string;
  progressSealed: string;
  progressRevealed: string;
  decided: string;
  verdictWon: string;
  payoutLabel: string;
  stakeLost: string;
  balanceLabel: string;
  actionError: string;
  errorRateLimited: string;
};

export const JUSTICE_I18N: Record<Lang, JusticeStrings> = {
  ku: {
    title: "Dîwana Gel",
    subtitle: "Peymanên bazirganiyê û dadweriya civakî ji bo Kurdistanê û diaspora",
    fileToggle: "Doz veke",
    fileClose: "Girtin",
    locked: "Ji bo vekirina dozê pasporta xwe çalak bike.",
    kindAgreement: "Peymana akilmend",
    kindArbitration: "Dadweriya civakî",
    kindHint: "Peymana akilmend mercên bazirganiyê diparêze. Dadweriya civakî 3 juriyan ji bo çareseriyê destnîşan dike.",
    fieldTitle: "Sernav",
    fieldSummary: "Kurte ya doz an mercan",
    fieldAmount: "Mîqdara $ROJ ya girêdayî",
    fieldRegion: "Herêm",
    submit: "Bişîne",
    submitting: "Tê şandin…",
    filed: "Doz hate vekirin.",
    fileError: "Doz nehat vekirin. Dîsa biceribîne.",
    loadError: "Doz nehatin barkirin.",
    retry: "Dîsa biceribîne",
    empty: "Niha doz tune ne.",
    statusOpen: "Vekirî",
    statusInReview: "Di nirxandinê de",
    statusResolved: "Çareser bû",
    escrowLabel: "Girêdayî",
    juryTitle: "Jurî",
    juryHint: "Nasnameyên jurîyan veşartî ne. Tenê kodên wan têne nîşandan.",
    juror: "Juri",
    juryPending: "Hê tê destnîşankirin",
    jurorSealed: "Girtî",
    jurorRevealed: "Vekirî",
    viewJury: "Jurî nîşan bide",
    hideJury: "Jurî veşêre",
    escrowNote: "Ev mîqdar tenê tê tomarkirin; $ROJ hîn nayê veguhestin.",
    seatTitle: "Kursiya te ya jurî",
    seatHint: "Biryara xwe bi nihênî bigire û bi stakê biparêze. Piştî ku hemû jurî bigirin, biryar vekin.",
    verdictBuyer: "Kirrîyar rast e",
    verdictSeller: "Firoşyar rast e",
    stakeLabel: "Stake ($ROJ)",
    stakeHint: "Di navbera 10 û 1000 $ROJ.",
    sealButton: "Biryarê bigire",
    sealing: "Tê girtin…",
    sealedWaiting: "Biryar girtî ye. Li benda jurîyên din.",
    revealButton: "Biryarê vekin",
    revealing: "Tê vekirin…",
    revealedWaiting: "Biryar vekirî ye. Li benda jurîya dawî.",
    progressSealed: "Girtî: {n}/{total}",
    progressRevealed: "Vekirî: {n}/{total}",
    decided: "Biryara jurî",
    verdictWon: "Biryar: {verdict}",
    payoutLabel: "Te {n} $ROJ wergirt",
    stakeLost: "Stake'a te winda bû",
    balanceLabel: "Balansa te",
    actionError: "Çalakî pêk nehat. Dîsa biceribîne.",
    errorRateLimited: "Gelek caran hat ceribandin. Piştî demekê dîsa biceribînin.",
  },
  ckb: {
    title: "دیوانی گەل",
    subtitle: "ڕێککەوتنی بازرگانی و دادوەری کۆمەڵایەتی بۆ کوردستان و دیاسپۆرا",
    fileToggle: "دۆسیە بکەرەوە",
    fileClose: "داخستن",
    locked: "بۆ کردنەوەی دۆسیە پاسپۆرتەکەت چالاک بکە.",
    kindAgreement: "ڕێککەوتنی زیرەک",
    kindArbitration: "دادوەری کۆمەڵایەتی",
    kindHint: "ڕێککەوتنی زیرەک مەرجەکانی بازرگانی دەپارێزێت. دادوەری کۆمەڵایەتی ٣ دادوەر بۆ چارەسەر دیاری دەکات.",
    fieldTitle: "ناونیشان",
    fieldSummary: "کورتەی دۆسیە یان مەرجەکان",
    fieldAmount: "بڕی $ROJ ی بەستراو",
    fieldRegion: "ناوچە",
    submit: "بینێرە",
    submitting: "دەنێردرێت…",
    filed: "دۆسیەکە کرایەوە.",
    fileError: "دۆسیەکە نەکرایەوە. دووبارە هەوڵ بدەرەوە.",
    loadError: "دۆسیەکان باربکرێت نەکران.",
    retry: "دووبارە هەوڵ بدەرەوە",
    empty: "ئێستا هیچ دۆسیەیەک نییە.",
    statusOpen: "کراوە",
    statusInReview: "لە هەڵسەنگاندندا",
    statusResolved: "چارەسەر کرا",
    escrowLabel: "بەستراو",
    juryTitle: "دادوەران",
    juryHint: "ناسنامەی دادوەران شاراوەیە. تەنها کۆدەکانیان پیشان دەدرێت.",
    juror: "دادوەر",
    juryPending: "هێشتا دیاری ناکرێت",
    jurorSealed: "داخراو",
    jurorRevealed: "کراوە",
    viewJury: "دادوەران پیشان بدە",
    hideJury: "دادوەران شاردنەوە",
    escrowNote: "ئەم بڕە تەنها تۆمار دەکرێت؛ $ROJ هێشتا ناگوازرێتەوە.",
    seatTitle: "کورسیی تۆ وەک دادوەر",
    seatHint: "بڕیارەکەت بە نهێنی داخە و بە stake بیپارێزە. دوای ئەوەی هەموو دادوەران داخست، بڕیارەکان بکەرەوە.",
    verdictBuyer: "کڕیار ڕاستە",
    verdictSeller: "فرۆشیار ڕاستە",
    stakeLabel: "Stake ($ROJ)",
    stakeHint: "لە نێوان ١٠ و ١٠٠٠ $ROJ.",
    sealButton: "بڕیار داخە",
    sealing: "دادەخرێت…",
    sealedWaiting: "بڕیار داخرا. چاوەڕێی دادوەرەکانی تر.",
    revealButton: "بڕیار بکەرەوە",
    revealing: "دەکرێتەوە…",
    revealedWaiting: "بڕیار کرایەوە. چاوەڕێی دادوەری دواتر.",
    progressSealed: "داخراو: {n}/{total}",
    progressRevealed: "کراوە: {n}/{total}",
    decided: "بڕیاری دادوەران",
    verdictWon: "بڕیار: {verdict}",
    payoutLabel: "تۆ {n} $ROJ وەرگرت",
    stakeLost: "ستەیکەکەت لەدەست چوو",
    balanceLabel: "باڵانسی تۆ",
    actionError: "کردارەکە جێبەجێ نەکرا. دووبارە هەوڵ بدەرەوە.",
    errorRateLimited: "هەوڵی زۆر درا. تکایە دواتر دووبارە هەوڵ بدەرەوە.",
  },
  ru: {
    title: "Dîwana Gel",
    subtitle: "Смарт-контракты и общинный арбитраж для курдской торговли и диаспоры",
    fileToggle: "Открыть спор",
    fileClose: "Закрыть",
    locked: "Активируйте паспорт, чтобы открыть спор.",
    kindAgreement: "Смарт-контракт",
    kindArbitration: "Общинный арбитраж",
    kindHint: "Смарт-контракт фиксирует условия сделки. Арбитраж назначает 3 присяжных для решения.",
    fieldTitle: "Заголовок",
    fieldSummary: "Суть спора или условия",
    fieldAmount: "Сумма $ROJ в залоге",
    fieldRegion: "Регион",
    submit: "Подать",
    submitting: "Отправка…",
    filed: "Спор открыт.",
    fileError: "Не удалось открыть спор. Попробуйте ещё раз.",
    loadError: "Не удалось загрузить споры.",
    retry: "Повторить",
    empty: "Споров пока нет.",
    statusOpen: "Открыт",
    statusInReview: "На рассмотрении",
    statusResolved: "Решён",
    escrowLabel: "В залоге",
    juryTitle: "Присяжные",
    juryHint: "Личности присяжных скрыты. Показаны только их коды.",
    juror: "Присяжный",
    juryPending: "Ещё назначается",
    jurorSealed: "Запечатано",
    jurorRevealed: "Открыто",
    viewJury: "Показать присяжных",
    hideJury: "Скрыть присяжных",
    escrowNote: "Сумма только фиксируется; $ROJ пока не переводится.",
    seatTitle: "Ваше место присяжного",
    seatHint: "Запечатайте решение и внесите залог. Когда все присяжные запечатали решения, откройте их.",
    verdictBuyer: "Прав покупатель",
    verdictSeller: "Прав продавец",
    stakeLabel: "Залог ($ROJ)",
    stakeHint: "От 10 до 1000 $ROJ.",
    sealButton: "Запечатать решение",
    sealing: "Запечатывание…",
    sealedWaiting: "Решение запечатано. Ждём остальных присяжных.",
    revealButton: "Открыть решение",
    revealing: "Открытие…",
    revealedWaiting: "Решение открыто. Ждём последнего присяжного.",
    progressSealed: "Запечатано: {n}/{total}",
    progressRevealed: "Открыто: {n}/{total}",
    decided: "Решение присяжных",
    verdictWon: "Решение: {verdict}",
    payoutLabel: "Вы получили {n} $ROJ",
    stakeLost: "Залог потерян",
    balanceLabel: "Ваш баланс",
    actionError: "Не удалось выполнить действие. Попробуйте ещё раз.",
    errorRateLimited: "Слишком много попыток. Попробуйте позже.",
  },
  en: {
    title: "Dîwana Gel",
    subtitle: "Smart-contract agreements and community arbitration for Kurdish commerce worldwide",
    fileToggle: "File a case",
    fileClose: "Close",
    locked: "Activate your passport to file a case.",
    kindAgreement: "Smart-contract agreement",
    kindArbitration: "Community arbitration",
    kindHint: "A smart-contract agreement records trade terms. Arbitration seats 3 jurors to decide.",
    fieldTitle: "Title",
    fieldSummary: "Case summary or agreement terms",
    fieldAmount: "$ROJ amount in escrow",
    fieldRegion: "Region",
    submit: "File",
    submitting: "Filing…",
    filed: "Case filed.",
    fileError: "Could not file the case. Try again.",
    loadError: "Could not load cases.",
    retry: "Try again",
    empty: "No cases yet.",
    statusOpen: "Open",
    statusInReview: "In review",
    statusResolved: "Resolved",
    escrowLabel: "In escrow",
    juryTitle: "Jury",
    juryHint: "Juror identities are hidden. Only their codes are shown.",
    juror: "Juror",
    juryPending: "Being seated",
    jurorSealed: "Sealed",
    jurorRevealed: "Revealed",
    viewJury: "Show jury",
    hideJury: "Hide jury",
    escrowNote: "The amount is recorded only; $ROJ is not moved yet.",
    seatTitle: "Your jury seat",
    seatHint: "Seal your verdict and stake $ROJ. Once every juror has sealed, all verdicts can be revealed.",
    verdictBuyer: "Buyer is right",
    verdictSeller: "Seller is right",
    stakeLabel: "Stake ($ROJ)",
    stakeHint: "Between 10 and 1000 $ROJ.",
    sealButton: "Seal verdict",
    sealing: "Sealing…",
    sealedWaiting: "Verdict sealed. Waiting for the other jurors.",
    revealButton: "Reveal verdict",
    revealing: "Revealing…",
    revealedWaiting: "Verdict revealed. Waiting for the last juror.",
    progressSealed: "Sealed: {n}/{total}",
    progressRevealed: "Revealed: {n}/{total}",
    decided: "Jury decision",
    verdictWon: "Decision: {verdict}",
    payoutLabel: "You earned {n} $ROJ",
    stakeLost: "Your stake was forfeited",
    balanceLabel: "Your balance",
    actionError: "The action could not be completed. Try again.",
    errorRateLimited: "Too many attempts. Please try again later.",
  },
};
