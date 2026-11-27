import { useAuthSessionStore } from "@/src/store/authSessionStore";
import { loginSchema, type LoginInput } from "./loginSchema";

export type AuthenticatedUser = {
  uid: string;
  email: string | null;
};

export type LoginAccount = (
  email: string,
  password: string,
) => Promise<AuthenticatedUser>;

export type ResolveInitialSetupStatus = () => Promise<
  "NOT_STARTED" | "COMPLETED" | "INCONSISTENT"
>;

export type EnsureDefaultCategories = () => Promise<void>;

export async function loginUser(
  input: LoginInput,
  loginAccount: LoginAccount,
  resolveInitialSetupStatus: ResolveInitialSetupStatus,
  ensureDefaultCategories: EnsureDefaultCategories,
): Promise<AuthenticatedUser> {
  const validatedInput = loginSchema.parse(input);

  const user = await loginAccount(
    validatedInput.email,
    validatedInput.password,
  );

  // Check the user's persisted setup status after authentication.
  const setupStatus = await resolveInitialSetupStatus();

  if (setupStatus === "INCONSISTENT") {
    throw new Error("INITIAL_SETUP_DATA_INCONSISTENT");
  }

  // Ensure existing users have all predefined categories.
  // The repository creates only missing categories and preserves
  // existing customizations and deactivated categories.
  if (setupStatus === "COMPLETED") {
    await ensureDefaultCategories();
  }

  // Open the application session only after the required
  // initialization has completed successfully.
  useAuthSessionStore
    .getState()
    .startSession(user.uid, setupStatus === "COMPLETED");

  return user;
}
