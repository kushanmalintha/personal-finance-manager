/**
 * Account types supported by the application.
 */
export type AccountType = "WALLET" | "BANK";

/**
 * Financial transaction types.
 */
export type TransactionType =
  | "INCOME"
  | "EXPENSE"
  | "TRANSFER"
  | "ADJUSTMENT";

/**
 * Category types.
 */
export type CategoryType = "INCOME" | "EXPENSE";

/**
 * Supported recurring schedule frequencies.
 */
export type RecurrenceFrequency =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY";

/**
 * Recurring occurrence processing statuses.
 */
export type RecurringOccurrenceStatus =
  | "PENDING"
  | "GENERATED"
  | "NEEDS_ATTENTION"
  | "SKIPPED";
