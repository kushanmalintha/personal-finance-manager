import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from "react-native";

import { useColorScheme } from "@/src/hooks/useColorScheme";
import { colors, radius, componentSizes, typography } from "@/src/theme/tokens";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

interface AppButtonProps {
  children: string;
  onPress: PressableProps["onPress"];
  variant?: ButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

export function AppButton({
  children,
  onPress,
  variant = "primary",
  disabled = false,
  fullWidth = true,
  accessibilityLabel,
}: AppButtonProps) {
  const theme = useColorScheme();
  const themeColors = colors[theme];

  const backgroundColor = {
    primary: themeColors.primary,
    secondary: themeColors.surfaceSecondary,
    outline: "transparent",
    danger: themeColors.danger,
  }[variant];

  const textColor = {
    primary: "#FFFFFF",
    secondary: themeColors.text,
    outline: themeColors.primary,
    danger: "#FFFFFF",
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? children}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor: themeColors.border,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
        variant === "outline" && styles.outline,
        fullWidth && styles.fullWidth,
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: componentSizes.buttonHeight,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  outline: {
    borderWidth: 1,
  },
  fullWidth: {
    width: "100%",
  },
  text: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
});
