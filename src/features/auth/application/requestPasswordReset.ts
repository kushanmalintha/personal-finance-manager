import {
    passwordResetSchema,
    type PasswordResetInput,
} from "./passwordResetSchema";

export type SendPasswordResetEmail = (email: string) => Promise<void>;

export async function requestPasswordReset(
  input: PasswordResetInput,
  sendResetEmail: SendPasswordResetEmail,
): Promise<void> {
  const validatedInput = passwordResetSchema.parse(input);

  await sendResetEmail(validatedInput.email);
}
