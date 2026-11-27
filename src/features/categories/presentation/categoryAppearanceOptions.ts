/**
 * Emoji options available for category icons.
 */
export const CATEGORY_ICON_OPTIONS = [
  "🍽️",
  "🚗",
  "🛍️",
  "🏠",
  "💡",
  "🏥",
  "📚",
  "🎬",
  "👕",
  "👨‍👩‍👧",
  "✈️",
  "🏷️",
  "💼",
  "💻",
  "🏢",
  "📈",
  "🎁",
  "💰",
  "🏦",
  "🐷",
] as const;

/**
 * Colour options available for categories.
 */
export const CATEGORY_COLOR_OPTIONS = [
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#EC4899",
  "#64748B",
] as const;

/**
 * Default category appearance.
 */
export const DEFAULT_CATEGORY_APPEARANCE = {
  icon: "🏷️",
  color: "#64748B",
} as const;
