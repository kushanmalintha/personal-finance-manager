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

export async function loginUser(
  input: LoginInput,
  loginAccount: LoginAccount,
): Promise<AuthenticatedUser> {
  const validatedInput = loginSchema.parse(input);

  const user = await loginAccount(
    validatedInput.email,
    validatedInput.password,
  );

  // Open the application session only after Firebase login succeeds.
  useAuthSessionStore.getState().startSession(user.uid);

  return user;
}
