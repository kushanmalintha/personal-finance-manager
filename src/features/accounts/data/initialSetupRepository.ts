import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { APP_CURRENCY, FINANCIAL_TIME_ZONE } from "@/src/constants/app";
import { auth, db } from "@/src/services/firebase";
import type { Account, UserSettings } from "@/src/types/domain";

import type { ValidatedInitialSetup } from "../application/initialSetupSchema";
import { accountToFirestore } from "./accountMapper";
import { settingsToFirestore } from "./settingsMapper";

const WALLET_DOCUMENT_ID = "wallet";

function getCurrentUserId(): string {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("An authenticated user is required.");
  }

  return userId;
}

export type InitialSetupStatus = "NOT_STARTED" | "COMPLETED" | "INCONSISTENT";

/**
 * Determine whether the authenticated user has completed
 * the initial financial setup.
 */
export async function getInitialSetupStatus(): Promise<InitialSetupStatus> {
  const userId = getCurrentUserId();

  const settingsRef = doc(db, "users", userId, "profile", "settings");

  const accountsCollection = collection(db, "users", userId, "accounts");

  const walletRef = doc(accountsCollection, "wallet");

  const [settingsSnapshot, walletSnapshot, accountsSnapshot] =
    await Promise.all([
      getDoc(settingsRef),
      getDoc(walletRef),
      getDocs(accountsCollection),
    ]);

  if (settingsSnapshot.exists() && walletSnapshot.exists()) {
    return "COMPLETED";
  }

  if (!settingsSnapshot.exists() && accountsSnapshot.empty) {
    return "NOT_STARTED";
  }

  return "INCONSISTENT";
}

/**
 * Save all initial setup data atomically.
 *
 * Settings, the wallet, and optional bank accounts
 * are created together in a single Firestore transaction.
 */
export async function saveInitialSetup(
  setup: ValidatedInitialSetup,
): Promise<void> {
  const userId = getCurrentUserId();

  const settingsRef = doc(db, "users", userId, "profile", "settings");

  const accountsCollection = collection(db, "users", userId, "accounts");

  const walletRef = doc(accountsCollection, WALLET_DOCUMENT_ID);

  // Generate bank account references before the transaction.
  // Their IDs remain stable if Firestore retries the transaction.
  const bankAccountRefs = setup.bankAccounts.map(() => doc(accountsCollection));

  // Check for existing account documents before starting
  // the transaction. Firestore transaction.get() in this SDK
  // accepts document references, not collection queries.
  const existingAccountsSnapshot = await getDocs(accountsCollection);

  if (!existingAccountsSnapshot.empty) {
    throw new Error(
      "Account documents already exist. Initial setup cannot be repeated.",
    );
  }

  const now = new Date();

  const settings: UserSettings = {
    currency: APP_CURRENCY,
    timezone: FINANCIAL_TIME_ZONE,
    dailySpendingLimit: setup.dailySpendingLimit,
    createdAt: now,
    updatedAt: now,
  };

  const wallet: Account = {
    id: WALLET_DOCUMENT_ID,
    name: setup.wallet.name,
    type: "WALLET",
    openingBalance: setup.wallet.openingBalance,
    openingDate: setup.wallet.openingDate,
    currentBalance: setup.wallet.openingBalance,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const bankAccounts: Account[] = setup.bankAccounts.map(
    (bankAccount, index) => ({
      id: bankAccountRefs[index].id,
      name: bankAccount.name,
      type: "BANK",
      ...(bankAccount.bankName ? { bankName: bankAccount.bankName } : {}),
      openingBalance: bankAccount.openingBalance,
      openingDate: bankAccount.openingDate,
      currentBalance: bankAccount.openingBalance,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }),
  );

  const settingsData = settingsToFirestore(settings);
  const walletData = accountToFirestore(wallet);

  const bankAccountData = bankAccounts.map((account) =>
    accountToFirestore(account),
  );

  await runTransaction(db, async (transaction) => {
    // All transaction reads must happen before writes.
    const settingsSnapshot = await transaction.get(settingsRef);
    const walletSnapshot = await transaction.get(walletRef);

    if (settingsSnapshot.exists() || walletSnapshot.exists()) {
      throw new Error(
        "Initial setup has already been completed or partially initialized.",
      );
    }

    // Create application settings.
    transaction.set(settingsRef, {
      ...settingsData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create the single wallet.
    transaction.set(walletRef, {
      ...walletData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create optional bank accounts.
    bankAccountRefs.forEach((accountRef, index) => {
      transaction.set(accountRef, {
        ...bankAccountData[index],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
  });
}
