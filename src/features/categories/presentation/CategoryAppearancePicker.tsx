import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColorScheme } from "@/src/hooks/useColorScheme";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

import {
    CATEGORY_COLOR_OPTIONS,
    CATEGORY_ICON_OPTIONS,
} from "./categoryAppearanceOptions";

interface CategoryAppearancePickerProps {
  icon: string;
  color: string;
  onIconChange: (icon: string) => void;
  onColorChange: (color: string) => void;
}

/**
 * Reusable picker for selecting a category emoji and colour.
 * The parent component controls the selected values.
 */
export function CategoryAppearancePicker({
  icon,
  color,
  onIconChange,
  onColorChange,
}: CategoryAppearancePickerProps) {
  const scheme = useColorScheme();
  const theme = colors[scheme ?? "light"];

  return (
    <View style={styles.container}>
      {/* Icon selection */}
      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>
          Choose an icon
        </Text>

        <View style={styles.iconGrid}>
          {CATEGORY_ICON_OPTIONS.map((option) => {
            const isSelected = icon === option;

            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityLabel={`Select ${option} icon`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => onIconChange(option)}
                style={[
                  styles.iconOption,
                  {
                    backgroundColor: isSelected
                      ? theme.primaryLight
                      : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text style={styles.emoji}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Colour selection */}
      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>
          Choose a colour
        </Text>

        <View style={styles.colorGrid}>
          {CATEGORY_COLOR_OPTIONS.map((option) => {
            const isSelected = color === option;

            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityLabel={`Select colour ${option}`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => onColorChange(option)}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: option,
                    borderColor: isSelected ? theme.text : "transparent",
                    borderWidth: isSelected ? 3 : 1,
                  },
                ]}
              >
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  heading: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  iconOption: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderRadius: radius.md,
  },
  emoji: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  colorOption: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: typography.weight.bold,
  },
});
