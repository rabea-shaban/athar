import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  Share,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  Play,
  Pause,
  ChevronDown,
  Check,
  Search,
  Headphones,
  BookOpen,
  FileText,
  Share2,
  X,
  User,
  ChevronRight,
  Bell,
  Volume2,
} from "lucide-react-native";
import {
  getSurahList,
  getQuranAudio,
  Surah,
  QuranAudioFile,
} from "../api/islamic";
import { ADHANS_LIST, AdhanTrack } from "../data/adhans";
import { useAudioStore } from "../store/audioStore";
import { usePreferencesStore } from "../store/preferencesStore";
import { useSettingsStore } from "../store/settingsStore";
import { lightTheme, darkTheme, FONTS } from "../constants/theme";
import { toArabicNumber, cleanSurahName } from "../utils/arabic";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2;

export const RECITERS = [
  { id: 2, name: "عبد الباسط عبد الصمد", style: "مرتل", riwayah: "حفص عن عاصم" },
  { id: 1, name: "عبد الباسط عبد الصمد", style: "مجود", riwayah: "حفص عن عاصم" },
  { id: 6, name: "محمود خليل الحصري", style: "مرتل", riwayah: "حفص عن عاصم" },
  { id: 12, name: "محمود خليل الحصري", style: "معلم", riwayah: "حفص عن عاصم" },
  { id: 9, name: "محمد صديق المنشاوي", style: "مرتل", riwayah: "حفص عن عاصم" },
  { id: 8, name: "محمد صديق المنشاوي", style: "مجود", riwayah: "حفص عن عاصم" },
  { id: 7, name: "مشاري راشد العفاسي", style: "مرتل", riwayah: "حفص عن عاصم" },
  { id: 3, name: "عبد الرحمن السديس", style: "مرتل", riwayah: "حفص عن عاصم" },
  { id: 10, name: "سعود الشريم", style: "مرتل", riwayah: "حفص عن عاصم" },
  { id: 4, name: "أبو بكر الشاطري", style: "مرتل", riwayah: "حفص عن عاصم" },
  { id: 5, name: "هاني الرفاعي", style: "مرتل", riwayah: "حفص عن عاصم" },
  { id: 11, name: "عبد المحسن القاسم", style: "مرتل", riwayah: "حفص عن عاصم" },
];

