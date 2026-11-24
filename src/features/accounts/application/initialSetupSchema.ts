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

const accountNameSchema = z.string().trim().min(1, "Account name is required.");

const openingBalanceSchema = z
  .number()
  .refine(
    (value) => Number.isSafeInteger(value) && value >= 0,
    "Opening balance must be a non-negative whole amount in minor units.",
  );

const openingDateSchema = z
  .string()
  .refine(
    isValidFinancialDate,
    "Please provide a valid opening date in YYYY-MM-DD format.",
  );

const bankAccountSchema = z.object({
  name: accountNameSchema,

  bankName: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),

  openingBalance: openingBalanceSchema,

  openingDate: openingDateSchema,
});

/**
 * Validates all information required for initial setup.
 */
export const initialSetupSchema = z.object({
  wallet: z.object({
    name: accountNameSchema,
    openingBalance: openingBalanceSchema,
    openingDate: openingDateSchema,
  }),

  dailySpendingLimit: z
    .number()
    .refine(
      (value) => Number.isSafeInteger(value) && value > 0,
      "Daily spending limit must be a positive whole amount in minor units.",
    ),

  bankAccounts: z.array(bankAccountSchema).default([]),
});

export type InitialSetupInput = z.input<typeof initialSetupSchema>;

export type ValidatedInitialSetup = z.output<typeof initialSetupSchema>;
