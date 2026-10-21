import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import {
  ChevronRight,
  Compass,
  MapPin,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Navigation,
  Info,
} from "lucide-react-native";
import { useSettingsStore } from "../store/settingsStore";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";
import { PrayerTimesService } from "../services/prayer/PrayerTimesService";
import {
  NativeEngine,
  QiblaHeadingData,
} from "../services/native/AtharNativeModule";

export const QiblaScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { selectedCity, useGps, customCoords } = useSettingsStore();

  const effectiveCoords =
    useGps && customCoords ? customCoords : selectedCity.coords;

  const qiblaBearing = PrayerTimesService.calculateQiblaBearing(effectiveCoords);

  const [headingData, setHeadingData] = useState<QiblaHeadingData>({
    magneticHeading: 0,
    trueHeading: 0,
    declination: 0,
    accuracy: 3,
    isAvailable: true,
  });

  const animatedDialRotation = useRef(new Animated.Value(0)).current;

  // Calculate arrow rotation relative to phone top edge
  const rawArrowRotation = (qiblaBearing - headingData.trueHeading + 360) % 360;

  useEffect(() => {
    if (!isFocused) {
      NativeEngine.stopQiblaCompass();
      return;
    }

    NativeEngine.startQiblaCompass(
      effectiveCoords.latitude,
      effectiveCoords.longitude
    );

    const subscription = NativeEngine.addQiblaHeadingListener((data) => {
      setHeadingData(data);
    });

    return () => {
      NativeEngine.stopQiblaCompass();
      if (subscription && typeof subscription.remove === "function") {
        subscription.remove();
      }
    };
  }, [isFocused, effectiveCoords]);

  // Smooth rotation animation
  useEffect(() => {
    Animated.timing(animatedDialRotation, {
      toValue: -headingData.trueHeading,
      duration: 120,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [headingData.trueHeading]);

  const dialInterpolation = animatedDialRotation.interpolate({
    inputRange: [-360, 360],
    outputRange: ["-360deg", "360deg"],
  });

  const isPointingToQibla = Math.abs((rawArrowRotation + 180) % 360 - 180) <= 3;

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
          onPress={() => navigation.navigate("PrayerTimes")}
        >
          <Compass size={18} color={theme.primary} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: theme.text }]}>
          اتجاه القبلة
        </Text>

        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <ChevronRight size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* City Location Badge */}
        <View style={styles.locationBadgeRow}>
          <TouchableOpacity
            style={[styles.cityBadge, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => navigation.navigate("NotificationSettings")}
          >
            <MapPin size={13} color={theme.primary} />
            <Text style={[styles.cityBadgeText, { color: theme.text }]}>
              {useGps ? "الموقع الحالي (GPS)" : selectedCity.nameAr}
            </Text>
          </TouchableOpacity>

          <View style={styles.qiblaBadge}>
            <Sparkles size={13} color={theme.accentGold} />
            <Text style={[styles.qiblaBadgeText, { color: theme.primary }]}>
              زاوية الكعبة: {toArabicNumber(qiblaBearing)}°
            </Text>
          </View>
        </View>

        {/* Qibla Compass UI Visual */}
        <View style={styles.compassCenterBox}>
          <View
            style={[
              styles.outerCompassRing,
              {
                borderColor: isPointingToQibla
                  ? "#10b981"
                  : isDarkMode
                  ? "#1e293b"
                  : "#e2e8f0",
                backgroundColor: isPointingToQibla
                  ? "rgba(16,185,129,0.08)"
                  : theme.card,
              },
            ]}
          >
            {/* Rotating Compass Dial */}
            <Animated.View
              style={[
                styles.rotatingDial,
                { transform: [{ rotate: dialInterpolation }] },
              ]}
            >
              {/* Cardinal Directions */}
              <Text style={[styles.cardinalNorth, { color: theme.primary }]}>
                ش
              </Text>
              <Text style={[styles.cardinalEast, { color: theme.textMuted }]}>
                ق
              </Text>
              <Text style={[styles.cardinalSouth, { color: theme.textMuted }]}>
                ج
              </Text>
              <Text style={[styles.cardinalWest, { color: theme.textMuted }]}>
                غ
              </Text>

              {/* Kaaba Direction Marker on Dial */}
              <View
                style={[
                  styles.kaabaMarkerBox,
                  { transform: [{ rotate: `${qiblaBearing}deg` }] },
                ]}
              >
                <View style={styles.kaabaIconBadge}>
                  <Text style={styles.kaabaIconEmoji}>🕋</Text>
                </View>
              </View>
            </Animated.View>

            {/* Static Phone Alignment Indicator */}
            <View style={styles.staticPhonePointer}>
              <Navigation
                size={36}
                color={isPointingToQibla ? "#10b981" : theme.primary}
                style={{ transform: [{ rotate: "-45deg" }] }}
              />
            </View>
          </View>

          {/* Alignment Confirmation Banner */}
          {isPointingToQibla && (
            <View style={styles.alignedBanner}>
              <CheckCircle2 size={18} color="#10b981" />
              <Text style={styles.alignedBannerText}>
                أنت الآن تتجه نحو الكعبة المشرفة مباشرة 🕋
              </Text>
            </View>
          )}
        </View>

        {/* Degrees Readout Card */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={[styles.infoVal, { color: theme.primary }]}>
                {toArabicNumber(qiblaBearing)}°
              </Text>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
                زاوية القبلة
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.infoCol}>
              <Text style={[styles.infoVal, { color: theme.text }]}>
                {toArabicNumber(Math.round(headingData.trueHeading))}°
              </Text>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
                اتجاه الهاتف
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.infoCol}>
              <Text style={[styles.infoVal, { color: theme.accentGold }]}>
                {toArabicNumber(Math.round(headingData.declination))}°
              </Text>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
                الانحراف المغناطيسي
              </Text>
            </View>
          </View>
        </View>

        {/* Sensor Status / Calibration Guidance */}
        {!headingData.isAvailable ? (
          <View
            style={[
              styles.warningCard,
              { backgroundColor: isDarkMode ? "#371c19" : "#fef2f2", borderColor: "#fca5a5" },
            ]}
          >
            <ShieldAlert size={20} color="#ef4444" />
            <Text style={styles.warningText}>
              مستشعر البوصلة غير متوفر بـ هذا الجهاز. يمكنك الاستعانة بزاوية القبلة ({toArabicNumber(qiblaBearing)}°) مع البوصلة الخارجية.
            </Text>
          </View>
        ) : headingData.accuracy < 2 ? (
          <View
            style={[
              styles.warningCard,
              { backgroundColor: isDarkMode ? "#332212" : "#fffbe1", borderColor: "#fcd34d" },
            ]}
          >
            <RotateCcw size={18} color="#d97706" />
            <Text style={[styles.warningText, { color: "#92400e" }]}>
              يرجى تحريك الهاتف بـ الهواء على شكل رقم (8) لمعايرة مستشعر البوصلة ودقة الاتجاه.
            </Text>
          </View>
        ) : null}

        {/* Guidance Note */}
        <View
          style={[
            styles.noticeCard,
            { backgroundColor: isDarkMode ? "#132130" : "#f0fdf4", borderColor: "rgba(16,185,129,0.25)" },
          ]}
        >
          <Info size={16} color={theme.primary} style={{ marginTop: 2 }} />
          <Text style={[styles.noticeText, { color: theme.textMuted }]}>
            ضع الهاتف بـ مسار أفقي مسطح بعيداً عن الأجهزة الإلكترونية والمجالات المغناطيسية لتضمن دقة توجيه البوصلة.
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
  locationBadgeRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cityBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  cityBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  qiblaBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  qiblaBadgeText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  compassCenterBox: {
    alignItems: "center",
    marginVertical: 10,
  },
  outerCompassRing: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  rotatingDial: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cardinalNorth: {
    position: "absolute",
    top: 6,
    fontSize: 14,
    fontWeight: "bold",
  },
  cardinalEast: {
    position: "absolute",
    right: 8,
    fontSize: 13,
    fontWeight: "bold",
  },
  cardinalSouth: {
    position: "absolute",
    bottom: 6,
    fontSize: 13,
    fontWeight: "bold",
  },
  cardinalWest: {
    position: "absolute",
    left: 8,
    fontSize: 13,
    fontWeight: "bold",
  },
  kaabaMarkerBox: {
    position: "absolute",
    width: 240,
    height: 240,
    alignItems: "center",
  },
  kaabaIconBadge: {
    top: -12,
    padding: 2,
  },
  kaabaIconEmoji: {
    fontSize: 22,
  },
  staticPhonePointer: {
    position: "absolute",
  },
  alignedBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  alignedBannerText: {
    color: "#065f46",
    fontSize: 13,
    fontWeight: "bold",
  },
  infoCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-around",
  },
  infoCol: {
    alignItems: "center",
  },
  infoVal: {
    fontSize: 18,
    fontWeight: "bold",
  },
  infoLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 32,
  },
  warningCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  warningText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
    textAlign: "right",
    color: "#991b1b",
  },
  noticeCard: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
    textAlign: "right",
  },
});
