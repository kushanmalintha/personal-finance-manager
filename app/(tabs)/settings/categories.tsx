import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppCard } from "@/src/components/common/AppCard";
import { ScreenContainer } from "@/src/components/common/ScreenContainer";
import { createCategory } from "@/src/features/categories/application/createCategory";
import { deactivateCategory } from "@/src/features/categories/application/deactivateCategory";
import { getCategories } from "@/src/features/categories/application/getCategories";
import { reactivateCategory } from "@/src/features/categories/application/reactivateCategory";
import { updateCategory } from "@/src/features/categories/application/updateCategory";
import { categoryRepository } from "@/src/features/categories/data/categoryRepository";
import { CategoryFormModal } from "@/src/features/categories/presentation/CategoryFormModal";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";
import type { Category, CategoryType } from "@/src/types/domain";

export default function CategoriesScreen() {
  const scheme = useColorScheme();
  const theme = colors[scheme];

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryType, setCategoryType] = useState<CategoryType>("EXPENSE");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const loadCategories = useCallback(async () => {
    setError(null);

    try {
      const result = await getCategories(categoryRepository);
      setCategories(result);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load categories.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadCategories();
    }, [loadCategories]),
  );

  const filteredCategories = categories
    .filter((category) => category.type === categoryType)
    .sort((first, second) => {
      if (first.isActive !== second.isActive) {
        return first.isActive ? -1 : 1;
      }

      return first.name.localeCompare(second.name);
    });

  function openCreateForm() {
    setEditingCategory(null);
    setIsFormVisible(true);
  }

  function openEditForm(category: Category) {
    setEditingCategory(category);
    setIsFormVisible(true);
  }

  function closeForm() {
    if (isSaving) {
      return;
    }

    setIsFormVisible(false);
    setEditingCategory(null);
  }

  async function handleSave(values: {
    name: string;
    icon: string;
    color: string;
  }) {
    setIsSaving(true);

    try {
      if (editingCategory) {
        await updateCategory(categoryRepository, editingCategory.id, {
          name: values.name,
          icon: values.icon,
          color: values.color,
        });
      } else {
        await createCategory(categoryRepository, {
          name: values.name,
          type: categoryType,
          icon: values.icon,
          color: values.color,
        });
      }

      setIsFormVisible(false);
      setEditingCategory(null);

      await loadCategories();
    } finally {
      setIsSaving(false);
    }
  }

  function confirmDeactivate(category: Category) {
    Alert.alert(
      "Deactivate Category",
      `Are you sure you want to deactivate "${category.name}"? It will no longer be available for new transactions, but its historical records will be preserved.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: () => {
            void handleDeactivate(category);
          },
        },
      ],
    );
  }

  async function handleDeactivate(category: Category) {
    setDeactivatingId(category.id);
    setError(null);

    try {
      await deactivateCategory(categoryRepository, category.id);
      await loadCategories();
    } catch (deactivateError) {
      setError(
        deactivateError instanceof Error
          ? deactivateError.message
          : "Unable to deactivate category.",
      );
    } finally {
      setDeactivatingId(null);
    }
  }

  function confirmReactivate(category: Category) {
    Alert.alert(
      "Reactivate Category",
      `Are you sure you want to reactivate "${category.name}"? It will become available for new transactions again.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reactivate",
          onPress: () => {
            void handleReactivate(category);
          },
        },
      ],
    );
  }

  async function handleReactivate(category: Category) {
    setReactivatingId(category.id);
    setError(null);

    try {
      await reactivateCategory(categoryRepository, category.id);
      await loadCategories();
    } catch (reactivateError) {
      setError(
        reactivateError instanceof Error
          ? reactivateError.message
          : "Unable to reactivate category.",
      );
    } finally {
      setReactivatingId(null);
    }
  }

  return (
    <ScreenContainer scrollable contentStyle={styles.screen}>
      <View style={styles.heading}>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Organize your income and expenses using categories.
        </Text>
      </View>

      {/* Category type selector */}
      <View
        style={[
          styles.typeSelector,
          { backgroundColor: theme.surfaceSecondary },
        ]}
      >
        {(["EXPENSE", "INCOME"] as const).map((type) => {
          const selected = categoryType === type;

          return (
            <Pressable
              key={type}
              onPress={() => setCategoryType(type)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={[
                styles.typeOption,
                selected && { backgroundColor: theme.surface },
              ]}
            >
              <Text
                style={[
                  styles.typeOptionText,
                  {
                    color: selected ? theme.primary : theme.textSecondary,
                  },
                ]}
              >
                {type === "EXPENSE" ? "Expenses" : "Income"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Category list heading and add button */}
      <View style={styles.listHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {categoryType === "EXPENSE"
              ? "Expense Categories"
              : "Income Categories"}
          </Text>
          <Text style={[styles.countText, { color: theme.textSecondary }]}>
            {filteredCategories.length} categories
          </Text>
        </View>

        <AppButton onPress={openCreateForm} fullWidth={false}>
          + Add
        </AppButton>
      </View>

      {error && (
        <AppCard>
          <Text style={[styles.errorText, { color: theme.danger }]}>
            {error}
          </Text>
          <AppButton variant="outline" onPress={() => void loadCategories()}>
            Try Again
          </AppButton>
        </AppCard>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.textSecondary }}>
            Loading categories...
          </Text>
        </View>
      ) : filteredCategories.length === 0 ? (
        <AppCard>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No categories found
          </Text>
          <Text
            style={[styles.emptyDescription, { color: theme.textSecondary }]}
          >
            Add a category to organize your{" "}
            {categoryType === "EXPENSE" ? "expenses" : "income"}.
          </Text>
        </AppCard>
      ) : (
        <View style={styles.categoryList}>
          {filteredCategories.map((category) => (
            <AppCard key={category.id} padding="md">
              <View style={styles.categoryRow}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: category.color },
                  ]}
                >
                  <Text style={styles.categoryEmoji}>
                    {category.icon === "tag" ? "🏷️" : category.icon}
                  </Text>
                </View>

                <View style={styles.categoryDetails}>
                  <Text style={[styles.categoryName, { color: theme.text }]}>
                    {category.name}
                  </Text>

                  <View style={styles.metadataRow}>
                    {category.isDefault && (
                      <Text
                        style={[
                          styles.metadataText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Default
                      </Text>
                    )}

                    {!category.isActive && (
                      <Text
                        style={[styles.inactiveText, { color: theme.danger }]}
                      >
                        Deactivated
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.actions}>
                  {category.isActive ? (
                    <>
                      <Pressable
                        onPress={() => openEditForm(category)}
                        accessibilityRole="button"
                        accessibilityLabel={`Edit ${category.name}`}
                        style={styles.actionButton}
                      >
                        <Text style={{ color: theme.primary }}>Edit</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => confirmDeactivate(category)}
                        disabled={
                          deactivatingId === category.id ||
                          reactivatingId === category.id
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`Deactivate ${category.name}`}
                        style={styles.actionButton}
                      >
                        {deactivatingId === category.id ? (
                          <ActivityIndicator
                            color={theme.danger}
                            size="small"
                          />
                        ) : (
                          <Text style={{ color: theme.danger }}>Disable</Text>
                        )}
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      onPress={() => confirmReactivate(category)}
                      disabled={
                        reactivatingId === category.id ||
                        deactivatingId === category.id
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Reactivate ${category.name}`}
                      style={styles.actionButton}
                    >
                      {reactivatingId === category.id ? (
                        <ActivityIndicator color={theme.primary} size="small" />
                      ) : (
                        <Text style={{ color: theme.primary }}>Reactivate</Text>
                      )}
                    </Pressable>
                  )}
                </View>
              </View>
            </AppCard>
          ))}
        </View>
      )}

      <CategoryFormModal
        visible={isFormVisible}
        categoryType={categoryType}
        category={editingCategory}
        isSaving={isSaving}
        onClose={closeForm}
        onSubmit={handleSave}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  heading: {
    gap: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.sm,
    lineHeight: 21,
  },
  typeSelector: {
    flexDirection: "row",
    padding: spacing.xs,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  typeOption: {
    flex: 1,
    minHeight: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.sm,
  },
  typeOptionText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  countText: {
    fontSize: typography.size.xs,
    marginTop: spacing.xs,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.md,
  },
  categoryList: {
    gap: spacing.sm,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  categoryIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryEmoji: {
    fontSize: 23,
  },
  categoryDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  categoryName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  metadataRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metadataText: {
    fontSize: typography.size.xs,
  },
  inactiveText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  actions: {
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  actionButton: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  emptyTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  emptyDescription: {
    color: "#68736D",
    fontSize: typography.size.sm,
    lineHeight: 21,
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: typography.size.sm,
    marginBottom: spacing.md,
  },
});
