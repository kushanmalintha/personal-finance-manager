import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
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
   */
  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const userId = getCurrentUserId();

    const categoryRef = doc(getCategoriesCollection(userId));
    const now = new Date();

    const category: Category = {
      id: categoryRef.id,
      name: input.name,
      type: input.type,
      icon: input.icon,
      color: input.color,
      isDefault: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(categoryRef, {
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      isDefault: category.isDefault,
      isActive: category.isActive,
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
