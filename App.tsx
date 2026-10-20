import React, { Component, useEffect, ErrorInfo, ReactNode } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Amiri_400Regular,
  Amiri_700Bold,
} from "@expo-google-fonts/amiri";
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { usePreferencesStore } from "./src/store/preferencesStore";
import { useSettingsStore } from "./src/store/settingsStore";
import { NotificationService } from "./src/services/notifications/NotificationService";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>تطبيق أَثَر الإسلامي</Text>
          <Text style={errorStyles.subtitle}>حدث خطأ غير متوقع أثناء التحميل</Text>
          <Text style={errorStyles.errorDetails}>
            {this.state.error?.message || "يرجى إعادة المحاولة"}
          </Text>
          <TouchableOpacity style={errorStyles.button} onPress={this.handleRestart}>
            <Text style={errorStyles.buttonText}>إعادة تشغيل التطبيق</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { isDarkMode, loadPreferences } = usePreferencesStore();
  const { loadSettings, rescheduleNotifications } = useSettingsStore();

  const [fontsLoaded, fontError] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
  });

  useEffect(() => {
    async function init() {
      try {
        await loadPreferences();
      } catch (e) {
        console.warn("Preferences load warning:", e);
      }
      try {
        await loadSettings();
      } catch (e) {
        console.warn("Settings load warning:", e);
      }
      try {
        await NotificationService.initialize();
      } catch (e) {
        console.warn("Notification init warning:", e);
      }
      try {
        await rescheduleNotifications();
      } catch (e) {
        console.warn("Reschedule warning:", e);
      }
    }
    init();
  }, []);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={splashStyles.container}>
        <StatusBar style="light" />
        <View style={splashStyles.logoBox}>
          <Image
            source={require("./assets/icon.png")}
            style={splashStyles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={splashStyles.appName}>أَثَر</Text>
        <Text style={splashStyles.appSubtitle}>منصة المعرفة والهدى الإسلامية</Text>
        <View style={splashStyles.loadingRow}>
          <ActivityIndicator size="small" color="#10b981" />
          <Text style={splashStyles.loadingText}>جاري تجهيز التطبيق...</Text>
        </View>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <AppNavigator />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090d16",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logoBox: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  appName: {
    color: "#10b981",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 6,
    letterSpacing: 1,
  },
  appSubtitle: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 36,
  },
  loadingRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#64748b",
    fontSize: 13,
  },
});

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090d16",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#10b981",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#f8fafc",
    fontSize: 16,
    marginBottom: 12,
  },
  errorDetails: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#10b981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
