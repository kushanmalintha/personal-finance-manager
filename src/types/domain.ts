import { APP_CURRENCY, FINANCIAL_TIME_ZONE } from "@/src/constants/app";

/**
 * Account types supported by the application.
 */
export type AccountType = "WALLET" | "BANK";

/**
 * Financial transaction types.
 */
export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER" | "ADJUSTMENT";

/**
 * Category types.
 */
export type CategoryType = "INCOME" | "EXPENSE";

/**
 * Supported recurring schedule frequencies.
 */
export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

/**
 * Recurring occurrence processing statuses.
 */
export type RecurringOccurrenceStatus =
  | "PENDING"
  | "GENERATED"
  | "NEEDS_ATTENTION"
  | "SKIPPED";

/**
 * Monetary values represented as integer minor units.
 */
export type MoneyAmountMinorUnits = number;

/**
 * Financial calendar date in YYYY-MM-DD format.
 */
export type FinancialDate = string;

/**
 * User's financial application settings.
 */
export interface UserSettings {
  currency: typeof APP_CURRENCY;
  timezone: typeof FINANCIAL_TIME_ZONE;
  dailySpendingLimit: MoneyAmountMinorUnits;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Financial account owned by the authenticated user.
 */
export interface Account {
  id: string;
  name: string;
  type: AccountType;
  bankName?: string;
  openingBalance: MoneyAmountMinorUnits;
  openingDate: FinancialDate;
  currentBalance: MoneyAmountMinorUnits;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category owned by the authenticated user.
 *
 * Categories are used to classify income and expense transactions.
 */
export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
