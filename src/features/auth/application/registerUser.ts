import {
  registerSchema,
  type RegisterInput,
} from "./registerSchema";

export type RegisteredUser = {
  uid: string;
  email: string | null;
};

export type RegisterAccount = (
  email: string,
  password: string
) => Promise<RegisteredUser>;

// Validate the input and execute the registration operation.
export async function registerUser(
  input: RegisterInput,
  registerAccount: RegisterAccount
): Promise<RegisteredUser> {
  const validatedInput = registerSchema.parse(input);

  return registerAccount(
    validatedInput.email,
    validatedInput.password
  );
}
