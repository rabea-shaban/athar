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

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ChevronRight,
  Globe,
  Mail,
  GitBranch,
  Code,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Heart,
  Info,
} from "lucide-react-native";
import Constants from "expo-constants";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";

export const AboutScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [licensesExpanded, setLicensesExpanded] = useState(false);

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.warn("Failed to open link:", err)
    );
  };

  const thirdPartyLibraries = [
    { name: "React Native", license: "MIT License", copyright: "Meta Platforms, Inc." },
    { name: "Expo Framework", license: "MIT License", copyright: "650 Industries, Inc." },
    { name: "Adhan JS", license: "MIT License", copyright: "Batoul Apps" },
    { name: "Zustand State", license: "MIT License", copyright: "Paul Henschel & Contributors" },
    { name: "React Navigation", license: "MIT License", copyright: "React Navigation Contributors" },
    { name: "Lucide React Native", license: "ISC License", copyright: "Lucide Contributors" },
    { name: "AndroidX Media3", license: "Apache 2.0", copyright: "Google LLC / AOSP" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
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
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <ChevronRight size={22} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: theme.text }]}>
          عن تطبيق أَثَر
        </Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Logo & Header Section */}
        <View style={styles.brandCard}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.brandTitle, { color: theme.text }]}>
            أَثَر — ATHAR
          </Text>
          <Text style={[styles.brandSubtitle, { color: theme.primary }]}>
            منصة المعرفة والهدى الإسلامية
          </Text>
          <View
            style={[
              styles.versionBadge,
              { backgroundColor: "rgba(16,185,129,0.12)" },
            ]}
          >
            <Text style={[styles.versionText, { color: theme.primary }]}>
              الإصدار {appVersion}
            </Text>
          </View>
        </View>

        {/* Mission Statement Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              فكرة ورسالة المنصة
            </Text>
            <Info size={18} color={theme.primary} />
          </View>
          <Text style={[styles.cardDesc, { color: theme.textMuted }]}>
            تطبيق أَثَر هو منصة إسلامية شاملة تهدف إلى تقديم تجربة رقمية هادئة ونقية تجمع بين القرآن الكريم بالرسم العثماني، التفسير الميسر، الاستماع لكبار القراء، الإذاعات الإسلامية المباشرة، الأذكار مع السبحة الذكية، ومواقيت الصلاة الدقيقة.
          </Text>
        </View>

        {/* Developer & Ownership Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              الملكية والتطوير
            </Text>
            <ShieldCheck size={18} color={theme.primary} />
          </View>

          <View style={styles.ownerInfoBox}>
            <Text style={[styles.ownerName, { color: theme.text }]}>
              Rabea Shaban Ibrahem
            </Text>
            <Text style={[styles.ownerRole, { color: theme.primary }]}>
              Full Stack Software Engineer
            </Text>
          </View>

          <Text style={[styles.copyrightNoticeText, { color: theme.textMuted }]}>
            © 2026 ATHAR — جميع الحقوق محفوظة للأجزاء الأصلية المملوكة لصاحب المشروع.
          </Text>

          {/* Clickable Developer Links */}
          <View style={styles.linksContainer}>
            <TouchableOpacity
              style={[
                styles.linkBtn,
                { backgroundColor: isDarkMode ? "#172535" : "#f1f5f9" },
              ]}
              onPress={() => handleOpenLink("https://rabea-shaban.com/")}
            >
              <Globe size={16} color={theme.primary} />
              <Text style={[styles.linkText, { color: theme.text }]}>
                الموقع الرسمي: rabea-shaban.com
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.linkBtn,
                { backgroundColor: isDarkMode ? "#172535" : "#f1f5f9" },
              ]}
              onPress={() => handleOpenLink("mailto:rabea.elzayate@gmail.com")}
            >
              <Mail size={16} color={theme.primary} />
              <Text style={[styles.linkText, { color: theme.text }]}>
                البريد الإلكتروني: rabea.elzayate@gmail.com
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.linkBtn,
                { backgroundColor: isDarkMode ? "#172535" : "#f1f5f9" },
              ]}
              onPress={() =>
                handleOpenLink("https://github.com/rabea-shaban/athar")
              }
            >
              <GitBranch size={16} color={theme.primary} />
              <Text style={[styles.linkText, { color: theme.text }]}>
                مستودع المشروع على GitHub
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Open Source Licenses Accordion */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <TouchableOpacity
            style={styles.cardHeaderRow}
            onPress={() => setLicensesExpanded(!licensesExpanded)}
            activeOpacity={0.7}
          >
            {licensesExpanded ? (
              <ChevronUp size={18} color={theme.textMuted} />
            ) : (
              <ChevronDown size={18} color={theme.textMuted} />
            )}
            <View style={styles.licenseTitleRow}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                تراخيص المكتبات الخارجية (Open Source)
              </Text>
              <Code size={18} color={theme.primary} />
            </View>
          </TouchableOpacity>

          {licensesExpanded && (
            <View style={styles.licensesContent}>
              <Text
                style={[
                  styles.licenseDesc,
                  { color: theme.textMuted, marginBottom: 12 },
                ]}
              >
                تخضع المكتبات البرمجية والمواد الصوتية والنصوص التابعة لأطراف أخرى لتراخيصها وحقوق أصحابها الأصليين:
              </Text>

              {thirdPartyLibraries.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.licenseItem,
                    { borderBottomColor: theme.border },
                  ]}
                >
                  <Text style={[styles.licenseName, { color: theme.text }]}>
                    {item.name}
                  </Text>
                  <Text
                    style={[styles.licenseMeta, { color: theme.primary }]}
                  >
                    {item.license} • {item.copyright}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footerBox}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            Copyright © 2026 Rabea Shaban. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

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
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  brandCard: {
    alignItems: "center",
    paddingVertical: 12,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: "rgba(16,185,129,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 18,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  versionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  versionText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  licenseTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 22,
    marginTop: 10,
    textAlign: "right",
  },
  ownerInfoBox: {
    alignItems: "flex-end",
    marginTop: 12,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  ownerRole: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  copyrightNoticeText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    textAlign: "right",
  },
  linksContainer: {
    marginTop: 14,
    gap: 8,
  },
  linkBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 12,
    fontWeight: "600",
  },
  licensesContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(150,150,150,0.1)",
  },
  licenseDesc: {
    fontSize: 12,
    textAlign: "right",
  },
  licenseItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  licenseName: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "right",
  },
  licenseMeta: {
    fontSize: 11,
    marginTop: 2,
    textAlign: "right",
  },
  footerBox: {
    alignItems: "center",
    marginTop: 10,
  },
  footerText: {
    fontSize: 11,
  },
});
