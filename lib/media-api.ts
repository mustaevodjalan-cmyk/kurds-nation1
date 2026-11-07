import { getSupabase } from "./supabase";

export type MediaKind = "short" | "long" | "live";
export type MessageKind = "comment" | "chat";

export type MediaVideo = {
  id: string;
  kind: MediaKind;
  title: string;
  creator: string;
  description: string;
  hlsUrl: string;
  durationLabel: string;
  viewers: number;
  likes: number;
  donatedRoj: number;
  liked: boolean;
};

export type MediaMessage = {
  id: string;
  authorLabel: string;
  body: string;
  createdAt: string;
};

const KINDS: readonly MediaKind[] = ["short", "long", "live"];

function fail(): never {
  throw new Error("Unexpected media response");
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail();
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) fail();
  return value;
}

function str(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string") fail();
  return value;
}

function num(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== "number" || !Number.isFinite(value)) fail();
  return value;
}

function toVideo(value: unknown): MediaVideo {
  const v = asRecord(value);
  const kind = str(v, "kind");
  if (!KINDS.includes(kind as MediaKind) || typeof v.liked !== "boolean") fail();
  return {
    id: str(v, "id"),
    kind: kind as MediaKind,
    title: str(v, "title"),
    creator: str(v, "creator"),
    description: str(v, "description"),
    hlsUrl: str(v, "hlsUrl"),
    durationLabel: str(v, "durationLabel"),
    viewers: num(v, "viewers"),
    likes: num(v, "likes"),
    donatedRoj: num(v, "donatedRoj"),
    liked: v.liked,
  };
}

function toMessage(value: unknown): MediaMessage {
  const m = asRecord(value);
  return {
    id: str(m, "id"),
    authorLabel: str(m, "author_label"),
    body: str(m, "body"),
    createdAt: str(m, "created_at"),
  };
}

export async function fetchMediaCatalog(ownerToken: string | null): Promise<MediaVideo[]> {
  const { data, error } = await getSupabase().rpc("media_catalog", { p_owner_token: ownerToken });
  if (error) throw new Error(error.message);
  return asArray(data).map(toVideo);
}

export async function toggleMediaLike(
  ownerToken: string,
  videoId: string,
): Promise<{ liked: boolean; likes: number }> {
  const { data, error } = await getSupabase().rpc("toggle_media_like", {
    p_owner_token: ownerToken,
    p_video_id: videoId,
  });
  if (error) throw new Error(error.message);
  const r = asRecord(data);
  if (typeof r.liked !== "boolean") fail();
  return { liked: r.liked, likes: num(r, "likes") };
}

export async function fetchMediaMessages(videoId: string, kind: MessageKind): Promise<MediaMessage[]> {
  const { data, error } = await getSupabase().rpc("list_media_messages", {
    p_video_id: videoId,
    p_kind: kind,
  });
  if (error) throw new Error(error.message);
  return asArray(data).map(toMessage);
}

export async function postMediaMessage(
  ownerToken: string,
  videoId: string,
  kind: MessageKind,
  body: string,
): Promise<void> {
  const { error } = await getSupabase().rpc("post_media_message", {
    p_owner_token: ownerToken,
    p_video_id: videoId,
    p_kind: kind,
    p_body: body,
  });
  if (error) throw new Error(error.message);
}

export async function donateRoj(
  ownerToken: string,
  videoId: string,
  amount: number,
): Promise<{ balance: number; donatedRoj: number }> {
  const { data, error } = await getSupabase().rpc("donate_roj", {
    p_owner_token: ownerToken,
    p_video_id: videoId,
    p_amount: amount,
  });
  if (error) throw new Error(error.message);
  const r = asRecord(data);
  return { balance: num(r, "balance"), donatedRoj: num(r, "donatedRoj") };
}
