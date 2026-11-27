import type { CategoryRepository } from "./categoryRepository";

export async function deactivateCategory(
  repository: CategoryRepository,
  categoryId: string,
): Promise<void> {
  return repository.deactivateCategory(categoryId);
}
