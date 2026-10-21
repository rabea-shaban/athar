import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  Send,
  Play,
  Pause,
  Music,
  Headphones,
  ShieldAlert,
  BatteryCharging,
  Info,
} from "lucide-react-native";
import { ADHANS_LIST, getAdhanById, AdhanTrack } from "../data/adhans";
import { useAudioStore } from "../store/audioStore";
import { useSettingsStore } from "../store/settingsStore";
import { usePreferencesStore } from "../store/preferencesStore";
import { useNotifications } from "../hooks/useNotifications";
import { lightTheme, darkTheme } from "../constants/theme";
import { CITY_PRESETS } from "../services/location/LocationService";
import { CalculationMethodName, MadhabName } from "../types/prayer";
import { toArabicNumber } from "../utils/arabic";
import { NativeEngine } from "../services/native/AtharNativeModule";

export const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const {
    salawat,
    prayerNotifications,
    pushPreferences,
    selectedCity,
    calculationMethod,
    madhab,
    useGps,
    setSalawatConfig,
    setPrayerNotificationConfig,
    setPushPreferences,
    setSelectedCity,
    setCalculationMethod,
    setMadhab,
    setUseGps,
  } = useSettingsStore();

  const { hasPermission, requestPermission, sendTestNotification } =
    useNotifications();

  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [methodModalVisible, setMethodModalVisible] = useState(false);
  const [adhanModalVisible, setAdhanModalVisible] = useState(false);
  const [fajrModalVisible, setFajrModalVisible] = useState(false);

  const [canExactAlarm, setCanExactAlarm] = useState<boolean>(true);
  const [isTestingAdhanNative, setIsTestingAdhanNative] = useState<boolean>(false);
  const [isPreviewingVolume, setIsPreviewingVolume] = useState<boolean>(false);

  const { playTrack, togglePlay, currentTrack, isPlaying } = useAudioStore();

  const selectedAdhan = getAdhanById(prayerNotifications.sound);
  const selectedFajrAdhan = getAdhanById(
    prayerNotifications.fajrSound || "fajr"
  );

  const currentAdhanVolume = prayerNotifications.adhanVolume ?? 100;

  useEffect(() => {
    checkExactAlarmStatus();
    return () => {
      NativeEngine.stopAdhanVolumePreview();
    };
  }, []);

  const checkExactAlarmStatus = async () => {
    if (NativeEngine.isAvailable()) {
      const status = await NativeEngine.canScheduleExactAlarms();
      setCanExactAlarm(status);
    }
  };

  const isPlayingPreview = (adhanId: string) => {
    return currentTrack?.id === `adhan_preview_${adhanId}` && isPlaying;
  };

  const handlePreviewAdhan = (adhan: AdhanTrack) => {
    const trackId = `adhan_preview_${adhan.id}`;
    if (currentTrack?.id === trackId) {
      togglePlay();
    } else {
      playTrack({
        id: trackId,
        title: adhan.name,
        subtitle: adhan.muadhin,
        audioUrl: adhan.audioUrl,
      });
    }
  };

  const handleTestNativeAdhan = () => {
    if (isTestingAdhanNative) {
      NativeEngine.stopAdhan();
      setIsTestingAdhanNative(false);
    } else {
      NativeEngine.startAdhanTest("الظهر");
      setIsTestingAdhanNative(true);
    }
  };

  const volumePresets = [
    { value: 0, label: "0% (كتم)" },
    { value: 25, label: "25%" },
    { value: 50, label: "50%" },
    { value: 75, label: "75%" },
    { value: 100, label: "100% (أقصى)" },
  ];

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
    { value: 0.5, label: "كل 30 دقيقة" },
    { value: 1, label: "كل ساعة" },
    { value: 2, label: "كل ساعتين" },
    { value: 3, label: "كل ٣ ساعات" },
    { value: 4, label: "كل ٤ ساعات" },
    { value: 6, label: "كل ٦ ساعات" },
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
          {
            backgroundColor: theme.card,
            borderBottomColor: theme.border,
            paddingTop: insets.top + 8,
          },
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

        {/* Exact Alarm Permission Banner (Android 12+) */}
        {Platform.OS === "android" && !canExactAlarm && (
          <View
            style={[
              styles.permissionCard,
              {
                backgroundColor: isDarkMode ? "#3a2512" : "#fffbe1",
                borderColor: "#d97706",
              },
            ]}
          >
            <ShieldAlert size={20} color="#d97706" />
            <View style={styles.permissionInfo}>
              <Text style={[styles.permissionTitle, { color: "#d97706" }]}>
                التنبيهات الدقيقة تحتاج إلى إذن
              </Text>
              <Text style={[styles.permissionDesc, { color: "#92400e" }]}>
                لضمان إطلاق الأذان في ثانية الوقت بالضبط، يرجى السماح للتطبيق بالتنبيهات الدقيقة.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.permissionActionBtn, { backgroundColor: "#d97706" }]}
              onPress={() => NativeEngine.openExactAlarmSettings()}
            >
              <Text style={styles.permissionActionText}>السماح</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Android Native Engine Controls Card */}
        {Platform.OS === "android" && NativeEngine.isAvailable() && (
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 10 }]}>
              محرك الأذان والتنبيهات الأصلي (Android)
            </Text>

            <TouchableOpacity
              style={[
                styles.nativeActionBtn,
                {
                  backgroundColor: isTestingAdhanNative ? "#ef4444" : theme.primary,
                },
              ]}
              onPress={handleTestNativeAdhan}
            >
              {isTestingAdhanNative ? (
                <Pause size={18} color="#ffffff" />
              ) : (
                <Play size={18} color="#ffffff" />
              )}
              <Text style={styles.nativeActionBtnText}>
                {isTestingAdhanNative
                  ? "إيقاف صوت الأذان الأصلي"
                  : `اختبار الأذان بصوت (${selectedAdhan.muadhin})`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.nativeSecondaryBtn,
                { borderColor: theme.border, marginTop: 10 },
              ]}
              onPress={() => {
                NativeEngine.scheduleTestAdhanInOneMinute("الظهر", selectedAdhan.audioUrl);
                Alert.alert(
                  "تم جدولة الأذان التجريبي",
                  `سيعمل أذان (${selectedAdhan.muadhin}) بعد 60 ثانية بالضبط. اغلق التطبيق واقفل الشاشة لاختبار العمل في الخلفية!`
                );
              }}
            >
              <Clock size={18} color={theme.primary} />
              <Text style={[styles.nativeSecondaryBtnText, { color: theme.text }]}>
                جدولة أذان تجريبي بعد 60 ثانية (اختبار التطبيق المغلق والشاشة المقفولة)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.nativeSecondaryBtn,
                { borderColor: theme.border, marginTop: 10 },
              ]}
              onPress={() => NativeEngine.openBatteryOptimizationSettings()}
            >
              <BatteryCharging size={18} color={theme.primary} />
              <Text style={[styles.nativeSecondaryBtnText, { color: theme.text }]}>
                إعدادات استثناء البطارية (لضمان عمل الأذان بدون تأخير)
              </Text>
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

              <TouchableOpacity
                style={[
                  styles.nativeSecondaryBtn,
                  { borderColor: theme.primary, marginTop: 12 },
                ]}
                onPress={() => NativeEngine.startSalawatTest()}
              >
                <Heart size={16} color={theme.primary} />
                <Text style={[styles.nativeSecondaryBtnText, { color: theme.primary }]}>
                  تجربة استماع لنغمة «صلي على محمد»
                </Text>
              </TouchableOpacity>
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
              {/* Adhan Volume Control Section */}
              <Text style={[styles.subLabel, { color: theme.textMuted }]}>
                مستوى صوت الأذان الأصلي ({toArabicNumber(currentAdhanVolume)}%):
              </Text>

              <View style={styles.pillsRow}>
                {volumePresets.map((opt) => {
                  const isSelected = currentAdhanVolume === opt.value;
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
                      onPress={() => {
                        setPrayerNotificationConfig({ adhanVolume: opt.value });
                        if (isPreviewingVolume) {
                          NativeEngine.startAdhanVolumePreview(opt.value);
                        }
                      }}
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

              {/* Volume Fine Adjuster Stepper */}
              <View
                style={[
                  styles.volumeStepperRow,
                  {
                    backgroundColor: isDarkMode ? "#172535" : "#f8fafc",
                    borderColor: theme.border,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    const nextVal = Math.min(100, currentAdhanVolume + 10);
                    setPrayerNotificationConfig({ adhanVolume: nextVal });
                    if (isPreviewingVolume) {
                      NativeEngine.startAdhanVolumePreview(nextVal);
                    }
                  }}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>

                <View style={styles.volumeReadout}>
                  <Volume2 size={16} color={theme.primary} />
                  <Text style={[styles.volumeReadoutText, { color: theme.text }]}>
                    مستوى الصوت: {toArabicNumber(currentAdhanVolume)}%
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.stepperBtn,
                    { backgroundColor: isDarkMode ? "#334155" : "#e2e8f0" },
                  ]}
                  onPress={() => {
                    const nextVal = Math.max(0, currentAdhanVolume - 10);
                    setPrayerNotificationConfig({ adhanVolume: nextVal });
                    if (isPreviewingVolume) {
                      NativeEngine.startAdhanVolumePreview(nextVal);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.stepperBtnText,
                      { color: isDarkMode ? "#ffffff" : "#0f172a" },
                    ]}
                  >
                    -
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Preview Volume Sound Action */}
              <TouchableOpacity
                style={[
                  styles.nativeSecondaryBtn,
                  {
                    borderColor: isPreviewingVolume ? "#ef4444" : theme.primary,
                    marginTop: 10,
                    marginBottom: 12,
                  },
                ]}
                onPress={() => {
                  if (isPreviewingVolume) {
                    NativeEngine.stopAdhanVolumePreview();
                    setIsPreviewingVolume(false);
                  } else {
                    NativeEngine.startAdhanVolumePreview(currentAdhanVolume);
                    setIsPreviewingVolume(true);
                  }
                }}
              >
                {isPreviewingVolume ? (
                  <Pause size={16} color="#ef4444" />
                ) : (
                  <Volume2 size={16} color={theme.primary} />
                )}
                <Text
                  style={[
                    styles.nativeSecondaryBtnText,
                    { color: isPreviewingVolume ? "#ef4444" : theme.primary },
                  ]}
                >
                  {isPreviewingVolume
                    ? "إيقاف معاينة مستوى الصوت"
                    : `معاينة صوت الأذان بمستوى (${toArabicNumber(currentAdhanVolume)}%)`}
                </Text>
              </TouchableOpacity>

              {/* Volume Explanation Notice */}
              <View
                style={[
                  styles.volumeNoticeBox,
                  {
                    backgroundColor: isDarkMode ? "#132130" : "#f0fdf4",
                    borderColor: "rgba(16,185,129,0.25)",
                  },
                ]}
              >
                <Info size={14} color={theme.primary} style={{ marginTop: 2 }} />
                <Text style={[styles.volumeNoticeText, { color: theme.textMuted }]}>
                  ملاحظة: يتحكم هذا الإعداد في مستوى صوت مشغل الأذان بداخل التطبيق. يتأثر مستوى الصوت النهائي أيضاً بمستوى صوت الهاتف المعين في إعدادات جهازك.
                </Text>
              </View>

              {/* Pre-prayer selector */}
              <Text
                style={[
                  styles.subLabel,
                  { color: theme.textMuted, marginTop: 16 },
                ]}
              >
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

              {/* Adhan Sound Voice Selectors */}
              <Text
                style={[
                  styles.subLabel,
                  { color: theme.textMuted, marginTop: 14 },
                ]}
              >
                أصوات الأذان والتكبير:
              </Text>

              {/* General Adhan */}
              <View
                style={[
                  styles.adhanCardBox,
                  {
                    backgroundColor: isDarkMode ? "#172535" : "#f8fafc",
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.adhanCardHeader}>
                  <TouchableOpacity
                    style={[
                      styles.previewAudioBtn,
                      { backgroundColor: theme.primary },
                    ]}
                    onPress={() => handlePreviewAdhan(selectedAdhan)}
                    activeOpacity={0.8}
                  >
                    {isPlayingPreview(selectedAdhan.id) ? (
                      <Pause size={15} color="#ffffff" />
                    ) : (
                      <Play
                        size={15}
                        color="#ffffff"
                        style={{ marginLeft: 2 }}
                      />
                    )}
                    <Text style={styles.previewAudioBtnText}>
                      {isPlayingPreview(selectedAdhan.id)
                        ? "إيقاف"
                        : "استماع للأذان"}
                    </Text>
                  </TouchableOpacity>

                  <View style={{ alignItems: "flex-end", flex: 1 }}>
                    <Text
                      style={[styles.adhanCardTitle, { color: theme.text }]}
                    >
                      صوت الأذان العام
                    </Text>
                    <Text
                      style={[
                        styles.adhanCardMuadhin,
                        { color: theme.primary },
                      ]}
                      numberOfLines={1}
                    >
                      {selectedAdhan.name} ({selectedAdhan.muadhin})
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.changeAdhanBtn, { borderColor: theme.border }]}
                  onPress={() => setAdhanModalVisible(true)}
                >
                  <ChevronRight size={16} color={theme.textMuted} />
                  <Text
                    style={[styles.changeAdhanBtnText, { color: theme.text }]}
                  >
                    تغيير صوت الأذان ({toArabicNumber(ADHANS_LIST.length)} أصوات
                    ومؤذنين)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Dedicated Fajr Adhan */}
              <View
                style={[
                  styles.adhanCardBox,
                  {
                    backgroundColor: isDarkMode ? "#172535" : "#f8fafc",
                    borderColor: theme.border,
                    marginTop: 10,
                  },
                ]}
              >
                <View style={styles.adhanCardHeader}>
                  <TouchableOpacity
                    style={[
                      styles.previewAudioBtn,
                      { backgroundColor: "#059669" },
                    ]}
                    onPress={() => handlePreviewAdhan(selectedFajrAdhan)}
                    activeOpacity={0.8}
                  >
                    {isPlayingPreview(selectedFajrAdhan.id) ? (
                      <Pause size={15} color="#ffffff" />
                    ) : (
                      <Play
                        size={15}
                        color="#ffffff"
                        style={{ marginLeft: 2 }}
                      />
                    )}
                    <Text style={styles.previewAudioBtnText}>
                      {isPlayingPreview(selectedFajrAdhan.id)
                        ? "إيقاف"
                        : "استماع للأذان"}
                    </Text>
                  </TouchableOpacity>

                  <View style={{ alignItems: "flex-end", flex: 1 }}>
                    <Text
                      style={[styles.adhanCardTitle, { color: theme.text }]}
                    >
                      أذان الفجر المخصوص
                    </Text>
                    <Text
                      style={[styles.adhanCardMuadhin, { color: "#059669" }]}
                      numberOfLines={1}
                    >
                      {selectedFajrAdhan.name} ({selectedFajrAdhan.muadhin})
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.changeAdhanBtn, { borderColor: theme.border }]}
                  onPress={() => setFajrModalVisible(true)}
                >
                  <ChevronRight size={16} color={theme.textMuted} />
                  <Text
                    style={[styles.changeAdhanBtnText, { color: theme.text }]}
                  >
                    تغيير أذان الفجر (مع التثويب الشرعي)
                  </Text>
                </TouchableOpacity>
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

        {/* 4. Push Notifications Preferences Card (FCM) */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  إشعارات التحديثات والإعلانات العامة
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                  إشعارات إطلاق التحديثات والمحتوى الجديد
                </Text>
              </View>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: "rgba(59,130,246,0.12)" },
                ]}
              >
                <Bell size={20} color="#3b82f6" />
              </View>
            </View>
          </View>

          <View style={styles.subOptions}>
            <View style={styles.prayerRowToggle}>
              <Switch
                value={pushPreferences.appUpdatesEnabled}
                onValueChange={(val) =>
                  setPushPreferences({ appUpdatesEnabled: val })
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#ffffff"
              />
              <Text style={[styles.prayerRowLabel, { color: theme.text }]}>
                تنبيهات إطلاق التحديثات والنسخ الجديدة
              </Text>
            </View>

            <View style={styles.prayerRowToggle}>
              <Switch
                value={pushPreferences.announcementsEnabled}
                onValueChange={(val) =>
                  setPushPreferences({ announcementsEnabled: val })
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#ffffff"
              />
              <Text style={[styles.prayerRowLabel, { color: theme.text }]}>
                الإعلانات والأخبار العامة للمنصة
              </Text>
            </View>

            <View style={styles.prayerRowToggle}>
              <Switch
                value={pushPreferences.islamicContentEnabled}
                onValueChange={(val) =>
                  setPushPreferences({ islamicContentEnabled: val })
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#ffffff"
              />
              <Text style={[styles.prayerRowLabel, { color: theme.text }]}>
                إشعارات الدروس والمستجدات الإسلامية
              </Text>
            </View>
          </View>
        </View>

        {/* About ATHAR & Copyright Card */}
        <TouchableOpacity
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              flexDirection: "row-reverse",
              alignItems: "center",
              justifyContent: "space-between",
            },
          ]}
          onPress={() => navigation.navigate("About" as never)}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 12 }}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: "rgba(16,185,129,0.12)" },
              ]}
            >
              <Info size={20} color={theme.primary} />
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                عن تطبيق أَثَر وحقوق الملكية
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                المطور والمالك: Rabea Shaban • الإصدار 1.0.0
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={theme.textMuted} />
        </TouchableOpacity>
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

      {/* General Adhan Selection Modal */}
      <Modal
        visible={adhanModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAdhanModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: theme.border },
            ]}
          >
            <TouchableOpacity
              onPress={() => setAdhanModalVisible(false)}
              style={styles.closeBtn}
            >
              <X size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              اختيار صوت الأذان
            </Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalList}>
            {ADHANS_LIST.map((adhan) => {
              const isSelected = prayerNotifications.sound === adhan.id;
              const isPreviewing = isPlayingPreview(adhan.id);

              return (
                <View
                  key={adhan.id}
                  style={[
                    styles.adhanModalCard,
                    {
                      backgroundColor: isSelected
                        ? isDarkMode
                          ? "#0f372a"
                          : "#ecfdf5"
                        : isDarkMode
                        ? "#172535"
                        : "#ffffff",
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <View style={styles.adhanModalCardTop}>
                    {/* Select Action */}
                    <TouchableOpacity
                      style={[
                        styles.selectAdhanBtn,
                        {
                          backgroundColor: isSelected
                            ? theme.primary
                            : "transparent",
                          borderColor: isSelected
                            ? theme.primary
                            : theme.border,
                        },
                      ]}
                      onPress={() => {
                        setPrayerNotificationConfig({ sound: adhan.id });
                        setAdhanModalVisible(false);
                      }}
                    >
                      {isSelected ? (
                        <Check size={16} color="#ffffff" />
                      ) : (
                        <Text
                          style={[
                            styles.selectAdhanBtnText,
                            { color: theme.text },
                          ]}
                        >
                          اختيار
                        </Text>
                      )}
                    </TouchableOpacity>

                    {/* Info */}
                    <View style={{ flex: 1, alignItems: "flex-end" }}>
                      <View style={styles.adhanTitleRow}>
                        {adhan.badge && (
                          <View
                            style={[
                              styles.badgeSmall,
                              {
                                backgroundColor: adhan.color
                                  ? `${adhan.color}20`
                                  : "rgba(16,185,129,0.15)",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgeSmallText,
                                { color: adhan.color || theme.primary },
                              ]}
                            >
                              {adhan.badge}
                            </Text>
                          </View>
                        )}
                        <Text
                          style={[
                            styles.adhanModalName,
                            { color: theme.text },
                          ]}
                        >
                          {adhan.name}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.adhanModalMuadhin,
                          { color: theme.primary },
                        ]}
                      >
                        {adhan.muadhin}
                      </Text>
                      <Text
                        style={[
                          styles.adhanModalLocation,
                          { color: theme.textMuted },
                        ]}
                      >
                        {adhan.location} • {adhan.durationFormatted}
                      </Text>
                    </View>
                  </View>

                  {/* Preview audio playback button */}
                  <View style={styles.adhanModalCardBottom}>
                    <TouchableOpacity
                      style={[
                        styles.modalPreviewBtn,
                        {
                          backgroundColor: isPreviewing
                            ? "#ef4444"
                            : isDarkMode
                            ? "#1e293b"
                            : "#f1f5f9",
                        },
                      ]}
                      onPress={() => handlePreviewAdhan(adhan)}
                    >
                      {isPreviewing ? (
                        <Pause size={14} color="#ffffff" />
                      ) : (
                        <Play
                          size={14}
                          color={theme.text}
                          style={{ marginLeft: 2 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.modalPreviewBtnText,
                          {
                            color: isPreviewing ? "#ffffff" : theme.text,
                          },
                        ]}
                      >
                        {isPreviewing ? "إيقاف الاستماع" : "معاينة صوت الأذان"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* Fajr Dedicated Adhan Selection Modal */}
      <Modal
        visible={fajrModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFajrModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: theme.border },
            ]}
          >
            <TouchableOpacity
              onPress={() => setFajrModalVisible(false)}
              style={styles.closeBtn}
            >
              <X size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              اختيار أذان صلاة الفجر
            </Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalList}>
            {ADHANS_LIST.map((adhan) => {
              const currentFajrSound =
                prayerNotifications.fajrSound || "fajr";
              const isSelected = currentFajrSound === adhan.id;
              const isPreviewing = isPlayingPreview(adhan.id);

              return (
                <View
                  key={adhan.id}
                  style={[
                    styles.adhanModalCard,
                    {
                      backgroundColor: isSelected
                        ? isDarkMode
                          ? "#0f372a"
                          : "#ecfdf5"
                        : isDarkMode
                        ? "#172535"
                        : "#ffffff",
                      borderColor: isSelected ? "#059669" : theme.border,
                    },
                  ]}
                >
                  <View style={styles.adhanModalCardTop}>
                    {/* Select Action */}
                    <TouchableOpacity
                      style={[
                        styles.selectAdhanBtn,
                        {
                          backgroundColor: isSelected
                            ? "#059669"
                            : "transparent",
                          borderColor: isSelected ? "#059669" : theme.border,
                        },
                      ]}
                      onPress={() => {
                        setPrayerNotificationConfig({ fajrSound: adhan.id });
                        setFajrModalVisible(false);
                      }}
                    >
                      {isSelected ? (
                        <Check size={16} color="#ffffff" />
                      ) : (
                        <Text
                          style={[
                            styles.selectAdhanBtnText,
                            { color: theme.text },
                          ]}
                        >
                          اختيار
                        </Text>
                      )}
                    </TouchableOpacity>

                    {/* Info */}
                    <View style={{ flex: 1, alignItems: "flex-end" }}>
                      <View style={styles.adhanTitleRow}>
                        {adhan.isFajr ? (
                          <View
                            style={[
                              styles.badgeSmall,
                              { backgroundColor: "rgba(5,150,105,0.2)" },
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgeSmallText,
                                { color: "#059669" },
                              ]}
                            >
                              مع التثويب
                            </Text>
                          </View>
                        ) : null}
                        <Text
                          style={[
                            styles.adhanModalName,
                            { color: theme.text },
                          ]}
                        >
                          {adhan.name}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.adhanModalMuadhin,
                          { color: "#059669" },
                        ]}
                      >
                        {adhan.muadhin}
                      </Text>
                      <Text
                        style={[
                          styles.adhanModalLocation,
                          { color: theme.textMuted },
                        ]}
                      >
                        {adhan.location} • {adhan.durationFormatted}
                      </Text>
                    </View>
                  </View>

                  {/* Preview audio playback button */}
                  <View style={styles.adhanModalCardBottom}>
                    <TouchableOpacity
                      style={[
                        styles.modalPreviewBtn,
                        {
                          backgroundColor: isPreviewing
                            ? "#ef4444"
                            : isDarkMode
                            ? "#1e293b"
                            : "#f1f5f9",
                        },
                      ]}
                      onPress={() => handlePreviewAdhan(adhan)}
                    >
                      {isPreviewing ? (
                        <Pause size={14} color="#ffffff" />
                      ) : (
                        <Play
                          size={14}
                          color={theme.text}
                          style={{ marginLeft: 2 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.modalPreviewBtnText,
                          {
                            color: isPreviewing ? "#ffffff" : theme.text,
                          },
                        ]}
                      >
                        {isPreviewing ? "إيقاف الاستماع" : "معاينة صوت الأذان"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
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
  volumeStepperRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  stepperBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 22,
  },
  volumeReadout: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  volumeReadoutText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  volumeNoticeBox: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
  },
  volumeNoticeText: {
    fontSize: 11,
    lineHeight: 18,
    flex: 1,
    textAlign: "right",
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
  adhanCardBox: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  adhanCardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  adhanCardTitle: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "right",
  },
  adhanCardMuadhin: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
    textAlign: "right",
  },
  previewAudioBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  previewAudioBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  changeAdhanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  changeAdhanBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  adhanModalCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  adhanModalCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  adhanTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  adhanModalName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
  },
  adhanModalMuadhin: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 3,
    textAlign: "right",
  },
  adhanModalLocation: {
    fontSize: 11,
    marginTop: 2,
    textAlign: "right",
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeSmallText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  selectAdhanBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  selectAdhanBtnText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  adhanModalCardBottom: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
  },
  modalPreviewBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalPreviewBtnText: {
    fontSize: 11,
    fontWeight: "600",
  },
  nativeActionBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  nativeActionBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
  nativeSecondaryBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  nativeSecondaryBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
