import type { Account } from "@/src/types/domain";

export type FetchAccounts = () => Promise<Account[]>;

/**
 * Retrieve and organize the authenticated user's accounts.
 * The wallet appears before bank accounts.
 */
export async function listAccounts(
  fetchAccounts: FetchAccounts,
): Promise<Account[]> {
  const accounts = await fetchAccounts();

  return [...accounts].sort((first, second) => {
    if (first.type === second.type) {
      return first.name.localeCompare(second.name);
    }

    return first.type === "WALLET" ? -1 : 1;
  });
}
