import { getSupabase } from "./supabase";
import { REGIONS, type Region } from "./registry";

export type ListingKind = "job" | "b2b";

export type Listing = {
  id: string;
  kind: ListingKind;
  title: string;
  organization: string;
  region: Region;
  description: string;
  trusted: boolean;
  createdAt: string;
};

export type ListingDraft = {
  kind: ListingKind;
  title: string;
  organization: string;
  region: Region;
  description: string;
};

const LISTING_COLUMNS = "id, kind, title, organization, region, description, trusted, created_at";
const KINDS: readonly ListingKind[] = ["job", "b2b"];

type ListingRow = {
  id: string;
  kind: string;
  title: string;
  organization: string;
  region: string;
  description: string;
  trusted: boolean;
  created_at: string;
};

function toListing(row: unknown): Listing {
  const r = row as Partial<ListingRow> | null;
  if (
    !r ||
    typeof r.id !== "string" ||
    !KINDS.includes(r.kind as ListingKind) ||
    typeof r.title !== "string" ||
    typeof r.organization !== "string" ||
    !REGIONS.includes(r.region as Region) ||
    typeof r.description !== "string" ||
    typeof r.trusted !== "boolean" ||
    typeof r.created_at !== "string"
  ) {
    throw new Error("Unexpected listing record");
  }
  return {
    id: r.id,
    kind: r.kind as ListingKind,
    title: r.title,
    organization: r.organization,
    region: r.region as Region,
    description: r.description,
    trusted: r.trusted,
    createdAt: r.created_at,
  };
}

export async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await getSupabase()
    .from("listings")
    .select(LISTING_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  if (!Array.isArray(data)) throw new Error("Unexpected listing feed");
  return data.map(toListing);
}

export async function postListing(ownerToken: string, draft: ListingDraft): Promise<void> {
  const { error } = await getSupabase().rpc("post_listing", {
    p_owner_token: ownerToken,
    p_kind: draft.kind,
    p_title: draft.title,
    p_organization: draft.organization,
    p_region: draft.region,
    p_description: draft.description,
  });
  if (error) throw new Error(error.message);
}
