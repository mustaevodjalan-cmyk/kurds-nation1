"use client";

import { useCallback, useEffect, useState } from "react";
import { answerDailyQuiz, fetchCitizenDashboard, type CitizenDashboard, type QuizAnswer } from "@/lib/roj-api";

export type DashboardStatus = "idle" | "loading" | "ready" | "error";

export function useCitizenDashboard(ownerToken: string | null) {
  const [dashboard, setDashboard] = useState<CitizenDashboard | null>(null);
  const [answer, setAnswer] = useState<QuizAnswer | null>(null);
  const [status, setStatus] = useState<DashboardStatus>("idle");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (token: string) => {
    setStatus("loading");
    try {
      const data = await fetchCitizenDashboard(token);
      setDashboard(data);
      setStatus(data ? "ready" : "error");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    setAnswer(null);
    if (!ownerToken) {
      setDashboard(null);
      setStatus("idle");
      return;
    }
    void load(ownerToken);
  }, [ownerToken, load]);

  const submit = useCallback(
    async (choice: number): Promise<QuizAnswer | null> => {
      if (!ownerToken || !dashboard || submitting || dashboard.answeredToday) return null;
      setSubmitting(true);
      try {
        const result = await answerDailyQuiz(ownerToken, dashboard.question.id, choice);
        setAnswer(result);
        setDashboard({
          ...dashboard,
          balance: result.balance,
          rank: result.rank,
          answeredToday: true,
        });
        return result;
      } catch {
        setStatus("error");
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [ownerToken, dashboard, submitting],
  );

  return { dashboard, answer, status, submitting, submit, reload: () => ownerToken && load(ownerToken) };
}

export type CitizenDashboardState = ReturnType<typeof useCitizenDashboard>;
