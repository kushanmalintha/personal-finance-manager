import type { Category } from "@/src/types/domain";

import type {
  CategoryRepository,
  UpdateCategoryInput,
} from "./categoryRepository";

/**
 * Validate and update an existing category.
 */
export async function updateCategory(
  repository: CategoryRepository,
  categoryId: string,
  input: UpdateCategoryInput,
): Promise<Category> {
  if (!categoryId.trim()) {
    throw new Error("Category ID is required.");
  }

  if (typeof input.name !== "string" || !input.name.trim()) {
    throw new Error("Category name is required.");
  }

  if (typeof input.icon !== "string" || !input.icon.trim()) {
    throw new Error("Category icon is required.");
  }

  if (typeof input.color !== "string" || !input.color.trim()) {
    throw new Error("Category color is required.");
  }

  const validatedInput: UpdateCategoryInput = {
    name: input.name.trim(),
    icon: input.icon.trim(),
    color: input.color.trim(),
  };

  return repository.updateCategory(categoryId, validatedInput);
}
