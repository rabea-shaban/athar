import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  ChevronRight,
  Clock,
  MapPin,
  Bell,
  Compass,
  Sun,
  Moon,
  Sunrise,
  Sunset,
} from "lucide-react-native";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";

export const PrayerTimesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { todayPrayers, nextPrayer, cityNameAr } = usePrayerTimes();

  const formatClock = (d: Date) => {
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const isPm = hours >= 12;
    const h12 = hours % 12 || 12;
    const minsStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${toArabicNumber(h12)}:${toArabicNumber(minsStr)} ${
      isPm ? "م" : "ص"
    }`;
  };

  const formatCountdown = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${toArabicNumber(hours)} س : ${toArabicNumber(
      mins
    )} د : ${toArabicNumber(secs)} ث`;
  };

  const prayersList = [
    {
      id: "Fajr",
      nameAr: "صلاة الفجر",
      time: todayPrayers.fajr,
      icon: Moon,
    },
    {
      id: "Sunrise",
      nameAr: "الشروق",
      time: todayPrayers.sunrise,
      icon: Sunrise,
    },
    {
      id: "Dhuhr",
      nameAr: "صلاة الظهر",
      time: todayPrayers.dhuhr,
      icon: Sun,
    },
    {
      id: "Asr",
      nameAr: "صلاة العصر",
      time: todayPrayers.asr,
      icon: Sun,
    },
    {
      id: "Maghrib",
      nameAr: "صلاة المغرب",
      time: todayPrayers.maghrib,
      icon: Sunset,
    },
    {
      id: "Isha",
      nameAr: "صلاة العشاء",
      time: todayPrayers.isha,
      icon: Moon,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View
        style={[
          styles.navBar,
          { backgroundColor: theme.card, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.border }]}
          onPress={() => navigation.navigate("NotificationSettings")}
        >
          <Bell size={18} color={theme.primary} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: theme.text }]}>
          مواقيت الصلاة
        </Text>

        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <ChevronRight size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Next Prayer Countdown Hero Card */}
        <View
          style={[
            styles.nextPrayerHero,
            {
              backgroundColor: isDarkMode ? "#0e231c" : "#e6f4ea",
              borderColor: isDarkMode ? "#194a3a" : "#bbf7d0",
            },
          ]}
        >
          <View style={styles.cityLocationRow}>
            <TouchableOpacity
              style={[styles.cityBadge, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate("NotificationSettings")}
            >
              <MapPin size={13} color={theme.primary} />
              <Text style={[styles.cityBadgeText, { color: theme.text }]}>
                {cityNameAr}
              </Text>
            </TouchableOpacity>

            <View style={styles.livePulseRow}>
              <View style={styles.livePulseDot} />
              <Text style={[styles.livePulseText, { color: theme.primary }]}>
                الصلاة القادمة
              </Text>
            </View>
          </View>

          <Text style={[styles.nextPrayerName, { color: theme.text }]}>
            {nextPrayer.nameAr}
          </Text>

          <Text style={[styles.nextPrayerClock, { color: theme.primary }]}>
            {formatClock(nextPrayer.time)}
          </Text>

          <View
            style={[
              styles.countdownBox,
              {
                backgroundColor: isDarkMode ? "#132f26" : "#ffffff",
                borderColor: theme.border,
              },
            ]}
          >
            <Clock size={16} color={theme.accentGold} />
            <Text style={[styles.countdownText, { color: theme.text }]}>
              متبقي: {formatCountdown(nextPrayer.countdownSeconds)}
            </Text>
          </View>
        </View>

        {/* Daily Schedule List */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            جدول أوقات الصلاة لليوم
          </Text>
        </View>

        <View style={styles.scheduleList}>
          {prayersList.map((item) => {
            const isNext = nextPrayer.name === item.id;
            const Icon = item.icon;

            return (
              <View
                key={item.id}
                style={[
                  styles.prayerItemCard,
                  {
                    backgroundColor: isNext
                      ? isDarkMode
                        ? "#122a21"
                        : "#f0fdf4"
                      : theme.card,
                    borderColor: isNext ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.prayerClockText,
                    {
                      color: isNext ? theme.primary : theme.text,
                      fontWeight: isNext ? "bold" : "600",
                    },
                  ]}
                >
                  {formatClock(item.time)}
                </Text>

                <View style={styles.prayerRightInfo}>
                  <Text
                    style={[
                      styles.prayerLabelText,
                      {
                        color: isNext ? theme.primary : theme.text,
                        fontWeight: isNext ? "bold" : "600",
                      },
                    ]}
                  >
                    {item.nameAr}
                  </Text>
                  <View
                    style={[
                      styles.iconBadge,
                      {
                        backgroundColor: isNext
                          ? theme.primary
                          : isDarkMode
                          ? "#172535"
                          : "#f1f5f9",
                      },
                    ]}
                  >
                    <Icon
                      size={18}
                      color={isNext ? "#ffffff" : theme.textMuted}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Notifications Shortcut Card */}
        <TouchableOpacity
          style={[
            styles.settingsShortcutCard,
            {
              backgroundColor: isDarkMode ? "#172535" : "#fdfbf7",
              borderColor: isDarkMode ? "#1e293b" : "#fef3c7",
            },
          ]}
          onPress={() => navigation.navigate("NotificationSettings")}
          activeOpacity={0.7}
        >
          <View style={styles.shortcutLeft}>
            <ChevronRight size={18} color={theme.textMuted} />
          </View>
          <View style={styles.shortcutRight}>
            <View style={styles.shortcutInfo}>
              <Text style={[styles.shortcutTitle, { color: theme.text }]}>
                تخصيص أذان وتنبيهات الصلوات
              </Text>
              <Text style={[styles.shortcutDesc, { color: theme.textMuted }]}>
                تعديل وقت التنبيه المسبق والصلاة على النبي ﷺ
              </Text>
            </View>
            <View
              style={[
                styles.bellBadge,
                { backgroundColor: "rgba(217,119,6,0.15)" },
              ]}
            >
              <Bell size={20} color={theme.accentGold} />
            </View>
          </View>
        </TouchableOpacity>
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
  nextPrayerHero: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    alignItems: "center",
  },
  cityLocationRow: {
    width: "100%",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cityBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  cityBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  livePulseRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  livePulseText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  nextPrayerName: {
    fontSize: 28,
    fontWeight: "bold",
  },
  nextPrayerClock: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
  },
  countdownBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 16,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  sectionHeader: {
    alignItems: "flex-end",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  scheduleList: {
    gap: 10,
  },
  prayerItemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  prayerRightInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerLabelText: {
    fontSize: 15,
  },
  prayerClockText: {
    fontSize: 15,
  },
  settingsShortcutCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 6,
  },
  shortcutRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  bellBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  shortcutInfo: {
    alignItems: "flex-end",
  },
  shortcutTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  shortcutDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  shortcutLeft: {
    padding: 4,
  },
});
