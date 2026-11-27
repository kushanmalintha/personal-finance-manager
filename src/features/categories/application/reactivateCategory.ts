import type { CategoryRepository } from "./categoryRepository";

/**
 * Reactivate a previously deactivated category.
 */
export async function reactivateCategory(
  repository: CategoryRepository,
  categoryId: string,
): Promise<void> {
  if (!categoryId.trim()) {
    throw new Error("Category ID is required.");
  }

  return repository.reactivateCategory(categoryId);
}
