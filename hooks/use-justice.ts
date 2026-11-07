"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchDisputes,
  fetchMySeats,
  openDispute,
  revealVerdict,
  sealVerdict,
  type Dispute,
  type DisputeDraft,
  type Juror,
  type MySeat,
} from "@/lib/justice-api";
import { isRateLimitError } from "@/lib/rate-limit";
import type { Verdict } from "@/lib/verdict-commitment";

export type JusticeStatus = "loading" | "ready" | "error";
export type JusticeFailure = "failed" | "rate_limited" | null;

export function useJustice(ownerToken: string | null) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [jurors, setJurors] = useState<Juror[]>([]);
  const [seats, setSeats] = useState<MySeat[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [status, setStatus] = useState<JusticeStatus>("loading");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<JusticeFailure>(null);
  const [submitted, setSubmitted] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<JusticeFailure>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const feed = await fetchDisputes();
      const mine = ownerToken ? await fetchMySeats(ownerToken) : null;
      setDisputes(feed.disputes);
      setJurors(feed.jurors);
      setSeats(mine?.seats ?? []);
      setBalance(mine?.balance ?? null);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [ownerToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = useCallback(
    async (draft: DisputeDraft) => {
      if (!ownerToken || submitting) return;
      setSubmitting(true);
      setSubmitError(null);
      setSubmitted(false);
      try {
        await openDispute(ownerToken, draft);
        setSubmitted(true);
        await load();
      } catch (err) {
        setSubmitError(isRateLimitError(err) ? "rate_limited" : "failed");
      } finally {
        setSubmitting(false);
      }
    },
    [ownerToken, submitting, load],
  );

  const runAction = useCallback(
    async (action: () => Promise<unknown>) => {
      if (actionBusy) return;
      setActionBusy(true);
      setActionError(null);
      try {
        await action();
        await load();
      } catch (err) {
        setActionError(isRateLimitError(err) ? "rate_limited" : "failed");
      } finally {
        setActionBusy(false);
      }
    },
    [actionBusy, load],
  );

  const seal = useCallback(
    (disputeId: string, verdict: Verdict, stake: number) => {
      if (!ownerToken) return Promise.resolve();
      return runAction(() => sealVerdict(ownerToken, disputeId, verdict, stake));
    },
    [ownerToken, runAction],
  );

  const reveal = useCallback(
    (disputeId: string) => {
      if (!ownerToken) return Promise.resolve();
      return runAction(() => revealVerdict(ownerToken, disputeId));
    },
    [ownerToken, runAction],
  );

  return {
    disputes,
    jurors,
    seats,
    balance,
    status,
    submitting,
    submitError,
    submitted,
    submit,
    actionBusy,
    actionError,
    seal,
    reveal,
    reload: load,
  };
}
