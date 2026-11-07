"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchListings, postListing, type Listing, type ListingDraft } from "@/lib/syndicate-api";
import { isRateLimitError } from "@/lib/rate-limit";

export type SyndicateStatus = "loading" | "ready" | "error";
export type SyndicateFailure = "failed" | "rate_limited" | null;

export function useSyndicate(ownerToken: string | null) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [status, setStatus] = useState<SyndicateStatus>("loading");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<SyndicateFailure>(null);
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setListings(await fetchListings());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = useCallback(
    async (draft: ListingDraft) => {
      if (!ownerToken || submitting) return;
      setSubmitting(true);
      setSubmitError(null);
      setSubmitted(false);
      try {
        await postListing(ownerToken, draft);
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

  return { listings, status, submitting, submitError, submitted, submit, reload: load };
}
