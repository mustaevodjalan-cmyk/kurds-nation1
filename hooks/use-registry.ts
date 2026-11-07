"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchRecentRegistrations, fetchRegistryStats, type CitizenRecord, type RegistryStats } from "@/lib/registry-api";

const POLL_INTERVAL_MS = 5000;

export type RegistryStatus = "loading" | "ready" | "error";

export function useRegistry() {
  const [stats, setStats] = useState<RegistryStats | null>(null);
  const [recent, setRecent] = useState<CitizenRecord[]>([]);
  const [status, setStatus] = useState<RegistryStatus>("loading");

  const refresh = useCallback(async () => {
    try {
      const [nextStats, nextRecent] = await Promise.all([fetchRegistryStats(), fetchRecentRegistrations()]);
      setStats(nextStats);
      setRecent(nextRecent);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  return { stats, recent, status, refresh };
}

export type RegistryState = ReturnType<typeof useRegistry>;
