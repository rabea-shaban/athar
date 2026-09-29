export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentGold: string;
  background: string;
  card: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  textSecondary: string;
  border: string;
  divider: string;
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
  success: string;
  badgeBg: string;
  badgeText: string;
  audioPlayerBg: string;
}

export const lightTheme: ThemeColors = {
  primary: "#1a5d44",
  primaryLight: "#2e7d5d",
  primaryDark: "#134633",
  accent: "#10b981",
  accentGold: "#d97706",
  background: "#f8fafc",
  card: "#ffffff",
  cardBorder: "#e2e8f0",
  text: "#0f172a",
  textMuted: "#64748b",
  textSecondary: "#334155",
  border: "#e2e8f0",
  divider: "#f1f5f9",
  tabBar: "#ffffff",
  tabBarActive: "#1a5d44",
  tabBarInactive: "#94a3b8",
  success: "#16a34a",
  badgeBg: "#ecfdf5",
  badgeText: "#065f46",
  audioPlayerBg: "#0f172a",
};

export const darkTheme: ThemeColors = {
  primary: "#10b981",
  primaryLight: "#34d399",
  primaryDark: "#059669",
  accent: "#34d399",
  accentGold: "#fbbf24",
  background: "#090d16",
  card: "#131d2a",
  cardBorder: "#1e293b",
  text: "#f8fafc",
  textMuted: "#94a3b8",
  textSecondary: "#cbd5e1",
  border: "#1e293b",
  divider: "#172233",
  tabBar: "#0c131f",
  tabBarActive: "#34d399",
  tabBarInactive: "#64748b",
  success: "#22c55e",
  badgeBg: "#064e3b",
  badgeText: "#6ee7b7",
  audioPlayerBg: "#080c14",
};

export const FONTS = {
  amiri: "Amiri_400Regular",
  amiriBold: "Amiri_700Bold",
  regular: undefined,
  bold: undefined,
};
