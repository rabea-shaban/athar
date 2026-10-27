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
  ActivityIndicator,
} from "react-native";
import Svg, { Rect, Path } from "react-native-svg";
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
  Activity,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Radio,
} from "lucide-react-native";
import { useSettingsStore } from "../store/settingsStore";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";
import { PrayerTimesService } from "../services/prayer/PrayerTimesService";
import { LocationService } from "../services/location/LocationService";
import {
  NativeEngine,
  QiblaHeadingData,
} from "../services/native/AtharNativeModule";

// Authentic Vector SVG Kaaba Icon Component
const KaabaSvgIcon: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="5"
      width="18"
      height="15"
      rx="3"
      fill="#1e293b"
      stroke="#0f172a"
      strokeWidth="1.5"
    />
    <Path d="M3 10H21" stroke="#f59e0b" strokeWidth="2.5" />
    <Rect x="13" y="12" width="4" height="8" rx="1" fill="#f59e0b" />
    <Path d="M4 6H20" stroke="#f1f5f9" strokeWidth="1" opacity="0.6" />
  </Svg>
);

export const QiblaScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const {
    selectedCity,
    useGps,
    customCoords,
    setCustomCoords,
    setUseGps,
  } = useSettingsStore();

  const [isLocating, setIsLocating] = useState<boolean>(false);

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

  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

  const animatedDialRotation = useRef(new Animated.Value(0)).current;
  const prevHeadingRef = useRef<number>(0);

  // Calculate relative Qibla angle from phone top edge
  const relativeQiblaAngle = (qiblaBearing - headingData.trueHeading + 360) % 360;

  const fetchLiveGpsLocation = async () => {
    setIsLocating(true);
    const coords = await LocationService.getCurrentCoordinates();
    if (coords) {
      setCustomCoords(coords);
      setUseGps(true);
    }
    setIsLocating(false);
  };

  // Continuous Real-Time GPS Location Watcher while on QiblaScreen
  useEffect(() => {
    if (!isFocused) return;

    fetchLiveGpsLocation();

    let locationSub: { remove: () => void } | null = null;

    LocationService.watchLocationAsync((coords) => {
      setCustomCoords(coords);
      setUseGps(true);
    }).then((sub) => {
      locationSub = sub;
    });

    return () => {
      if (locationSub && typeof locationSub.remove === "function") {
        try {
          locationSub.remove();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isFocused]);

  // Continuous Real-Time Compass Sensor Listener
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
  }, [isFocused, effectiveCoords.latitude, effectiveCoords.longitude]);

  // Smooth rotation animation with shortest angular path (prevents 0/360 boundary jump)
  useEffect(() => {
    let current = headingData.trueHeading;
    let prev = prevHeadingRef.current;

    let diff = current - (prev % 360);
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;

    const targetAngle = prev + diff;
    prevHeadingRef.current = targetAngle;

    Animated.timing(animatedDialRotation, {
      toValue: -targetAngle,
      duration: 120,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [headingData.trueHeading]);

  const dialInterpolation = animatedDialRotation.interpolate({
    inputRange: [-360, 360],
    outputRange: ["-360deg", "360deg"],
  });

  const isPointingToQibla = Math.abs((relativeQiblaAngle + 180) % 360 - 180) <= 3;

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
          اتجاه القبلة المباشر (Real-Time GPS)
        </Text>

        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <ChevronRight size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* City & Real-Time Live GPS Location Badge Row */}
        <View style={styles.locationBadgeRow}>
          <TouchableOpacity
            style={[
              styles.cityBadge,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={fetchLiveGpsLocation}
            activeOpacity={0.7}
            disabled={isLocating}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Radio size={13} color="#10b981" />
            )}
            <Text style={[styles.cityBadgeText, { color: theme.text }]}>
              {isLocating
                ? "جاري ربط الـ GPS المباشر..."
                : useGps && customCoords
                ? `موقعي (${effectiveCoords.latitude.toFixed(4)}°, ${effectiveCoords.longitude.toFixed(4)}°)`
                : selectedCity.nameAr}
            </Text>
            <RefreshCw size={12} color={theme.textMuted} />
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
              {/* North (0°) */}
              <View style={styles.cardinalNorthBox}>
                <Text style={[styles.cardinalText, { color: theme.primary, fontWeight: "bold" }]}>
                  ش
                </Text>
              </View>

              {/* East (90°) */}
              <View style={styles.cardinalEastBox}>
                <Text style={[styles.cardinalText, { color: theme.textMuted }]}>
                  ق
                </Text>
              </View>

              {/* South (180°) */}
              <View style={styles.cardinalSouthBox}>
                <Text style={[styles.cardinalText, { color: theme.textMuted }]}>
                  ج
                </Text>
              </View>

              {/* West (270°) */}
              <View style={styles.cardinalWestBox}>
                <Text style={[styles.cardinalText, { color: theme.textMuted }]}>
                  غ
                </Text>
              </View>

              {/* Kaaba Direction Vector SVG Marker on Dial */}
              <View
                style={[
                  styles.kaabaMarkerBox,
                  { transform: [{ rotate: `${qiblaBearing}deg` }] },
                ]}
              >
                <View style={styles.kaabaIconBadge}>
                  <KaabaSvgIcon size={26} />
                </View>
              </View>
            </Animated.View>

            {/* Static Phone Alignment Indicator Pointer */}
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
                أنت الآن تتجه نحو الكعبة المشرفة مباشرة
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

        {/* Diagnostic Debug Panel Toggle */}
        <TouchableOpacity
          style={[
            styles.diagnosticToggleBtn,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={() => setShowDiagnostics(!showDiagnostics)}
        >
          <View style={styles.diagnosticToggleRight}>
            <Activity size={16} color={theme.primary} />
            <Text style={[styles.diagnosticToggleTitle, { color: theme.text }]}>
              شاشة الفحص والتشخيص الرياضي المباشر
            </Text>
          </View>
          {showDiagnostics ? (
            <ChevronUp size={16} color={theme.textMuted} />
          ) : (
            <ChevronDown size={16} color={theme.textMuted} />
          )}
        </TouchableOpacity>

        {showDiagnostics && (
          <View
            style={[
              styles.diagnosticPanel,
              { backgroundColor: isDarkMode ? "#111827" : "#f8fafc", borderColor: theme.border },
            ]}
          >
            <Text style={[styles.diagTitle, { color: theme.primary }]}>
              بيانات التشخيص المباشرة (Real-Time Live GPS & Sensors):
            </Text>

            <TouchableOpacity
              style={[
                styles.refreshGpsBtn,
                { backgroundColor: theme.primary },
              ]}
              onPress={fetchLiveGpsLocation}
            >
              <RefreshCw size={14} color="#ffffff" />
              <Text style={styles.refreshGpsBtnText}>
                إعادة جلب موثوق لـ GPS الآن
              </Text>
            </TouchableOpacity>

            <Text style={[styles.diagLine, { color: theme.text }]}>
              • Real-Time Latitude: {effectiveCoords.latitude.toFixed(6)}
            </Text>
            <Text style={[styles.diagLine, { color: theme.text }]}>
              • Real-Time Longitude: {effectiveCoords.longitude.toFixed(6)}
            </Text>
            <Text style={[styles.diagLine, { color: theme.text }]}>
              • Qibla Bearing (الكعبة): {qiblaBearing.toFixed(1)}°
            </Text>
            <Text style={[styles.diagLine, { color: theme.text }]}>
              • Magnetic Heading: {headingData.magneticHeading.toFixed(1)}°
            </Text>
            <Text style={[styles.diagLine, { color: theme.text }]}>
              • Declination: {headingData.declination.toFixed(1)}°
            </Text>
            <Text style={[styles.diagLine, { color: theme.text }]}>
              • True Heading: {headingData.trueHeading.toFixed(1)}°
            </Text>
            <Text style={[styles.diagLine, { color: theme.text }]}>
              • Relative Qibla Angle: {relativeQiblaAngle.toFixed(1)}°
            </Text>
            <Text style={[styles.diagLine, { color: theme.text }]}>
              • Sensor Accuracy: {headingData.accuracy} (0=Unreliable, 1=Low, 2=Med, 3=High)
            </Text>
          </View>
        )}

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
  cardinalNorthBox: {
    position: "absolute",
    top: 6,
    alignItems: "center",
  },
  cardinalEastBox: {
    position: "absolute",
    right: 8,
    alignItems: "center",
    transform: [{ rotate: "90deg" }],
  },
  cardinalSouthBox: {
    position: "absolute",
    bottom: 6,
    alignItems: "center",
    transform: [{ rotate: "180deg" }],
  },
  cardinalWestBox: {
    position: "absolute",
    left: 8,
    alignItems: "center",
    transform: [{ rotate: "270deg" }],
  },
  cardinalText: {
    fontSize: 14,
  },
  kaabaMarkerBox: {
    position: "absolute",
    width: 240,
    height: 240,
    alignItems: "center",
  },
  kaabaIconBadge: {
    top: -14,
    padding: 2,
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
  diagnosticToggleBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  diagnosticToggleRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  diagnosticToggleTitle: {
    fontSize: 13,
    fontWeight: "bold",
  },
  diagnosticPanel: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  diagTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  refreshGpsBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  refreshGpsBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  diagLine: {
    fontSize: 11,
    fontFamily: Platform.OS === "android" ? "monospace" : "Courier",
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
