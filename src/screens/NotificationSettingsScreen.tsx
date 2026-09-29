import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  ChevronRight,
  Bell,
  Heart,
  Clock,
  Volume2,
  Vibrate,
  MapPin,
  Check,
  X,
  Sparkles,
  Send,
} from "lucide-react-native";
import { useSettingsStore } from "../store/settingsStore";
import { usePreferencesStore } from "../store/preferencesStore";
import { useNotifications } from "../hooks/useNotifications";
import { lightTheme, darkTheme } from "../constants/theme";
import { CITY_PRESETS } from "../services/location/LocationService";
import { CalculationMethodName, MadhabName } from "../types/prayer";
import { toArabicNumber } from "../utils/arabic";

export const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const {
    salawat,
    prayerNotifications,
    selectedCity,
    calculationMethod,
    madhab,
    useGps,
    setSalawatConfig,
    setPrayerNotificationConfig,
    setSelectedCity,
    setCalculationMethod,
    setMadhab,
    setUseGps,
  } = useSettingsStore();

  const { hasPermission, requestPermission, sendTestNotification } =
    useNotifications();

  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [methodModalVisible, setMethodModalVisible] = useState(false);

  const calculationMethods: { id: CalculationMethodName; label: string }[] = [
    { id: "Egyptian", label: "الهيئة المصرية العامة للمساحة (مصر وأفريقيا)" },
    { id: "UmmAlQura", label: "جامعة أم القرى (مكة المكرمة والخليج)" },
    { id: "MuslimWorldLeague", label: "رابطة العالم الإسلامي" },
    { id: "Dubai", label: "دائرة الشؤون الإسلامية (دبي)" },
    { id: "Kuwait", label: "وزارة الأوقاف والشؤون الإسلامية (الكويت)" },
    { id: "Qatar", label: "وزارة الأوقاف (قطر)" },
    { id: "Karachi", label: "جامعة العلوم الإسلامية (كراتشي)" },
    { id: "NorthAmerica", label: "الجمعية الإسلامية لأمريكا الشمالية (ISNA)" },
  ];

  const prePrayerOptions = [
    { value: 0, label: "إيقاف" },
    { value: 5, label: "٥ دقائق" },
    { value: 10, label: "١٠ دقائق" },
    { value: 15, label: "١٥ دقيقة" },
    { value: 30, label: "٣٠ دقيقة" },
  ];

  const salawatIntervalOptions = [
    { value: 1, label: "كل ساعة" },
    { value: 2, label: "كل ساعتين" },
    { value: 3, label: "كل ٣ ساعات" },
  ];

  const handleTestNotification = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          "تنبيه",
          "يرجى السماح بالإشعارات من إعدادات الهاتف لتتمكن من استقبال التذكيرات."
        );
        return;
      }
    }
    await sendTestNotification();
    Alert.alert("تم الإرسال", "تم إرسال إشعار تجريبي لهاتفك الآن بنجاح!");
  };

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
          style={[styles.testBtn, { backgroundColor: "rgba(16,185,129,0.12)" }]}
          onPress={handleTestNotification}
        >
          <Send size={14} color={theme.primary} />
          <Text style={[styles.testBtnText, { color: theme.primary }]}>
            تجربة إشعار
          </Text>
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: theme.text }]}>
          إعدادات التنبيهات
        </Text>

        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <ChevronRight size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Permission Banner if not granted */}
        {hasPermission === false && (
          <View
            style={[
              styles.permissionCard,
              {
                backgroundColor: isDarkMode ? "#2d1b17" : "#fff1f0",
                borderColor: "#f87171",
              },
            ]}
          >
            <Bell size={20} color="#ef4444" />
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionTitle}>الإشعارات غير مفعلة</Text>
              <Text style={styles.permissionDesc}>
                فعّل إذن الإشعارات لتصلك تنبيهات الأذان والتذكيرات في موعدها.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.permissionActionBtn}
              onPress={requestPermission}
            >
              <Text style={styles.permissionActionText}>تفعيل</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 1. Salawat Reminder Section */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Switch
              value={salawat.enabled}
              onValueChange={(val) => setSalawatConfig({ enabled: val })}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#ffffff"
            />
            <View style={styles.sectionTitleRow}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  الصلاة على النبي ﷺ
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                  تذكير صوتي ودوري بالصلاة على النبي
                </Text>
              </View>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: "rgba(16,185,129,0.12)" },
                ]}
              >
                <Heart size={20} color={theme.primary} />
              </View>
            </View>
          </View>

          {salawat.enabled && (
            <View style={styles.subOptions}>
              <Text style={[styles.subLabel, { color: theme.textMuted }]}>
                التكرار:
              </Text>
              <View style={styles.pillsRow}>
                {salawatIntervalOptions.map((opt) => {
                  const isSelected = salawat.intervalHours === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.pillOption,
                        {
                          backgroundColor: isSelected
                            ? theme.primary
                            : isDarkMode
                            ? "#172535"
                            : "#f1f5f9",
                          borderColor: isSelected
                            ? theme.primary
                            : theme.border,
                        },
                      ]}
                      onPress={() =>
                        setSalawatConfig({ intervalHours: opt.value })
                      }
                    >
                      <Text
                        style={[
                          styles.pillOptionText,
                          {
                            color: isSelected ? "#ffffff" : theme.text,
                            fontWeight: isSelected ? "bold" : "500",
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.subLabel, { color: theme.textMuted, marginTop: 12 }]}>
                نطاق التذكير اليومي:
              </Text>
              <View style={styles.timeRangeBox}>
                <Text style={[styles.timeRangeText, { color: theme.text }]}>
                  من {toArabicNumber("08:00")} صباحاً إلى {toArabicNumber("10:00")} مساءً
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* 2. Prayer Times Notifications Section */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Switch
              value={prayerNotifications.enabled}
              onValueChange={(val) =>
                setPrayerNotificationConfig({ enabled: val })
              }
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#ffffff"
            />
            <View style={styles.sectionTitleRow}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  تنبيهات مواقيت الصلاة والأذان
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                  إشعارات دخول الوقت والتذكير المسبق
                </Text>
              </View>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: "rgba(217,119,6,0.12)" },
                ]}
              >
                <Clock size={20} color={theme.accentGold} />
              </View>
            </View>
          </View>

          {prayerNotifications.enabled && (
            <View style={styles.subOptions}>
              {/* Pre-prayer selector */}
              <Text style={[styles.subLabel, { color: theme.textMuted }]}>
                التنبيه قبل دخول الوقت:
              </Text>
              <View style={styles.pillsRow}>
                {prePrayerOptions.map((opt) => {
                  const isSelected =
                    prayerNotifications.prePrayerMinutes === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.pillOption,
                        {
                          backgroundColor: isSelected
                            ? theme.primary
                            : isDarkMode
                            ? "#172535"
                            : "#f1f5f9",
                          borderColor: isSelected
                            ? theme.primary
                            : theme.border,
                        },
                      ]}
                      onPress={() =>
                        setPrayerNotificationConfig({
                          prePrayerMinutes: opt.value,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.pillOptionText,
                          {
                            color: isSelected ? "#ffffff" : theme.text,
                            fontWeight: isSelected ? "bold" : "500",
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Per-Prayer Toggles */}
              <Text
                style={[
                  styles.subLabel,
                  { color: theme.textMuted, marginTop: 14 },
                ]}
              >
                تفعيل التنبيه لكل صلاة:
              </Text>

              {[
                { key: "fajr", label: "صلاة الفجر" },
                { key: "dhuhr", label: "صلاة الظهر" },
                { key: "asr", label: "صلاة العصر" },
                { key: "maghrib", label: "صلاة المغرب" },
                { key: "isha", label: "صلاة العشاء" },
              ].map((p) => (
                <View key={p.key} style={styles.prayerRowToggle}>
                  <Switch
                    value={
                      prayerNotifications[
                        p.key as keyof typeof prayerNotifications
                      ] as boolean
                    }
                    onValueChange={(val) =>
                      setPrayerNotificationConfig({ [p.key]: val })
                    }
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#ffffff"
                  />
                  <Text style={[styles.prayerRowLabel, { color: theme.text }]}>
                    {p.label}
                  </Text>
                </View>
              ))}

              {/* Vibration Toggle */}
              <View style={styles.prayerRowToggle}>
                <Switch
                  value={prayerNotifications.vibration}
                  onValueChange={(val) =>
                    setPrayerNotificationConfig({ vibration: val })
                  }
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor="#ffffff"
                />
                <Text style={[styles.prayerRowLabel, { color: theme.text }]}>
                  الاهتزاز عند الأذان
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* 3. Location & Calculation Method Settings */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>
            الموقع وطريقة الحساب
          </Text>

          {/* GPS Toggle */}
          <View style={styles.prayerRowToggle}>
            <Switch
              value={useGps}
              onValueChange={setUseGps}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#ffffff"
            />
            <Text style={[styles.prayerRowLabel, { color: theme.text }]}>
              تحديد الموقع التلقائي (GPS)
            </Text>
          </View>

          {/* Manual City Selector */}
          <TouchableOpacity
            style={[
              styles.settingSelector,
              {
                backgroundColor: isDarkMode ? "#172535" : "#f8fafc",
                borderColor: theme.border,
              },
            ]}
            onPress={() => setCityModalVisible(true)}
          >
            <View style={styles.selectorLeft}>
              <Text style={[styles.selectorValue, { color: theme.primary }]}>
                {selectedCity.nameAr} ({selectedCity.countryAr})
              </Text>
              <ChevronRight size={16} color={theme.textMuted} />
            </View>
            <Text style={[styles.selectorLabel, { color: theme.text }]}>
              المدينة المحددة
            </Text>
          </TouchableOpacity>

          {/* Calculation Method Selector */}
          <TouchableOpacity
            style={[
              styles.settingSelector,
              {
                backgroundColor: isDarkMode ? "#172535" : "#f8fafc",
                borderColor: theme.border,
              },
            ]}
            onPress={() => setMethodModalVisible(true)}
          >
            <View style={styles.selectorLeft}>
              <Text
                style={[
                  styles.selectorValue,
                  { color: theme.primary, maxWidth: 140 },
                ]}
                numberOfLines={1}
              >
                {calculationMethods.find((m) => m.id === calculationMethod)
                  ?.label || calculationMethod}
              </Text>
              <ChevronRight size={16} color={theme.textMuted} />
            </View>
            <Text style={[styles.selectorLabel, { color: theme.text }]}>
              طريقة الحساب
            </Text>
          </TouchableOpacity>

          {/* Madhab Selector */}
          <View style={styles.madhabRow}>
            <Text style={[styles.subLabel, { color: theme.textMuted }]}>
              المذهب الفقهي (لحساب وقت العصر):
            </Text>
            <View style={styles.pillsRow}>
              {[
                { id: "shafi", label: "الجمهور (الشافعي والمالكي والحنبلي)" },
                { id: "hanafi", label: "الحنفي" },
              ].map((m) => {
                const isSelected = madhab === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.pillOption,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : isDarkMode
                          ? "#172535"
                          : "#f1f5f9",
                        borderColor: isSelected
                          ? theme.primary
                          : theme.border,
                      },
                    ]}
                    onPress={() => setMadhab(m.id as MadhabName)}
                  >
                    <Text
                      style={[
                        styles.pillOptionText,
                        {
                          color: isSelected ? "#ffffff" : theme.text,
                          fontWeight: isSelected ? "bold" : "500",
                        },
                      ]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* City Selection Modal */}
      <Modal
        visible={cityModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCityModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => setCityModalVisible(false)}
              style={styles.closeBtn}
            >
              <X size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              اختيار المدينة
            </Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalList}>
            {CITY_PRESETS.map((city) => {
              const isSelected = selectedCity.id === city.id;
              return (
                <TouchableOpacity
                  key={city.id}
                  style={[
                    styles.cityItem,
                    {
                      backgroundColor: isSelected
                        ? isDarkMode
                          ? "#0f372a"
                          : "#ecfdf5"
                        : theme.card,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedCity(city);
                    setCityModalVisible(false);
                  }}
                >
                  {isSelected ? <Check size={18} color={theme.primary} /> : <View />}
                  <Text
                    style={[
                      styles.cityName,
                      {
                        color: isSelected ? theme.primary : theme.text,
                        fontWeight: isSelected ? "bold" : "500",
                      },
                    ]}
                  >
                    {city.nameAr} — {city.countryAr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* Calculation Method Modal */}
      <Modal
        visible={methodModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setMethodModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => setMethodModalVisible(false)}
              style={styles.closeBtn}
            >
              <X size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              طريقة حساب مواقيت الصلاة
            </Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalList}>
            {calculationMethods.map((m) => {
              const isSelected = calculationMethod === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.cityItem,
                    {
                      backgroundColor: isSelected
                        ? isDarkMode
                          ? "#0f372a"
                          : "#ecfdf5"
                        : theme.card,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => {
                    setCalculationMethod(m.id);
                    setMethodModalVisible(false);
                  }}
                >
                  {isSelected ? <Check size={18} color={theme.primary} /> : <View />}
                  <Text
                    style={[
                      styles.cityName,
                      {
                        color: isSelected ? theme.primary : theme.text,
                        fontWeight: isSelected ? "bold" : "500",
                        flex: 1,
                        textAlign: "right",
                      },
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
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
  testBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  testBtnText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  permissionCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  permissionInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  permissionTitle: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "bold",
  },
  permissionDesc: {
    color: "#991b1b",
    fontSize: 11,
    marginTop: 2,
    textAlign: "right",
  },
  permissionActionBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  permissionActionText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  sectionCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "right",
  },
  sectionSubtitle: {
    fontSize: 11,
    marginTop: 2,
    textAlign: "right",
  },
  subOptions: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(150,150,150,0.1)",
  },
  subLabel: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  pillOption: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  pillOptionText: {
    fontSize: 12,
  },
  timeRangeBox: {
    alignItems: "flex-end",
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  prayerRowToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  prayerRowLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  settingSelector: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  selectorLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  selectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  selectorValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  madhabRow: {
    marginTop: 14,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalList: {
    padding: 16,
    gap: 10,
  },
  cityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  cityName: {
    fontSize: 14,
  },
});
