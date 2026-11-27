import type {
    CategoryRepository,
    UpdateCategoryInput,
} from "./categoryRepository";

export async function updateCategory(
  repository: CategoryRepository,
  categoryId: string,
  input: UpdateCategoryInput,
) {
  return repository.updateCategory(categoryId, input);
}
