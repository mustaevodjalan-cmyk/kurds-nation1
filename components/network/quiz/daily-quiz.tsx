"use client";

import { CheckCircle2, Coins, Lock, XCircle } from "lucide-react";
import type { DashboardStrings } from "@/lib/dashboard-i18n";
import type { CitizenDashboardState } from "@/hooks/use-citizen-dashboard";
import { cn } from "@/lib/utils";

type DailyQuizProps = {
  strings: DashboardStrings;
  state: CitizenDashboardState;
  active: boolean;
};

export function DailyQuiz({ strings: d, state, active }: DailyQuizProps) {
  const { dashboard, answer, status, submitting, submit, reload } = state;
  const answered = answer !== null || dashboard?.answeredToday === true;

  return (
    <section
      aria-labelledby="daily-quiz-title"
      className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04] p-6 shadow-[0_0_50px_-24px_rgba(255,201,51,0.45)] backdrop-blur-xl sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 id="daily-quiz-title" className="text-lg font-bold sm:text-xl">
            {d.quizTitle}
          </h3>
          <p className="mt-1 text-sm text-slate-400">{d.quizSubtitle}</p>
        </div>
        {dashboard && (
          <span className="inline-flex items-center gap-2 rounded-full border border-sun/50 bg-sun/10 px-3 py-1 font-mono text-sm font-semibold text-sun">
            <Coins className="h-4 w-4" aria-hidden="true" />
            {dashboard.balance} {d.balanceLabel}
          </span>
        )}
      </div>

      {!active ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-white/20 p-5 text-sm text-slate-400">
          <Lock className="h-5 w-5 shrink-0" aria-hidden="true" />
          {d.quizLocked}
        </div>
      ) : status === "error" ? (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-flame/40 bg-flame/10 p-5">
          <p role="alert" className="text-sm text-flame">
            {d.quizError}
          </p>
          <button
            type="button"
            onClick={() => void reload()}
            className="rounded-xl border border-ice/50 bg-ice/10 px-4 py-2 text-sm font-semibold text-ice transition hover:bg-ice/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice"
          >
            {d.quizRetry}
          </button>
        </div>
      ) : !dashboard ? (
        <div aria-hidden="true" className="mt-6 h-40 animate-pulse rounded-2xl bg-white/5" />
      ) : (
        <div className="mt-6">
          <p className="text-base font-semibold leading-snug text-slate-100 sm:text-lg">{dashboard.question.prompt}</p>

          <div role="radiogroup" aria-label={dashboard.question.prompt} className="mt-5 grid gap-3">
            {dashboard.question.options.map((option, index) => {
              const correctIndex = answer?.correctIndex;
              const isCorrectOption = answered && correctIndex === index;
              const isPickedWrong = answer !== null && !answer.correct && answer.correctIndex !== index;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={isCorrectOption}
                  disabled={answered || submitting}
                  onClick={() => void submit(index)}
                  className={cn(
                    "relative flex items-center justify-between gap-3 rounded-2xl border px-5 py-3.5 text-start text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun disabled:cursor-default",
                    !answered && "border-white/15 bg-white/5 text-slate-100 hover:-translate-y-0.5 hover:border-sun/60 hover:bg-sun/10",
                    isCorrectOption && "border-jade bg-jade/15 text-jade",
                    isPickedWrong && "border-flame/50 bg-flame/10 text-slate-300 opacity-70",
                  )}
                >
                  <span>{option}</span>
                  {isCorrectOption && answer?.correct && (
                    <span className="relative flex h-6 w-6 items-center justify-center">
                      <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-jade/50" />
                      <CheckCircle2 className="relative h-5 w-5 text-jade" aria-hidden="true" />
                    </span>
                  )}
                  {isCorrectOption && !answer?.correct && <CheckCircle2 className="h-5 w-5 text-jade" aria-hidden="true" />}
                  {isPickedWrong && <XCircle className="h-5 w-5 text-flame" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <div aria-live="polite" className="mt-5 min-h-[2rem]">
            {answer?.correct && (
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-jade">
                {d.quizCorrect}
                <span className="animate-bounce rounded-full bg-jade/20 px-2 py-0.5 font-mono text-xs">{d.quizReward}</span>
              </p>
            )}
            {answer && !answer.correct && <p className="text-sm text-flame">{d.quizWrong}</p>}
            {!answer && dashboard.answeredToday && (
              <p className="text-sm text-slate-400">
                {d.quizAnswered} {d.quizTomorrow}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
