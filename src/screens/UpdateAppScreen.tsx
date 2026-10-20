/**
 * ATHAR — أَثَر
 * Islamic Knowledge & Guidance Platform
 *
 * Copyright (c) 2026 Rabea Shaban.
 * All rights reserved.
 *
 * Contact: rabea.elzayate@gmail.com
 * Website: https://rabea-shaban.com/
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Download, Sparkles, ChevronRight, ShieldAlert } from "lucide-react-native";
import Constants from "expo-constants";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";

export const UpdateAppScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const currentVersion = Constants.expoConfig?.version || "1.0.0";

  const {
    version = "1.1.0",
    minimumVersion = "1.0.0",
    storeUrl = "https://rabea-shaban.com/athar",
    forceUpdate = false,
    releaseNotes = "يتضمن هذا الإصدار تحسينات جديدة على محرك الأذان الأصلي، وإصلاحات لمواقيت الصلاة، مع تحسين الأداء وإضافة مزايا جديدة في المكتبة الإسلامية.",
  } = route.params || {};

  const isForceUpdate = forceUpdate === true || forceUpdate === "true";
  const isForceUpdateRequired =
    isForceUpdate && compareVersions(currentVersion, minimumVersion) < 0;

  const handleUpdatePress = () => {
    const targetUrl = storeUrl || "https://rabea-shaban.com/athar";
    Linking.openURL(targetUrl).catch((err) =>
      console.warn("Failed to open store URL:", err)
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.navBar,
          {
            backgroundColor: theme.card,
            borderBottomColor: theme.border,
            paddingTop: insets.top + 8,
          },
        ]}
      >
        {!isForceUpdateRequired ? (
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.border }]}
            onPress={() => navigation.goBack()}
          >
            <ChevronRight size={22} color={theme.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}

        <Text style={[styles.navTitle, { color: theme.text }]}>
          تحديث تطبيق أَثَر
        </Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Icon Header */}
        <View style={styles.headerBox}>
          <View style={styles.logoCircle}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            إصدار جديد متاح الآن 🌙
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            تحديث رقم {version} متوفر لمنصة أَثَر
          </Text>
        </View>

        {/* Version Comparison Card */}
        <View
          style={[
            styles.versionCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.versionRow}>
            <View style={styles.versionCol}>
              <Text style={[styles.versionLabel, { color: theme.textMuted }]}>
                الإصدار الجديد
              </Text>
              <Text style={[styles.versionVal, { color: theme.primary }]}>
                v{version}
              </Text>
            </View>

            <View
              style={[styles.divider, { backgroundColor: theme.border }]}
            />

            <View style={styles.versionCol}>
              <Text style={[styles.versionLabel, { color: theme.textMuted }]}>
                الإصدار الحالي
              </Text>
              <Text style={[styles.versionVal, { color: theme.text }]}>
                v{currentVersion}
              </Text>
            </View>
          </View>
        </View>

        {/* Force Update Alert Banner */}
        {isForceUpdateRequired && (
          <View style={styles.forceBanner}>
            <ShieldAlert size={20} color="#ef4444" />
            <Text style={styles.forceBannerText}>
              يتطلب هذا التحديث الهام المواصلة للاستفادة من تحسينات الخدمة.
            </Text>
          </View>
        )}

        {/* Release Notes Card */}
        <View
          style={[
            styles.notesCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.notesHeader}>
            <Text style={[styles.notesTitle, { color: theme.text }]}>
              ما الجديد في هذا الإصدار؟
            </Text>
            <Sparkles size={18} color={theme.accentGold} />
          </View>

          <Text style={[styles.notesText, { color: theme.textMuted }]}>
            {releaseNotes}
          </Text>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={[styles.updateBtn, { backgroundColor: theme.primary }]}
          onPress={handleUpdatePress}
          activeOpacity={0.8}
        >
          <Download size={20} color="#ffffff" />
          <Text style={styles.updateBtnText}>تحديث التطبيق الآن</Text>
        </TouchableOpacity>

        {!isForceUpdateRequired && (
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.skipBtnText, { color: theme.textMuted }]}>
              متابعة استخدام التطبيق لاحقاً
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

function compareVersions(v1: string, v2: string): number {
  const p1 = v1.split(".").map(Number);
  const p2 = v2.split(".").map(Number);
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  headerBox: {
    alignItems: "center",
    paddingVertical: 10,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: "rgba(16,185,129,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  versionCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  versionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  versionCol: {
    alignItems: "center",
  },
  versionLabel: {
    fontSize: 11,
  },
  versionVal: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 32,
  },
  forceBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  forceBannerText: {
    color: "#991b1b",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  notesCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  notesHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  notesText: {
    fontSize: 13,
    lineHeight: 22,
    textAlign: "right",
  },
  updateBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  updateBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  skipBtnText: {
    fontSize: 13,
  },
});
