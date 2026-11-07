import { getSupabase } from "./supabase";
import type { Dialect, Region } from "./registry";

const PUBLIC_COLUMNS = "citizen_number, alias, region, dialect, created_at";

export type CitizenRecord = {
  citizenNumber: number;
  alias: string;
  region: Region;
  dialect: Dialect;
  createdAt: string;
};

export type RegistryStats = {
  total: number;
  regions: Partial<Record<Region, number>>;
  dialects: Partial<Record<Dialect, number>>;
};

type CitizenRow = {
  citizen_number: number;
  alias: string;
  region: Region;
  dialect: Dialect;
  created_at: string;
};

function toCitizen(row: unknown): CitizenRecord {
  const r = row as Partial<CitizenRow> | null;
  if (
    !r ||
    typeof r.citizen_number !== "number" ||
    typeof r.alias !== "string" ||
    typeof r.region !== "string" ||
    typeof r.dialect !== "string" ||
    typeof r.created_at !== "string"
  ) {
    throw new Error("Unexpected citizen record");
  }
  return {
    citizenNumber: r.citizen_number,
    alias: r.alias,
    region: r.region,
    dialect: r.dialect,
    createdAt: r.created_at,
  };
}

function isCountMap(value: unknown): value is Record<string, number> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function issueCitizen(input: {
  alias: string;
  region: Region;
  dialect: Dialect;
  ownerToken: string;
}): Promise<CitizenRecord> {
  const { data, error } = await getSupabase()
    .from("citizens")
    .insert({
      alias: input.alias,
      region: input.region,
      dialect: input.dialect,
      owner_token: input.ownerToken,
    })
    .select(PUBLIC_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return toCitizen(data);
}

export async function wipeCitizen(ownerToken: string): Promise<void> {
  const { error } = await getSupabase().rpc("wipe_citizen", { p_owner_token: ownerToken });
  if (error) throw new Error(error.message);
}

export async function fetchRegistryStats(): Promise<RegistryStats> {
  const { data, error } = await getSupabase().rpc("registry_stats");
  if (error) throw new Error(error.message);
  const stats = data as { total?: unknown; regions?: unknown; dialects?: unknown } | null;
  if (!stats || typeof stats.total !== "number" || !isCountMap(stats.regions) || !isCountMap(stats.dialects)) {
    throw new Error("Unexpected registry stats");
  }
  return {
    total: stats.total,
    regions: stats.regions as RegistryStats["regions"],
    dialects: stats.dialects as RegistryStats["dialects"],
  };
}

export async function fetchRecentRegistrations(limit = 8): Promise<CitizenRecord[]> {
  const { data, error } = await getSupabase()
    .from("citizens")
    .select(PUBLIC_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  if (!Array.isArray(data)) throw new Error("Unexpected registry feed");
  return data.map(toCitizen);
}
