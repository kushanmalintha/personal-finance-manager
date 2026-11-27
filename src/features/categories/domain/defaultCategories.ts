import type { CategoryType } from "@/src/types/domain";

/**
 * Structure of a predefined category.
 *
 * Presentation properties and Firestore metadata
 * are assigned during category initialization.
 */
export interface DefaultCategoryDefinition {
  readonly name: string;
  readonly type: CategoryType;
  readonly isDefault: true;
}

/**
 * Predefined expense categories approved for the application.
 */
export const DEFAULT_EXPENSE_CATEGORIES = [
  {
    name: "Food & Dining",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Transportation",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Shopping",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Housing",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Bills & Utilities",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Health",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Education",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Entertainment",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Clothing",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Personal & Family",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Travel",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Other",
    type: "EXPENSE",
    isDefault: true,
  },
] as const satisfies readonly DefaultCategoryDefinition[];

/**
 * Predefined income categories approved for the application.
 */
export const DEFAULT_INCOME_CATEGORIES = [
  {
    name: "Salary",
    type: "INCOME",
    isDefault: true,
  },
  {
    name: "Freelancing",
    type: "INCOME",
    isDefault: true,
  },
  {
    name: "Business",
    type: "INCOME",
    isDefault: true,
  },
  {
    name: "Interest",
    type: "INCOME",
    isDefault: true,
  },
  {
    name: "Gifts",
    type: "INCOME",
    isDefault: true,
  },
  {
    name: "Other Income",
    type: "INCOME",
    isDefault: true,
  },
] as const satisfies readonly DefaultCategoryDefinition[];
