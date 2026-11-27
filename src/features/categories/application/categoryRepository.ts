import type { Category, CategoryType } from "@/src/types/domain";

/**
 * Input required to create a custom category.
 */
export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}

/**
 * Fields that can be changed when editing a category.
 *
 * The category type and default status are not changed
 * through this update operation.
 */
export interface UpdateCategoryInput {
  name: string;
  icon: string;
  color: string;
}

/**
 * Contract for category persistence operations.
 *
 * Implementations belong to the data layer.
 * The application layer depends only on this contract.
 */
export interface CategoryRepository {
  getCategories(): Promise<Category[]>;

  createCategory(input: CreateCategoryInput): Promise<Category>;

  updateCategory(
    categoryId: string,
    input: UpdateCategoryInput,
  ): Promise<Category>;

  deactivateCategory(categoryId: string): Promise<void>;
}
