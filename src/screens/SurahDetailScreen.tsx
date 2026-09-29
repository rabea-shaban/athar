import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  Play,
  Pause,
  BookOpen,
  Bookmark,
  ChevronRight,
  Mic,
  Share2,
  Sparkles,
  Info,
  X,
  Type,
} from "lucide-react-native";
import {
  getSurah,
  getTafsir,
  SurahDetail,
  TafsirAyah,
  getAyahAudioUrl,
  QURAN_RECITERS,
} from "../api/islamic";
import { useAudioStore } from "../store/audioStore";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";
import { ReciterModal } from "../components/ReciterModal";

export const SurahDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { surahNumber, surahName } = route.params;

  const {
    isDarkMode,
    preferredReciter,
    setLastRead,
    lastRead,
    fontSize,
    setFontSize,
  } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { playTrack, currentTrack, isPlaying } = useAudioStore();

  const [surahData, setSurahData] = useState<SurahDetail | null>(null);
  const [tafsirData, setTafsirData] = useState<TafsirAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTafsirAyah, setSelectedTafsirAyah] = useState<TafsirAyah | null>(
    null
  );
  const [tafsirModalVisible, setTafsirModalVisible] = useState(false);
  const [reciterModalOpen, setReciterModalOpen] = useState(false);

  const currentReciter = useMemo(() => {
    return (
      QURAN_RECITERS.find((r) => r.identifier === preferredReciter) ||
      QURAN_RECITERS[0]
    );
  }, [preferredReciter]);

  useEffect(() => {
    setLoading(true);
    Promise.all([getSurah(surahNumber, preferredReciter), getTafsir(surahNumber)])
      .then(([surahRes, tafsirRes]) => {
        setSurahData(surahRes);
        setTafsirData(tafsirRes);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Failed to load surah details:", err);
        setLoading(false);
      });
  }, [surahNumber, preferredReciter]);

  const handlePlayAyah = (ayahGlobalNumber: number, ayahNumberInSurah: number) => {
    const audioUrl = getAyahAudioUrl(ayahGlobalNumber, preferredReciter);
    playTrack({
      id: `surah_${surahNumber}_ayah_${ayahNumberInSurah}`,
      title: `سورة ${surahData?.name || surahName} - آية ${toArabicNumber(
        ayahNumberInSurah
      )}`,
      subtitle: currentReciter.name,
      audioUrl,
      reciterId: preferredReciter,
    });
  };

  const handleBookmark = (ayahNumberInSurah: number, pageNumber?: number) => {
    setLastRead({
      surahNumber,
      surahName: surahData?.name || surahName,
      ayahNumber: ayahNumberInSurah,
      pageNumber: pageNumber || 1,
    });
  };

  const openTafsir = (ayahIndex: number) => {
    if (tafsirData && tafsirData[ayahIndex]) {
      setSelectedTafsirAyah(tafsirData[ayahIndex]);
      setTafsirModalVisible(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Custom Top Navigation Bar */}
      <View
        style={[
          styles.navBar,
          { backgroundColor: theme.card, borderBottomColor: theme.border },
        ]}
      >
        <View style={styles.navLeft}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.border }]}
            onPress={() => setReciterModalOpen(true)}
          >
            <Mic size={17} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.border }]}
            onPress={() => setFontSize(fontSize === 26 ? 20 : fontSize + 2)}
          >
            <Type size={17} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.navCenter}>
          <Text style={[styles.navTitle, { color: theme.text }]}>
            {surahData?.name || surahName}
          </Text>
          <Text style={[styles.navSubtitle, { color: theme.textMuted }]}>
            {surahData
              ? `${surahData.revelationType === "Meccan" ? "مكية" : "مدنية"} • ${toArabicNumber(
                  surahData.numberOfAyahs
                )} آية`
              : ""}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <ChevronRight size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator
          color={theme.primary}
          size="large"
          style={{ marginTop: 60 }}
        />
      ) : surahData ? (
        <FlatList
          data={surahData.ayahs}
          keyExtractor={(item) => String(item.number)}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerComponent}>
              {/* Surah Banner Card */}
              <View
                style={[
                  styles.surahBanner,
                  {
                    backgroundColor: isDarkMode ? "#0e231c" : "#e6f4ea",
                    borderColor: isDarkMode ? "#194a3a" : "#bbf7d0",
                  },
                ]}
              >
                <Text style={[styles.bannerTitle, { color: theme.primary }]}>
                  {surahData.name}
                </Text>
                <Text style={[styles.bannerSubtitle, { color: theme.textMuted }]}>
                  {surahData.englishNameTranslation}
                </Text>
              </View>

              {/* Basmala (except for At-Tawbah) */}
              {surahNumber !== 9 && surahNumber !== 1 && (
                <View style={styles.basmalaContainer}>
                  <Text
                    style={[
                      styles.basmalaText,
                      { color: theme.text },
                    ]}
                  >
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </Text>
                </View>
              )}
            </View>
          }
          renderItem={({ item, index }) => {
            const isBookmarked =
              lastRead?.surahNumber === surahNumber &&
              lastRead?.ayahNumber === item.numberInSurah;

            const isPlayingThis =
              isPlaying &&
              currentTrack?.id === `surah_${surahNumber}_ayah_${item.numberInSurah}`;

            return (
              <View
                style={[
                  styles.ayahCard,
                  {
                    backgroundColor: isPlayingThis
                      ? isDarkMode
                        ? "#152e25"
                        : "#f0fdf4"
                      : theme.card,
                    borderColor: isPlayingThis
                      ? theme.primary
                      : isBookmarked
                      ? theme.accentGold
                      : theme.border,
                  },
                ]}
              >
                {/* Ayah Actions Top Bar */}
                <View style={styles.ayahActions}>
                  <View style={styles.leftActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => openTafsir(index)}
                    >
                      <Info size={16} color={theme.textMuted} />
                      <Text style={[styles.actionLabel, { color: theme.textMuted }]}>
                        التفسير
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() =>
                        handleBookmark(item.numberInSurah, item.page)
                      }
                    >
                      <Bookmark
                        size={16}
                        color={isBookmarked ? theme.accentGold : theme.textMuted}
                        fill={isBookmarked ? theme.accentGold : "transparent"}
                      />
                      <Text
                        style={[
                          styles.actionLabel,
                          {
                            color: isBookmarked
                              ? theme.accentGold
                              : theme.textMuted,
                          },
                        ]}
                      >
                        حفظ
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.playAyahBtn,
                      { backgroundColor: isPlayingThis ? theme.primary : theme.border },
                    ]}
                    onPress={() =>
                      handlePlayAyah(item.number, item.numberInSurah)
                    }
                  >
                    {isPlayingThis ? (
                      <Pause size={14} color="#ffffff" />
                    ) : (
                      <Play size={14} color={theme.text} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Ayah Arabic Text */}
                <Text
                  style={[
                    styles.ayahText,
                    { color: theme.text, fontSize },
                  ]}
                >
                  {item.text}{" "}
                  <Text style={[styles.ayahBadge, { color: theme.primary }]}>
                    ﴿{toArabicNumber(item.numberInSurah)}﴾
                  </Text>
                </Text>
              </View>
            );
          }}
        />
      ) : null}

      {/* Tafsir Modal */}
      <Modal
        visible={tafsirModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setTafsirModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => setTafsirModalVisible(false)}
              style={styles.closeBtn}
            >
              <X size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              التفسير الميسر
            </Text>
            <View style={{ width: 36 }} />
          </View>

          {selectedTafsirAyah ? (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View
                style={[
                  styles.tafsirAyahCard,
                  {
                    backgroundColor: isDarkMode ? "#172233" : "#f8fafc",
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={[styles.tafsirAyahText, { color: theme.primary }]}>
                  {selectedTafsirAyah.arabic_text}
                </Text>
              </View>

              <Text style={[styles.tafsirLabel, { color: theme.textMuted }]}>
                معنى وتفسير الآية:
              </Text>

              <Text
                style={[
                  styles.tafsirExplanation,
                  { color: theme.text, lineHeight: 28 },
                ]}
              >
                {selectedTafsirAyah.translation}
              </Text>
            </ScrollView>
          ) : null}
        </View>
      </Modal>

      <ReciterModal
        visible={reciterModalOpen}
        onClose={() => setReciterModalOpen(false)}
      />
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
  navLeft: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  navCenter: {
    alignItems: "center",
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  navSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 40,
    gap: 12,
  },
  headerComponent: {
    paddingVertical: 16,
    alignItems: "center",
  },
  surahBanner: {
    width: "100%",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  bannerSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  basmalaContainer: {
    marginTop: 18,
    alignItems: "center",
  },
  basmalaText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  ayahCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  ayahActions: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  leftActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 14,
  },
  actionBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  actionLabel: {
    fontSize: 11,
  },
  playAyahBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  ayahText: {
    textAlign: "right",
    lineHeight: 38,
    fontWeight: "500",
  },
  ayahBadge: {
    fontSize: 18,
    fontWeight: "bold",
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
  modalContent: {
    padding: 18,
  },
  tafsirAyahCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  tafsirAyahText: {
    fontSize: 18,
    textAlign: "right",
    lineHeight: 32,
    fontWeight: "600",
  },
  tafsirLabel: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "right",
  },
  tafsirExplanation: {
    fontSize: 15,
    textAlign: "right",
  },
});
