"use client";

import { useEffect, useState } from "react";

export function MintOverlay({ steps }: { steps: string[] }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const stepTimer = window.setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    }, 1000);
    const frame = requestAnimationFrame(() => setFilled(true));
    return () => {
      window.clearInterval(stepTimer);
      cancelAnimationFrame(frame);
    };
  }, [steps.length]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 rounded-3xl bg-ink/90 p-6 text-center backdrop-blur-md"
    >
      <div className="relative h-24 w-24" aria-hidden="true">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-ice" />
        <span className="absolute inset-2 animate-[spin_2s_linear_infinite_reverse] rounded-full border-2 border-transparent border-b-sun" />
        <span className="absolute inset-5 animate-ping rounded-full bg-jade/40" />
      </div>
      <p key={stepIndex} className="min-h-[1.5rem] animate-pulse text-sm font-medium tracking-wide text-slate-100">
        {steps[stepIndex]}
      </p>
      <div className="h-1 w-56 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-ice to-jade transition-[width] duration-[3200ms] ease-linear ${
            filled ? "w-full" : "w-0"
          }`}
        />
      </div>
    </div>
  );
}
