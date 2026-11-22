import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  inMemoryPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Read Firebase configuration from environment variables.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Validate required configuration before initialization.
for (const [key, value] of Object.entries(firebaseConfig)) {
  if (!value) {
    throw new Error(
      `Missing Firebase environment variable for: ${key}`
    );
  }
}

// Reuse the existing Firebase app during Fast Refresh.
export const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication with in-memory persistence.
// Reuse the existing Auth instance if it was already initialized.
export const auth = (() => {
  try {
    return initializeAuth(firebaseApp, {
      persistence: inMemoryPersistence,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "auth/already-initialized"
    ) {
      return getAuth(firebaseApp);
    }

    throw error;
  }
})();

// Initialize Cloud Firestore.
export const db = getFirestore(firebaseApp);
