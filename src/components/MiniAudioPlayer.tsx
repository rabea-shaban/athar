import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Play, Pause, X, Radio } from "lucide-react-native";
import { useAudioStore } from "../store/audioStore";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";
import { FullAudioPlayerModal } from "./FullAudioPlayerModal";

export const MiniAudioPlayer: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { currentTrack, isPlaying, isLoading, togglePlay, stopTrack, duration, position } =
    useAudioStore();

  if (!currentTrack) return null;

  const progressPercentage =
    duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setModalVisible(true)}
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode ? "#0d1522" : "#1a5d44",
            borderColor: isDarkMode ? "#1e293b" : "#2e7d5d",
          },
        ]}
      >
        {/* Top Progress bar if applicable */}
        {!currentTrack.isLive && (
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercentage}%`, backgroundColor: theme.accentGold },
              ]}
            />
          </View>
        )}

        <View style={styles.innerContent}>
          {/* Close / Stop Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={(e) => {
              e.stopPropagation();
              stopTrack();
            }}
          >
            <X size={18} color="#ffffffa0" />
          </TouchableOpacity>

          {/* Track Info */}
          <View style={styles.trackInfo}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {currentTrack.subtitle || (currentTrack.isLive ? "بث مباشر" : "منصة أَثَر")}
            </Text>
          </View>

          {/* Play / Pause Button */}
          <TouchableOpacity
            style={[
              styles.playBtn,
              { backgroundColor: isDarkMode ? theme.primary : "#ffffff" },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          >
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color={isDarkMode ? "#ffffff" : "#1a5d44"}
              />
            ) : isPlaying ? (
              <Pause
                size={18}
                color={isDarkMode ? "#ffffff" : "#1a5d44"}
                fill={isDarkMode ? "#ffffff" : "#1a5d44"}
              />
            ) : (
              <Play
                size={18}
                color={isDarkMode ? "#ffffff" : "#1a5d44"}
                fill={isDarkMode ? "#ffffff" : "#1a5d44"}
              />
            )}
          </TouchableOpacity>

          {/* Icon Badge */}
          <View style={styles.iconBadge}>
            <Radio size={16} color="#ffffff" />
          </View>
        </View>
      </TouchableOpacity>

      <FullAudioPlayerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    overflow: "hidden",
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
    width: "100%",
  },
  progressBarFill: {
    height: 3,
  },
  innerContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  trackInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  title: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "right",
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginTop: 2,
    textAlign: "right",
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    padding: 6,
  },
});
