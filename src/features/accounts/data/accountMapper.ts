import { Timestamp, type DocumentData } from "firebase/firestore";

import type { Account, AccountType, FinancialDate } from "@/src/types/domain";

type FirestoreAccountDocument = {
  name: string;
  type: AccountType;
  bankName?: string;
  openingBalance: number;
  openingDate: FinancialDate;
  currentBalance: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

function readNonNegativeInteger(value: unknown, fieldName: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(
      `Invalid account document: ${fieldName} must be a non-negative safe integer.`,
    );
  }

  return value;
}

function readTimestamp(value: unknown, fieldName: string): Date {
  if (!(value instanceof Timestamp)) {
    throw new Error(
      `Invalid account document: ${fieldName} must be a Firestore Timestamp.`,
    );
  }

  return value.toDate();
}

function readFinancialDate(value: unknown): FinancialDate {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(
      "Invalid account document: openingDate must use YYYY-MM-DD format.",
    );
  }

  return value;
}

/**
 * Convert a Firestore account document into a domain Account.
 * The Firestore document ID is supplied separately.
 */
export function accountFromFirestore(id: string, data: DocumentData): Account {
  if (typeof data.name !== "string" || !data.name.trim()) {
    throw new Error("Invalid account document: name is required.");
  }

  if (data.type !== "WALLET" && data.type !== "BANK") {
    throw new Error("Invalid account document: unsupported account type.");
  }

  if (data.bankName !== undefined && typeof data.bankName !== "string") {
    throw new Error("Invalid account document: bankName must be a string.");
  }

  if (typeof data.isActive !== "boolean") {
    throw new Error("Invalid account document: isActive must be a boolean.");
  }

  return {
    id,
    name: data.name,
    type: data.type,
    ...(data.bankName !== undefined ? { bankName: data.bankName } : {}),
    openingBalance: readNonNegativeInteger(
      data.openingBalance,
      "openingBalance",
    ),
    openingDate: readFinancialDate(data.openingDate),
    currentBalance: readNonNegativeInteger(
      data.currentBalance,
      "currentBalance",
    ),
    isActive: data.isActive,
    createdAt: readTimestamp(data.createdAt, "createdAt"),
    updatedAt: readTimestamp(data.updatedAt, "updatedAt"),
  };
}

/**
 * Convert a domain Account into Firestore-compatible document data.
 * The document ID is managed by Firestore and is not stored as a field.
 */
export function accountToFirestore(account: Account): FirestoreAccountDocument {
  return {
    name: account.name,
    type: account.type,
    ...(account.bankName !== undefined ? { bankName: account.bankName } : {}),
    openingBalance: account.openingBalance,
    openingDate: account.openingDate,
    currentBalance: account.currentBalance,
    isActive: account.isActive,
    createdAt: Timestamp.fromDate(account.createdAt),
    updatedAt: Timestamp.fromDate(account.updatedAt),
  };
}
