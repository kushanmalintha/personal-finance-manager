import type { Account } from "@/src/types/domain";

export type FetchAccount = (accountId: string) => Promise<Account | null>;

/**
 * Retrieve one account using its document ID.
 */
export async function getAccountDetails(
  accountId: string,
  fetchAccount: FetchAccount,
): Promise<Account | null> {
  if (!accountId.trim()) {
    throw new Error("An account ID is required.");
  }

  return fetchAccount(accountId);
}
