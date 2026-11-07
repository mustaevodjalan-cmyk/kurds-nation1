export const CHANNEL_IDS = ["general", "history-culture", "tech-startups", "eco-municipalism"] as const;

export type ChannelId = (typeof CHANNEL_IDS)[number];

export const DEFAULT_CHANNEL: ChannelId = "general";

export function isChannelId(value: unknown): value is ChannelId {
  return typeof value === "string" && (CHANNEL_IDS as readonly string[]).includes(value);
}
