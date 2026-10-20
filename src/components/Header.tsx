import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Moon, Sun, Search, Bell, Info } from "lucide-react-native";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onSearchPress?: () => void;
  onBellPress?: () => void;
  onInfoPress?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title = "أَثَر",
  subtitle = "منصة المعرفة الإسلامية",
  onSearchPress,
  onBellPress,
  onInfoPress,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const { isDarkMode, toggleTheme } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: theme.card,
          borderBottomColor: theme.border,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.border }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            {isDarkMode ? (
              <Sun size={18} color={theme.accentGold} />
            ) : (
              <Moon size={18} color={theme.text} />
            )}
          </TouchableOpacity>

          {onBellPress && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.border }]}
              onPress={onBellPress}
              activeOpacity={0.7}
            >
              <Bell size={18} color={theme.primary} />
            </TouchableOpacity>
          )}

          {onInfoPress && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.border }]}
              onPress={onInfoPress}
              activeOpacity={0.7}
            >
              <Info size={18} color={theme.text} />
            </TouchableOpacity>
          )}

          {onSearchPress && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.border }]}
              onPress={onSearchPress}
              activeOpacity={0.7}
            >
              <Search size={18} color={theme.text} />
            </TouchableOpacity>
          )}

          {rightAction}
        </View>

        <View style={styles.titleContainer}>
          <View style={styles.logoRow}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          </View>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "flex-end",
  },
  logoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
