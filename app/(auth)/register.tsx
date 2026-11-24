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
    registerSchema,
    type RegisterInput,
} from "@/src/features/auth/application/registerSchema";
import { registerUser } from "@/src/features/auth/application/registerUser";
import { registerWithEmail } from "@/src/features/auth/data/authService";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import {
    colors,
    componentSizes,
    radius,
    spacing,
    typography,
} from "@/src/theme/tokens";

function getRegistrationErrorMessage(error: unknown): string {
  const errorCode =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  switch (errorCode) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/weak-password":
      return "Please choose a stronger password.";

    case "auth/operation-not-allowed":
      return "Email registration is currently unavailable.";

    case "auth/network-request-failed":
      return "Unable to connect. Please check your internet connection.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    default:
      return "Unable to create your account. Please try again.";
  }
}

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useColorScheme();
  const themeColors = colors[theme];

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    if (isSubmitting) return;

    setServerError(null);
    setIsSubmitting(true);

    try {
      await registerUser(values, registerWithEmail);

      // The authentication route guard observes the new session
      // and redirects to the root entry route automatically.
    } catch (error) {
      setServerError(getRegistrationErrorMessage(error));
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
              Create account
            </Text>

            <Text
              style={[styles.subtitle, { color: themeColors.textSecondary }]}
            >
              Get started with managing your personal finances.
            </Text>
          </View>

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
                    placeholder="Enter your email"
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

            <View style={styles.field}>
              <Text style={[styles.label, { color: themeColors.text }]}>
                Password
              </Text>

              <View
                style={[
                  styles.passwordContainer,
                  {
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.passwordInput,
                        { color: themeColors.text },
                      ]}
                      placeholder="Create a password"
                      placeholderTextColor={themeColors.textSecondary}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="new-password"
                      textContentType="newPassword"
                      editable={!isSubmitting}
                      value={value}
                      onChangeText={(text) => {
                        setServerError(null);
                        onChange(text);
                      }}
                      onBlur={onBlur}
                      accessibilityLabel="Password"
                    />
                  )}
                />

                <Pressable
                  onPress={() => setShowPassword((current) => !current)}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                  hitSlop={8}
                >
                  <Text
                    style={[
                      styles.passwordToggle,
                      { color: themeColors.primary },
                    ]}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>

              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}

              <Text
                style={[
                  styles.helperText,
                  { color: themeColors.textSecondary },
                ]}
              >
                Use at least 6 characters.
              </Text>
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
              {isSubmitting ? "Creating account..." : "Create account"}
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
              <Text style={[styles.backText, { color: themeColors.primary }]}>
                Already have an account? Sign in
              </Text>
            </Pressable>
          </View>
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
  passwordContainer: {
    height: componentSizes.inputHeight,
    borderWidth: 1,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    fontSize: typography.size.md,
  },
  passwordToggle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    paddingLeft: spacing.sm,
  },
  helperText: {
    fontSize: typography.size.xs,
  },
  errorText: {
    color: "#D64545",
    fontSize: typography.size.sm,
  },
  loadingIndicator: {
    marginTop: -spacing.sm,
  },
  backButton: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  backText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
});
