"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEMO_ACCOUNT,
  checkPassport,
  getProvider,
  parseChainId,
  type PassportStatus,
} from "@/lib/wallet";
import { readStorage, removeStorage, writeStorage } from "@/lib/safe-storage";
import type { MessageKey } from "@/lib/i18n";

const CONNECTED_KEY = "nn.connected";

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [passport, setPassport] = useState<PassportStatus | null>(null);
  const [demo, setDemo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<MessageKey | null>(null);
  const [scanKey, setScanKey] = useState(0);

  const applyAccounts = useCallback(async (accounts: string[]) => {
    const next = accounts[0] ?? null;
    setAccount(next);
    if (!next) {
      removeStorage(CONNECTED_KEY);
      setPassport(null);
      return;
    }
    setPassport(await checkPassport(getProvider(), next));
  }, []);

  const playScan = useCallback(() => setScanKey((k) => k + 1), []);

  const connect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      setMessage("noWallet");
      return;
    }
    setBusy(true);
    setDemo(false);
    setMessage(null);
    try {
      const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });
      setChainId(parseChainId(await provider.request({ method: "eth_chainId" })));
      await applyAccounts(accounts);
      writeStorage(CONNECTED_KEY, "1");
      setMessage("connectedMsg");
      playScan();
    } catch (err) {
      setMessage((err as { code?: number })?.code === 4001 ? "rejected" : "error");
    } finally {
      setBusy(false);
    }
  }, [applyAccounts, playScan]);

  /* A site cannot force a wallet to disconnect: this only forgets the session locally. */
  const disconnect = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setPassport(null);
    setDemo(false);
    removeStorage(CONNECTED_KEY);
    setMessage(null);
  }, []);

  const enterDemo = useCallback(() => {
    setDemo(true);
    setAccount(DEMO_ACCOUNT);
    setChainId(null);
    setPassport("demo");
    setMessage("connectedMsg");
    playScan();
  }, [playScan]);

  useEffect(() => {
    const provider = getProvider();
    if (!provider || !readStorage(CONNECTED_KEY)) return;
    let cancelled = false;
    (async () => {
      try {
        const accounts: string[] = await provider.request({ method: "eth_accounts" });
        if (!accounts.length || cancelled) return;
        setChainId(parseChainId(await provider.request({ method: "eth_chainId" })));
        await applyAccounts(accounts);
      } catch {
        /* silent re-connect is best-effort */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyAccounts]);

  useEffect(() => {
    const provider = getProvider();
    if (!provider?.on || !provider.removeListener) return;
    const onAccounts = (accounts: string[]) => void applyAccounts(accounts);
    const onChain = (hex: string) => setChainId(parseChainId(hex));
    provider.on("accountsChanged", onAccounts);
    provider.on("chainChanged", onChain);
    return () => {
      provider.removeListener?.("accountsChanged", onAccounts);
      provider.removeListener?.("chainChanged", onChain);
    };
  }, [applyAccounts]);

  return {
    account,
    chainId,
    passport,
    demo,
    busy,
    message,
    scanKey,
    connect,
    disconnect,
    enterDemo,
  };
}

export type WalletState = ReturnType<typeof useWallet>;
