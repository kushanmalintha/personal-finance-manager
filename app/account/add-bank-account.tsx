import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppCard } from "@/src/components/common/AppCard";
import { ScreenContainer } from "@/src/components/common/ScreenContainer";
import { addBankAccount } from "@/src/features/accounts/application/addBankAccount";
import {
    type AddBankAccountInput
} from "@/src/features/accounts/application/addBankAccountSchema";
import { createBankAccount } from "@/src/features/accounts/data/accountRepository";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import {
    colors,
    componentSizes,
    radius,
    spacing,
    typography,
} from "@/src/theme/tokens";
import { getFinancialDateKey } from "@/src/utils/date";
import { parseLkrToMinorUnits } from "@/src/utils/money";

type BankAccountFormValues = {
  name: string;
  bankName: string;
  openingBalance: string;
  openingDate: string;
};

type FormFieldName = keyof BankAccountFormValues;

function getSubmissionErrorMessage(error: unknown): string {
  const errorCode =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  switch (errorCode) {
    case "permission-denied":
      return "Access denied. Please check your account permissions.";

    case "unauthenticated":
      return "Your session has expired. Please sign in again.";

    case "unavailable":
    case "deadline-exceeded":
    case "network-request-failed":
      return "Unable to connect to the server. Please check your internet connection.";

    default:
      return "Unable to add the bank account. Please try again.";
  }
}

function FormField({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  keyboardType = "default",
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur: () => void;
  placeholder: string;
  error?: string;
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
            borderColor: error ? themeColors.danger : themeColors.border,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={themeColors.textSecondary}
        keyboardType={keyboardType}
        autoCapitalize="none"
        editable={editable}
        accessibilityLabel={label}
      />

      {error && (
        <Text style={[styles.errorText, { color: themeColors.danger }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

export default function AddBankAccountScreen() {
  const router = useRouter();

  const theme = useColorScheme();
  const themeColors = colors[theme];

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<BankAccountFormValues>({
    defaultValues: {
      name: "",
      bankName: "",
      openingBalance: "0.00",
      openingDate: getFinancialDateKey(),
    },
  });

  const onSubmit = async (values: BankAccountFormValues) => {
    setSubmissionError(null);
    clearErrors();

    try {
      const input: AddBankAccountInput = {
        name: values.name,
        bankName: values.bankName,
        openingBalance: parseLkrToMinorUnits(values.openingBalance),
        openingDate: values.openingDate,
      };

      await addBankAccount(input, createBankAccount);

      // Return to the Accounts screen only after Firestore succeeds.
      router.back();
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "issues" in error &&
        Array.isArray(error.issues)
      ) {
        let hasFieldError = false;

        for (const issue of error.issues) {
          if (
            typeof issue === "object" &&
            issue !== null &&
            "path" in issue &&
            Array.isArray(issue.path) &&
            "message" in issue &&
            typeof issue.message === "string"
          ) {
            const field = issue.path[0];

            if (
              field === "name" ||
              field === "bankName" ||
              field === "openingBalance" ||
              field === "openingDate"
            ) {
              setError(field, {
                type: "validate",
                message: issue.message,
              });

              hasFieldError = true;
            }
          }
        }

        if (!hasFieldError) {
          setSubmissionError("Please check the entered account information.");
        }

        return;
      }

      if (error instanceof Error) {
        if (error.message === "Invalid LKR amount format.") {
          setError("openingBalance", {
            type: "validate",
            message: "Enter a valid LKR amount with up to two decimal places.",
          });
          return;
        }

        if (error.message === "LKR amount exceeds the supported range.") {
          setError("openingBalance", {
            type: "validate",
            message: "The opening balance exceeds the supported limit.",
          });
          return;
        }
      }

      setSubmissionError(getSubmissionErrorMessage(error));
    }
  };

  function renderField(
    name: FormFieldName,
    label: string,
    placeholder: string,
    keyboardType: "default" | "decimal-pad" = "default",
  ) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <FormField
            label={label}
            value={field.value}
            onChangeText={(value) => {
              setSubmissionError(null);
              field.onChange(value);
            }}
            onBlur={field.onBlur}
            placeholder={placeholder}
            error={errors[name]?.message}
            keyboardType={keyboardType}
            editable={!isSubmitting}
          />
        )}
      />
    );
  }

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
              Add bank account
            </Text>

            <Text
              style={[styles.subtitle, { color: themeColors.textSecondary }]}
            >
              Add another bank account to keep track of its balance.
            </Text>
          </View>

          <AppCard>
            <View style={styles.form}>
              {renderField(
                "name",
                "Account name",
                "For example, Savings Account",
              )}

              {renderField(
                "bankName",
                "Bank name (optional)",
                "For example, Commercial Bank",
              )}

              {renderField(
                "openingBalance",
                "Opening balance (LKR)",
                "0.00",
                "decimal-pad",
              )}

              {renderField("openingDate", "Opening date", "YYYY-MM-DD")}

              <Text
                style={[
                  styles.helperText,
                  { color: themeColors.textSecondary },
                ]}
              >
                The opening date defines when balance tracking begins.
              </Text>
            </View>
          </AppCard>

          {submissionError && (
            <Text
              accessibilityRole="alert"
              style={[styles.errorText, { color: themeColors.danger }]}
            >
              {submissionError}
            </Text>
          )}

          <AppButton
            disabled={isSubmitting}
            onPress={() => {
              void handleSubmit(onSubmit)();
            }}
          >
            {isSubmitting ? "Adding account..." : "Add bank account"}
          </AppButton>

          {isSubmitting && (
            <ActivityIndicator
              color={themeColors.primary}
              style={styles.loadingIndicator}
            />
          )}

          <AppButton
            variant="outline"
            disabled={isSubmitting}
            onPress={() => router.back()}
          >
            Cancel
          </AppButton>
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
    gap: spacing.md,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  input: {
    minHeight: componentSizes.inputHeight,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.size.md,
  },
  helperText: {
    fontSize: typography.size.xs,
    lineHeight: 18,
  },
  errorText: {
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  loadingIndicator: {
    marginTop: -spacing.sm,
  },
});
