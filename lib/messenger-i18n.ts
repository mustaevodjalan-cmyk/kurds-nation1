import type { Lang } from "./i18n";

export type MessengerStrings = {
  title: string;
  subtitle: string;
  placeholder: string;
  send: string;
  empty: string;
  securing: string;
  secured: string;
  failed: string;
  rateLimited: string;
  e2ee: string;
  disappearing: string;
  expiresIn: string;
  translated: string;
  channels: string;
};

/* Placeholder: {time} = remaining countdown. */
export const MESSENGER_I18N: Record<Lang, MessengerStrings> = {
  ku: {
    title: "Peyam",
    subtitle: "Peyamên peer-to-peer, bi şîfreya dawî-bi-dawî",
    placeholder: "Peyamek binivîse…",
    send: "Bişîne",
    empty: "Hê peyam tune. Destpê bike.",
    securing: "Kanal tê ewlekirin…",
    secured: "Kanal ewle ye",
    failed: "Kanal nehat ewlekirin",
    rateLimited: "Gelek caran hat ceribandin. Piştî demekê dîsa biceribînin.",
    e2ee: "Dawî-bi-dawî şîfrekirî",
    disappearing: "Peyamên xwe-jêbûyî",
    expiresIn: "Di {time} de jê dibe",
    translated: "Wergerandî bi AI",
    channels: "Kanal",
  },
  ckb: {
    title: "نامە",
    subtitle: "نامەی هاوتا-بۆ-هاوتا، بە کۆدکردنی سەرتا بۆ کۆتا",
    placeholder: "نامەیەک بنووسە…",
    send: "ناردن",
    empty: "هێشتا نامە نییە. دەست پێ بکە.",
    securing: "کەناڵ پارێزراو دەکرێت…",
    secured: "کەناڵەکە پارێزراوە",
    failed: "کەناڵەکە پارێزراو نەکرا",
    rateLimited: "هەوڵی زۆر درا. تکایە دواتر دووبارە هەوڵ بدەرەوە.",
    e2ee: "کۆدکراوی سەرتا بۆ کۆتا",
    disappearing: "نامە خۆبەخۆ دەسڕێتەوە",
    expiresIn: "دەسڕدرێتەوە لە {time}",
    translated: "وەرگێڕدراو بە AI",
    channels: "کەناڵەکان",
  },
  ru: {
    title: "Мессенджер",
    subtitle: "Одноранговые сообщения с шифрованием",
    placeholder: "Напишите сообщение…",
    send: "Отправить",
    empty: "Сообщений пока нет. Напишите первым.",
    securing: "Защищаем канал…",
    secured: "Канал защищён",
    failed: "Не удалось защитить канал",
    rateLimited: "Слишком много попыток. Попробуйте позже.",
    e2ee: "Сквозное шифрование",
    disappearing: "Исчезающие сообщения",
    expiresIn: "Исчезнет через {time}",
    translated: "Переведено AI",
    channels: "Каналы",
  },
  en: {
    title: "Messenger",
    subtitle: "Peer-to-peer messages, end-to-end encrypted",
    placeholder: "Write a message…",
    send: "Send",
    empty: "No messages yet. Say hello.",
    securing: "Securing channel…",
    secured: "Channel secured",
    failed: "Could not secure channel",
    rateLimited: "Too many attempts. Please try again later.",
    e2ee: "End-to-end encrypted",
    disappearing: "Disappearing messages",
    expiresIn: "Expires in {time}",
    translated: "AI Translated",
    channels: "Channels",
  },
};
