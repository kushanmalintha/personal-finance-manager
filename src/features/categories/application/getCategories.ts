import type { CategoryRepository } from "./categoryRepository";

export async function getCategories(repository: CategoryRepository) {
  return repository.getCategories();
}
