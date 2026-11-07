import { getSupabase } from "./supabase";
import { REGIONS, type Region } from "./registry";
import {
  clearSealedVerdict,
  commitmentFor,
  createSalt,
  loadSealedVerdict,
  saveSealedVerdict,
  type Verdict,
} from "./verdict-commitment";

export type DisputeKind = "agreement" | "arbitration";
export type DisputeStatus = "open" | "in_review" | "resolved";

export type Dispute = {
  id: string;
  kind: DisputeKind;
  title: string;
  summary: string;
  amountRoj: number;
  region: Region;
  status: DisputeStatus;
  verdict: Verdict | null;
  createdAt: string;
};

export type Juror = {
  disputeId: string;
  slot: number;
  label: string;
  committed: boolean;
  revealed: boolean;
  stake: number;
  payout: number | null;
};

export type MySeat = {
  disputeId: string;
  slot: number;
  committed: boolean;
  revealed: boolean;
  stake: number;
  payout: number | null;
};

export type DisputeDraft = {
  kind: DisputeKind;
  title: string;
  summary: string;
  amountRoj: number;
  region: Region;
};

const KINDS: readonly DisputeKind[] = ["agreement", "arbitration"];
const STATUSES: readonly DisputeStatus[] = ["open", "in_review", "resolved"];
const VERDICTS: readonly Verdict[] = ["buyer", "seller"];

function isVerdict(value: unknown): value is Verdict {
  return VERDICTS.includes(value as Verdict);
}

function toDispute(row: unknown): Dispute {
  const r = row as Record<string, unknown> | null;
  if (
    !r ||
    typeof r.id !== "string" ||
    !KINDS.includes(r.kind as DisputeKind) ||
    typeof r.title !== "string" ||
    typeof r.summary !== "string" ||
    typeof r.amount_roj !== "number" ||
    !REGIONS.includes(r.region as Region) ||
    !STATUSES.includes(r.status as DisputeStatus) ||
    (r.verdict !== null && !isVerdict(r.verdict)) ||
    typeof r.created_at !== "string"
  ) {
    throw new Error("Unexpected dispute record");
  }
  return {
    id: r.id,
    kind: r.kind as DisputeKind,
    title: r.title,
    summary: r.summary,
    amountRoj: r.amount_roj,
    region: r.region as Region,
    status: r.status as DisputeStatus,
    verdict: r.verdict as Verdict | null,
    createdAt: r.created_at,
  };
}

function toJuror(row: unknown): Juror {
  const r = row as Record<string, unknown> | null;
  if (
    !r ||
    typeof r.dispute_id !== "string" ||
    typeof r.slot !== "number" ||
    typeof r.juror_label !== "string" ||
    typeof r.stake_roj !== "number" ||
    (r.payout_roj !== null && typeof r.payout_roj !== "number")
  ) {
    throw new Error("Unexpected juror record");
  }
  return {
    disputeId: r.dispute_id,
    slot: r.slot,
    label: r.juror_label,
    committed: r.verdict_commit !== null && r.verdict_commit !== undefined,
    revealed: r.revealed_at !== null && r.revealed_at !== undefined,
    stake: r.stake_roj,
    payout: r.payout_roj as number | null,
  };
}

function toMySeat(row: unknown): MySeat {
  const r = row as Record<string, unknown> | null;
  if (
    !r ||
    typeof r.disputeId !== "string" ||
    typeof r.slot !== "number" ||
    typeof r.committed !== "boolean" ||
    typeof r.revealed !== "boolean" ||
    typeof r.stake !== "number" ||
    (r.payout !== null && typeof r.payout !== "number")
  ) {
    throw new Error("Unexpected seat record");
  }
  return {
    disputeId: r.disputeId,
    slot: r.slot,
    committed: r.committed,
    revealed: r.revealed,
    stake: r.stake,
    payout: r.payout as number | null,
  };
}

export async function fetchDisputes(): Promise<{ disputes: Dispute[]; jurors: Juror[] }> {
  const supabase = getSupabase();
  const [disputes, jurors] = await Promise.all([
    supabase
      .from("disputes")
      .select("id, kind, title, summary, amount_roj, region, status, verdict, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("dispute_jurors")
      .select("dispute_id, slot, juror_label, verdict_commit, revealed_at, stake_roj, payout_roj")
      .order("slot", { ascending: true }),
  ]);
  if (disputes.error) throw new Error(disputes.error.message);
  if (jurors.error) throw new Error(jurors.error.message);
  if (!Array.isArray(disputes.data) || !Array.isArray(jurors.data)) throw new Error("Unexpected dispute feed");
  return { disputes: disputes.data.map(toDispute), jurors: jurors.data.map(toJuror) };
}

export async function openDispute(ownerToken: string, draft: DisputeDraft): Promise<void> {
  const { error } = await getSupabase().rpc("open_dispute", {
    p_owner_token: ownerToken,
    p_kind: draft.kind,
    p_title: draft.title,
    p_summary: draft.summary,
    p_amount_roj: draft.amountRoj,
    p_region: draft.region,
  });
  if (error) throw new Error(error.message);
}

export async function fetchMySeats(ownerToken: string): Promise<{ balance: number; seats: MySeat[] } | null> {
  const { data, error } = await getSupabase().rpc("my_jury_seats", { p_owner_token: ownerToken });
  if (error) throw new Error(error.message);
  if (data === null) return null;
  const r = data as Record<string, unknown>;
  if (typeof r.balance !== "number" || !Array.isArray(r.seats)) throw new Error("Unexpected seat feed");
  return { balance: r.balance, seats: r.seats.map(toMySeat) };
}

export async function sealVerdict(
  ownerToken: string,
  disputeId: string,
  verdict: Verdict,
  stake: number,
): Promise<void> {
  const salt = createSalt();
  const commitment = await commitmentFor(verdict, salt);
  saveSealedVerdict(disputeId, { verdict, salt });
  const { error } = await getSupabase().rpc("commit_jury_verdict", {
    p_owner_token: ownerToken,
    p_dispute_id: disputeId,
    p_commitment: commitment,
    p_stake: stake,
  });
  if (error) {
    clearSealedVerdict(disputeId);
    throw new Error(error.message);
  }
}

export async function revealVerdict(ownerToken: string, disputeId: string): Promise<boolean> {
  const sealed = loadSealedVerdict(disputeId);
  if (!sealed) throw new Error("Sealed verdict not found on this device");
  const { data, error } = await getSupabase().rpc("reveal_jury_verdict", {
    p_owner_token: ownerToken,
    p_dispute_id: disputeId,
    p_verdict: sealed.verdict,
    p_salt: sealed.salt,
  });
  if (error) throw new Error(error.message);
  clearSealedVerdict(disputeId);
  return data === true;
}
