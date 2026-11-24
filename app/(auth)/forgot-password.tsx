import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { ScreenContainer } from "@/src/components/common/ScreenContainer";
import {
    passwordResetSchema,
    type PasswordResetInput,
} from "@/src/features/auth/application/passwordResetSchema";
import { requestPasswordReset } from "@/src/features/auth/application/requestPasswordReset";
import { sendPasswordReset } from "@/src/features/auth/data/authService";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import {
    colors,
    componentSizes,
    radius,
    spacing,
    typography,
} from "@/src/theme/tokens";

function getPasswordResetErrorMessage(error: unknown): string {
  const errorCode =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  switch (errorCode) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Unable to connect. Please check your internet connection.";

    case "auth/operation-not-allowed":
      return "Password reset is currently unavailable.";

    default:
      return "Unable to process your request. Please try again.";
  }
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useColorScheme();
  const themeColors = colors[theme];

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: PasswordResetInput) => {
    if (isSubmitting) return;

    setServerError(null);
    setIsSubmitting(true);

    try {
      await requestPasswordReset(values, sendPasswordReset);
      setRequestSent(true);
    } catch (error) {
      setServerError(getPasswordResetErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = [
    styles.input,
    {
      color: themeColors.text,
      backgroundColor: themeColors.surface,
      borderColor: themeColors.border,
    },
  ];

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
              Reset password
            </Text>

            <Text
              style={[styles.subtitle, { color: themeColors.textSecondary }]}
            >
              Enter your email address and we'll send instructions to reset your
              password.
            </Text>
          </View>

          {requestSent ? (
            <View style={styles.successContainer}>
              <Text
                style={[styles.successMessage, { color: themeColors.text }]}
                accessibilityRole="alert"
              >
                If an account exists for this email address, you'll receive
                instructions to reset your password.
              </Text>

              <AppButton
                onPress={() => router.replace("/(auth)/login")}
                fullWidth
              >
                Back to sign in
              </AppButton>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: themeColors.text }]}>
                  Email address
                </Text>

                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={inputStyle}
                      placeholder="Enter your registered email"
                      placeholderTextColor={themeColors.textSecondary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      editable={!isSubmitting}
                      value={value}
                      onChangeText={(text) => {
                        setServerError(null);
                        onChange(text);
                      }}
                      onBlur={onBlur}
                      accessibilityLabel="Email address"
                    />
                  )}
                />

                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </View>

              {serverError && (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {serverError}
                </Text>
              )}

              <AppButton
                onPress={() => {
                  void handleSubmit(onSubmit)();
                }}
                disabled={isSubmitting}
                fullWidth
              >
                {isSubmitting ? "Sending instructions..." : "Send reset email"}
              </AppButton>

              {isSubmitting && (
                <ActivityIndicator
                  color={themeColors.primary}
                  style={styles.loadingIndicator}
                />
              )}

              <Pressable
                onPress={() => router.replace("/(auth)/login")}
                disabled={isSubmitting}
                style={styles.backButton}
                accessibilityRole="button"
              >
                <Text style={[styles.linkText, { color: themeColors.primary }]}>
                  Back to sign in
                </Text>
              </Pressable>
            </View>
          )}
        </KeyboardAvoidingView>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    justifyContent: "center",
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    marginBottom: spacing.xxl,
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
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  input: {
    height: componentSizes.inputHeight,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.size.md,
  },
  errorText: {
    color: "#D64545",
    fontSize: typography.size.sm,
  },
  successContainer: {
    gap: spacing.lg,
  },
  successMessage: {
    fontSize: typography.size.md,
    lineHeight: 24,
  },
  loadingIndicator: {
    marginTop: -spacing.sm,
  },
  backButton: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  linkText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
});
