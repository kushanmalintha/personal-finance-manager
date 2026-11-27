import { Stack } from "expo-router";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppCard } from "@/src/components/common/AppCard";
import { ScreenContainer } from "@/src/components/common/ScreenContainer";
import { completeInitialSetup } from "@/src/features/accounts/application/completeInitialSetup";
import { saveInitialSetup } from "@/src/features/accounts/data/initialSetupRepository";
import { initializeDefaultCategories } from "@/src/features/categories/application/initializeDefaultCategories";
import { categoryRepository } from "@/src/features/categories/data/categoryRepository";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { useAuthSessionStore } from "@/src/store/authSessionStore";
import {
  colors,
  componentSizes,
  radius,
  spacing,
  typography,
} from "@/src/theme/tokens";
import { getFinancialDateKey } from "@/src/utils/date";
import { parseLkrToMinorUnits } from "@/src/utils/money";

type InitialSetupFormValues = {
  wallet: {
    name: string;
    openingBalance: string;
    openingDate: string;
  };
  dailySpendingLimit: string;
  bankAccounts: {
    name: string;
    bankName: string;
    openingBalance: string;
    openingDate: string;
  }[];
};

function getInitialSetupErrorMessage(error: unknown): string {
  // Handle Firestore and Firebase error codes.
  const errorCode =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  switch (errorCode) {
    case "permission-denied":
      return "Unable to save your setup because access was denied. Please check your connection or try again later.";

    case "unauthenticated":
      return "Your session has expired. Please sign in again.";

    case "unavailable":
    case "deadline-exceeded":
    case "network-request-failed":
      return "Unable to connect to the server. Please check your internet connection.";

    case "aborted":
      return "The setup could not be completed. Please try again.";

    case "already-exists":
      return "Your initial setup has already been completed.";

    default:
      break;
  }

  // Display the first Zod validation issue when available.
  if (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray(error.issues)
  ) {
    const firstIssue = error.issues[0];

    if (
      typeof firstIssue === "object" &&
      firstIssue !== null &&
      "message" in firstIssue &&
      typeof firstIssue.message === "string"
    ) {
      return firstIssue.message;
    }
  }

  if (error instanceof Error) {
    switch (error.message) {
      case "Initial setup has already been completed.":
        return "Your initial setup has already been completed.";

      case "Account documents already exist. Initial setup cannot be repeated.":
        return "Account information already exists. Initial setup cannot be repeated.";

      case "Invalid LKR amount format.":
        return "Please enter valid LKR amounts with up to two decimal places.";

      case "LKR amount exceeds the supported range.":
        return "One of the entered amounts exceeds the supported limit.";

      default:
        break;
    }
  }

  return "Unable to complete your initial setup. Please try again.";
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "decimal-pad";
  editable?: boolean;
}) {
  const theme = useColorScheme();
  const themeColors = colors[theme];

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: themeColors.text }]}>{label}</Text>

      <TextInput
        style={[
          styles.input,
          {
            color: themeColors.text,
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={themeColors.textSecondary}
        keyboardType={keyboardType}
        autoCapitalize="none"
        editable={editable}
      />
    </View>
  );
}

export default function InitialSetupScreen() {
  const theme = useColorScheme();
  const themeColors = colors[theme];

  const completeSetup = useAuthSessionStore((state) => state.completeSetup);

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<InitialSetupFormValues>({
    defaultValues: {
      wallet: {
        name: "My Wallet",
        openingBalance: "0.00",
        openingDate: getFinancialDateKey(),
      },
      dailySpendingLimit: "",
      bankAccounts: [],
    },
  });

  const {
    fields: bankFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "bankAccounts",
  });

  /**
   * Convert the form's LKR strings into integer minor units,
   * initialize predefined categories, validate through the
   * application use case, and save the initial setup.
   */
  const onSubmit = async (values: InitialSetupFormValues) => {
    setSubmissionError(null);

    try {
      const setupInput = {
        wallet: {
          name: values.wallet.name,
          openingBalance: parseLkrToMinorUnits(values.wallet.openingBalance),
          openingDate: values.wallet.openingDate,
        },

        dailySpendingLimit: parseLkrToMinorUnits(values.dailySpendingLimit),

        bankAccounts: values.bankAccounts.map((account) => ({
          name: account.name,
          bankName: account.bankName,
          openingBalance: parseLkrToMinorUnits(account.openingBalance),
          openingDate: account.openingDate,
        })),
      };

      // Ensure all predefined categories exist before saving
      // the user's initial financial setup.
      await initializeDefaultCategories(categoryRepository);

      // The application layer validates the input and delegates
      // persistence to the injected data-layer operation.
      await completeInitialSetup(setupInput, saveInitialSetup);

      // Only mark setup as complete after Firestore succeeds.
      completeSetup();

      // The existing setup route guard observes this state change
      // and redirects the user to the Dashboard.
    } catch (error) {
      setSubmissionError(getInitialSetupErrorMessage(error));
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenContainer scrollable contentStyle={styles.screenContent}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardContainer}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text }]}>
              Set up your finances
            </Text>

            <Text
              style={[styles.subtitle, { color: themeColors.textSecondary }]}
            >
              Add your starting balances and daily spending limit to get
              started.
            </Text>
          </View>

          <View style={styles.form}>
            {/* Wallet details */}
            <AppCard>
              <View style={styles.sectionHeader}>
                <Text
                  style={[styles.sectionTitle, { color: themeColors.text }]}
                >
                  My wallet
                </Text>

                <Text
                  style={[
                    styles.sectionDescription,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Your primary cash account.
                </Text>
              </View>

              <Controller
                control={control}
                name="wallet.name"
                render={({ field }) => (
                  <FormField
                    label="Wallet name"
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder="My Wallet"
                    editable={!isSubmitting}
                  />
                )}
              />

              <Controller
                control={control}
                name="wallet.openingBalance"
                render={({ field }) => (
                  <FormField
                    label="Opening balance (LKR)"
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    editable={!isSubmitting}
                  />
                )}
              />

              <Controller
                control={control}
                name="wallet.openingDate"
                render={({ field }) => (
                  <FormField
                    label="Opening date"
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder="YYYY-MM-DD"
                    editable={!isSubmitting}
                  />
                )}
              />
            </AppCard>

            {/* Daily spending limit */}
            <AppCard>
              <View style={styles.sectionHeader}>
                <Text
                  style={[styles.sectionTitle, { color: themeColors.text }]}
                >
                  Daily spending limit
                </Text>

                <Text
                  style={[
                    styles.sectionDescription,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Set your daily expense warning limit.
                </Text>
              </View>

              <Controller
                control={control}
                name="dailySpendingLimit"
                render={({ field }) => (
                  <FormField
                    label="Daily limit (LKR)"
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder="For example, 5000.00"
                    keyboardType="decimal-pad"
                    editable={!isSubmitting}
                  />
                )}
              />
            </AppCard>

            {/* Optional bank accounts */}
            <AppCard>
              <View style={styles.sectionHeader}>
                <Text
                  style={[styles.sectionTitle, { color: themeColors.text }]}
                >
                  Bank accounts
                </Text>

                <Text
                  style={[
                    styles.sectionDescription,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Optional. You can also add bank accounts later.
                </Text>
              </View>

              {bankFields.map((item, index) => (
                <View key={item.id} style={styles.bankAccount}>
                  <View style={styles.bankHeader}>
                    <Text
                      style={[styles.bankTitle, { color: themeColors.text }]}
                    >
                      Bank account {index + 1}
                    </Text>

                    <Pressable
                      onPress={() => remove(index)}
                      disabled={isSubmitting}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove bank account ${index + 1}`}
                    >
                      <Text
                        style={[
                          styles.removeText,
                          { color: themeColors.danger },
                        ]}
                      >
                        Remove
                      </Text>
                    </Pressable>
                  </View>

                  <Controller
                    control={control}
                    name={`bankAccounts.${index}.name`}
                    render={({ field }) => (
                      <FormField
                        label="Account name"
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholder="For example, Savings"
                        editable={!isSubmitting}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={`bankAccounts.${index}.bankName`}
                    render={({ field }) => (
                      <FormField
                        label="Bank name (optional)"
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholder="For example, Commercial Bank"
                        editable={!isSubmitting}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={`bankAccounts.${index}.openingBalance`}
                    render={({ field }) => (
                      <FormField
                        label="Opening balance (LKR)"
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        editable={!isSubmitting}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={`bankAccounts.${index}.openingDate`}
                    render={({ field }) => (
                      <FormField
                        label="Opening date"
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholder="YYYY-MM-DD"
                        editable={!isSubmitting}
                      />
                    )}
                  />
                </View>
              ))}

              <AppButton
                variant="outline"
                disabled={isSubmitting}
                onPress={() =>
                  append({
                    name: "",
                    bankName: "",
                    openingBalance: "0.00",
                    openingDate: getFinancialDateKey(),
                  })
                }
              >
                + Add bank account
              </AppButton>
            </AppCard>

            {submissionError && (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {submissionError}
              </Text>
            )}

            <AppButton
              disabled={isSubmitting}
              onPress={() => void handleSubmit(onSubmit)()}
            >
              {isSubmitting ? "Setting up..." : "Complete setup"}
            </AppButton>

            {isSubmitting && (
              <ActivityIndicator
                color={themeColors.primary}
                style={styles.loadingIndicator}
              />
            )}

            <Text
              style={[styles.footerNote, { color: themeColors.textSecondary }]}
            >
              All monetary amounts are recorded in LKR.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: spacing.xxxl,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.size.md,
    lineHeight: 24,
  },
  form: {
    gap: spacing.lg,
  },
  sectionHeader: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
  },
  sectionDescription: {
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  field: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  input: {
    minHeight: componentSizes.inputHeight,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.size.md,
  },
  bankAccount: {
    borderTopWidth: 1,
    borderTopColor: "#E2E7E3",
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  bankHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  bankTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  removeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  errorText: {
    color: "#D64545",
    fontSize: typography.size.sm,
  },
  loadingIndicator: {
    marginTop: -spacing.sm,
  },
  footerNote: {
    fontSize: typography.size.xs,
    textAlign: "center",
  },
});
