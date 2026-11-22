import { FINANCIAL_TIME_ZONE } from "@/src/constants/app";

/**
 * Returns the calendar date of an instant in the application's
 * financial timezone, formatted as YYYY-MM-DD.
 *
 * This does not depend on the device's local timezone.
 */
export function getFinancialDateKey(date: Date = new Date()): string {
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date.");
  }

  const parts = new Intl.DateTimeFormat("en", {
    timeZone: FINANCIAL_TIME_ZONE,
    calendar: "gregory",
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to determine the financial date.");
  }

  return `${year}-${month}-${day}`;
}

/**
 * Checks whether two instants fall on the same calendar day
 * in the application's financial timezone.
 */
export function isSameFinancialDay(
  first: Date,
  second: Date,
): boolean {
  return getFinancialDateKey(first) === getFinancialDateKey(second);
}
