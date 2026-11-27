import type { CategoryRepository } from "./categoryRepository";

/**
 * Ensure that all predefined categories exist
 * for the authenticated user.
 */
export async function initializeDefaultCategories(
  repository: CategoryRepository,
): Promise<void> {
  return repository.initializeDefaultCategories();
}
