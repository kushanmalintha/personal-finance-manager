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
 */
export interface UpdateCategoryInput {
  name: string;
  icon: string;
  color: string;
}

/**
 * Contract for category persistence operations.
 */
export interface CategoryRepository {
  initializeDefaultCategories(): Promise<void>;

  getCategories(): Promise<Category[]>;

  createCategory(input: CreateCategoryInput): Promise<Category>;

  updateCategory(
    categoryId: string,
    input: UpdateCategoryInput,
  ): Promise<Category>;

  deactivateCategory(categoryId: string): Promise<void>;

  reactivateCategory(categoryId: string): Promise<void>;
}
