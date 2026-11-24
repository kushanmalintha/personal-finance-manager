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
    loginSchema,
    type LoginInput,
} from "@/src/features/auth/application/loginSchema";
import { loginUser } from "@/src/features/auth/application/loginUser";
import { loginWithEmail } from "@/src/features/auth/data/authService";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import {
    colors,
    componentSizes,
    radius,
    spacing,
    typography,
} from "@/src/theme/tokens";

function getLoginErrorMessage(error: unknown): string {
  const errorCode =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  switch (errorCode) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Unable to connect. Please check your internet connection.";

    case "auth/operation-not-allowed":
      return "Email and password login is currently unavailable.";

    default:
      return "Unable to sign in. Please try again.";
  }
}

export default function LoginScreen() {
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
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginInput) => {
    if (isSubmitting) return;

    setServerError(null);
    setIsSubmitting(true);

    try {
      await loginUser(values, loginWithEmail);

      // Navigation will be handled by the authentication gate
      // in the later authentication and navigation tasks.
    } catch (error) {
      setServerError(getLoginErrorMessage(error));
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
              Welcome back
            </Text>

            <Text
              style={[styles.subtitle, { color: themeColors.textSecondary }]}
            >
              Sign in to manage your personal finances.
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
                      placeholder="Enter your password"
                      placeholderTextColor={themeColors.textSecondary}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="current-password"
                      textContentType="password"
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
            </View>

            <Pressable
              onPress={() => {
                router.push("/(auth)/forgot-password");
              }}
              disabled={isSubmitting}
              style={styles.forgotPassword}
              accessibilityRole="button"
            >
              <Text style={[styles.linkText, { color: themeColors.primary }]}>
                Forgot password?
              </Text>
            </Pressable>

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
              {isSubmitting ? "Signing in..." : "Sign in"}
            </AppButton>

            {isSubmitting && (
              <ActivityIndicator
                color={themeColors.primary}
                style={styles.loadingIndicator}
              />
            )}

            <Pressable
              onPress={() => router.push("/(auth)/register")}
              disabled={isSubmitting}
              style={styles.registerButton}
              accessibilityRole="button"
            >
              <Text style={[styles.linkText, { color: themeColors.primary }]}>
                Don't have an account? Create one
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
  forgotPassword: {
    alignSelf: "flex-end",
  },
  registerButton: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  linkText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  errorText: {
    color: "#D64545",
    fontSize: typography.size.sm,
  },
  loadingIndicator: {
    marginTop: -spacing.sm,
  },
});
