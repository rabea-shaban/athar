import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
  ScrollView,
} from "react-native";
import {
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Radio,
  Share2,
  Timer,
  Check,
  X,
} from "lucide-react-native";
import { useAudioStore } from "../store/audioStore";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";
import { formatTime, toArabicNumber } from "../utils/arabic";

interface FullAudioPlayerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FullAudioPlayerModal: React.FC<FullAudioPlayerModalProps> = ({
  visible,
  onClose,
}) => {
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [timerModalVisible, setTimerModalVisible] = useState(false);

  const {
    currentTrack,
    isPlaying,
    isLoading,
    position,
    duration,
    playbackSpeed,
    sleepTimerMinutes,
    sleepTimerRemainingSecs,
    togglePlay,
    skipSeconds,
    setPlaybackSpeed,
    setSleepTimer,
  } = useAudioStore();

  if (!currentTrack) return null;

  const speeds = [0.75, 1.0, 1.25, 1.5];

  const handleNextSpeed = () => {
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `استمع إلى ${currentTrack.title} عبر تطبيق أَثَر الإسلامي: https://athar-library.vercel.app`,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const timerOptions = [
    { minutes: null, label: "إيقاف مؤقت النوم" },
    { minutes: 15, label: "١٥ دقيقة" },
    { minutes: 30, label: "٣٠ دقيقة" },
    { minutes: 45, label: "٤٥ دقيقة" },
    { minutes: 60, label: "٦٠ دقيقة (ساعة واحدة)" },
    { minutes: 90, label: "٩٠ دقيقة (ساعة ونصف)" },
  ];

  const formatRemainingTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const sStr = s < 10 ? `0${s}` : `${s}`;
    return `${toArabicNumber(m)} د : ${toArabicNumber(sStr)} ث`;
  };

  const progressPercentage =
    duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        {/* Header bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <ChevronDown size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: theme.textMuted }]}>
            {currentTrack.isLive ? "بث مباشر 24/7" : "مشغل الصوتيات"}
          </Text>
          <TouchableOpacity onPress={handleShare} style={styles.closeBtn}>
            <Share2 size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Artwork Card */}
        <View style={styles.artworkContainer}>
          <View
            style={[
              styles.artworkCard,
              {
                backgroundColor: isDarkMode ? "#172535" : "#e6f4ea",
                borderColor: theme.border,
              },
            ]}
          >
            <Radio size={80} color={theme.primary} />
            <Text style={[styles.artSubtitle, { color: theme.textMuted }]}>
              منصة أَثَر الإسلامية
            </Text>
          </View>
        </View>

        {/* Track info */}
        <View style={styles.infoSection}>
          <Text style={[styles.trackTitle, { color: theme.text }]} numberOfLines={2}>
            {currentTrack.title}
          </Text>
          {currentTrack.subtitle ? (
            <Text style={[styles.trackSubtitle, { color: theme.textMuted }]}>
              {currentTrack.subtitle}
            </Text>
          ) : null}
        </View>

        {/* Sleep Timer Countdown Active Badge */}
        {sleepTimerMinutes && sleepTimerRemainingSecs !== null ? (
          <TouchableOpacity
            style={[
              styles.timerActiveBadge,
              {
                backgroundColor: isDarkMode ? "#0d281e" : "#ecfdf5",
                borderColor: theme.primary,
              },
            ]}
            onPress={() => setTimerModalVisible(true)}
            activeOpacity={0.8}
          >
            <Timer size={15} color={theme.primary} />
            <Text style={[styles.timerActiveText, { color: theme.primary }]}>
              مؤقت النوم مفعّل: متبقي {formatRemainingTimer(sleepTimerRemainingSecs)}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Progress Bar (if not live) */}
        {!currentTrack.isLive ? (
          <View style={styles.progressSection}>
            <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: theme.primary,
                    width: `${progressPercentage}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.timeRow}>
              <Text style={[styles.timeText, { color: theme.textMuted }]}>
                {toArabicNumber(formatTime(duration))}
              </Text>
              <Text style={[styles.timeText, { color: theme.textMuted }]}>
                {toArabicNumber(formatTime(position))}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.liveBadgeRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>جاري البث المباشر بـ الخلفية وقفل الشاشة</Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.secondaryControl, { backgroundColor: theme.border }]}
            onPress={handleNextSpeed}
          >
            <Text style={[styles.speedText, { color: theme.text }]}>
              {playbackSpeed}x
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => skipSeconds(-10)}
            disabled={currentTrack.isLive}
          >
            <RotateCcw size={26} color={currentTrack.isLive ? theme.border : theme.text} />
            <Text style={[styles.skipBadge, { color: theme.textMuted }]}>١٠</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainPlayBtn, { backgroundColor: theme.primary }]}
            onPress={togglePlay}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : isPlaying ? (
              <Pause size={30} color="#fff" fill="#fff" />
            ) : (
              <Play size={30} color="#fff" fill="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => skipSeconds(10)}
            disabled={currentTrack.isLive}
          >
            <RotateCw size={26} color={currentTrack.isLive ? theme.border : theme.text} />
            <Text style={[styles.skipBadge, { color: theme.textMuted }]}>١٠</Text>
          </TouchableOpacity>

          {/* Sleep Timer Button */}
          <TouchableOpacity
            style={[
              styles.secondaryControl,
              {
                backgroundColor: sleepTimerMinutes
                  ? theme.primary
                  : theme.border,
              },
            ]}
            onPress={() => setTimerModalVisible(true)}
          >
            <Timer
              size={20}
              color={sleepTimerMinutes ? "#ffffff" : theme.text}
            />
          </TouchableOpacity>
        </View>

        {/* Sleep Timer Modal Selection Sheet */}
        <Modal
          visible={timerModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setTimerModalVisible(false)}
        >
          <View style={[styles.timerModalContainer, { backgroundColor: theme.card }]}>
            <View style={[styles.timerModalHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity
                onPress={() => setTimerModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={22} color={theme.text} />
              </TouchableOpacity>

              <View style={styles.timerTitleRow}>
                <Timer size={20} color={theme.primary} />
                <Text style={[styles.timerModalTitle, { color: theme.text }]}>
                  مؤقت النوم (الإيقاف التلقائي)
                </Text>
              </View>

              <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={styles.timerModalList}>
              <Text style={[styles.timerSubtitle, { color: theme.textMuted }]}>
                سيقوم المشغل بـ إيقاف البث أوتوماتيكياً بعد انقضاء الوقت المحدد:
              </Text>

              {timerOptions.map((opt, idx) => {
                const isSelected = sleepTimerMinutes === opt.minutes;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.timerOptionItem,
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
                      setSleepTimer(opt.minutes);
                      setTimerModalVisible(false);
                    }}
                  >
                    {isSelected ? <Check size={18} color={theme.primary} /> : <View />}
                    <Text
                      style={[
                        styles.timerOptionLabel,
                        {
                          color: isSelected ? theme.primary : theme.text,
                          fontWeight: isSelected ? "bold" : "500",
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeBtn: {
    padding: 8,
  },
  topTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  artworkContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  artworkCard: {
    width: 240,
    height: 240,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  artSubtitle: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "500",
  },
  infoSection: {
    alignItems: "center",
    marginVertical: 12,
  },
  trackTitle: {
    fontSize: 19,
    fontWeight: "bold",
    textAlign: "center",
  },
  trackSubtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
  timerActiveBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "center",
    marginVertical: 4,
  },
  timerActiveText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  progressSection: {
    marginVertical: 14,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
  },
  liveBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginVertical: 14,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
  },
  liveText: {
    color: "#ef4444",
    fontWeight: "bold",
    fontSize: 13,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  mainPlayBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  skipBtn: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  skipBadge: {
    fontSize: 10,
    marginTop: 2,
  },
  secondaryControl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  speedText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  timerModalContainer: {
    flex: 1,
  },
  timerModalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  timerTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  timerModalTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timerModalList: {
    padding: 20,
    gap: 12,
  },
  timerSubtitle: {
    fontSize: 13,
    textAlign: "right",
    marginBottom: 8,
  },
  timerOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  timerOptionLabel: {
    fontSize: 14,
  },
});
