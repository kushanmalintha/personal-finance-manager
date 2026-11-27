import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";
import type { Category, CategoryType } from "@/src/types/domain";

import { CategoryAppearancePicker } from "./CategoryAppearancePicker";
import { DEFAULT_CATEGORY_APPEARANCE } from "./categoryAppearanceOptions";

interface CategoryFormValues {
  name: string;
  icon: string;
  color: string;
}

interface CategoryFormModalProps {
  visible: boolean;
  categoryType: CategoryType;
  category?: Category | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}

export function CategoryFormModal({
  visible,
  categoryType,
  category,
  isSaving,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const scheme = useColorScheme();
  const theme = colors[scheme ?? "light"];

  const [name, setName] = useState<string>("");
  const [icon, setIcon] = useState<string>(DEFAULT_CATEGORY_APPEARANCE.icon);
  const [color, setColor] = useState<string>(DEFAULT_CATEGORY_APPEARANCE.color);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(category);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(category?.name ?? "");
    setIcon(
      category?.icon === "tag"
        ? DEFAULT_CATEGORY_APPEARANCE.icon
        : (category?.icon ?? DEFAULT_CATEGORY_APPEARANCE.icon),
    );
    setColor(category?.color ?? DEFAULT_CATEGORY_APPEARANCE.color);
    setError(null);
  }, [visible, category]);

  async function handleSubmit() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter a category name.");
      return;
    }

    setError(null);

    try {
      await onSubmit({
        name: trimmedName,
        icon,
        color,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save the category. Please try again.",
      );
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={isSaving ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              {isEditing ? "Edit Category" : "Add Category"}
            </Text>

            <Pressable
              onPress={onClose}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Close category form"
            >
              <Text
                style={[styles.closeButton, { color: theme.textSecondary }]}
              >
                ✕
              </Text>
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.formContent}
          >
            <Text style={[styles.label, { color: theme.text }]}>
              Category type
            </Text>

            <View
              style={[
                styles.typeDisplay,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.typeText, { color: theme.text }]}>
                {categoryType === "INCOME" ? "Income" : "Expense"}
              </Text>
            </View>

            <Text style={[styles.label, { color: theme.text }]}>
              Category name
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter category name"
              placeholderTextColor={theme.textSecondary}
              editable={!isSaving}
              maxLength={40}
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            />

            <CategoryAppearancePicker
              icon={icon}
              color={color}
              onIconChange={setIcon}
              onColorChange={setColor}
            />

            {error && (
              <Text
                accessibilityRole="alert"
                style={[styles.error, { color: theme.danger }]}
              >
                {error}
              </Text>
            )}

            <AppButton onPress={handleSubmit} disabled={isSaving}>
              {isSaving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Category"}
            </AppButton>

            {isSaving && <ActivityIndicator color={theme.primary} />}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    maxHeight: "90%",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  closeButton: {
    fontSize: typography.size.xl,
    padding: spacing.xs,
  },
  formContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  typeDisplay: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  typeText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.size.md,
  },
  error: {
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
});
