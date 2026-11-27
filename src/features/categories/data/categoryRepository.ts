import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "@/src/services/firebase";
import type { Category } from "@/src/types/domain";

import type {
  CategoryRepository,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../application/categoryRepository";

import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from "../domain/defaultCategories";

import { categoryFromFirestore } from "./categoryMapper";

function getCurrentUserId(): string {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("An authenticated user is required.");
  }

  return userId;
}

function getCategoriesCollection(userId: string) {
  return collection(db, "users", userId, "categories");
}

function getCategoryDocument(userId: string, categoryId: string) {
  return doc(getCategoriesCollection(userId), categoryId);
}

/**
 * Normalize category names for duplicate checking.
 */
function normalizeCategoryName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Firestore implementation of the CategoryRepository contract.
 */
export const categoryRepository: CategoryRepository = {
  /**
   * Ensure that all predefined categories exist for the current user.
   *
   * Existing documents are never overwritten. This preserves
   * user customizations and deactivated categories.
   */
  async initializeDefaultCategories(): Promise<void> {
    const userId = getCurrentUserId();

    const categories = [
      ...DEFAULT_EXPENSE_CATEGORIES,
      ...DEFAULT_INCOME_CATEGORIES,
    ];

    const categoryRefs = categories.map((category) =>
      getCategoryDocument(userId, category.id),
    );

    await runTransaction(db, async (transaction) => {
      // Read every predefined category before performing writes.
      const snapshots = await Promise.all(
        categoryRefs.map((categoryRef) => transaction.get(categoryRef)),
      );

      // Create only documents that do not already exist.
      for (const [index, category] of categories.entries()) {
        const snapshot = snapshots[index];
        const categoryRef = categoryRefs[index];

        if (!snapshot || !categoryRef || snapshot.exists()) {
          continue;
        }

        transaction.set(categoryRef, {
          name: category.name,
          type: category.type,
          icon: DEFAULT_CATEGORY_ICON,
          color: DEFAULT_CATEGORY_COLOR,
          isDefault: true,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    });
  },

  /**
   * Retrieve all categories belonging to the current user.
   */
  async getCategories(): Promise<Category[]> {
    const userId = getCurrentUserId();

    const snapshot = await getDocs(getCategoriesCollection(userId));

    return snapshot.docs
      .map((document) => categoryFromFirestore(document.id, document.data()))
      .sort(
        (first, second) =>
          first.createdAt.getTime() - second.createdAt.getTime(),
      );
  },

  /**
   * Create a custom category for the current user.
   *
   * Duplicate names are not allowed within the same category type.
   * Inactive categories are also included in duplicate checks.
   */
  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const userId = getCurrentUserId();

    const categoriesCollection = getCategoriesCollection(userId);
    const categoryRef = doc(categoriesCollection);

    const categoryName = input.name.trim();
    const normalizedName = normalizeCategoryName(categoryName);
    const now = new Date();

    const category: Category = {
      id: categoryRef.id,
      name: categoryName,
      type: input.type,
      icon: input.icon,
      color: input.color,
      isDefault: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const categoriesQuery = query(
      categoriesCollection,
      where("type", "==", input.type),
    );

    // Retrieve existing categories of the same type.
    const snapshot = await getDocs(categoriesQuery);

    // Check for duplicates, including inactive categories.
    const duplicateExists = snapshot.docs.some((document) => {
      const existingName = document.data().name;

      return (
        typeof existingName === "string" &&
        normalizeCategoryName(existingName) === normalizedName
      );
    });

    if (duplicateExists) {
      throw new Error(
        `A ${input.type.toLowerCase()} category with this name already exists.`,
      );
    }

    // Save the new custom category.
    await setDoc(categoryRef, {
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      isDefault: false,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return category;
  },

  /**
   * Update the editable properties of an existing category.
   * The category type and default status remain unchanged.
   */
  async updateCategory(
    categoryId: string,
    input: UpdateCategoryInput,
  ): Promise<Category> {
    const userId = getCurrentUserId();

    const categoryRef = getCategoryDocument(userId, categoryId);
    const snapshot = await getDoc(categoryRef);

    if (!snapshot.exists()) {
      throw new Error("Category not found.");
    }

    const existingCategory = categoryFromFirestore(
      snapshot.id,
      snapshot.data(),
    );

    const updatedAt = new Date();

    await updateDoc(categoryRef, {
      name: input.name,
      icon: input.icon,
      color: input.color,
      updatedAt: serverTimestamp(),
    });

    return {
      ...existingCategory,
      name: input.name,
      icon: input.icon,
      color: input.color,
      updatedAt,
    };
  },

  /**
   * Deactivate a category without deleting its document.
   * This preserves the category for historical references.
   */
  async deactivateCategory(categoryId: string): Promise<void> {
    const userId = getCurrentUserId();

    const categoryRef = getCategoryDocument(userId, categoryId);
    const snapshot = await getDoc(categoryRef);

    if (!snapshot.exists()) {
      throw new Error("Category not found.");
    }

    await updateDoc(categoryRef, {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  },
};
