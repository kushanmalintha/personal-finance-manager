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

  return loginAccount(validatedInput.email, validatedInput.password);
}
