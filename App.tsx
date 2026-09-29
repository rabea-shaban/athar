import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Amiri_400Regular,
  Amiri_700Bold,
} from "@expo-google-fonts/amiri";
import { ActivityIndicator, View } from "react-native";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { usePreferencesStore } from "./src/store/preferencesStore";
import { useSettingsStore } from "./src/store/settingsStore";
import { NotificationService } from "./src/services/notifications/NotificationService";

export default function App() {
  const { isDarkMode, loadPreferences } = usePreferencesStore();
  const { loadSettings, rescheduleNotifications } = useSettingsStore();

  const [fontsLoaded] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
  });

  useEffect(() => {
    async function init() {
      await loadPreferences();
      await loadSettings();
      await NotificationService.initialize();
      await rescheduleNotifications();
    }
    init();
  }, []);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDarkMode ? "#090d16" : "#f8fafc",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
