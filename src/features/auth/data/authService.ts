import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "@/src/services/firebase";

// Register a new user with email and password.
export async function registerWithEmail(
  email: string,
  password: string
) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  return credential.user;
}

// Sign in an existing user.
export async function loginWithEmail(
  email: string,
  password: string
) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  return credential.user;
}

// Send a password-reset email.
export async function sendPasswordReset(
  email: string
): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

// Sign out the current user.
export async function logout(): Promise<void> {
  await signOut(auth);
}
