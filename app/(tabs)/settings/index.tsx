import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/src/components/common/AppCard";
import { ScreenContainer } from "@/src/components/common/ScreenContainer";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

export default function SettingsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = colors[scheme];

  function openCategories() {
    router.push("/(tabs)/settings/categories");
  }

  return (
    <ScreenContainer scrollable contentStyle={styles.screen}>
      <View style={styles.heading}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Manage your application preferences and configurations.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Finance Management
      </Text>

      <Pressable
        onPress={openCategories}
        accessibilityRole="button"
        accessibilityLabel="Manage categories"
      >
        <AppCard padding="lg">
          <View style={styles.settingRow}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.primaryLight },
              ]}
            >
              <Text style={styles.icon}>🏷️</Text>
            </View>

            <View style={styles.settingDetails}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                Categories
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: theme.textSecondary },
                ]}
              >
                Create, edit, and manage income and expense categories.
              </Text>
            </View>

            <Text style={[styles.arrow, { color: theme.textSecondary }]}>
              ›
            </Text>
          </View>
        </AppCard>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  heading: {
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    fontSize: typography.size.sm,
    lineHeight: 21,
  },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 23,
  },
  settingDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  settingTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  settingDescription: {
    fontSize: typography.size.xs,
    lineHeight: 18,
  },
  arrow: {
    fontSize: 28,
  },
});