export const ListenScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioStore();

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [audioFiles, setAudioFiles] = useState<QuranAudioFile[]>([]);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [isReciterModalOpen, setIsReciterModalOpen] = useState(false);
  const [reciterSearchQuery, setReciterSearchQuery] = useState("");
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<
    "ALL" | "مرتل" | "مجود" | "معلم"
  >("ALL");
  const [surahSearch, setSurahSearch] = useState("");
  const [revelationFilter, setRevelationFilter] = useState<
    "ALL" | "Meccan" | "Medinan"
  >("ALL");

  const { prayerNotifications, setPrayerNotificationConfig } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<"quran" | "adhans">("quran");
  const [adhanSearch, setAdhanSearch] = useState("");
  const [filterFajrAdhans, setFilterFajrAdhans] = useState(false);

  useEffect(() => {
    getSurahList()
      .then(setSurahs)
      .catch((err) => console.warn("Failed to fetch surah list:", err));
  }, []);

  useEffect(() => {
    setLoadingAudio(true);
    getQuranAudio(selectedReciter.id)
      .then(setAudioFiles)
      .catch((err) => console.warn("Failed to load audio files:", err))
      .finally(() => setLoadingAudio(false));
  }, [selectedReciter]);

  const handlePlaySurah = (surah: Surah) => {
    const file = audioFiles.find((f) => f.chapter_id === surah.number);
    if (!file) return;

    const trackId = `listen_reciter_${selectedReciter.id}_surah_${surah.number}`;
    const isThisTrack = currentTrack?.id === trackId;

    if (isThisTrack) {
      togglePlay();
      return;
    }

    playTrack({
      id: trackId,
      title: `سورة ${cleanSurahName(surah.name)}`,
      subtitle: `الشيخ ${selectedReciter.name} (${selectedReciter.style})`,
      audioUrl: file.audio_url,
      reciterId: String(selectedReciter.id),
    });
  };

  const handlePlayAdhan = (adhan: AdhanTrack) => {
    const trackId = `adhan_track_${adhan.id}`;
    const isThisTrack = currentTrack?.id === trackId;

    if (isThisTrack) {
      togglePlay();
      return;
    }

    playTrack({
      id: trackId,
      title: adhan.name,
      subtitle: `${adhan.muadhin} • ${adhan.location}`,
      audioUrl: adhan.audioUrl,
    });
  };

  const filteredReciters = useMemo(() => {
    return RECITERS.filter((r) => {
      const matchSearch =
        r.name.includes(reciterSearchQuery) ||
        r.style.includes(reciterSearchQuery);
      const matchStyle =
        selectedStyleFilter === "ALL" || r.style === selectedStyleFilter;
      return matchSearch && matchStyle;
    });
  }, [reciterSearchQuery, selectedStyleFilter]);

  const filteredSurahs = useMemo(() => {
    return surahs.filter((s) => {
      const cleanName = cleanSurahName(s.name);
      const matchSearch =
        s.name.includes(surahSearch) ||
        cleanName.includes(surahSearch) ||
        String(s.number).includes(surahSearch);
      const matchRev =
        revelationFilter === "ALL" || s.revelationType === revelationFilter;
      return matchSearch && matchRev;
    });
  }, [surahs, surahSearch, revelationFilter]);

  const filteredAdhans = useMemo(() => {
    return ADHANS_LIST.filter((a) => {
      const matchSearch =
        a.name.includes(adhanSearch) ||
        a.muadhin.includes(adhanSearch) ||
        a.location.includes(adhanSearch) ||
        a.country.includes(adhanSearch);
      const matchFajr = filterFajrAdhans ? a.isFajr : true;
      return matchSearch && matchFajr;
    });
  }, [adhanSearch, filterFajrAdhans]);

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
          onPress={() => setIsReciterModalOpen(true)}
        >
          <Headphones size={18} color={theme.primary} />
        </TouchableOpacity>

        <Text
          style={[
            styles.navTitle,
            { color: theme.text, fontFamily: FONTS.amiriBold },
          ]}
        >
          الاستماع إلى القرآن الكريم
        </Text>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <ChevronRight size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ─── Mode Switcher Tabs ─── */}
        <View style={styles.topTabsContainer}>
          <TouchableOpacity
            style={[
              styles.topTabButton,
              {
                backgroundColor:
                  activeTab === "quran"
                    ? theme.primary
                    : isDarkMode
                    ? "#172535"
                    : "#f1f5f9",
                borderColor:
                  activeTab === "quran" ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setActiveTab("quran")}
          >
            <BookOpen
              size={16}
              color={activeTab === "quran" ? "#ffffff" : theme.textMuted}
            />
            <Text
              style={[
                styles.topTabButtonText,
                {
                  color: activeTab === "quran" ? "#ffffff" : theme.text,
                  fontWeight: activeTab === "quran" ? "bold" : "500",
                },
              ]}
            >
              تلاوات القرآن ({toArabicNumber(114)})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.topTabButton,
              {
                backgroundColor:
                  activeTab === "adhans"
                    ? theme.primary
                    : isDarkMode
                    ? "#172535"
                    : "#f1f5f9",
                borderColor:
                  activeTab === "adhans" ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setActiveTab("adhans")}
          >
            <Volume2
              size={16}
              color={activeTab === "adhans" ? "#ffffff" : theme.textMuted}
            />
            <Text
              style={[
                styles.topTabButtonText,
                {
                  color: activeTab === "adhans" ? "#ffffff" : theme.text,
                  fontWeight: activeTab === "adhans" ? "bold" : "500",
                },
              ]}
            >
              أصوات الأذان ({toArabicNumber(ADHANS_LIST.length)})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "quran" ? (
          <>
            {/* ─── Hero Section ─── */}
            <View style={styles.heroSection}>
              <View
                style={[
                  styles.heroBadge,
                  {
                    backgroundColor: isDarkMode ? "#064e3b" : "#ecfdf5",
                    borderColor: isDarkMode ? "#047857" : "#a7f3d0",
                  },
                ]}
              >
                <Headphones size={13} color={theme.primary} />
                <Text
                  style={[
                    styles.heroBadgeText,
                    { color: theme.primary, fontFamily: FONTS.amiriBold },
                  ]}
                >
                  تلاوات خاشعة بأصوات كبار القراء
                </Text>
              </View>

              <Text
                style={[
                  styles.heroTitle,
                  { color: theme.text, fontFamily: FONTS.amiriBold },
                ]}
              >
                الاستماع إلى القرآن الكريم
              </Text>

              <Text style={[styles.heroSubtitle, { color: theme.textMuted }]}>
                استمع إلى سور القرآن الكريم كاملة برواية حفص عن عاصم بمختلف أساليب
                التلاوة (مرتل، مجود، ومعلم) بصوت نخبة من أعلام التلاوة.
              </Text>

              {/* ─── Active Reciter Selector Box ─── */}
              <TouchableOpacity
                style={[
                  styles.reciterBox,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    shadowColor: isDarkMode ? "#000" : "#64748b",
                  },
                ]}
                onPress={() => setIsReciterModalOpen(true)}
                activeOpacity={0.8}
              >
            <View style={styles.reciterBoxRight}>
              <View
                style={[
                  styles.reciterAvatar,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Text style={styles.reciterAvatarText}>
                  {selectedReciter.name.split(" ")[0][0]}
                </Text>
              </View>

              <View style={styles.reciterBoxInfo}>
                <View style={styles.reciterTitleRow}>
                  <Text
                    style={[styles.reciterLabel, { color: theme.textMuted }]}
                  >
                    القارئ المختار:
                  </Text>
                  <Text
                    style={[
                      styles.reciterMainName,
                      { color: theme.text, fontFamily: FONTS.amiriBold },
                    ]}
                  >
                    الشيخ {selectedReciter.name}
                  </Text>
                </View>

                <View style={styles.reciterStyleRow}>
                  <View
                    style={[
                      styles.styleBadge,
                      {
                        backgroundColor:
                          selectedReciter.style === "مرتل"
                            ? isDarkMode
                              ? "#064e3b"
                              : "#d1fae5"
                            : selectedReciter.style === "مجود"
                            ? isDarkMode
                              ? "#451a03"
                              : "#fef3c7"
                            : isDarkMode
                            ? "#082f49"
                            : "#e0f2fe",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.styleBadgeText,
                        {
                          color:
                            selectedReciter.style === "مرتل"
                              ? "#059669"
                              : selectedReciter.style === "مجود"
                              ? "#d97706"
                              : "#0284c7",
                        },
                      ]}
                    >
                      {selectedReciter.style}
                    </Text>
                  </View>
                  <Text
                    style={[styles.riwayahText, { color: theme.textMuted }]}
                  >
                    {selectedReciter.riwayah}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.reciterBoxLeft}>
              <Text
                style={[styles.listRecitersText, { color: theme.primary }]}
              >
                قائمة القراء ({toArabicNumber(RECITERS.length)})
              </Text>
              <View
                style={[
                  styles.chevronCircle,
                  { backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9" },
                ]}
              >
                <ChevronDown size={14} color={theme.textMuted} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Quick Reciters Horizontal Chips */}
          <View style={styles.quickChipsSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickChipsContent}
            >
              <TouchableOpacity
                style={[
                  styles.moreRecitersBtn,
                  {
                    borderColor: theme.primary,
                    backgroundColor: isDarkMode ? "#064e3b" : "#ecfdf5",
                  },
                ]}
                onPress={() => setIsReciterModalOpen(true)}
              >
                <Text
                  style={[
                    styles.moreRecitersText,
                    { color: theme.primary, fontFamily: FONTS.amiriBold },
                  ]}
                >
                  + المزيد
                </Text>
              </TouchableOpacity>

              {RECITERS.slice(0, 6).map((r) => {
                const isSelected =
                  selectedReciter.id === r.id &&
                  selectedReciter.style === r.style;
                return (
                  <TouchableOpacity
                    key={`${r.id}-${r.style}`}
                    style={[
                      styles.quickChip,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : theme.card,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => setSelectedReciter(r)}
                  >
                    <Text
                      style={[
                        styles.quickChipText,
                        {
                          color: isSelected ? "#ffffff" : theme.textMuted,
                          fontWeight: isSelected ? "bold" : "500",
                        },
                      ]}
                    >
                      {r.name.split(" ")[0]} {r.name.split(" ")[1] ?? ""} (
                      {r.style})
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <Text
                style={[
                  styles.quickChipsLabel,
                  { color: theme.textMuted, fontFamily: FONTS.amiri },
                ]}
              >
                أبرز القراء:
              </Text>
            </ScrollView>
          </View>
        </View>

        {/* ─── Search & Revelation Filter Bar ─── */}
        <View style={styles.filterSection}>
          <View
            style={[
              styles.searchBox,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            {surahSearch.length > 0 && (
              <TouchableOpacity
                onPress={() => setSurahSearch("")}
                style={styles.clearBtn}
              >
                <X size={16} color={theme.textMuted} />
              </TouchableOpacity>
            )}
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="ابحث باسم السورة أو رقمها..."
              placeholderTextColor={theme.textMuted}
              value={surahSearch}
              onChangeText={setSurahSearch}
              textAlign="right"
            />
            <Search size={18} color={theme.textMuted} />
          </View>

          {/* Filter Pills */}
          <View style={styles.filterPillsRow}>
            {[
              { key: "ALL", label: `جميع السور (${toArabicNumber(114)})` },
              { key: "Meccan", label: `مكية (${toArabicNumber(86)})` },
              { key: "Medinan", label: `مدنية (${toArabicNumber(28)})` },
            ].map((pill) => {
              const isActive = revelationFilter === pill.key;
              return (
                <TouchableOpacity
                  key={pill.key}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: isActive
                        ? theme.primary
                        : isDarkMode
                        ? "#131d2a"
                        : "#e2e8f0",
                    },
                  ]}
                  onPress={() => setRevelationFilter(pill.key as any)}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      {
                        color: isActive ? "#ffffff" : theme.textMuted,
                        fontWeight: isActive ? "bold" : "500",
                      },
                    ]}
                  >
                    {pill.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Loading Audio Status */}
        {loadingAudio && (
          <View style={styles.loadingAudioBox}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[styles.loadingAudioText, { color: theme.textMuted }]}>
              جاري تجهيز تلاوات الشيخ {selectedReciter.name}...
            </Text>
          </View>
        )}

        {/* ─── Surahs Audio Grid (2 Columns) ─── */}
        <View style={styles.gridContainer}>
          {filteredSurahs.map((surah) => {
            const file = audioFiles.find((f) => f.chapter_id === surah.number);
            const trackId = `listen_reciter_${selectedReciter.id}_surah_${surah.number}`;
            const isCurrent = currentTrack?.id === trackId;
            const playing = isCurrent && isPlaying;
            const cleanName = cleanSurahName(surah.name);

            return (
              <View
                key={surah.number}
                style={[
                  styles.surahCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: isCurrent ? theme.primary : theme.border,
                    borderWidth: isCurrent ? 1.5 : 1,
                    shadowColor: isDarkMode ? "#000" : "#64748b",
                  },
                ]}
              >
                {/* Top Row: Surah Name & Number */}
                <View style={styles.surahCardTop}>
                  <View style={styles.surahNameCol}>
                    <Text
                      style={[
                        styles.surahCardTitle,
                        {
                          color: isCurrent ? theme.primary : theme.text,
                          fontFamily: FONTS.amiriBold,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      سورة {cleanName}
                    </Text>
                    <Text
                      style={[
                        styles.surahCardMeta,
                        { color: theme.textMuted },
                      ]}
                    >
                      {surah.revelationType === "Meccan" ? "مكية" : "مدنية"} •{" "}
                      {toArabicNumber(surah.numberOfAyahs)} آية
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.surahNumberCircle,
                      {
                        backgroundColor: isDarkMode ? "#172535" : "#f1f5f9",
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.surahNumberText,
                        { color: theme.primary },
                      ]}
                    >
                      {toArabicNumber(surah.number)}
                    </Text>
                  </View>
                </View>

                {/* Bottom Row: Play Button & Quick Links */}
                <View
                  style={[
                    styles.surahCardBottom,
                    { borderTopColor: theme.border },
                  ]}
                >
                  <View style={styles.quickIconsRow}>
                    <TouchableOpacity
                      style={styles.cardIconBtn}
                      onPress={() =>
                        Share.share({
                          message: `استمع إلى سورة ${cleanName} بصوت الشيخ ${selectedReciter.name}\n${file?.audio_url || ""}`,
                        })
                      }
                    >
                      <Share2 size={16} color={theme.textMuted} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cardIconBtn}
                      onPress={() =>
                        navigation.navigate("SurahDetail", {
                          surahNumber: surah.number,
                          surahName: surah.name,
                        })
                      }
                    >
                      <BookOpen size={16} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.listenBtn,
                      {
                        backgroundColor: isCurrent
                          ? theme.primary
                          : isDarkMode
                          ? "#1e293b"
                          : "#f1f5f9",
                      },
                    ]}
                    onPress={() => handlePlaySurah(surah)}
                    disabled={loadingAudio || !file}
                  >
                    {playing ? (
                      <Pause size={14} color="#ffffff" />
                    ) : (
                      <Play
                        size={14}
                        color={isCurrent ? "#ffffff" : theme.text}
                      />
                    )}
                    <Text
                      style={[
                        styles.listenBtnText,
                        {
                          color: isCurrent ? "#ffffff" : theme.text,
                          fontFamily: FONTS.amiriBold,
                        },
                      ]}
                    >
                      {playing ? "إيقاف" : "استماع"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </>
    ) : (
      /* ─── Adhans Audio Section ─── */
      <View style={styles.adhansSection}>
        <View style={styles.heroSection}>
          <View
            style={[
              styles.heroBadge,
              {
                backgroundColor: isDarkMode ? "#1e1b4b" : "#e0e7ff",
                borderColor: isDarkMode ? "#4338ca" : "#c7d2fe",
              },
            ]}
          >
            <Volume2 size={13} color="#6366f1" />
            <Text
              style={[
                styles.heroBadgeText,
                { color: "#6366f1", fontFamily: FONTS.amiriBold },
              ]}
            >
              أصوات الأذان الحرمين والعالم الإسلامي
            </Text>
          </View>

          <Text
            style={[
              styles.heroTitle,
              { color: theme.text, fontFamily: FONTS.amiriBold },
            ]}
          >
            الأذان والتكبيرات الشرعية
          </Text>

          <Text style={[styles.heroSubtitle, { color: theme.textMuted }]}>
            مكتبة صوتية شاملة لأصوات الأذان كاملة من الحرم المكي والمسجد النبوي والمسجد الأقصى ونخبة من أعلام المؤذنين، مع إمكانية تعيين أي أذان كتنبيه للصلاة.
          </Text>
        </View>

        {/* Adhan Search & Filter */}
        <View style={styles.filterSection}>
          <View
            style={[
              styles.searchBox,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            {adhanSearch.length > 0 && (
              <TouchableOpacity
                onPress={() => setAdhanSearch("")}
                style={styles.clearBtn}
              >
                <X size={16} color={theme.textMuted} />
              </TouchableOpacity>
            )}
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="ابحث عن مؤذن، مسجد، أو دولة..."
              placeholderTextColor={theme.textMuted}
              value={adhanSearch}
              onChangeText={setAdhanSearch}
              textAlign="right"
            />
            <Search size={18} color={theme.textMuted} />
          </View>

          {/* Fajr Filter Pill */}
          <View style={styles.filterPillsRow}>
            <TouchableOpacity
              style={[
                styles.filterPill,
                {
                  backgroundColor: !filterFajrAdhans
                    ? theme.primary
                    : isDarkMode
                    ? "#131d2a"
                    : "#e2e8f0",
                },
              ]}
              onPress={() => setFilterFajrAdhans(false)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  {
                    color: !filterFajrAdhans ? "#ffffff" : theme.textMuted,
                    fontWeight: !filterFajrAdhans ? "bold" : "500",
                  },
                ]}
              >
                جميع الأذانات ({toArabicNumber(ADHANS_LIST.length)})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                {
                  backgroundColor: filterFajrAdhans
                    ? "#059669"
                    : isDarkMode
                    ? "#131d2a"
                    : "#e2e8f0",
                },
              ]}
              onPress={() => setFilterFajrAdhans(true)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  {
                    color: filterFajrAdhans ? "#ffffff" : theme.textMuted,
                    fontWeight: filterFajrAdhans ? "bold" : "500",
                  },
                ]}
              >
                أذان الفجر فقط (مع التثويب)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Adhans List Cards */}
        <View style={styles.adhansListContainer}>
          {filteredAdhans.map((adhan) => {
            const trackId = `adhan_track_${adhan.id}`;
            const isCurrent = currentTrack?.id === trackId;
            const playing = isCurrent && isPlaying;
            const isSelectedAsDefault =
              prayerNotifications.sound === adhan.id;

            return (
              <View
                key={adhan.id}
                style={[
                  styles.adhanFullCard,
                  {
                    backgroundColor: isCurrent
                      ? isDarkMode
                        ? "#064e3b22"
                        : "#ecfdf5"
                      : theme.card,
                    borderColor: isCurrent ? theme.primary : theme.border,
                  },
                ]}
              >
                <View style={styles.adhanFullCardTop}>
                  {/* Play Button */}
                  <TouchableOpacity
                    style={[
                      styles.adhanPlayLargeBtn,
                      {
                        backgroundColor: isCurrent
                          ? theme.primary
                          : isDarkMode
                          ? "#1e293b"
                          : "#f1f5f9",
                      },
                    ]}
                    onPress={() => handlePlayAdhan(adhan)}
                    activeOpacity={0.8}
                  >
                    {playing ? (
                      <Pause size={20} color="#ffffff" />
                    ) : (
                      <Play
                        size={20}
                        color={isCurrent ? "#ffffff" : theme.text}
                        style={{ marginLeft: 3 }}
                      />
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
                          styles.adhanCardTitleLarge,
                          {
                            color: theme.text,
                            fontFamily: FONTS.amiriBold,
                          },
                        ]}
                      >
                        {adhan.name}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.adhanCardMuadhinText,
                        { color: theme.primary },
                      ]}
                    >
                      {adhan.muadhin}
                    </Text>

                    <Text
                      style={[
                        styles.adhanCardDescText,
                        { color: theme.textMuted },
                      ]}
                    >
                      {adhan.description}
                    </Text>

                    <Text
                      style={[
                        styles.adhanCardMetaText,
                        { color: theme.textMuted },
                      ]}
                    >
                      {adhan.location} • المدة: {adhan.durationFormatted}
                    </Text>
                  </View>
                </View>

                {/* Footer Actions: Set as App Adhan */}
                <View
                  style={[
                    styles.adhanCardFooter,
                    { borderTopColor: theme.border },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.setAsAdhanBtn,
                      {
                        backgroundColor: isSelectedAsDefault
                          ? isDarkMode
                            ? "#064e3b"
                            : "#d1fae5"
                          : "transparent",
                        borderColor: isSelectedAsDefault
                          ? theme.primary
                          : theme.border,
                      },
                    ]}
                    onPress={() => {
                      setPrayerNotificationConfig({ sound: adhan.id });
                    }}
                  >
                    {isSelectedAsDefault && (
                      <Check size={14} color={theme.primary} />
                    )}
                    <Text
                      style={[
                        styles.setAsAdhanBtnText,
                        {
                          color: isSelectedAsDefault
                            ? theme.primary
                            : theme.textMuted,
                          fontWeight: isSelectedAsDefault
                            ? "bold"
                            : "500",
                        },
                      ]}
                    >
                      {isSelectedAsDefault
                        ? "محدد كصوت للأذان في التطبيق"
                        : "تعيين كصوت الأذان للتنبيهات"}
                    </Text>
                    <Bell
                      size={14}
                      color={
                        isSelectedAsDefault
                          ? theme.primary
                          : theme.textMuted
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    )}
  </ScrollView>

      {/* ─── Reciter Selection Modal ─── */}
      <Modal
        visible={isReciterModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsReciterModalOpen(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: theme.border },
            ]}
          >
            <TouchableOpacity
              onPress={() => setIsReciterModalOpen(false)}
              style={styles.closeBtn}
            >
              <X size={22} color={theme.text} />
            </TouchableOpacity>

            <View style={styles.modalHeaderTitleGroup}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: theme.text, fontFamily: FONTS.amiriBold },
                ]}
              >
                قائمة القراء المعتمدين
              </Text>
              <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
                اختر القارئ وأسلوب التلاوة للاستماع إلى المصحف
              </Text>
            </View>

            <View style={{ width: 32 }} />
          </View>

          {/* Search Box */}
          <View style={styles.modalSearchSection}>
            <View
              style={[
                styles.modalSearchBox,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}
            >
              <TextInput
                style={[styles.modalSearchInput, { color: theme.text }]}
                placeholder="ابحث باسم القارئ..."
                placeholderTextColor={theme.textMuted}
                value={reciterSearchQuery}
                onChangeText={setReciterSearchQuery}
                textAlign="right"
              />
              <Search size={18} color={theme.textMuted} />
            </View>

            {/* Style Filters */}
            <View style={styles.modalStyleRow}>
              {(["ALL", "مرتل", "مجود", "معلم"] as const).map((style) => {
                const isSelected = selectedStyleFilter === style;
                return (
                  <TouchableOpacity
                    key={style}
                    style={[
                      styles.modalStylePill,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : isDarkMode
                          ? "#1e293b"
                          : "#f1f5f9",
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => setSelectedStyleFilter(style)}
                  >
                    <Text
                      style={[
                        styles.modalStylePillText,
                        {
                          color: isSelected ? "#ffffff" : theme.textMuted,
                          fontWeight: isSelected ? "bold" : "500",
                        },
                      ]}
                    >
                      {style === "ALL"
                        ? `جميع القراء (${toArabicNumber(RECITERS.length)})`
                        : style}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Reciters List */}
          <FlatList
            data={filteredReciters}
            keyExtractor={(item) => `${item.id}-${item.style}`}
            contentContainerStyle={styles.modalListContent}
            renderItem={({ item }) => {
              const isSelected =
                selectedReciter.id === item.id &&
                selectedReciter.style === item.style;
              return (
                <TouchableOpacity
                  style={[
                    styles.reciterItemCard,
                    {
                      backgroundColor: isSelected
                        ? isDarkMode
                          ? "#064e3b"
                          : "#ecfdf5"
                        : theme.card,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedReciter(item);
                    setIsReciterModalOpen(false);
                  }}
                >
                  <View style={styles.reciterItemRight}>
                    <View
                      style={[
                        styles.reciterItemAvatar,
                        { backgroundColor: theme.primary },
                      ]}
                    >
                      <Text style={styles.reciterItemAvatarText}>
                        {item.name.split(" ")[0][0]}
                      </Text>
                    </View>

                    <View style={styles.reciterItemInfo}>
                      <Text
                        style={[
                          styles.reciterItemName,
                          {
                            color: isSelected ? theme.primary : theme.text,
                            fontFamily: FONTS.amiriBold,
                          },
                        ]}
                      >
                        الشيخ {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.reciterItemRiwayah,
                          { color: theme.textMuted },
                        ]}
                      >
                        {item.riwayah}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.reciterItemLeft}>
                    <View
                      style={[
                        styles.styleBadge,
                        {
                          backgroundColor:
                            item.style === "مرتل"
                              ? isDarkMode
                                ? "#064e3b"
                                : "#d1fae5"
                              : item.style === "مجود"
                              ? isDarkMode
                                ? "#451a03"
                                : "#fef3c7"
                              : isDarkMode
                              ? "#082f49"
                              : "#e0f2fe",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.styleBadgeText,
                          {
                            color:
                              item.style === "مرتل"
                                ? "#059669"
                                : item.style === "مجود"
                                ? "#d97706"
                                : "#0284c7",
                          },
                        ]}
                      >
                        {item.style}
                      </Text>
                    </View>
                    {isSelected && (
                      <Check size={18} color={theme.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
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
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 16,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: "center",
  },
  heroBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
  },
  heroBadgeText: {
    fontSize: 12,
  },
  heroTitle: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  reciterBox: {
    width: "100%",
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  reciterBoxRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  reciterAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  reciterAvatarText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  reciterBoxInfo: {
    alignItems: "flex-end",
    flex: 1,
  },
  reciterTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  reciterLabel: {
    fontSize: 11,
  },
  reciterMainName: {
    fontSize: 14,
  },
  reciterStyleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  styleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  styleBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  riwayahText: {
    fontSize: 11,
  },
  reciterBoxLeft: {
    alignItems: "center",
    gap: 4,
  },
  listRecitersText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  chevronCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickChipsSection: {
    marginTop: 12,
    width: "100%",
  },
  quickChipsContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  quickChipsLabel: {
    fontSize: 12,
    marginLeft: 4,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: 11,
  },
  moreRecitersBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  moreRecitersText: {
    fontSize: 11,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  clearBtn: {
    padding: 4,
  },
  filterPillsRow: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterPillText: {
    fontSize: 11,
  },
  loadingAudioBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  loadingAudioText: {
    fontSize: 12,
  },
  gridContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 40,
    gap: 10,
  },
  surahCard: {
    width: CARD_WIDTH,
    borderRadius: 18,
    padding: 12,
    justifyContent: "space-between",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  surahCardTop: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  surahNameCol: {
    alignItems: "flex-end",
    flex: 1,
    marginLeft: 6,
  },
  surahCardTitle: {
    fontSize: 14,
  },
  surahCardMeta: {
    fontSize: 10,
    marginTop: 2,
  },
  surahNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  surahNumberText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  surahCardBottom: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
  },
  quickIconsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  cardIconBtn: {
    padding: 4,
  },
  listenBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  listenBtnText: {
    fontSize: 11,
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
  modalHeaderTitleGroup: {
    alignItems: "center",
  },
  closeBtn: {
    padding: 6,
  },
  modalTitle: {
    fontSize: 16,
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  modalSearchSection: {
    padding: 14,
    gap: 10,
  },
  modalSearchBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalSearchInput: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 13,
  },
  modalStyleRow: {
    flexDirection: "row-reverse",
    gap: 6,
  },
  modalStylePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalStylePillText: {
    fontSize: 11,
  },
  modalListContent: {
    paddingHorizontal: 14,
    paddingBottom: 40,
    gap: 8,
  },
  reciterItemCard: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  reciterItemRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  reciterItemAvatar: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  reciterItemAvatarText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  reciterItemInfo: {
    alignItems: "flex-end",
    flex: 1,
  },
  reciterItemName: {
    fontSize: 14,
  },
  reciterItemRiwayah: {
    fontSize: 11,
    marginTop: 2,
  },
  reciterItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topTabsContainer: {
    flexDirection: "row-reverse",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  topTabButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  topTabButtonText: {
    fontSize: 13,
  },
  adhansSection: {
    paddingBottom: 20,
  },
  adhansListContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 4,
  },
  adhanFullCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  adhanFullCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  adhanPlayLargeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  adhanCardTitleLarge: {
    fontSize: 15,
    textAlign: "right",
  },
  adhanCardMuadhinText: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 3,
    textAlign: "right",
  },
  adhanCardDescText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    textAlign: "right",
  },
  adhanCardMetaText: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "right",
  },
  adhanCardFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
  },
  setAsAdhanBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  setAsAdhanBtnText: {
    fontSize: 11,
  },
  adhanTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
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
});
