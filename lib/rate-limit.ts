export function isRateLimitError(err: unknown): boolean {
  return err instanceof Error && err.message === "rate_limited";
}
