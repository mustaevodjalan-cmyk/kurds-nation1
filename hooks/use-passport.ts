"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readStorage, removeStorage, writeStorage } from "@/lib/safe-storage";
import { DIALECTS, REGIONS, type Dialect, type Region } from "@/lib/registry";
import { issueCitizen, wipeCitizen } from "@/lib/registry-api";
import { clearAllSealedVerdicts } from "@/lib/verdict-commitment";
import { isRateLimitError } from "@/lib/rate-limit";

const STORAGE_KEY = "nn.passport";
const MINT_ANIMATION_MS = 3200;

export type PassportStatus = "locked" | "minting" | "active";
export type PassportError = "mint" | "rate_limited" | "wipe" | null;

export type Passport = {
  alias: string;
  region: Region;
  dialect: Dialect;
  citizenNumber: number;
  issuedAt: string;
};

export type PassportDraft = {
  alias: string;
  region: Region | null;
  dialect: Dialect | null;
};

type StoredPassport = Passport & { ownerToken: string };

const EMPTY_DRAFT: PassportDraft = { alias: "", region: null, dialect: null };

function isStoredPassport(value: unknown): value is StoredPassport {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.alias === "string" &&
    typeof v.ownerToken === "string" &&
    typeof v.issuedAt === "string" &&
    typeof v.citizenNumber === "number" &&
    REGIONS.includes(v.region as Region) &&
    DIALECTS.includes(v.dialect as Dialect)
  );
}

function loadStored(): StoredPassport | null {
  const raw = readStorage(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isStoredPassport(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export function usePassport() {
  const [status, setStatus] = useState<PassportStatus>("locked");
  const [passport, setPassport] = useState<Passport | null>(null);
  const [ownerToken, setOwnerToken] = useState<string | null>(null);
  const [draft, setDraft] = useState<PassportDraft>(EMPTY_DRAFT);
  const [error, setError] = useState<PassportError>(null);
  const tokenRef = useRef<string | null>(null);
  const generationRef = useRef(0);

  useEffect(() => {
    const stored = loadStored();
    if (!stored) return;
    tokenRef.current = stored.ownerToken;
    setOwnerToken(stored.ownerToken);
    setPassport({
      alias: stored.alias,
      region: stored.region,
      dialect: stored.dialect,
      citizenNumber: stored.citizenNumber,
      issuedAt: stored.issuedAt,
    });
    setStatus("active");
  }, []);

  const mint = useCallback(async (input: { alias: string; region: Region; dialect: Dialect }) => {
    const generation = ++generationRef.current;
    const token = crypto.randomUUID();
    tokenRef.current = token;
    setStatus("minting");
    setError(null);

    try {
      const [record] = await Promise.all([
        issueCitizen({ ...input, ownerToken: token }),
        wait(MINT_ANIMATION_MS),
      ]);

      if (generation !== generationRef.current) {
        await wipeCitizen(token).catch(() => undefined);
        return;
      }

      const identity: Passport = {
        alias: record.alias,
        region: record.region,
        dialect: record.dialect,
        citizenNumber: record.citizenNumber,
        issuedAt: record.createdAt,
      };
      const stored: StoredPassport = { ...identity, ownerToken: token };
      writeStorage(STORAGE_KEY, JSON.stringify(stored));
      setPassport(identity);
      setOwnerToken(token);
      setDraft(EMPTY_DRAFT);
      setStatus("active");
    } catch (err) {
      if (generation !== generationRef.current) return;
      tokenRef.current = null;
      setStatus("locked");
      setError(isRateLimitError(err) ? "rate_limited" : "mint");
    }
  }, []);

  const wipe = useCallback(async (): Promise<boolean> => {
    generationRef.current++;
    const token = tokenRef.current;
    if (token) {
      try {
        await wipeCitizen(token);
      } catch {
        setError("wipe");
        return false;
      }
    }
    tokenRef.current = null;
    removeStorage(STORAGE_KEY);
    clearAllSealedVerdicts();
    setPassport(null);
    setOwnerToken(null);
    setDraft(EMPTY_DRAFT);
    setStatus("locked");
    setError(null);
    return true;
  }, []);

  return { status, passport, ownerToken, draft, setDraft, error, mint, wipe };
}

export type PassportState = ReturnType<typeof usePassport>;
