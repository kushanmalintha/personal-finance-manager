import { z } from "zod";

function isValidFinancialDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (year < 1) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export const addBankAccountSchema = z.object({
  name: z.string().trim().min(1, "Account name is required."),

  bankName: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),

  openingBalance: z
    .number()
    .refine(
      (value) => Number.isSafeInteger(value) && value >= 0,
      "Opening balance must be a non-negative whole amount in minor units.",
    ),

  openingDate: z
    .string()
    .refine(
      isValidFinancialDate,
      "Please provide a valid opening date in YYYY-MM-DD format.",
    ),
});

export type AddBankAccountInput = z.input<typeof addBankAccountSchema>;

export type ValidatedAddBankAccount = z.output<typeof addBankAccountSchema>;
