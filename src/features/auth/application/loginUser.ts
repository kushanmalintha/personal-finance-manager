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

export async function loginUser(
  input: LoginInput,
  loginAccount: LoginAccount,
  resolveInitialSetupStatus: ResolveInitialSetupStatus,
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

  // Open the application session with the correct setup status.
  useAuthSessionStore
    .getState()
    .startSession(user.uid, setupStatus === "COMPLETED");

  return user;
}
