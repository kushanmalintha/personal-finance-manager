import {
  View,
  StyleSheet,
  type ViewProps,
} from "react-native";

import { useColorScheme } from "@/src/hooks/useColorScheme";
import { colors, radius, spacing } from "@/src/theme/tokens";

interface AppCardProps extends ViewProps {
  children: React.ReactNode;
  padding?: keyof typeof spacing;
}

export function AppCard({
  children,
  padding = "lg",
  style,
  ...rest
}: AppCardProps) {
  const theme = useColorScheme();
  const themeColors = colors[theme];

  return (
    <View
      {...rest}
      style={[
        styles.card,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
          padding: spacing[padding],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
  },
});
