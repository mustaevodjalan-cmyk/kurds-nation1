import { getSupabase } from "./supabase";

export type CitizenRank = "novice" | "history_keeper";

export type DailyQuestion = {
  id: number;
  prompt: string;
  options: string[];
};

export type CitizenDashboard = {
  balance: number;
  rank: CitizenRank;
  answeredToday: boolean;
  question: DailyQuestion;
};

export type QuizAnswer = {
  correct: boolean;
  correctIndex: number;
  balance: number;
  rank: CitizenRank;
};

const RANKS: readonly CitizenRank[] = ["novice", "history_keeper"];

function toDashboard(value: unknown): CitizenDashboard | null {
  if (value === null) return null;
  const v = value as Record<string, unknown> | null;
  const q = v?.question as Record<string, unknown> | undefined;
  if (
    !v ||
    typeof v.balance !== "number" ||
    !RANKS.includes(v.rank as CitizenRank) ||
    typeof v.answeredToday !== "boolean" ||
    !q ||
    typeof q.id !== "number" ||
    typeof q.prompt !== "string" ||
    !Array.isArray(q.options) ||
    !q.options.every((o) => typeof o === "string")
  ) {
    throw new Error("Unexpected citizen dashboard");
  }
  return {
    balance: v.balance,
    rank: v.rank as CitizenRank,
    answeredToday: v.answeredToday,
    question: { id: q.id, prompt: q.prompt, options: q.options as string[] },
  };
}

function toAnswer(value: unknown): QuizAnswer {
  const v = value as Record<string, unknown> | null;
  if (
    !v ||
    typeof v.correct !== "boolean" ||
    typeof v.correctIndex !== "number" ||
    typeof v.balance !== "number" ||
    !RANKS.includes(v.rank as CitizenRank)
  ) {
    throw new Error("Unexpected quiz result");
  }
  return {
    correct: v.correct,
    correctIndex: v.correctIndex,
    balance: v.balance,
    rank: v.rank as CitizenRank,
  };
}

export async function fetchCitizenDashboard(ownerToken: string): Promise<CitizenDashboard | null> {
  const { data, error } = await getSupabase().rpc("citizen_dashboard", { p_owner_token: ownerToken });
  if (error) throw new Error(error.message);
  return toDashboard(data);
}

export async function answerDailyQuiz(
  ownerToken: string,
  questionId: number,
  choice: number,
): Promise<QuizAnswer> {
  const { data, error } = await getSupabase().rpc("answer_daily_quiz", {
    p_owner_token: ownerToken,
    p_question_id: questionId,
    p_choice: choice,
  });
  if (error) throw new Error(error.message);
  return toAnswer(data);
}
