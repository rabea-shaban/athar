import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  AppState,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  BookOpen,
  Radio,
  Heart,
  Clock,
  ChevronLeft,
  Compass,
  Bookmark,
  Volume2,
  GraduationCap,
  Headphones,
  Sparkles,
  Download,
  X,
} from "lucide-react-native";
import { Header } from "../components/Header";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";
import { getPrayerTimes, PrayerTimings } from "../api/islamic";
import { toArabicNumber, PRAYER_NAMES_AR } from "../utils/arabic";
import {
  AppUpdateChecker,
  CheckUpdateResult,
} from "../services/updates/AppUpdateChecker";

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isDarkMode, lastRead } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [prayers, setPrayers] = useState<PrayerTimings | null>(null);
  const [loadingPrayers, setLoadingPrayers] = useState(true);
  const [updateResult, setUpdateResult] = useState<CheckUpdateResult | null>(null);

  useEffect(() => {
    getPrayerTimes("cairo", "egypt")
      .then((data) => {
        setPrayers(data);
        setLoadingPrayers(false);
      })
      .catch((err) => {
        console.warn("Prayer times fetch error:", err);
        setLoadingPrayers(false);
      });

    const runCheck = () => {
      AppUpdateChecker.checkForUpdates().then((res) => {
        if (res.hasUpdate) {
          setUpdateResult(res);
        } else {
          setUpdateResult(null);
        }
      });
    };

    runCheck();

    // Re-check for updates whenever app returns to active foreground
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        runCheck();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handlePostponeUpdate = async () => {
    if (updateResult?.updateInfo?.latestVersion) {
      await AppUpdateChecker.postponeUpdate(updateResult.updateInfo.latestVersion);
      setUpdateResult(null);
    }
  };

  const handleOpenUpdateScreen = () => {
    if (updateResult?.updateInfo) {
      navigation.navigate("UpdateApp", {
        version: updateResult.updateInfo.latestVersion,
        minimumVersion: updateResult.updateInfo.minimumVersion,
        storeUrl: updateResult.updateInfo.storeUrl,
        forceUpdate: updateResult.updateInfo.forceUpdate,
        releaseNotes: updateResult.updateInfo.releaseNotes,
      });
    }
  };

  const quickShortcuts = [
    {
      id: "quran",
      title: "المصحف الشريف",
      subtitle: "١١٤ سورة مباركة",
      icon: BookOpen,
      color: theme.primary,
      onPress: () => navigation.navigate("QuranTab"),
    },
    {
      id: "listen",
      title: "الاستماع للقرآن",
      subtitle: "تلاوات كبار القراء",
      icon: Headphones,
      color: "#059669",
      onPress: () => navigation.navigate("Listen"),
    },
    {
      id: "radio",
      title: "الإذاعات الإسلامية",
      subtitle: "بث إذاعي مباشر",
      icon: Radio,
      color: theme.accentGold,
      onPress: () => navigation.navigate("RadioTab"),
    },
    {
      id: "adhkar",
      title: "الأذكار والأدعية",
      subtitle: "حصن المسلم اليومي",
      icon: Heart,
      color: "#ec4899",
      onPress: () => navigation.navigate("AdhkarTab"),
    },
    {
      id: "tasbeeh",
      title: "السبحة الإلكترونية",
      subtitle: "أذكار وتسبيح ذكي",
      icon: Compass,
      color: "#8b5cf6",
      onPress: () => navigation.navigate("AdhkarTab", { screen: "Tasbeeh" }),
    },
    {
      id: "library",
      title: "المكتبة الإسلامية",
      subtitle: "أمهات كتب التراث",
      icon: Bookmark,
      color: "#3b82f6",
      onPress: () => navigation.navigate("LibraryTab"),
    },
    {
      id: "lectures",
      title: "الشروحات والدروس",
      subtitle: "سلاسل صوتية وعلمية",
      icon: GraduationCap,
      color: "#10b981",
      onPress: () => navigation.navigate("LibraryTab", { screen: "Lectures" }),
    },
  ];

  const prayerKeys = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        onSearchPress={() => navigation.navigate("QuranSearch")}
        onBellPress={() => navigation.navigate("NotificationSettings")}
        onInfoPress={() => navigation.navigate("About")}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Automatic In-App Update Notice Banner */}
        {updateResult?.hasUpdate && updateResult.updateInfo && (
          <View
            style={[
              styles.updateBanner,
              {
                backgroundColor: isDarkMode ? "#1e293b" : "#f0fdf4",
                borderColor: theme.primary,
              },
            ]}
          >
            <View style={styles.updateBannerHeader}>
              <TouchableOpacity
                style={styles.closeBannerBtn}
                onPress={handlePostponeUpdate}
              >
                <X size={16} color={theme.textMuted} />
              </TouchableOpacity>

              <View style={styles.updateBannerTitleRow}>
                <Text style={[styles.updateBannerTitle, { color: theme.text }]}>
                  تحديث جديد متوفر بـ أثر (v{updateResult.updateInfo.latestVersion}) 🌙
                </Text>
                <Sparkles size={16} color={theme.accentGold} />
              </View>
            </View>

            <Text
              style={[styles.updateBannerBody, { color: theme.textMuted }]}
              numberOfLines={2}
            >
              {updateResult.updateInfo.releaseNotes}
            </Text>

            <View style={styles.updateBannerActions}>
              <TouchableOpacity
                style={[
                  styles.updateActionBtn,
                  { backgroundColor: theme.primary },
                ]}
                onPress={handleOpenUpdateScreen}
              >
                <Download size={14} color="#ffffff" />
                <Text style={styles.updateActionBtnText}>
                  عرض التحديث والتفاصيل
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.postponeActionBtn,
                  { borderColor: theme.border },
                ]}
                onPress={handlePostponeUpdate}
              >
                <Text
                  style={[styles.postponeActionText, { color: theme.textMuted }]}
                >
                  تأجيل 24 ساعة
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Welcome & Last Read Banner */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: isDarkMode ? "#0e201b" : "#e6f4ea",
              borderColor: isDarkMode ? "#194a3a" : "#bbf7d0",
            },
          ]}
        >
          <View style={styles.heroTop}>
            <View style={styles.heroBadge}>
              <Text style={[styles.heroBadgeText, { color: theme.primary }]}>
                متابعة القراءة
              </Text>
            </View>
            <Text style={[styles.heroTime, { color: theme.textMuted }]}>
              منصة أَثَر
            </Text>
          </View>

          <Text style={[styles.heroTitle, { color: theme.text }]}>
            سورة {lastRead?.surahName || "الفاتحة"}
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.textMuted }]}>
            الآية {toArabicNumber(lastRead?.ayahNumber || 1)} • الصفحة{" "}
            {toArabicNumber(lastRead?.pageNumber || 1)}
          </Text>

          <TouchableOpacity
            style={[styles.resumeButton, { backgroundColor: theme.primary }]}
            onPress={() =>
              navigation.navigate("SurahDetail", {
                surahNumber: lastRead?.surahNumber || 1,
                surahName: lastRead?.surahName || "الفاتحة",
              })
            }
          >
            <ChevronLeft size={16} color="#ffffff" />
            <Text style={styles.resumeButtonText}>واصل التلاوة الآن</Text>
          </TouchableOpacity>
        </View>

        {/* Prayer Times Widget */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => navigation.navigate("PrayerTimes")}
          activeOpacity={0.7}
        >
          <View style={styles.cityBadge}>
            <Text style={[styles.seeAllText, { color: theme.primary }]}>
              عرض الكل والتنبيهات
            </Text>
            <ChevronLeft size={14} color={theme.primary} />
          </View>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            مواقيت الصلاة اليوم
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.prayersCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={() => navigation.navigate("PrayerTimes")}
          activeOpacity={0.8}
        >
          {loadingPrayers ? (
            <ActivityIndicator color={theme.primary} style={{ padding: 20 }} />
          ) : prayers ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.prayersRow}
            >
              {prayerKeys.map((key) => {
                const time = prayers[key];
                return (
                  <View
                    key={key}
                    style={[
                      styles.prayerItem,
                      {
                        backgroundColor: isDarkMode ? "#172233" : "#f8fafc",
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.prayerName, { color: theme.textMuted }]}>
                      {PRAYER_NAMES_AR[key] || key}
                    </Text>
                    <Text style={[styles.prayerTime, { color: theme.text }]}>
                      {toArabicNumber(time?.slice(0, 5) || "")}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          ) : null}
        </TouchableOpacity>

        {/* Quick Shortcuts Grid */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            أقسام المنصة
          </Text>
        </View>

        <View style={styles.gridContainer}>
          {quickShortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.gridCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.gridIconContainer,
                    { backgroundColor: `${item.color}15` },
                  ]}
                >
                  <Icon size={24} color={item.color} />
                </View>
                <Text style={[styles.gridTitle, { color: theme.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.gridSubtitle, { color: theme.textMuted }]}>
                  {item.subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Daily Verse / Hadith Inspiration */}
        <View
          style={[
            styles.quoteCard,
            {
              backgroundColor: isDarkMode ? "#151e2b" : "#fdfbf7",
              borderColor: isDarkMode ? "#1e293b" : "#fef3c7",
            },
          ]}
        >
          <View style={styles.quoteHeader}>
            <Text style={[styles.quoteTag, { color: theme.accentGold }]}>
              من هدايات القرآن الكريم
            </Text>
          </View>
          <Text style={[styles.quoteText, { color: theme.text }]}>
            ﴿ إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ وَيُبَشِّرُ
            الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ
            أَجْرًا كَبِيرًا ﴾
          </Text>
          <Text style={[styles.quoteSurah, { color: theme.textMuted }]}>
            سورة الإسراء • آية ٩
          </Text>
        </View>

        {/* Copyright & About ATHAR Footer */}
        <TouchableOpacity
          style={styles.aboutFooter}
          onPress={() => navigation.navigate("About")}
          activeOpacity={0.7}
        >
          <Text style={[styles.aboutFooterText, { color: theme.textMuted }]}>
            © 2026 ATHAR — أَثَر • Developed by Rabea Shaban
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  updateBanner: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  updateBannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  updateBannerTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  updateBannerTitle: {
    fontSize: 13,
    fontWeight: "bold",
  },
  closeBannerBtn: {
    padding: 4,
  },
  updateBannerBody: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "right",
    marginTop: 6,
    marginBottom: 10,
  },
  updateBannerActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  updateActionBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  updateActionBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  postponeActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  postponeActionText: {
    fontSize: 11,
    fontWeight: "600",
  },
  heroCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  heroTop: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  heroBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  heroTime: {
    fontSize: 11,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "right",
  },
  heroSubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: "right",
  },
  resumeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  resumeButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cityBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  prayersCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 22,
  },
  prayersRow: {
    flexDirection: "row-reverse",
    gap: 10,
    paddingHorizontal: 6,
  },
  prayerItem: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 72,
  },
  prayerName: {
    fontSize: 12,
    marginBottom: 4,
  },
  prayerTime: {
    fontSize: 13,
    fontWeight: "bold",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginBottom: 22,
  },
  gridCard: {
    width: "48%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "flex-end",
  },
  gridIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
    textAlign: "right",
  },
  gridSubtitle: {
    fontSize: 11,
    textAlign: "right",
  },
  quoteCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    alignItems: "center",
  },
  quoteHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  quoteTag: {
    fontSize: 12,
    fontWeight: "bold",
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 28,
    textAlign: "center",
    fontWeight: "500",
  },
  quoteSurah: {
    fontSize: 12,
    marginTop: 10,
  },
  aboutFooter: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 8,
  },
  aboutFooterText: {
    fontSize: 11,
    fontWeight: "500",
  },
});
