
export type AccountOperation = (accountId: string) => Promise<void>;

export type OpeningBalanceOperation = (
  accountId: string,
  openingBalance: number,
) => Promise<void>;

export type FetchAccountLifecycleStatus = (
  accountId: string,
  accountType: "WALLET" | "BANK",
) => Promise<AccountLifecycleStatus>;

export function validateAccountId(accountId: string): string {
  const normalized = accountId.trim();

  if (!normalized) {
    throw new Error("An account ID is required.");
  }

  return normalized;
}

export async function activateAccount(
  accountId: string,
  persist: AccountOperation,
): Promise<void> {
  await persist(validateAccountId(accountId));
}

export async function deactivateAccount(
  accountId: string,
  persist: AccountOperation,
): Promise<void> {
  await persist(validateAccountId(accountId));
}

export async function deleteAccount(
  accountId: string,
  persist: AccountOperation,
): Promise<void> {
  await persist(validateAccountId(accountId));
}

export async function updateOpeningBalance(
  accountId: string,
  openingBalance: number,
  persist: OpeningBalanceOperation,
): Promise<void> {
  const normalizedId = validateAccountId(accountId);

  if (!Number.isSafeInteger(openingBalance) || openingBalance < 0) {
    throw new Error(
      "Opening balance must be a non-negative whole amount in minor units.",
    );
  }

  await persist(normalizedId, openingBalance);
}

export async function getAccountLifecycleStatus(
  accountId: string,
  accountType: "WALLET" | "BANK",
  fetchStatus: FetchAccountLifecycleStatus,
): Promise<AccountLifecycleStatus> {
  return fetchStatus(validateAccountId(accountId), accountType);
}

export interface AccountLifecycleStatus {
  hasTransactions: boolean;
  hasRecurringReferences: boolean;
  hasActiveRecurringReferences: boolean;
  canDelete: boolean;
}
