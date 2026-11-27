import type { Category, CategoryType } from "@/src/types/domain";

import type {
  CategoryRepository,
  CreateCategoryInput,
} from "./categoryRepository";

/**
 * Validate and create a custom category.
 */
export async function createCategory(
  repository: CategoryRepository,
  input: CreateCategoryInput,
): Promise<Category> {
  if (typeof input.name !== "string" || !input.name.trim()) {
    throw new Error("Category name is required.");
  }

  if (input.type !== "INCOME" && input.type !== "EXPENSE") {
    throw new Error("Invalid category type.");
  }

  if (typeof input.icon !== "string" || !input.icon.trim()) {
    throw new Error("Category icon is required.");
  }

  if (typeof input.color !== "string" || !input.color.trim()) {
    throw new Error("Category color is required.");
  }

  const validatedInput: CreateCategoryInput = {
    name: input.name.trim(),
    type: input.type as CategoryType,
    icon: input.icon.trim(),
    color: input.color.trim(),
  };

  return repository.createCategory(validatedInput);
}
