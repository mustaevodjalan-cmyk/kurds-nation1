export const REGIONS = ["bakur", "rojava", "basur", "rojhilat", "europe", "cis"] as const;
export type Region = (typeof REGIONS)[number];

export const HOMELAND_REGIONS: readonly Region[] = ["bakur", "rojava", "basur", "rojhilat"];

export const DIALECTS = ["kurmanci", "sorani", "zazaki", "kelhuri", "hewrami"] as const;
export type Dialect = (typeof DIALECTS)[number];

export const ALIAS_MIN_LENGTH = 3;
export const ALIAS_MAX_LENGTH = 24;

export function isHomeland(region: Region): boolean {
  return HOMELAND_REGIONS.includes(region);
}

export function formatCitizenNumber(value: number): string {
  const digits = String(value).padStart(9, "0");
  return `${digits.slice(0, 3)},${digits.slice(3, 6)},${digits.slice(6)}`;
}
