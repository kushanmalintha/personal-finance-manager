import {
    ScrollView,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { useColorScheme } from "@/src/hooks/useColorScheme";
import { colors, spacing } from "@/src/theme/tokens";

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
}

export function ScreenContainer({
  children,
  scrollable = false,
  edges,
  contentStyle,
}: ScreenContainerProps) {
  const theme = useColorScheme();
  const backgroundColor = colors[theme].background;

  return (
    <SafeAreaView edges={edges} style={[styles.container, { backgroundColor }]}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
  },
});
