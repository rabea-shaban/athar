import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  Radio as RadioIcon,
  Play,
  Pause,
  Search,
  Star,
  Sparkles,
  Volume2,
} from "lucide-react-native";
import { Header } from "../components/Header";
import { getRadioStations, RadioStation } from "../api/islamic";
import { useAudioStore } from "../store/audioStore";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";

export const RadioScreen: React.FC = () => {
  const { isDarkMode, favoriteRadios, toggleFavoriteRadio } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioStore();

  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getRadioStations()
      .then((data) => {
        setStations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Failed to fetch radio stations:", err);
        setLoading(false);
      });
  }, []);

  const filteredStations = useMemo(() => {
    return stations.filter((st) =>
      st.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stations, searchQuery]);

  const handleToggleStation = (station: RadioStation) => {
    const isThisStation = currentTrack?.id === `radio_${station.id}`;
    if (isThisStation) {
      togglePlay();
    } else {
      playTrack({
        id: `radio_${station.id}`,
        title: station.name,
        subtitle: "بث إذاعي مباشر 24/7",
        audioUrl: station.url,
        isLive: true,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="الإذاعات الإسلامية"
        subtitle="بث مباشر لإذاعة القرآن الكريم وكبار القراء"
      />

      {/* Search bar */}
      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="ابحث عن محطة إذاعية أو قارئ..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
          <Search size={18} color={theme.textMuted} />
        </View>
      </View>

      {/* Radio Stations List */}
      {loading ? (
        <ActivityIndicator
          color={theme.primary}
          size="large"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={filteredStations}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isCurrent = currentTrack?.id === `radio_${item.id}`;
            const isPlayingThis = isCurrent && isPlaying;
            const isFav = favoriteRadios.includes(item.id);

            return (
              <TouchableOpacity
                style={[
                  styles.stationCard,
                  {
                    backgroundColor: isPlayingThis
                      ? isDarkMode
                        ? "#0f3226"
                        : "#ecfdf5"
                      : theme.card,
                    borderColor: isPlayingThis ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => handleToggleStation(item)}
                activeOpacity={0.7}
              >
                <View style={styles.leftCol}>
                  <TouchableOpacity
                    onPress={() => toggleFavoriteRadio(item.id)}
                    style={styles.favBtn}
                  >
                    <Star
                      size={18}
                      color={isFav ? theme.accentGold : theme.textMuted}
                      fill={isFav ? theme.accentGold : "transparent"}
                    />
                  </TouchableOpacity>

                  <View
                    style={[
                      styles.playBtn,
                      {
                        backgroundColor: isPlayingThis
                          ? theme.primary
                          : isDarkMode
                          ? "#172233"
                          : "#f1f5f9",
                      },
                    ]}
                  >
                    {isPlayingThis ? (
                      <Pause size={18} color="#ffffff" />
                    ) : (
                      <Play
                        size={18}
                        color={isPlayingThis ? "#ffffff" : theme.text}
                      />
                    )}
                  </View>
                </View>

                <View style={styles.rightCol}>
                  <View style={styles.stationInfo}>
                    <Text
                      style={[
                        styles.stationName,
                        {
                          color: isPlayingThis ? theme.primary : theme.text,
                          fontWeight: isPlayingThis ? "bold" : "600",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <View style={styles.liveBadgeRow}>
                      <View
                        style={[
                          styles.liveDot,
                          {
                            backgroundColor: isPlayingThis
                              ? "#22c55e"
                              : theme.textMuted,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.liveText,
                          {
                            color: isPlayingThis
                              ? "#22c55e"
                              : theme.textMuted,
                          },
                        ]}
                      >
                        {isPlayingThis ? "جاري الاستماع الآن" : "بث مباشر"}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.radioIconBadge,
                      {
                        backgroundColor: isPlayingThis
                          ? theme.primary
                          : "rgba(16,185,129,0.12)",
                      },
                    ]}
                  >
                    <RadioIcon
                      size={20}
                      color={isPlayingThis ? "#ffffff" : theme.primary}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 10,
  },
  stationCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  rightCol: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  radioIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  stationInfo: {
    alignItems: "flex-end",
    flex: 1,
  },
  stationName: {
    fontSize: 15,
    textAlign: "right",
  },
  liveBadgeRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 11,
  },
  leftCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  favBtn: {
    padding: 6,
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
});
