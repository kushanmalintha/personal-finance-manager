import { Stack } from "expo-router";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
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
import { initialSetupSchema } from "@/src/features/accounts/application/initialSetupSchema";
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

  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<InitialSetupFormValues>({
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

  const onSubmit = (values: InitialSetupFormValues) => {
    setValidationError(null);
    setValidationMessage(null);

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

      const result = initialSetupSchema.safeParse(setupInput);

      if (!result.success) {
        setValidationError(
          result.error.issues[0]?.message ?? "Please check your details.",
        );
        return;
      }

      setValidationMessage(
        "Your setup details are valid. They are ready to be saved.",
      );
    } catch {
      setValidationError(
        "Please enter valid LKR amounts with up to two decimal places.",
      );
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
                      />
                    )}
                  />
                </View>
              ))}

              <AppButton
                variant="outline"
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

            {validationError && (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {validationError}
              </Text>
            )}

            {validationMessage && (
              <Text
                accessibilityRole="status"
                style={[styles.successText, { color: themeColors.success }]}
              >
                {validationMessage}
              </Text>
            )}

            <AppButton onPress={() => void handleSubmit(onSubmit)()}>
              Validate setup details
            </AppButton>

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
    color: "#17211C",
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
  successText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  footerNote: {
    fontSize: typography.size.xs,
    textAlign: "center",
  },
});
