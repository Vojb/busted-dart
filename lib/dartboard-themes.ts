// Dartboard Color Themes
// Each theme defines colors for:
// - singleBlack: Black segments (single zone)
// - singleCream: Cream/white segments (single zone)
// - doubleTripleRed: Red segments (double/triple rings on black segments)
// - doubleTripleGreen: Green segments (double/triple rings on cream segments)
// - outerBull: Outer bull (25) color
// - bull: Inner bull (50) color

import type { DartboardColorTheme, DartboardThemeColors } from "./storage"

export const DARTBOARD_THEMES: Record<DartboardColorTheme, DartboardThemeColors> = {
  classic: {
    singleBlack: "#1a1a1a",
    singleCream: "#f5f5dc",
    doubleTripleRed: "#dc2626",
    doubleTripleGreen: "#16a34a",
    outerBull: "#16a34a",
    bull: "#dc2626",
  },
  vibrant: {
    singleBlack: "#0a0a0a",
    singleCream: "#fffef0",
    doubleTripleRed: "#ef4444",
    doubleTripleGreen: "#22c55e",
    outerBull: "#22c55e",
    bull: "#ef4444",
  },
  muted: {
    singleBlack: "#2a2a2a",
    singleCream: "#e8e8d8",
    doubleTripleRed: "#b91c1c",
    doubleTripleGreen: "#15803d",
    outerBull: "#15803d",
    bull: "#b91c1c",
  },
  neon: {
    singleBlack: "#0a0a0f",
    singleCream: "#ff00ff",
    doubleTripleRed: "#d946ef",
    doubleTripleGreen: "#00d9ff",
    outerBull: "#00d9ff",
    bull: "#d946ef",
  },
  dark: {
    singleBlack: "#1a1a1a",
    singleCream: "#3b3b3b",
    doubleTripleRed: "#9a1919",
    doubleTripleGreen: "#0a4d22",
    outerBull: "#0b4d22",
    bull: "#9a1919",
  },
  midnight: {
    singleBlack: "#000000",
    singleCream: "#1a1a1a",
    doubleTripleRed: "#7f1d1d",
    doubleTripleGreen: "#14532d",
    outerBull: "#14532d",
    bull: "#7f1d1d",
  },
}

export function getDartboardThemeColors(theme: DartboardColorTheme, customColors?: DartboardThemeColors): DartboardThemeColors {
  if (theme === "custom" && customColors) {
    return customColors
  }
  return DARTBOARD_THEMES[theme]
}

