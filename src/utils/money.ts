import { APP_CURRENCY } from "@/src/constants/app";

/**
 * Number of minor units in one LKR.
 */
export const MINOR_UNITS_PER_LKR = 100;

/**
 * Validate an integer monetary amount in minor units.
 */
export function isValidMoneyAmount(
  amount: number
): boolean {
  return (
    Number.isSafeInteger(amount) &&
    amount >= 0
  );
}

/**
 * Convert a user-entered LKR decimal string
 * into integer minor units.
 *
 * Examples:
 * "100"    -> 10000
 * "250.50" -> 25050
 * "10.5"   -> 1050
 */
export function parseLkrToMinorUnits(
  value: string
): number {
  const normalized = value.trim();

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Invalid LKR amount format.");
  }

  const [rupees, cents = ""] = normalized.split(".");

  const minorUnits =
    BigInt(rupees) * BigInt(MINOR_UNITS_PER_LKR) +
    BigInt(cents.padEnd(2, "0"));

  if (minorUnits > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("LKR amount exceeds the supported range.");
  }

  return Number(minorUnits);
}

/**
 * Format integer minor units as an LKR display value.
 *
 * Floating-point conversion is used only at the
 * presentation boundary, never for financial calculations.
 */
export function formatMinorUnitsAsLkr(
  amount: number
): string {
  if (!isValidMoneyAmount(amount)) {
    throw new Error("Invalid monetary amount.");
  }

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: APP_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / MINOR_UNITS_PER_LKR);
}
