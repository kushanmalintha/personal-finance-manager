import type { Account } from "@/src/types/domain";

import {
    addBankAccountSchema,
    type AddBankAccountInput,
    type ValidatedAddBankAccount,
} from "./addBankAccountSchema";

type NewBankAccount = Omit<Account, "id" | "createdAt" | "updatedAt">;

export type CreateBankAccount = (account: NewBankAccount) => Promise<string>;

/**
 * Validate and create a bank account.
 *
 * The application layer prepares the initial account state
 * and delegates persistence to the injected data operation.
 */
export async function addBankAccount(
  input: AddBankAccountInput,
  createBankAccount: CreateBankAccount,
): Promise<string> {
  const validated: ValidatedAddBankAccount = addBankAccountSchema.parse(input);

  const account: NewBankAccount = {
    name: validated.name,
    type: "BANK",
    ...(validated.bankName ? { bankName: validated.bankName } : {}),
    openingBalance: validated.openingBalance,
    openingDate: validated.openingDate,
    currentBalance: validated.openingBalance,
    isActive: true,
  };

  return createBankAccount(account);
}
