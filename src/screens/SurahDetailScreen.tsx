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
  Share,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  Play,
  Pause,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Mic,
  Share2,
  Copy,
  Info,
  X,
  AlignJustify,
  Minus,
  Plus,
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
import { lightTheme, darkTheme, FONTS } from "../constants/theme";
import {
  toArabicNumber,
  SURAH_PAGES,
  cleanSurahName,
  isDivineWord,
} from "../utils/arabic";
import { ReciterModal } from "../components/ReciterModal";
import { QuranPageView } from "../components/QuranPageView";

const FONT_SCALES = [19, 22, 25, 29, 34];

export const SurahDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { surahNumber = 1, surahName = "الفاتحة", initialPage } =
    route.params || {};

  const {
    isDarkMode,
    preferredReciter,
    setLastRead,
    lastRead,
    favoriteSurahs,
  } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioStore();

  // Mode: "mushaf" (صفحات المصحف) or "ayah" (عرض الآيات)
  const [viewMode, setViewMode] = useState<"mushaf" | "ayah">("mushaf");

  // Font scale: 1 to 5 (Default 3)
  const [fontScale, setFontScale] = useState(3);

  const [surahData, setSurahData] = useState<SurahDetail | null>(null);
  const [tafsirData, setTafsirData] = useState<TafsirAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTafsirAyah, setSelectedTafsirAyah] =
    useState<TafsirAyah | null>(null);
  const [tafsirModalVisible, setTafsirModalVisible] = useState(false);
  const [reciterModalOpen, setReciterModalOpen] = useState(false);
  const [copiedAyahNum, setCopiedAyahNum] = useState<number | null>(null);

  const startPageNum = useMemo(() => {
    if (initialPage) return initialPage;
    if (SURAH_PAGES[surahNumber]) return SURAH_PAGES[surahNumber].page;
    return 1;
  }, [initialPage, surahNumber]);

  const currentReciter = useMemo(() => {
    return (
      QURAN_RECITERS.find((r) => r.identifier === preferredReciter) ||
      QURAN_RECITERS[0]
    );
  }, [preferredReciter]);

  const currentFontSize = FONT_SCALES[fontScale - 1] || 25;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSurah(surahNumber, preferredReciter),
      getTafsir(surahNumber),
    ])
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

  const handlePlayAyah = (
    ayahGlobalNumber: number,
    ayahNumberInSurah: number
  ) => {
    const isPlayingThis =
      isPlaying &&
      currentTrack?.id === `surah_${surahNumber}_ayah_${ayahNumberInSurah}`;

    if (isPlayingThis) {
      togglePlay();
      return;
    }

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

  const handleBookmarkAyah = (
    ayahNumberInSurah: number,
    pageNumber?: number
  ) => {
    setLastRead({
      surahNumber,
      surahName: surahData?.name || surahName,
      ayahNumber: ayahNumberInSurah,
      pageNumber: pageNumber || startPageNum,
    });
  };

  const handleCopyAyah = async (text: string, ayahNum: number) => {
    await Clipboard.setStringAsync(text);
    setCopiedAyahNum(ayahNum);
    setTimeout(() => setCopiedAyahNum(null), 2000);
  };

  const handleShareAyah = (text: string, ayahNum: number) => {
    Share.share({
      message: `${text}\n\n— سورة ${cleanSurahName(
        surahData?.name || surahName
      )}، آية ${ayahNum}`,
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
      {/* ─── Top Header Navigation Bar ─── */}
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
          style={[styles.iconButton, { backgroundColor: theme.border }]}
          onPress={() => setReciterModalOpen(true)}
        >
          <Mic size={17} color={theme.primary} />
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <Text
            style={[
              styles.navTitle,
              { color: theme.text, fontFamily: FONTS.amiriBold },
            ]}
          >
            {surahData?.name || `سورة ${cleanSurahName(surahName)}`}
          </Text>
          <Text style={[styles.navSubtitle, { color: theme.textMuted }]}>
            {surahData
              ? `${
                  surahData.revelationType === "Meccan" ? "مكية" : "مدنية"
                } • ${toArabicNumber(surahData.numberOfAyahs)} آية`
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

      {/* ─── View Mode Switcher & Font Controls Toolbar ─── */}
      <View
        style={[
          styles.toolbarCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        {/* Right side: Segmented Mode Switcher */}
        <View
          style={[
            styles.segmentedContainer,
            {
              backgroundColor: isDarkMode ? "#172233" : "#f1f5f9",
              borderColor: theme.border,
            },
          ]}
        >
          {/* 1. عرض الآيات */}
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              viewMode === "ayah" && [
                styles.segmentBtnActive,
                {
                  backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                  shadowColor: isDarkMode ? "#000" : "#94a3b8",
                },
              ],
            ]}
            onPress={() => setViewMode("ayah")}
            activeOpacity={0.8}
          >
            <AlignJustify
              size={14}
              color={viewMode === "ayah" ? theme.text : theme.textMuted}
            />
            <Text
              style={[
                styles.segmentBtnText,
                {
                  color: viewMode === "ayah" ? theme.text : theme.textMuted,
                  fontFamily: FONTS.amiriBold,
                  fontWeight: viewMode === "ayah" ? "bold" : "500",
                },
              ]}
            >
              عرض الآيات
            </Text>
          </TouchableOpacity>

          {/* 2. صفحات المصحف */}
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              viewMode === "mushaf" && [
                styles.segmentBtnActive,
                {
                  backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                  shadowColor: isDarkMode ? "#000" : "#94a3b8",
                },
              ],
            ]}
            onPress={() => setViewMode("mushaf")}
            activeOpacity={0.8}
          >
            <BookOpen
              size={14}
              color={viewMode === "mushaf" ? theme.text : theme.textMuted}
            />
            <Text
              style={[
                styles.segmentBtnText,
                {
                  color: viewMode === "mushaf" ? theme.text : theme.textMuted,
                  fontFamily: FONTS.amiriBold,
                  fontWeight: viewMode === "mushaf" ? "bold" : "500",
                },
              ]}
            >
              صفحات المصحف
            </Text>
          </TouchableOpacity>
        </View>

        {/* Left side: Font Size Stepper (حجم الخط: - 3 +) */}
        <View style={styles.fontStepperRow}>
          <Text
            style={[
              styles.fontLabel,
              { color: theme.textMuted, fontFamily: FONTS.amiri },
            ]}
          >
            حجم الخط:
          </Text>

          <View
            style={[
              styles.stepperBox,
              {
                backgroundColor: isDarkMode ? "#172233" : "#f1f5f9",
                borderColor: theme.border,
              },
            ]}
          >
            {/* Minus */}
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setFontScale((s) => Math.max(1, s - 1))}
              disabled={fontScale <= 1}
            >
              <Minus
                size={12}
                color={fontScale <= 1 ? theme.border : theme.text}
              />
            </TouchableOpacity>

            {/* Current Scale Number */}
            <Text
              style={[
                styles.stepValue,
                { color: theme.text, fontFamily: FONTS.amiriBold },
              ]}
            >
              {toArabicNumber(fontScale)}
            </Text>

            {/* Plus */}
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setFontScale((s) => Math.min(5, s + 1))}
              disabled={fontScale >= 5}
            >
              <Plus
                size={12}
                color={fontScale >= 5 ? theme.border : theme.text}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ─── Mode 1: صفحات المصحف (Mushaf Page Frame) ─── */}
      {viewMode === "mushaf" ? (
        <QuranPageView
          initialPage={startPageNum}
          initialSurahNumber={surahNumber}
          fontScale={fontScale}
        />
      ) : loading ? (
        <ActivityIndicator
          color={theme.primary}
          size="large"
          style={{ marginTop: 60 }}
        />
      ) : surahData ? (
        /* ─── Mode 2: عرض الآيات (Clean Ayah Cards Matching Screenshot 2) ─── */
        <FlatList
          data={surahData.ayahs}
          keyExtractor={(item) => String(item.number)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            surahNumber !== 9 && surahNumber !== 1 ? (
              <View style={styles.basmalaContainer}>
                <Text
                  style={[
                    styles.basmalaText,
                    { color: theme.text, fontFamily: FONTS.amiriBold },
                  ]}
                >
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item, index }) => {
            const isBookmarked =
              lastRead?.surahNumber === surahNumber &&
              lastRead?.ayahNumber === item.numberInSurah;

            const isPlayingThis =
              isPlaying &&
              currentTrack?.id ===
                `surah_${surahNumber}_ayah_${item.numberInSurah}`;

            const words = item.text.split(" ");

            return (
              <View
                style={[
                  styles.cleanAyahCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: isPlayingThis
                      ? theme.primary
                      : isBookmarked
                      ? "#f59e0b"
                      : theme.border,
                    borderWidth: isPlayingThis || isBookmarked ? 1.5 : 1,
                    shadowColor: isDarkMode ? "#000" : "#64748b",
                  },
                ]}
              >
                {/* Top-Right Circle Badge (Ayah Number in Green) */}
                <View style={styles.cardHeaderRow}>
                  <View
                    style={[
                      styles.circleAyahBadge,
                      {
                        backgroundColor: isDarkMode ? "#064e3b" : "#d1fae5",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.circleAyahBadgeText,
                        { color: isDarkMode ? "#34d399" : "#059669" },
                      ]}
                    >
                      ({item.numberInSurah})
                    </Text>
                  </View>
                </View>

                {/* Ayah Text in Center (with red Divine word highlighting) */}
                <View style={styles.cleanAyahTextContainer}>
                  <Text
                    style={[
                      styles.cleanAyahParagraph,
                      {
                        color: theme.text,
                        fontSize: currentFontSize,
                        lineHeight: currentFontSize * 2.2,
                        fontFamily: FONTS.amiri,
                      },
                    ]}
                  >
                    {words.map((word, wIdx) => {
                      const isDivine = isDivineWord(word);
                      return (
                        <Text
                          key={wIdx}
                          style={[
                            isDivine && {
                              color: isDarkMode ? "#f87171" : "#dc2626",
                              fontFamily: FONTS.amiriBold,
                            },
                          ]}
                        >
                          {word}
                          {wIdx < words.length - 1 ? " " : ""}
                        </Text>
                      );
                    })}
                  </Text>
                </View>

                {/* Bottom Action Row (وضع علامة | تشغيل | تفسير | نسخ | مشاركة | مفضلة) */}
                <View style={styles.cardActionRow}>
                  {/* Left Action Icons */}
                  <View style={styles.actionIconsLeft}>
                    {/* Bookmark Favorite */}
                    <TouchableOpacity
                      style={styles.cleanIconBtn}
                      onPress={() =>
                        handleBookmarkAyah(item.numberInSurah, item.page)
                      }
                    >
                      <Bookmark
                        size={18}
                        color={isBookmarked ? "#d97706" : theme.textMuted}
                        fill={isBookmarked ? "#d97706" : "transparent"}
                      />
                    </TouchableOpacity>

                    {/* Share */}
                    <TouchableOpacity
                      style={styles.cleanIconBtn}
                      onPress={() =>
                        handleShareAyah(item.text, item.numberInSurah)
                      }
                    >
                      <Share2 size={18} color={theme.textMuted} />
                    </TouchableOpacity>

                    {/* Copy */}
                    <TouchableOpacity
                      style={styles.cleanIconBtn}
                      onPress={() =>
                        handleCopyAyah(item.text, item.numberInSurah)
                      }
                    >
                      <Copy
                        size={18}
                        color={
                          copiedAyahNum === item.numberInSurah
                            ? "#10b981"
                            : theme.textMuted
                        }
                      />
                    </TouchableOpacity>

                    {/* Tafsir */}
                    <TouchableOpacity
                      style={styles.cleanIconBtn}
                      onPress={() => openTafsir(index)}
                    >
                      <BookOpen size={18} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Right Primary Action Buttons */}
                  <View style={styles.actionButtonsRight}>
                    {/* Play Button */}
                    <TouchableOpacity
                      style={styles.cleanActionBtn}
                      onPress={() =>
                        handlePlayAyah(item.number, item.numberInSurah)
                      }
                    >
                      {isPlayingThis ? (
                        <Pause size={15} color={theme.primary} />
                      ) : (
                        <Play size={15} color={theme.text} />
                      )}
                      <Text
                        style={[
                          styles.cleanActionBtnText,
                          {
                            color: isPlayingThis ? theme.primary : theme.text,
                            fontFamily: FONTS.amiri,
                          },
                        ]}
                      >
                        {isPlayingThis ? "إيقاف" : "تشغيل"}
                      </Text>
                    </TouchableOpacity>

                    {/* Bookmark Stop Marker Button */}
                    <TouchableOpacity
                      style={styles.cleanActionBtn}
                      onPress={() =>
                        handleBookmarkAyah(item.numberInSurah, item.page)
                      }
                    >
                      <BookmarkCheck
                        size={15}
                        color={isBookmarked ? "#d97706" : theme.textMuted}
                      />
                      <Text
                        style={[
                          styles.cleanActionBtnText,
                          {
                            color: isBookmarked ? "#d97706" : theme.textMuted,
                            fontFamily: FONTS.amiri,
                          },
                        ]}
                      >
                        {isBookmarked ? "علامة وقوف" : "وضع علامة"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      ) : null}

      {/* ─── Tafsir Modal ─── */}
      <Modal
        visible={tafsirModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setTafsirModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: theme.border },
            ]}
          >
            <TouchableOpacity
              onPress={() => setTafsirModalVisible(false)}
              style={styles.closeBtn}
            >
              <X size={22} color={theme.text} />
            </TouchableOpacity>
            <Text
              style={[
                styles.modalTitle,
                { color: theme.text, fontFamily: FONTS.amiriBold },
              ]}
            >
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
                <Text
                  style={[
                    styles.tafsirAyahText,
                    { color: theme.primary, fontFamily: FONTS.amiriBold },
                  ]}
                >
                  {selectedTafsirAyah.arabic_text}
                </Text>
              </View>

              <Text
                style={[
                  styles.tafsirLabel,
                  { color: theme.textMuted },
                ]}
              >
                معنى وتفسير الآية:
              </Text>

              <Text
                style={[
                  styles.tafsirExplanation,
                  {
                    color: theme.text,
                    lineHeight: 28,
                    fontFamily: FONTS.amiri,
                  },
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
    paddingVertical: 10,
    borderBottomWidth: 1,
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
  },
  navSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  toolbarCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  segmentedContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  segmentBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  segmentBtnActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 12,
  },
  fontStepperRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  fontLabel: {
    fontSize: 12,
  },
  stepperBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 6,
  },
  stepBtn: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: {
    fontSize: 13,
    paddingHorizontal: 2,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 40,
    gap: 12,
  },
  basmalaContainer: {
    marginVertical: 12,
    alignItems: "center",
  },
  basmalaText: {
    fontSize: 22,
  },
  cleanAyahCard: {
    borderRadius: 20,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 8,
  },
  circleAyahBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  circleAyahBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cleanAyahTextContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cleanAyahParagraph: {
    textAlign: "center",
  },
  cardActionRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 0.8,
    borderTopColor: "rgba(150, 150, 150, 0.15)",
  },
  actionButtonsRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  cleanActionBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  cleanActionBtnText: {
    fontSize: 12,
  },
  actionIconsLeft: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 14,
  },
  cleanIconBtn: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
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
