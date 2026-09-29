import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  Share,
  Dimensions,
  TextInput,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import {
  ChevronRight,
  ChevronLeft,
  BookmarkCheck,
  Bookmark,
  Play,
  Pause,
  BookOpen,
  Copy,
  Share2,
  X,
  Sparkles,
} from "lucide-react-native";
import {
  getQuranPage,
  getTafsir,
  getAyahAudioUrl,
  QuranPageAyah,
  TafsirAyah,
  QURAN_RECITERS,
} from "../api/islamic";
import { useAudioStore } from "../store/audioStore";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme, FONTS } from "../constants/theme";
import {
  toArabicNumber,
  isDivineWord,
  stripBismillah,
  cleanSurahName,
  JUZ_NAMES,
  SURAH_PAGES,
} from "../utils/arabic";

const { width } = Dimensions.get("window");
const TOTAL_PAGES = 604;

interface Props {
  initialPage?: number;
  initialSurahNumber?: number;
  onPageChanged?: (page: number, surahNumber: number) => void;
}

export const QuranPageView: React.FC<Props> = ({
  initialPage = 1,
  initialSurahNumber,
  onPageChanged,
}) => {
  const { isDarkMode, preferredReciter, setLastRead, lastRead, fontSize } =
    usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioStore();

  // Determine starting page
  const startPage = useMemo(() => {
    if (initialPage && initialPage >= 1 && initialPage <= TOTAL_PAGES) {
      return initialPage;
    }
    if (initialSurahNumber && SURAH_PAGES[initialSurahNumber]) {
      return SURAH_PAGES[initialSurahNumber].page;
    }
    return 1;
  }, [initialPage, initialSurahNumber]);

  const [currentPage, setCurrentPage] = useState(startPage);
  const [ayahs, setAyahs] = useState<QuranPageAyah[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Ayah for modal
  const [selectedAyah, setSelectedAyah] = useState<QuranPageAyah | null>(null);
  const [tafsirData, setTafsirData] = useState<TafsirAyah | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [copied, setCopied] = useState(false);

  // Page Jump Modal
  const [jumpModalOpen, setJumpModalOpen] = useState(false);
  const [jumpInput, setJumpInput] = useState(String(currentPage));

  const currentReciter = useMemo(() => {
    return (
      QURAN_RECITERS.find((r) => r.identifier === preferredReciter) ||
      QURAN_RECITERS[0]
    );
  }, [preferredReciter]);

  const loadPage = useCallback(
    (pageNumber: number) => {
      setLoading(true);
      setSelectedAyah(null);
      setShowTafsir(false);
      setTafsirData(null);

      getQuranPage(pageNumber)
        .then((data) => {
          setAyahs(data.ayahs || []);
          if (data.ayahs && data.ayahs.length > 0) {
            const first = data.ayahs[0];
            onPageChanged?.(pageNumber, first.surah.number);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.warn("Failed to load Quran page:", err);
          setLoading(false);
        });
    },
    [onPageChanged]
  );

  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage, loadPage]);

  // Group ayahs by surah on this page
  const groups = useMemo(() => {
    const list: {
      surahName: string;
      surahNumber: number;
      ayahs: QuranPageAyah[];
    }[] = [];
    for (const ayah of ayahs) {
      const last = list[list.length - 1];
      if (!last || last.surahNumber !== ayah.surah.number) {
        list.push({
          surahName: ayah.surah.name,
          surahNumber: ayah.surah.number,
          ayahs: [ayah],
        });
      } else {
        last.ayahs.push(ayah);
      }
    }
    return list;
  }, [ayahs]);

  const firstAyah = ayahs[0];
  const juz = firstAyah?.juz || 1;
  const currentSurahName = firstAyah?.surah.name || "";
  const juzTitle = JUZ_NAMES[juz] || `الجُزْءُ ${toArabicNumber(juz)}`;

  const handlePlayAyah = (ayah: QuranPageAyah) => {
    const isPlayingThis =
      isPlaying &&
      currentTrack?.id === `surah_${ayah.surah.number}_ayah_${ayah.numberInSurah}`;

    if (isPlayingThis) {
      togglePlay();
      return;
    }

    const audioUrl = getAyahAudioUrl(ayah.number, preferredReciter);
    playTrack({
      id: `surah_${ayah.surah.number}_ayah_${ayah.numberInSurah}`,
      title: `سورة ${ayah.surah.name} - آية ${toArabicNumber(
        ayah.numberInSurah
      )}`,
      subtitle: currentReciter.name,
      audioUrl,
      reciterId: preferredReciter,
    });
  };

  const handleBookmark = (ayah: QuranPageAyah) => {
    setLastRead({
      surahNumber: ayah.surah.number,
      surahName: ayah.surah.name,
      ayahNumber: ayah.numberInSurah,
      pageNumber: currentPage,
    });
  };

  const handleFetchTafsir = async (ayah: QuranPageAyah) => {
    if (showTafsir) {
      setShowTafsir(false);
      return;
    }
    setShowTafsir(true);
    if (!tafsirData) {
      setLoadingTafsir(true);
      try {
        const list = await getTafsir(ayah.surah.number);
        const item = list.find((t) => t.aya === ayah.numberInSurah);
        setTafsirData(item || null);
      } catch {
        setTafsirData(null);
      } finally {
        setLoadingTafsir(false);
      }
    }
  };

  const handleCopyAyah = async (text: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareAyah = (ayah: QuranPageAyah) => {
    Share.share({
      message: `${ayah.text}\n\n— سورة ${cleanSurahName(
        ayah.surah.name
      )}، آية ${ayah.numberInSurah}`,
    });
  };

  const goToNextPage = () => {
    if (currentPage < TOTAL_PAGES) {
      setCurrentPage((p) => p + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  const handleJumpToPage = () => {
    const num = parseInt(jumpInput, 10);
    if (!isNaN(num) && num >= 1 && num <= TOTAL_PAGES) {
      setCurrentPage(num);
      setJumpModalOpen(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ─── Authentic Mushaf Page Frame ─── */}
      <View
        style={[
          styles.outerFrame,
          {
            borderColor: isDarkMode ? "#10b981" : "#0d9488",
            backgroundColor: isDarkMode ? "#0c1520" : "#fefdfa",
          },
        ]}
      >
        <View
          style={[
            styles.innerFrame,
            {
              borderColor: isDarkMode ? "#194a3a" : "#2dd4bf",
              backgroundColor: isDarkMode ? "#0d1824" : "#ffffff",
            },
          ]}
        >
          {/* Top Header Inside Mushaf Page */}
          <View style={styles.pageHeaderRow}>
            {/* Right Badge: Surah Name */}
            <View
              style={[
                styles.headerBadge,
                {
                  backgroundColor: isDarkMode ? "#1a2a36" : "#fef3c7",
                  borderColor: isDarkMode ? "#374151" : "#fde68a",
                },
              ]}
            >
              <Text
                style={[
                  styles.headerBadgeText,
                  {
                    color: isDarkMode ? "#fbbf24" : "#92400e",
                    fontFamily: FONTS.amiriBold,
                  },
                ]}
              >
                سُورَةُ {cleanSurahName(currentSurahName)}
              </Text>
            </View>

            {/* Left Badge: Juz Name */}
            <View
              style={[
                styles.headerBadge,
                {
                  backgroundColor: isDarkMode ? "#1a2a36" : "#fef3c7",
                  borderColor: isDarkMode ? "#374151" : "#fde68a",
                },
              ]}
            >
              <Text
                style={[
                  styles.headerBadgeText,
                  {
                    color: isDarkMode ? "#fbbf24" : "#92400e",
                    fontFamily: FONTS.amiriBold,
                  },
                ]}
              >
                {juzTitle}
              </Text>
            </View>
          </View>

          {/* Page Quranic Content */}
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={theme.primary} size="large" />
              <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                جاري فتح صفحة المصحف...
              </Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.mushafScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {groups.map((group) => (
                <View key={group.surahNumber} style={styles.groupContainer}>
                  {/* Traditional Surah Header Banner (If Surah starts at Ayah 1) */}
                  {group.ayahs[0]?.numberInSurah === 1 && (
                    <View style={styles.surahBannerWrapper}>
                      <View
                        style={[
                          styles.surahBanner,
                          {
                            backgroundColor: isDarkMode ? "#192823" : "#fffbeb",
                            borderColor: isDarkMode ? "#059669" : "#f59e0b",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.surahBannerTitle,
                            {
                              color: isDarkMode ? "#34d399" : "#92400e",
                              fontFamily: FONTS.amiriBold,
                            },
                          ]}
                        >
                          سُورَةُ {cleanSurahName(group.surahName)}
                        </Text>
                      </View>

                      {/* Basmala */}
                      {group.surahNumber !== 1 && group.surahNumber !== 9 && (
                        <View style={styles.basmalaContainer}>
                          <Text
                            style={[
                              styles.basmalaText,
                              {
                                color: isDarkMode ? "#f8fafc" : "#1e293b",
                                fontFamily: FONTS.amiriBold,
                              },
                            ]}
                          >
                            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Justified Continuous Quranic Block */}
                  <View style={styles.quranTextBlock}>
                    <Text
                      style={[
                        styles.quranTextParagraph,
                        {
                          color: isDarkMode ? "#f1f5f9" : "#0f172a",
                          fontSize: fontSize || 22,
                          lineHeight: (fontSize || 22) * 2.2,
                          fontFamily: FONTS.amiri,
                        },
                      ]}
                    >
                      {group.ayahs.map((ayah) => {
                        const cleanText = stripBismillah(
                          ayah.text,
                          group.surahNumber,
                          ayah.numberInSurah
                        );
                        const words = cleanText.split(" ");
                        const isBookmarked =
                          lastRead?.surahNumber === group.surahNumber &&
                          lastRead?.ayahNumber === ayah.numberInSurah;
                        const isPlayingThis =
                          isPlaying &&
                          currentTrack?.id ===
                            `surah_${group.surahNumber}_ayah_${ayah.numberInSurah}`;

                        return (
                          <Text
                            key={ayah.number}
                            onPress={() => setSelectedAyah(ayah)}
                            style={[
                              isPlayingThis && {
                                backgroundColor: isDarkMode
                                  ? "rgba(16, 185, 129, 0.3)"
                                  : "rgba(16, 185, 129, 0.18)",
                              },
                              isBookmarked && {
                                backgroundColor: isDarkMode
                                  ? "rgba(245, 158, 11, 0.25)"
                                  : "rgba(254, 243, 199, 0.9)",
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
                            {" "}
                            {/* Ornate End Ayah Symbol */}
                            <Text
                              style={[
                                styles.ayahEndSymbol,
                                {
                                  color: isDarkMode ? "#34d399" : "#0d9488",
                                  fontFamily: FONTS.amiriBold,
                                },
                              ]}
                            >
                              {"\u200F"}﴿{toArabicNumber(ayah.numberInSurah)}﴾
                            </Text>
                            {" "}
                          </Text>
                        );
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Bottom Footer Inside Mushaf Frame */}
          <View style={styles.pageFooterRow}>
            <TouchableOpacity
              style={[
                styles.pageNumberPill,
                {
                  backgroundColor: isDarkMode ? "#1a2a36" : "#fef3c7",
                  borderColor: isDarkMode ? "#374151" : "#fde68a",
                },
              ]}
              onPress={() => {
                setJumpInput(String(currentPage));
                setJumpModalOpen(true);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pageNumberText,
                  {
                    color: isDarkMode ? "#fbbf24" : "#92400e",
                    fontFamily: FONTS.amiriBold,
                  },
                ]}
              >
                {toArabicNumber(currentPage)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ─── Bottom Navigation Buttons (الصفحة السابقة / صفحة من / الصفحة التالية) ─── */}
      <View style={styles.navigationRow}>
        {/* Previous Page (RTL Right side) */}
        <TouchableOpacity
          style={[
            styles.navBtn,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              opacity: currentPage <= 1 ? 0.4 : 1,
            },
          ]}
          onPress={goToPrevPage}
          disabled={currentPage <= 1 || loading}
          activeOpacity={0.7}
        >
          <ChevronRight size={16} color={theme.text} />
          <Text style={[styles.navBtnText, { color: theme.text }]}>
            الصفحة السابقة
          </Text>
        </TouchableOpacity>

        {/* Page Counter & Quick Jump Button */}
        <TouchableOpacity
          style={[
            styles.pageCounterBtn,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={() => {
            setJumpInput(String(currentPage));
            setJumpModalOpen(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.pageCounterText, { color: theme.textMuted }]}>
            صفحة{" "}
            <Text
              style={{
                color: theme.primary,
                fontWeight: "bold",
              }}
            >
              {currentPage}
            </Text>{" "}
            من {TOTAL_PAGES}
          </Text>
        </TouchableOpacity>

        {/* Next Page (RTL Left side) */}
        <TouchableOpacity
          style={[
            styles.navBtn,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              opacity: currentPage >= TOTAL_PAGES ? 0.4 : 1,
            },
          ]}
          onPress={goToNextPage}
          disabled={currentPage >= TOTAL_PAGES || loading}
          activeOpacity={0.7}
        >
          <Text style={[styles.navBtnText, { color: theme.text }]}>
            الصفحة التالية
          </Text>
          <ChevronLeft size={16} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* ─── Selected Ayah Action Modal (Tafsir, Play, Bookmark, Copy, Share) ─── */}
      {selectedAyah && (
        <Modal
          visible={!!selectedAyah}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedAyah(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              {/* Modal Header */}
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: theme.border },
                ]}
              >
                <View style={styles.modalHeaderInfo}>
                  <Text
                    style={[
                      styles.modalSurahName,
                      { color: theme.text, fontFamily: FONTS.amiriBold },
                    ]}
                  >
                    سورة {cleanSurahName(selectedAyah.surah.name)}
                  </Text>
                  <Text
                    style={[styles.modalAyahBadge, { color: theme.primary }]}
                  >
                    آية {toArabicNumber(selectedAyah.numberInSurah)}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setSelectedAyah(null)}
                  style={styles.modalCloseBtn}
                >
                  <X size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Ayah Full Arabic Text */}
              <ScrollView style={styles.modalScroll}>
                <View
                  style={[
                    styles.modalAyahTextBox,
                    {
                      backgroundColor: isDarkMode ? "#172535" : "#f8fafc",
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalAyahText,
                      {
                        color: theme.text,
                        fontFamily: FONTS.amiri,
                      },
                    ]}
                  >
                    {selectedAyah.text}
                  </Text>
                </View>

                {/* Tafsir Area if opened */}
                {showTafsir && (
                  <View
                    style={[
                      styles.tafsirSection,
                      {
                        backgroundColor: isDarkMode ? "#0d2b20" : "#ecfdf5",
                        borderColor: theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tafsirSectionTitle,
                        { color: theme.primary },
                      ]}
                    >
                      التفسير الميسر:
                    </Text>
                    {loadingTafsir ? (
                      <ActivityIndicator
                        size="small"
                        color={theme.primary}
                        style={{ marginVertical: 8 }}
                      />
                    ) : tafsirData ? (
                      <Text
                        style={[
                          styles.tafsirContentText,
                          {
                            color: isDarkMode ? "#f1f5f9" : "#1e293b",
                            fontFamily: FONTS.amiri,
                          },
                        ]}
                      >
                        {tafsirData.translation}
                      </Text>
                    ) : (
                      <Text
                        style={[
                          styles.tafsirEmptyText,
                          { color: theme.textMuted },
                        ]}
                      >
                        لا يتوفر تفسير حالياً لهذه الآية
                      </Text>
                    )}
                  </View>
                )}
              </ScrollView>

              {/* Action Buttons Row */}
              <View
                style={[
                  styles.modalActionsRow,
                  { borderTopColor: theme.border },
                ]}
              >
                {/* 1. Play */}
                <TouchableOpacity
                  style={[
                    styles.modalActionItem,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={() => handlePlayAyah(selectedAyah)}
                >
                  <Play size={16} color="#ffffff" />
                  <Text style={styles.modalActionItemTextWhite}>استماع</Text>
                </TouchableOpacity>

                {/* 2. Tafsir */}
                <TouchableOpacity
                  style={[
                    styles.modalActionItemOutline,
                    { borderColor: theme.border, backgroundColor: theme.card },
                  ]}
                  onPress={() => handleFetchTafsir(selectedAyah)}
                >
                  <BookOpen size={16} color={theme.primary} />
                  <Text
                    style={[
                      styles.modalActionItemText,
                      { color: theme.primary },
                    ]}
                  >
                    {showTafsir ? "إخفاء التفسير" : "التفسير"}
                  </Text>
                </TouchableOpacity>

                {/* 3. Bookmark */}
                <TouchableOpacity
                  style={[
                    styles.modalActionItemOutline,
                    { borderColor: theme.border, backgroundColor: theme.card },
                  ]}
                  onPress={() => {
                    handleBookmark(selectedAyah);
                    setSelectedAyah(null);
                  }}
                >
                  <BookmarkCheck size={16} color={theme.accentGold} />
                  <Text
                    style={[
                      styles.modalActionItemText,
                      { color: theme.accentGold },
                    ]}
                  >
                    حفظ علامة
                  </Text>
                </TouchableOpacity>

                {/* 4. Copy */}
                <TouchableOpacity
                  style={[
                    styles.modalIconBtn,
                    { backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9" },
                  ]}
                  onPress={() => handleCopyAyah(selectedAyah.text)}
                >
                  <Copy size={16} color={copied ? "#10b981" : theme.text} />
                </TouchableOpacity>

                {/* 5. Share */}
                <TouchableOpacity
                  style={[
                    styles.modalIconBtn,
                    { backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9" },
                  ]}
                  onPress={() => handleShareAyah(selectedAyah)}
                >
                  <Share2 size={16} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ─── Direct Page Jump Modal ─── */}
      <Modal
        visible={jumpModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setJumpModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.jumpModalCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text
              style={[
                styles.jumpModalTitle,
                { color: theme.text, fontFamily: FONTS.amiriBold },
              ]}
            >
              الانتقال إلى صفحة المصحف
            </Text>
            <Text
              style={[styles.jumpModalSubtitle, { color: theme.textMuted }]}
            >
              أدخل رقم الصفحة من 1 إلى 604
            </Text>

            <TextInput
              style={[
                styles.jumpInput,
                {
                  color: theme.text,
                  borderColor: theme.primary,
                  backgroundColor: isDarkMode ? "#172535" : "#f8fafc",
                },
              ]}
              value={jumpInput}
              onChangeText={setJumpInput}
              keyboardType="number-pad"
              textAlign="center"
              maxLength={3}
              autoFocus
            />

            <View style={styles.jumpActionsRow}>
              <TouchableOpacity
                style={[
                  styles.jumpConfirmBtn,
                  { backgroundColor: theme.primary },
                ]}
                onPress={handleJumpToPage}
              >
                <Text style={styles.jumpConfirmText}>انتقال</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.jumpCancelBtn,
                  { borderColor: theme.border },
                ]}
                onPress={() => setJumpModalOpen(false)}
              >
                <Text style={[styles.jumpCancelText, { color: theme.textMuted }]}>
                  إلغاء
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 16,
  },
  outerFrame: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 2.5,
    padding: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  innerFrame: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  pageHeaderRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
  },
  headerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  headerBadgeText: {
    fontSize: 13,
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  mushafScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 10,
  },
  groupContainer: {
    marginBottom: 8,
  },
  surahBannerWrapper: {
    alignItems: "center",
    marginVertical: 8,
  },
  surahBanner: {
    paddingHorizontal: 28,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  surahBannerTitle: {
    fontSize: 17,
  },
  basmalaContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  basmalaText: {
    fontSize: 19,
    textAlign: "center",
  },
  quranTextBlock: {
    paddingHorizontal: 4,
  },
  quranTextParagraph: {
    textAlign: "center",
    textAlignVertical: "center",
  },
  ayahEndSymbol: {
    fontSize: 16,
    paddingHorizontal: 2,
  },
  pageFooterRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },
  pageNumberPill: {
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderRadius: 14,
    borderWidth: 1,
  },
  pageNumberText: {
    fontSize: 13,
  },
  navigationRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 4,
    gap: 8,
  },
  navBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  pageCounterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  pageCounterText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxHeight: "80%",
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalHeaderInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  modalSurahName: {
    fontSize: 16,
  },
  modalAyahBadge: {
    fontSize: 12,
    fontWeight: "bold",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: 16,
  },
  modalAyahTextBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  modalAyahText: {
    fontSize: 18,
    textAlign: "right",
    lineHeight: 32,
  },
  tafsirSection: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  tafsirSectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "right",
  },
  tafsirContentText: {
    fontSize: 15,
    textAlign: "right",
    lineHeight: 26,
  },
  tafsirEmptyText: {
    fontSize: 12,
    textAlign: "right",
  },
  modalActionsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderTopWidth: 1,
    gap: 6,
  },
  modalActionItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modalActionItemTextWhite: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalActionItemOutline: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalActionItemText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  modalIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  jumpModalCard: {
    width: "85%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
  },
  jumpModalTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  jumpModalSubtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  jumpInput: {
    width: 100,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  jumpActionsRow: {
    flexDirection: "row-reverse",
    gap: 12,
    width: "100%",
  },
  jumpConfirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  jumpConfirmText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  jumpCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  jumpCancelText: {
    fontSize: 14,
  },
});
