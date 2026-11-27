import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "@/src/services/firebase";
import type { Category, CategoryType } from "@/src/types/domain";

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

function getCategoryNameLocksCollection(userId: string) {
  return collection(db, "users", userId, "categoryNameLocks");
}

/**
 * Normalize category names for duplicate checking.
 */
function normalizeCategoryName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Generate a deterministic Firestore document reference for a
 * category name reservation.
 *
 * Category type is included so an income and expense category
 * can have the same name.
 */
function getCategoryNameLockDocument(
  userId: string,
  type: CategoryType,
  name: string,
) {
  const normalizedName = normalizeCategoryName(name);
  const lockId = `${type}_${encodeURIComponent(normalizedName)}`;

  return doc(getCategoryNameLocksCollection(userId), lockId);
}

/**
 * Generate the standard duplicate-name error.
 */
function throwDuplicateCategoryName(type: CategoryType): never {
  throw new Error(
    `A ${type.toLowerCase()} category with this name already exists.`,
  );
}

/**
 * Check existing category documents before attempting a transaction.
 *
 * This check also protects categories created before name reservations
 * were introduced. The transaction reservation provides the additional
 * protection against concurrent create/update operations.
 */
async function assertNoDuplicateCategoryName(
  userId: string,
  type: CategoryType,
  name: string,
  excludedCategoryId?: string,
): Promise<void> {
  const categoriesQuery = query(
    getCategoriesCollection(userId),
    where("type", "==", type),
  );

  const snapshot = await getDocs(categoriesQuery);
  const normalizedName = normalizeCategoryName(name);

  const duplicateExists = snapshot.docs.some((document) => {
    if (document.id === excludedCategoryId) {
      return false;
    }

    const existingName = document.data().name;

    return (
      typeof existingName === "string" &&
      normalizeCategoryName(existingName) === normalizedName
    );
  });

  if (duplicateExists) {
    throwDuplicateCategoryName(type);
  }
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
   *
   * Name reservations are also created for predefined categories
   * so custom categories cannot claim their names.
   */
  async initializeDefaultCategories(): Promise<void> {
    const userId = getCurrentUserId();

    const categories = [
      ...DEFAULT_EXPENSE_CATEGORIES,
      ...DEFAULT_INCOME_CATEGORIES,
    ];

    const categoriesCollection = getCategoriesCollection(userId);

    const categoryRefs = categories.map((category) =>
      getCategoryDocument(userId, category.id),
    );

    // Read existing categories to detect name conflicts with
    // categories that existed before reservation documents.
    const existingCategoriesSnapshot = await getDocs(categoriesCollection);

    await runTransaction(db, async (transaction) => {
      // Read all predefined category documents first.
      const categorySnapshots = await Promise.all(
        categoryRefs.map((categoryRef) => transaction.get(categoryRef)),
      );

      // Determine the name each predefined category currently owns.
      // Existing customized names must be preserved.
      const targetCategories = categories.map((category, index) => {
        const snapshot = categorySnapshots[index];

        if (!snapshot) {
          throw new Error("Unable to read a predefined category.");
        }

        if (!snapshot.exists()) {
          return {
            id: category.id,
            name: category.name,
            type: category.type as CategoryType,
          };
        }

        const data = snapshot.data();

        if (
          typeof data.name !== "string" ||
          (data.type !== "INCOME" && data.type !== "EXPENSE")
        ) {
          throw new Error("Invalid predefined category document.");
        }

        if (data.type !== category.type) {
          throw new Error("Predefined category type cannot be changed.");
        }

        return {
          id: category.id,
          name: data.name,
          type: data.type as CategoryType,
        };
      });

      // Detect duplicate names against existing categories.
      // A category is allowed to match its own predefined document.
      for (const target of targetCategories) {
        const normalizedName = normalizeCategoryName(target.name);

        const duplicateExists = existingCategoriesSnapshot.docs.some(
          (document) => {
            if (document.id === target.id) {
              return false;
            }

            const data = document.data();

            return (
              data.type === target.type &&
              typeof data.name === "string" &&
              normalizeCategoryName(data.name) === normalizedName
            );
          },
        );

        if (duplicateExists) {
          throwDuplicateCategoryName(target.type);
        }
      }

      // Read every name reservation before performing any writes.
      const lockRefs = targetCategories.map((category) =>
        getCategoryNameLockDocument(userId, category.type, category.name),
      );

      const lockSnapshots = await Promise.all(
        lockRefs.map((lockRef) => transaction.get(lockRef)),
      );

      // Validate all existing reservations before writing.
      for (const [index, category] of targetCategories.entries()) {
        const lockSnapshot = lockSnapshots[index];

        if (!lockSnapshot) {
          throw new Error("Unable to read a category name reservation.");
        }

        if (
          lockSnapshot.exists() &&
          lockSnapshot.data().categoryId !== category.id
        ) {
          throwDuplicateCategoryName(category.type);
        }
      }

      // Create missing category documents and missing reservations.
      for (const [index, category] of categories.entries()) {
        const categorySnapshot = categorySnapshots[index];
        const categoryRef = categoryRefs[index];
        const lockSnapshot = lockSnapshots[index];
        const lockRef = lockRefs[index];
        const target = targetCategories[index];

        if (
          !categorySnapshot ||
          !categoryRef ||
          !lockSnapshot ||
          !lockRef ||
          !target
        ) {
          throw new Error("Unable to initialize predefined categories.");
        }

        if (!lockSnapshot.exists()) {
          transaction.set(lockRef, {
            categoryId: target.id,
            type: target.type,
            normalizedName: normalizeCategoryName(target.name),
            createdAt: serverTimestamp(),
          });
        }

        if (!categorySnapshot.exists()) {
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
   *
   * The category document and its name reservation are created
   * atomically in a Firestore transaction.
   */
  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const userId = getCurrentUserId();

    const categoriesCollection = getCategoriesCollection(userId);
    const categoryRef = doc(categoriesCollection);

    const categoryName = input.name.trim();
    const normalizedName = normalizeCategoryName(categoryName);

    // Check existing documents, including legacy categories without
    // name reservation documents.
    await assertNoDuplicateCategoryName(userId, input.type, categoryName);

    const lockRef = getCategoryNameLockDocument(
      userId,
      input.type,
      categoryName,
    );

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

    await runTransaction(db, async (transaction) => {
      // Read the reservation before writing.
      const lockSnapshot = await transaction.get(lockRef);

      // Another request may have reserved this name after the
      // preliminary duplicate query.
      if (lockSnapshot.exists()) {
        throwDuplicateCategoryName(input.type);
      }

      // Reserve the name and create the category atomically.
      transaction.set(lockRef, {
        categoryId: categoryRef.id,
        type: input.type,
        normalizedName,
        createdAt: serverTimestamp(),
      });

      transaction.set(categoryRef, {
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
        isDefault: false,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    return category;
  },

  /**
   * Update the editable properties of an existing category.
   * The category type and default status remain unchanged.
   *
   * The new name reservation, category update, and old reservation
   * release are handled atomically.
   */
  async updateCategory(
    categoryId: string,
    input: UpdateCategoryInput,
  ): Promise<Category> {
    const userId = getCurrentUserId();

    const categoryRef = getCategoryDocument(userId, categoryId);
    const initialSnapshot = await getDoc(categoryRef);

    if (!initialSnapshot.exists()) {
      throw new Error("Category not found.");
    }

    const initialCategory = categoryFromFirestore(
      initialSnapshot.id,
      initialSnapshot.data(),
    );

    const categoryName = input.name.trim();
    const normalizedName = normalizeCategoryName(categoryName);
    const updatedAt = new Date();

    // Check existing documents, excluding the category being edited.
    await assertNoDuplicateCategoryName(
      userId,
      initialCategory.type,
      categoryName,
      categoryId,
    );

    let updatedCategory: Category | undefined;

    await runTransaction(db, async (transaction) => {
      // Re-read the category inside the transaction to avoid
      // updating based on stale category information.
      const currentSnapshot = await transaction.get(categoryRef);

      if (!currentSnapshot.exists()) {
        throw new Error("Category not found.");
      }

      const currentCategory = categoryFromFirestore(
        currentSnapshot.id,
        currentSnapshot.data(),
      );

      const newLockRef = getCategoryNameLockDocument(
        userId,
        currentCategory.type,
        categoryName,
      );

      const oldLockRef = getCategoryNameLockDocument(
        userId,
        currentCategory.type,
        currentCategory.name,
      );

      // Read the new reservation.
      const newLockSnapshot = await transaction.get(newLockRef);

      // If the old and new names are identical, reuse the same read.
      const oldLockSnapshot =
        oldLockRef.path === newLockRef.path
          ? newLockSnapshot
          : await transaction.get(oldLockRef);

      // The new name may already belong to another category.
      if (
        newLockSnapshot.exists() &&
        newLockSnapshot.data().categoryId !== categoryId
      ) {
        throwDuplicateCategoryName(currentCategory.type);
      }

      // Reserve the new name if it has not already been reserved
      // by this category.
      if (!newLockSnapshot.exists()) {
        transaction.set(newLockRef, {
          categoryId,
          type: currentCategory.type,
          normalizedName,
          createdAt: serverTimestamp(),
        });
      }

      // Release the old reservation only when this category owns it.
      // Inactive categories keep their reservations until renamed.
      if (
        oldLockRef.path !== newLockRef.path &&
        oldLockSnapshot.exists() &&
        oldLockSnapshot.data().categoryId === categoryId
      ) {
        transaction.delete(oldLockRef);
      }

      // Update only editable category fields.
      transaction.update(categoryRef, {
        name: categoryName,
        icon: input.icon.trim(),
        color: input.color.trim(),
        updatedAt: serverTimestamp(),
      });

      updatedCategory = {
        ...currentCategory,
        name: categoryName,
        icon: input.icon.trim(),
        color: input.color.trim(),
        updatedAt,
      };
    });

    if (!updatedCategory) {
      throw new Error("Unable to update category.");
    }

    return updatedCategory;
  },

  /**
   * Deactivate a category without deleting its document.
   * This preserves the category for historical references.
   *
   * Its name remains unavailable for reuse.
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
