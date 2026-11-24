import {
    doc,
    getDoc,
    runTransaction,
    serverTimestamp,
} from "firebase/firestore";

import { APP_CURRENCY, FINANCIAL_TIME_ZONE } from "@/src/constants/app";
import { auth, db } from "@/src/services/firebase";
import type { UserSettings } from "@/src/types/domain";

import { settingsFromFirestore, settingsToFirestore } from "./settingsMapper";

function getCurrentUserId(): string {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("An authenticated user is required.");
  }

  return userId;
}

function getSettingsDocument(userId: string) {
  return doc(db, "users", userId, "profile", "settings");
}

/**
 * Retrieve the current user's settings.
 * Returns null when the settings document does not exist.
 */
export async function getSettings(): Promise<UserSettings | null> {
  const userId = getCurrentUserId();
  const settingsRef = getSettingsDocument(userId);

  const snapshot = await getDoc(settingsRef);

  if (!snapshot.exists()) {
    return null;
  }

  return settingsFromFirestore(snapshot.data());
}

/**
 * Create the user's initial settings.
 * Existing settings are never overwritten by this operation.
 */
export async function createSettings(
  dailySpendingLimit: number,
): Promise<void> {
  const userId = getCurrentUserId();
  const settingsRef = getSettingsDocument(userId);

  const now = new Date();

  const settings: UserSettings = {
    currency: APP_CURRENCY,
    timezone: FINANCIAL_TIME_ZONE,
    dailySpendingLimit,
    createdAt: now,
    updatedAt: now,
  };

  const firestoreData = settingsToFirestore(settings);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(settingsRef);

    if (snapshot.exists()) {
      throw new Error("User settings have already been created.");
    }

    transaction.set(settingsRef, {
      ...firestoreData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}
