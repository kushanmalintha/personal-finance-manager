import { Timestamp, type DocumentData } from "firebase/firestore";

import type { Category, CategoryType } from "@/src/types/domain";

type FirestoreCategoryDocument = {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

function readString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new Error(
      `Invalid category document: ${fieldName} must be a string.`,
    );
  }

  return value;
}

function readBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(
      `Invalid category document: ${fieldName} must be a boolean.`,
    );
  }

  return value;
}

function readCategoryType(value: unknown): CategoryType {
  if (value !== "INCOME" && value !== "EXPENSE") {
    throw new Error("Invalid category document: unsupported category type.");
  }

  return value;
}

function readTimestamp(value: unknown, fieldName: string): Date {
  if (!(value instanceof Timestamp)) {
    throw new Error(
      `Invalid category document: ${fieldName} must be a Firestore Timestamp.`,
    );
  }

  return value.toDate();
}

/**
 * Convert a Firestore category document into a domain Category.
 * The Firestore document ID is supplied separately.
 */
export function categoryFromFirestore(
  id: string,
  data: DocumentData,
): Category {
  return {
    id,
    name: readString(data.name, "name"),
    type: readCategoryType(data.type),
    icon: readString(data.icon, "icon"),
    color: readString(data.color, "color"),
    isDefault: readBoolean(data.isDefault, "isDefault"),
    isActive: readBoolean(data.isActive, "isActive"),
    createdAt: readTimestamp(data.createdAt, "createdAt"),
    updatedAt: readTimestamp(data.updatedAt, "updatedAt"),
  };
}

/**
 * Convert a domain Category into Firestore-compatible data.
 * The document ID is managed separately by Firestore.
 */
export function categoryToFirestore(
  category: Category,
): FirestoreCategoryDocument {
  return {
    name: category.name,
    type: category.type,
    icon: category.icon,
    color: category.color,
    isDefault: category.isDefault,
    isActive: category.isActive,
    createdAt: Timestamp.fromDate(category.createdAt),
    updatedAt: Timestamp.fromDate(category.updatedAt),
  };
}
