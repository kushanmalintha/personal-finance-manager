import {
    collection,
    doc,
    getDocs,
    query,
    runTransaction,
    serverTimestamp,
    where,
} from "firebase/firestore";

import { auth, db } from "@/src/services/firebase";

import type { AccountLifecycleStatus } from "../application/accountLifecycle";

const TRANSACTION_REFERENCE_FIELDS = [
  "accountId",
  "sourceAccountId",
  "destinationAccountId",
] as const;

const RECURRING_REFERENCE_FIELDS = [
  "accountId",
  "sourceAccountId",
  "destinationAccountId",
] as const;

function getCurrentUserId(): string {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("An authenticated user is required.");
  }

  return userId;
}

function getAccountReference(accountId: string) {
  const userId = getCurrentUserId();

  return doc(db, "users", userId, "accounts", accountId);
}

function getUserCollection(collectionName: string) {
  const userId = getCurrentUserId();

  return collection(db, "users", userId, collectionName);
}

/**
 * Check whether any document in a collection references an account.
 */
async function hasReferences(
  collectionName: string,
  fields: readonly string[],
  accountId: string,
): Promise<boolean> {
  const targetCollection = getUserCollection(collectionName);

  const snapshots = await Promise.all(
    fields.map((field) =>
      getDocs(query(targetCollection, where(field, "==", accountId))),
    ),
  );

  return snapshots.some((snapshot) => !snapshot.empty);
}

/**
 * Check whether an active recurring template references an account.
 *
 * We query by account reference and inspect isActive locally.
 * This avoids requiring a compound Firestore index.
 */
async function hasActiveRecurringReferences(
  accountId: string,
): Promise<boolean> {
  const targetCollection = getUserCollection("recurringTemplates");

  const snapshots = await Promise.all(
    RECURRING_REFERENCE_FIELDS.map((field) =>
      getDocs(query(targetCollection, where(field, "==", accountId))),
    ),
  );

  return snapshots.some((snapshot) =>
    snapshot.docs.some((document) => document.data().isActive === true),
  );
}

/**
 * Get the account's current lifecycle restrictions.
 */
export async function getAccountLifecycleStatus(
  accountId: string,
  accountType: "WALLET" | "BANK",
): Promise<AccountLifecycleStatus> {
  const [
    hasTransactions,
    hasRecurringReferences,
    hasActiveRecurringReferencesResult,
  ] = await Promise.all([
    hasReferences("transactions", TRANSACTION_REFERENCE_FIELDS, accountId),
    hasReferences("recurringTemplates", RECURRING_REFERENCE_FIELDS, accountId),
    hasActiveRecurringReferences(accountId),
  ]);

  return {
    hasTransactions,
    hasRecurringReferences,
    hasActiveRecurringReferences: hasActiveRecurringReferencesResult,
    canDelete:
      accountType === "BANK" && !hasTransactions && !hasRecurringReferences,
  };
}

/**
 * Activate an account.
 */
export async function activateAccountRecord(accountId: string): Promise<void> {
  const accountRef = getAccountReference(accountId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(accountRef);

    if (!snapshot.exists()) {
      throw new Error("Account not found.");
    }

    if (snapshot.data().isActive === true) {
      return;
    }

    transaction.update(accountRef, {
      isActive: true,
      updatedAt: serverTimestamp(),
    });
  });
}

/**
 * Deactivate an account.
 */
export async function deactivateAccountRecord(
  accountId: string,
): Promise<void> {
  const hasActiveReferences = await hasActiveRecurringReferences(accountId);

  if (hasActiveReferences) {
    throw new Error(
      "This account is referenced by an active recurring schedule. Pause or stop the schedule first.",
    );
  }

  const accountRef = getAccountReference(accountId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(accountRef);

    if (!snapshot.exists()) {
      throw new Error("Account not found.");
    }

    if (snapshot.data().isActive !== true) {
      return;
    }

    transaction.update(accountRef, {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  });
}

/**
 * Delete an empty, unreferenced bank account.
 *
 * The primary wallet is deliberately protected because it is
 * required by the application's completed initial-setup state.
 */
export async function deleteAccountRecord(accountId: string): Promise<void> {
  if (accountId === "wallet") {
    throw new Error(
      "The primary wallet cannot be deleted. You can deactivate it instead.",
    );
  }

  const [hasTransactions, hasRecurringReferences] = await Promise.all([
    hasReferences("transactions", TRANSACTION_REFERENCE_FIELDS, accountId),
    hasReferences("recurringTemplates", RECURRING_REFERENCE_FIELDS, accountId),
  ]);

  if (hasTransactions) {
    throw new Error(
      "This account has transaction history and cannot be deleted. Deactivate it instead.",
    );
  }

  if (hasRecurringReferences) {
    throw new Error(
      "This account is referenced by a recurring schedule and cannot be deleted.",
    );
  }

  const accountRef = getAccountReference(accountId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(accountRef);

    if (!snapshot.exists()) {
      throw new Error("Account not found.");
    }

    if (snapshot.data().type !== "BANK") {
      throw new Error("Only bank accounts can be permanently deleted.");
    }

    transaction.delete(accountRef);
  });
}

/**
 * Edit opening balance before the first transaction exists.
 */
export async function updateOpeningBalanceRecord(
  accountId: string,
  openingBalance: number,
): Promise<void> {
  const hasTransactions = await hasReferences(
    "transactions",
    TRANSACTION_REFERENCE_FIELDS,
    accountId,
  );

  if (hasTransactions) {
    throw new Error(
      "The opening balance cannot be changed after transactions exist. Use a balance adjustment instead.",
    );
  }

  const accountRef = getAccountReference(accountId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(accountRef);

    if (!snapshot.exists()) {
      throw new Error("Account not found.");
    }

    transaction.update(accountRef, {
      openingBalance,
      currentBalance: openingBalance,
      updatedAt: serverTimestamp(),
    });
  });
}
