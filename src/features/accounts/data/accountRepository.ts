import {
    collection,
    doc,
    getDoc,
    getDocs,
    runTransaction,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

import { auth, db } from "@/src/services/firebase";
import type { Account } from "@/src/types/domain";

import { accountFromFirestore, accountToFirestore } from "./accountMapper";

type NewAccount = Omit<Account, "id" | "createdAt" | "updatedAt">;

const WALLET_DOCUMENT_ID = "wallet";

function getCurrentUserId(): string {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("An authenticated user is required.");
  }

  return userId;
}

function getAccountsCollection(userId: string) {
  return collection(db, "users", userId, "accounts");
}

function createAccountDocumentData(account: Account) {
  return {
    ...accountToFirestore(account),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

/**
 * Retrieve one account by its document ID.
 */
export async function getAccount(accountId: string): Promise<Account | null> {
  const userId = getCurrentUserId();

  const accountRef = doc(getAccountsCollection(userId), accountId);

  const snapshot = await getDoc(accountRef);

  if (!snapshot.exists()) {
    return null;
  }

  return accountFromFirestore(snapshot.id, snapshot.data());
}

/**
 * Retrieve all accounts belonging to the current user.
 */
export async function getAccounts(): Promise<Account[]> {
  const userId = getCurrentUserId();

  const snapshot = await getDocs(getAccountsCollection(userId));

  return snapshot.docs
    .map((document) => accountFromFirestore(document.id, document.data()))
    .sort(
      (first, second) => first.createdAt.getTime() - second.createdAt.getTime(),
    );
}

/**
 * Create the user's single wallet.
 * A deterministic document ID and transaction prevent duplicate
 * wallet creation through this repository operation.
 */
export async function createWallet(account: NewAccount): Promise<string> {
  if (account.type !== "WALLET") {
    throw new Error("The wallet must have account type WALLET.");
  }

  if (account.bankName !== undefined) {
    throw new Error("A wallet cannot have a bank name.");
  }

  const userId = getCurrentUserId();

  const walletRef = doc(getAccountsCollection(userId), WALLET_DOCUMENT_ID);

  const now = new Date();

  const wallet: Account = {
    ...account,
    id: WALLET_DOCUMENT_ID,
    createdAt: now,
    updatedAt: now,
  };

  const firestoreData = createAccountDocumentData(wallet);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(walletRef);

    if (snapshot.exists()) {
      throw new Error("A wallet has already been created.");
    }

    transaction.set(walletRef, firestoreData);
  });

  return WALLET_DOCUMENT_ID;
}

/**
 * Create a bank account with an automatically generated document ID.
 */
export async function createBankAccount(account: NewAccount): Promise<string> {
  if (account.type !== "BANK") {
    throw new Error("The account must have account type BANK.");
  }

  const userId = getCurrentUserId();

  const accountRef = doc(getAccountsCollection(userId));
  const now = new Date();

  const bankAccount: Account = {
    ...account,
    id: accountRef.id,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(accountRef, createAccountDocumentData(bankAccount));

  return accountRef.id;
}
