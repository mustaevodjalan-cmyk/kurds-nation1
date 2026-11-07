export const PASSPORT_CONTRACT = "";

export const DEMO_ACCOUNT = "0x7A3f2c9B41d8E05aC6b1F9d03e5A7b8C41D29c21";

const CHAINS: Record<number, string> = {
  1: "Ethereum",
  10: "Optimism",
  42161: "Arbitrum One",
  11155111: "Sepolia",
  421614: "Arbitrum Sepolia",
};

export function chainName(chainId: number | null): string {
  if (!chainId) return "";
  return CHAINS[chainId] ?? `Chain ${chainId}`;
}

export type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<any>;
  on?: (event: string, handler: (arg: any) => void) => void;
  removeListener?: (event: string, handler: (arg: any) => void) => void;
};

export function getProvider(): Eip1193Provider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { ethereum?: Eip1193Provider }).ethereum;
}

export function parseChainId(hex: string): number {
  return parseInt(hex, 16);
}

export function shortAddress(address: string): string {
  return address.slice(0, 6) + "…" + address.slice(-4);
}

export type PassportStatus = "demo" | "found" | "none" | "error";

/* ERC-721 balanceOf(address) */
export async function checkPassport(provider: Eip1193Provider | undefined, address: string): Promise<PassportStatus> {
  if (!PASSPORT_CONTRACT) return "demo";
  if (!provider) return "error";
  try {
    const data = "0x70a08231" + address.slice(2).toLowerCase().padStart(64, "0");
    const res: string = await provider.request({
      method: "eth_call",
      params: [{ to: PASSPORT_CONTRACT, data }, "latest"],
    });
    return BigInt(res) > BigInt(0) ? "found" : "none";
  } catch {
    return "error";
  }
}
