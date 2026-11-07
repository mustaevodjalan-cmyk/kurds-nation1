"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { DEFAULT_CHANNEL, type ChannelId } from "@/lib/channels";
import { openLobbyText, sealLobbyText } from "@/lib/message-cipher";
import { isRateLimitError } from "@/lib/rate-limit";
import {
  fetchLiveMessages,
  insertMessage,
  purgeExpiredMessages,
  subscribeToMessages,
  type MessageRecord,
} from "@/lib/messages-api";
import { readStorage, writeStorage } from "@/lib/safe-storage";

export const WIPE_COMMAND = "NN_WIPE";
const SENDER_STORAGE_KEY = "nn.sender";

export type ChatMessage = {
  id: string;
  author: "me" | "peer";
  lang: Lang;
  text: string;
  createdAt: number;
  expiresAt: number;
};

export type ChannelStatus = "securing" | "ready" | "failed" | "rate_limited";

function newSenderId(): string {
  const id = crypto.randomUUID();
  writeStorage(SENDER_STORAGE_KEY, id);
  return id;
}

function loadSenderId(): string {
  const stored = readStorage(SENDER_STORAGE_KEY);
  return stored && /^[0-9a-f-]{36}$/i.test(stored) ? stored : newSenderId();
}

export function useMessenger() {
  const [channel, setChannel] = useState<ChannelId>(DEFAULT_CHANNEL);
  const [status, setStatus] = useState<ChannelStatus>("securing");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [now, setNow] = useState(0);
  const senderRef = useRef<string | null>(null);
  const generationRef = useRef(0);

  const absorb = useCallback(async (records: MessageRecord[], generation: number) => {
    const me = senderRef.current;
    const decoded = await Promise.all(
      records.map(async (record): Promise<ChatMessage | null> => {
        const text = await openLobbyText(record.cipher, record.iv);
        const expiresAt = Date.parse(record.expiresAt);
        if (text === null || expiresAt <= Date.now()) return null;
        return {
          id: record.id,
          author: record.senderId === me ? "me" : "peer",
          lang: record.lang,
          text,
          createdAt: Date.parse(record.createdAt),
          expiresAt,
        };
      }),
    );
    if (generation !== generationRef.current) return;
    const fresh = decoded.filter((m): m is ChatMessage => m !== null);
    if (fresh.length === 0) return;
    setMessages((prev) => {
      const known = new Set(prev.map((m) => m.id));
      const added = fresh.filter((m) => !known.has(m.id));
      return added.length === 0
        ? prev
        : [...prev, ...added].sort((a, b) => a.createdAt - b.createdAt);
    });
  }, []);

  useEffect(() => {
    senderRef.current = loadSenderId();
    let cancelled = false;
    setStatus("securing");

    const syncHistory = () => {
      const generation = generationRef.current;
      fetchLiveMessages(channel)
        .then((records) => {
          if (!cancelled) return absorb(records, generation);
        })
        .catch(() => {
          if (!cancelled) setStatus("failed");
        });
    };

    purgeExpiredMessages().catch(() => undefined);
    const unsubscribe = subscribeToMessages(
      channel,
      (record) => {
        if (!cancelled) void absorb([record], generationRef.current);
      },
      (live) => {
        if (cancelled) return;
        setStatus(live ? "ready" : "failed");
        if (live) syncHistory();
      },
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [absorb, channel]);

  const selectChannel = useCallback((next: ChannelId) => {
    generationRef.current += 1;
    setMessages([]);
    setChannel(next);
  }, []);

  const send = useCallback(
    async (raw: string, lang: Lang) => {
      const text = raw.trim();
      const senderId = senderRef.current;
      if (!text || !senderId) return;
      const generation = generationRef.current;
      try {
        const sealed = await sealLobbyText(text);
        const record = await insertMessage({ senderId, channel, lang, ...sealed });
        await absorb([record], generation);
        setStatus("ready");
      } catch (err) {
        setStatus(isRateLimitError(err) ? "rate_limited" : "failed");
      }
    },
    [absorb, channel],
  );

  const wipe = useCallback(() => {
    generationRef.current += 1;
    senderRef.current = newSenderId();
    setMessages([]);
  }, []);

  useEffect(() => {
    const tick = () => {
      const current = Date.now();
      setNow(current);
      setMessages((prev) =>
        prev.some((m) => m.expiresAt <= current) ? prev.filter((m) => m.expiresAt > current) : prev,
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return { channel, selectChannel, status, messages, now, send, wipe };
}

export type ChatState = ReturnType<typeof useMessenger>;
