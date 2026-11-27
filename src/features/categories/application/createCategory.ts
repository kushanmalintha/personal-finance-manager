import type {
    CategoryRepository,
    CreateCategoryInput,
} from "./categoryRepository";

export async function createCategory(
  repository: CategoryRepository,
  input: CreateCategoryInput,
) {
  return repository.createCategory(input);
}
