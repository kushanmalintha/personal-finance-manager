export const colors = {
  light: {
    background: "#F7F8FA",
    surface: "#FFFFFF",
    surfaceSecondary: "#F0F2F5",
    primary: "#16845B",
    primaryLight: "#E5F4ED",
    text: "#17211C",
    textSecondary: "#68736D",
    border: "#E2E7E3",
    danger: "#D64545",
    success: "#16845B",
    warning: "#D99120",
    disabled: "#AAB3AE",
  },

  dark: {
    background: "#101713",
    surface: "#19221D",
    surfaceSecondary: "#222D26",
    primary: "#43B982",
    primaryLight: "#203D30",
    text: "#F0F5F1",
    textSecondary: "#A4B0A8",
    border: "#344139",
    danger: "#F07171",
    success: "#43B982",
    warning: "#E9B45B",
    disabled: "#65736A",
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const typography = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 32,
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

export const componentSizes = {
  buttonHeight: 48,
  inputHeight: 50,
  iconButtonSize: 44,
} as const;
