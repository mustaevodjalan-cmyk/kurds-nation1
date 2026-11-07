import { getSupabase } from "./supabase";
import { LANGS, type Lang } from "./i18n";
import { isChannelId, type ChannelId } from "./channels";

const MESSAGE_COLUMNS = "id, sender_id, channel, lang, cipher, iv, created_at, expires_at";
const HISTORY_LIMIT = 100;

export type MessageRecord = {
  id: string;
  senderId: string;
  channel: ChannelId;
  lang: Lang;
  cipher: string;
  iv: string;
  createdAt: string;
  expiresAt: string;
};

type MessageRow = {
  id: string;
  sender_id: string;
  channel: string;
  lang: string;
  cipher: string;
  iv: string;
  created_at: string;
  expires_at: string;
};

function toMessage(row: unknown): MessageRecord {
  const r = row as Partial<MessageRow> | null;
  if (
    !r ||
    typeof r.id !== "string" ||
    typeof r.sender_id !== "string" ||
    !isChannelId(r.channel) ||
    typeof r.lang !== "string" ||
    !LANGS.includes(r.lang as Lang) ||
    typeof r.cipher !== "string" ||
    typeof r.iv !== "string" ||
    typeof r.created_at !== "string" ||
    typeof r.expires_at !== "string"
  ) {
    throw new Error("Unexpected message record");
  }
  return {
    id: r.id,
    senderId: r.sender_id,
    channel: r.channel,
    lang: r.lang as Lang,
    cipher: r.cipher,
    iv: r.iv,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
  };
}

export async function fetchLiveMessages(channel: ChannelId): Promise<MessageRecord[]> {
  const { data, error } = await getSupabase()
    .from("messages")
    .select(MESSAGE_COLUMNS)
    .eq("channel", channel)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);
  if (error) throw new Error(error.message);
  if (!Array.isArray(data)) throw new Error("Unexpected message feed");
  return data.map(toMessage).reverse();
}

export async function insertMessage(input: {
  senderId: string;
  channel: ChannelId;
  lang: Lang;
  cipher: string;
  iv: string;
}): Promise<MessageRecord> {
  const { data, error } = await getSupabase()
    .from("messages")
    .insert({
      sender_id: input.senderId,
      channel: input.channel,
      lang: input.lang,
      cipher: input.cipher,
      iv: input.iv,
    })
    .select(MESSAGE_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return toMessage(data);
}

export async function purgeExpiredMessages(): Promise<void> {
  const { error } = await getSupabase().rpc("purge_expired_messages");
  if (error) throw new Error(error.message);
}

/* Returns an unsubscribe function. `onLive` fires true once subscribed and false on channel failure. */
export function subscribeToMessages(
  channel: ChannelId,
  onInsert: (message: MessageRecord) => void,
  onLive: (live: boolean) => void,
): () => void {
  const supabase = getSupabase();
  const realtime = supabase
    .channel(`messages-${channel}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `channel=eq.${channel}` },
      (payload) => onInsert(toMessage(payload.new)),
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") onLive(true);
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") onLive(false);
    });
  return () => {
    void supabase.removeChannel(realtime);
  };
}
