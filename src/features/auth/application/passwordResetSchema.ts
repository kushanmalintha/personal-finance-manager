import { z } from "zod";

export const passwordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address."),
});

export type PasswordResetInput = z.infer<
  typeof passwordResetSchema
>;
