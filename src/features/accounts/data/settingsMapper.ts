import { Timestamp, type DocumentData } from "firebase/firestore";

import { APP_CURRENCY, FINANCIAL_TIME_ZONE } from "@/src/constants/app";

import type { MoneyAmountMinorUnits, UserSettings } from "@/src/types/domain";

type FirestoreSettingsDocument = {
  currency: typeof APP_CURRENCY;
  timezone: typeof FINANCIAL_TIME_ZONE;
  dailySpendingLimit: MoneyAmountMinorUnits;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

function readTimestamp(value: unknown, fieldName: string): Date {
  if (!(value instanceof Timestamp)) {
    throw new Error(
      `Invalid settings document: ${fieldName} must be a Firestore Timestamp.`,
    );
  }

  return value.toDate();
}

/**
 * Convert a Firestore settings document into domain UserSettings.
 */
export function settingsFromFirestore(data: DocumentData): UserSettings {
  if (data.currency !== APP_CURRENCY) {
    throw new Error("Invalid settings document: unsupported currency.");
  }

  if (data.timezone !== FINANCIAL_TIME_ZONE) {
    throw new Error("Invalid settings document: unsupported timezone.");
  }

  if (
    typeof data.dailySpendingLimit !== "number" ||
    !Number.isSafeInteger(data.dailySpendingLimit) ||
    data.dailySpendingLimit <= 0
  ) {
    throw new Error(
      "Invalid settings document: dailySpendingLimit must be a positive safe integer.",
    );
  }

  return {
    currency: APP_CURRENCY,
    timezone: FINANCIAL_TIME_ZONE,
    dailySpendingLimit: data.dailySpendingLimit,
    createdAt: readTimestamp(data.createdAt, "createdAt"),
    updatedAt: readTimestamp(data.updatedAt, "updatedAt"),
  };
}

/**
 * Convert domain UserSettings into Firestore-compatible document data.
 */
export function settingsToFirestore(
  settings: UserSettings,
): FirestoreSettingsDocument {
  if (
    !Number.isSafeInteger(settings.dailySpendingLimit) ||
    settings.dailySpendingLimit <= 0
  ) {
    throw new Error("dailySpendingLimit must be a positive safe integer.");
  }

  if (
    settings.currency !== APP_CURRENCY ||
    settings.timezone !== FINANCIAL_TIME_ZONE
  ) {
    throw new Error("Unsupported application currency or timezone.");
  }

  return {
    currency: APP_CURRENCY,
    timezone: FINANCIAL_TIME_ZONE,
    dailySpendingLimit: settings.dailySpendingLimit,
    createdAt: Timestamp.fromDate(settings.createdAt),
    updatedAt: Timestamp.fromDate(settings.updatedAt),
  };
}
