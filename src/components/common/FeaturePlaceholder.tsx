import { StyleSheet, Text } from "react-native";

import { ScreenContainer } from "@/src/components/common/ScreenContainer";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { colors, spacing, typography } from "@/src/theme/tokens";

type FeaturePlaceholderProps = {
  title: string;
  description: string;
};

export function FeaturePlaceholder({
  title,
  description,
}: FeaturePlaceholderProps) {
  const theme = useColorScheme();
  const themeColors = colors[theme];

  return (
    <ScreenContainer contentStyle={styles.container}>
      <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>

      <Text style={[styles.description, { color: themeColors.textSecondary }]}>
        {description}
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    textAlign: "center",
  },
  description: {
    fontSize: typography.size.md,
    lineHeight: 24,
    textAlign: "center",
  },
});
