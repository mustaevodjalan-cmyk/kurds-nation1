"use client";

import { useMediaMessages } from "@/hooks/use-media-messages";
import type { MediaStrings } from "@/lib/media-i18n";
import { MessageThread } from "./message-thread";

const CHAT_POLL_MS = 6000;

type PanelProps = {
  strings: MediaStrings;
  videoId: string;
  ownerToken: string | null;
};

export function VideoComments({ strings: s, videoId, ownerToken }: PanelProps) {
  const thread = useMediaMessages(videoId, "comment", ownerToken);
  return (
    <MessageThread
      messages={thread.messages}
      status={thread.status}
      canPost={ownerToken !== null}
      posting={thread.posting}
      onPost={thread.post}
      emptyText={s.commentsEmpty}
      placeholder={s.commentPlaceholder}
      sendLabel={s.send}
      lockedText={s.passportRequired}
      errorText={s.errorGeneric}
      loadErrorText={s.loadError}
      variant="comments"
    />
  );
}

export function LiveChat({ strings: s, videoId, ownerToken }: PanelProps) {
  const thread = useMediaMessages(videoId, "chat", ownerToken, CHAT_POLL_MS);
  return (
    <MessageThread
      messages={thread.messages}
      status={thread.status}
      canPost={ownerToken !== null}
      posting={thread.posting}
      onPost={thread.post}
      emptyText={s.chatEmpty}
      placeholder={s.chatPlaceholder}
      sendLabel={s.send}
      lockedText={s.passportRequired}
      errorText={s.errorGeneric}
      loadErrorText={s.loadError}
      variant="chat"
    />
  );
}
