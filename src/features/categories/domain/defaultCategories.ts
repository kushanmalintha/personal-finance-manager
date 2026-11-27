import type { CategoryType } from "@/src/types/domain";

/**
 * Structure of a predefined category.
 */
export interface DefaultCategoryDefinition {
  readonly id: string;
  readonly name: string;
  readonly type: CategoryType;
  readonly isDefault: true;
}

/**
 * Shared presentation defaults.
 * Users can customize these values later.
 */
export const DEFAULT_CATEGORY_ICON = "tag";
export const DEFAULT_CATEGORY_COLOR = "#64748B";

/**
 * Predefined expense categories.
 */
export const DEFAULT_EXPENSE_CATEGORIES = [
  {
    id: "default-expense-food-dining",
    name: "Food & Dining",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    id: "default-expense-transportation",
    name: "Transportation",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    id: "default-expense-shopping",
    name: "Shopping",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    id: "default-expense-housing",
    name: "Housing",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    id: "default-expense-bills-utilities",
    name: "Bills & Utilities",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    id: "default-expense-health",
    name: "Health",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    id: "default-expense-education",
    name: "Education",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    id: "default-expense-entertainment",
    name: "Entertainment",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    id: "default-expense-clothing",
    name: "Clothing",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    id: "default-expense-personal-family",
    name: "Personal & Family",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    id: "default-expense-travel",
    name: "Travel",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    id: "default-expense-other",
    name: "Other",
    type: "EXPENSE",
    isDefault: true,
  },
] as const satisfies readonly DefaultCategoryDefinition[];

/**
 * Predefined income categories.
 */
export const DEFAULT_INCOME_CATEGORIES = [
  {
    id: "default-income-salary",
    name: "Salary",
    type: "INCOME",
    isDefault: true,
  },
  {
    id: "default-income-freelancing",
    name: "Freelancing",
    type: "INCOME",
    isDefault: true,
  },
  {
    id: "default-income-business",
    name: "Business",
    type: "INCOME",
    isDefault: true,
  },
  {
    id: "default-income-interest",
    name: "Interest",
    type: "INCOME",
    isDefault: true,
  },
  {
    id: "default-income-gifts",
    name: "Gifts",
    type: "INCOME",
    isDefault: true,
  },
  {
    id: "default-income-other",
    name: "Other Income",
    type: "INCOME",
    isDefault: true,
  },
] as const satisfies readonly DefaultCategoryDefinition[];
