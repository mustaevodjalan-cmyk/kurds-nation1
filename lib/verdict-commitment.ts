export type Verdict = "buyer" | "seller";

export type SealedVerdict = {
  verdict: Verdict;
  salt: string;
};

const STORAGE_PREFIX = "nn.jury.";

function storageKey(disputeId: string): string {
  return `${STORAGE_PREFIX}${disputeId}`;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function createSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer);
}

export async function commitmentFor(verdict: Verdict, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${verdict}:${salt}`));
  return toHex(digest);
}

export function saveSealedVerdict(disputeId: string, sealed: SealedVerdict): void {
  localStorage.setItem(storageKey(disputeId), JSON.stringify(sealed));
}

export function loadSealedVerdict(disputeId: string): SealedVerdict | null {
  const raw = localStorage.getItem(storageKey(disputeId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SealedVerdict>;
    if ((parsed.verdict === "buyer" || parsed.verdict === "seller") && typeof parsed.salt === "string") {
      return { verdict: parsed.verdict, salt: parsed.salt };
    }
  } catch {
    return null;
  }
  return null;
}

export function clearSealedVerdict(disputeId: string): void {
  localStorage.removeItem(storageKey(disputeId));
}

export function clearAllSealedVerdicts(): void {
  const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).filter(
    (key): key is string => key !== null && key.startsWith(STORAGE_PREFIX),
  );
  keys.forEach((key) => localStorage.removeItem(key));
}
