import { useAuthSessionStore } from "@/src/store/authSessionStore";
import { registerSchema, type RegisterInput } from "./registerSchema";

export type RegisteredUser = {
  uid: string;
  email: string | null;
};

export type RegisterAccount = (
  email: string,
  password: string,
) => Promise<RegisteredUser>;

export async function registerUser(
  input: RegisterInput,
  registerAccount: RegisterAccount,
): Promise<RegisteredUser> {
  const validatedInput = registerSchema.parse(input);

  const user = await registerAccount(
    validatedInput.email,
    validatedInput.password,
  );

  // Registration creates an authenticated Firebase user.
  useAuthSessionStore.getState().startSession(user.uid);

  return user;
}
