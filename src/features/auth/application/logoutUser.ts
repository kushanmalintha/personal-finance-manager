import { useAuthSessionStore } from "@/src/store/authSessionStore";

// Function contract for signing out the current account.
export type LogoutAccount = () => Promise<void>;

export async function logoutUser(logoutAccount: LogoutAccount): Promise<void> {
  // Close the application session immediately.
  // This keeps the app locked even if Firebase sign-out fails.
  useAuthSessionStore.getState().endSession();

  // Then sign out from Firebase Authentication.
  await logoutAccount();
}
