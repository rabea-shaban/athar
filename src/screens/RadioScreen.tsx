import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  Radio as RadioIcon,
  Play,
  Pause,
  Search,
  X,
  Headphones,
  Signal,
  Volume2,
} from "lucide-react-native";
import { Header } from "../components/Header";
import { getRadioStations, RadioStation } from "../api/islamic";
import { useAudioStore } from "../store/audioStore";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme, FONTS } from "../constants/theme";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 44) / 2;

// High quality reciter / station preset images
const STATION_IMAGES: Record<string, string> = {
  "إذاعة القرآن الكريم من القاهرة":
    "https://apkdownmod.com/thumbnail?src=images/appsicon/2020/08/app-image-5f42ba68a61b1.jpg",
  "إذاعة السنة النبوية":
    "https://i.pinimg.com/564x/55/16/ab/5516abd3744c3d0b0a7b28bedd5474c0.jpg",
  "إذاعة القرآن الكريم - السعودية":
    "https://i.pinimg.com/564x/55/16/ab/5516abd3744c3d0b0a7b28bedd5474c0.jpg",
  "إذاعة محمد صديق المنشاوي":
    "https://upload.wikimedia.org/wikipedia/ar/5/52/%D9%85%D8%AD%D9%85%D8%AF_%D8%B5%D8%AF%D9%8A%D9%82_%D8%A7%D9%84%D9%85%D9%86%D8%B4%D8%A7%D9%88%D9%8A.jpg",
  "إذاعة محمود خليل الحصري":
    "https://upload.wikimedia.org/wikipedia/ar/2/25/%D9%85%D8%AD%D9%85%D9%88%D8%AF_%D8%AE%D9%84%D9%8A%D9%84_%D8%A7%D9%84%D8%AD%D8%B5%D8%B1%D9%8A.jpg",
  "إذاعة عبدالباسط عبدالصمد":
    "https://upload.wikimedia.org/wikipedia/ar/7/77/%D8%B9%D8%A8%D8%AF_%D8%A7%D9%84%D8%A8%D8%A7%D8%B3%D8%B7_%D8%B9%D8%A8%D8%AF_%D8%A7%D9%84%D8%B5%D9%85%D8%AF.jpg",
  "إذاعة مشاري العفاسي":
    "https://i1.sndcdn.com/artworks-000085448377-50853q-t500x500.jpg",
  "إذاعة ماهر المعيقلي":
    "https://i1.sndcdn.com/artworks-000108375628-98e6j0-t500x500.jpg",
  "إذاعة ناصر القطامي":
    "https://i1.sndcdn.com/artworks-000078303866-993d0n-t500x500.jpg",
};

const EXTRA_STATIONS: RadioStation[] = [
  {
    id: 100,
    name: "إذاعة القرآن الكريم من القاهرة",
    url: "http://live.mp3quran.net:9972/",
    img: "https://apkdownmod.com/thumbnail?src=images/appsicon/2020/08/app-image-5f42ba68a61b1.jpg",
  },
  {
    id: 101,
    name: "إذاعة القرآن الكريم - السعودية (مكة المكرمة)",
    url: "https://stream.radiojar.com/0tpy1h0kxtzuv",
    img: "https://i.pinimg.com/564x/55/16/ab/5516abd3744c3d0b0a7b28bedd5474c0.jpg",
  },
  {
    id: 102,
    name: "إذاعة سورة البقرة (بأصوات كبار القراء)",
    url: "https://backup.qurango.net/radio/albaqarah",
  },
  {
    id: 103,
    name: "إذاعة الفتاوى العامة",
    url: "https://backup.qurango.net/radio/fatwa",
  },
  {
    id: 104,
    name: "إذاعة صحيح البخاري",
    url: "https://backup.qurango.net/radio/saheh-bokharee",
  },
  {
    id: 105,
    name: "إذاعة صحيح مسلم",
    url: "https://backup.qurango.net/radio/saheh-muslim",
  },
  {
    id: 106,
    name: "إذاعة في ظلال السيرة النبوية",
    url: "https://backup.qurango.net/radio/fi_zilal_alsiyra",
  },
  {
    id: 107,
    name: "إذاعة قصص الأنبياء",
    url: "https://backup.qurango.net/radio/alanbiya",
  },
  {
    id: 108,
    name: "إذاعة الشمائل المحمدية",
    url: "https://backup.qurango.net/radio/shmaeel",
  },
  {
    id: 109,
    name: "إذاعة أذكار الصباح والمساء",
    url: "https://backup.qurango.net/radio/athkar_sabah",
  },
  {
    id: 110,
    name: "إذاعة الرقية الشرعية",
    url: "https://backup.qurango.net/radio/roqiah",
  },
  {
    id: 111,
    name: "إذاعة المختصر في تفسير القرآن الكريم",
    url: "https://backup.qurango.net/radio/mukhtasartafsir",
  },
  {
    id: 112,
    name: "إذاعة الشيخ أحمد العجمي",
    url: "https://backup.qurango.net/radio/ahmad_alajmy",
  },
  {
    id: 113,
    name: "إذاعة الشيخ سعد الغامدي",
    url: "https://backup.qurango.net/radio/saad_alghamdi",
  },
  {
    id: 114,
    name: "إذاعة الشيخ عبد الرحمن السديس",
    url: "https://backup.qurango.net/radio/abdulrahman_alsudaes",
  },
  {
    id: 115,
    name: "إذاعة الشيخ سعود الشريم",
    url: "https://backup.qurango.net/radio/saud_alshuraim",
  },
  {
    id: 116,
    name: "إذاعة الشيخ علي جابر",
    url: "https://backup.qurango.net/radio/ali_jaber",
  },
  {
    id: 117,
    name: "إذاعة الشيخ إدريس أبكر",
    url: "https://backup.qurango.net/radio/idrees_abkr",
  },
  {
    id: 118,
    name: "إذاعة الشيخ خالد الجليل",
    url: "https://backup.qurango.net/radio/khalid_aljileel",
  },
  {
    id: 119,
    name: "إذاعة الشيخ صلاح بو خاطر",
    url: "https://backup.qurango.net/radio/slaah_bukhatir",
  },
  {
    id: 120,
    name: "إذاعة الشيخ عادل ريان",
    url: "https://backup.qurango.net/radio/adel_ryyan",
  },
  {
    id: 121,
    name: "إذاعة الشيخ أبو بكر الشاطري",
    url: "https://backup.qurango.net/radio/shaik_abu_bakr_al_shatri",
  },
  {
    id: 122,
    name: "إذاعة الشيخ محمد الطبلاوي",
    url: "https://backup.qurango.net/radio/mohammad_altablaway",
  },
];

type CategoryFilter = "ALL" | "GENERAL" | "RECITERS";

export const RadioScreen: React.FC = () => {
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioStore();

  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    getRadioStations()
      .then((data) => {
        const existingIds = new Set(data.map((s) => s.id));
        const extras = EXTRA_STATIONS.filter((e) => !existingIds.has(e.id));
        setStations([...data, ...extras]);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Failed to fetch radio stations:", err);
        setStations(EXTRA_STATIONS);
        setLoading(false);
      });
  }, []);

  const categorizedStations = useMemo(() => {
    return stations.map((s) => {
      const isGeneral =
        s.name.includes("القاهرة") ||
        s.name.includes("السنة") ||
        s.name.includes("الفتاوى") ||
        s.name.includes("تفسير") ||
        s.name.includes("السعودية") ||
        s.name.includes("مكة") ||
        s.name.includes("البخاري") ||
        s.name.includes("مسلم") ||
        s.name.includes("السيرة") ||
        s.name.includes("الأنبياء") ||
        s.name.includes("الشمائل") ||
        s.name.includes("أذكار") ||
        s.name.includes("تلاوات") ||
        s.name.includes("الرقية") ||
        s.name.includes("البقرة");
      return {
        ...s,
        category: (isGeneral ? "GENERAL" : "RECITERS") as CategoryFilter,
      };
    });
  }, [stations]);

  const filteredStations = useMemo(() => {
    return categorizedStations.filter((st) => {
      const matchSearch = st.name
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
      const matchCategory =
        categoryFilter === "ALL" || st.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [categorizedStations, searchQuery, categoryFilter]);

  const handleToggleStation = (station: RadioStation) => {
    const isThisStation = currentTrack?.id === `radio_${station.id}`;
    if (isThisStation) {
      togglePlay();
    } else {
      const img =
        station.img ||
        STATION_IMAGES[station.name] ||
        STATION_IMAGES[station.name.trim()];
      playTrack({
        id: `radio_${station.id}`,
        title: station.name,
        subtitle: "بث مباشر 24/7",
        audioUrl: station.url,
        image: img,
        isLive: true,
      });
    }
  };

  const handleImageError = (id: number) => {
    setFailedImages((prev) => new Set([...prev, id]));
  };

  const activeStation = stations.find(
    (s) => currentTrack?.id === `radio_${s.id}`
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="الإذاعات الإسلامية"
        subtitle="بث مباشر لإذاعة القرآن الكريم وكبار القراء"
      />

      {/* Active Broadcast Highlight Banner */}
      {activeStation && (
        <View
          style={[
            styles.activeBanner,
            {
              backgroundColor: isDarkMode ? "#0d281e" : "#ecfdf5",
              borderColor: theme.primary,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.bannerPlayBtn, { backgroundColor: theme.primary }]}
            onPress={() => togglePlay()}
            activeOpacity={0.8}
          >
            {isPlaying ? (
              <Pause size={18} color="#ffffff" />
            ) : (
              <Play size={18} color="#ffffff" />
            )}
          </TouchableOpacity>

          <View style={styles.bannerInfo}>
            <View style={styles.bannerBadgeRow}>
              <View
                style={[
                  styles.livePingDot,
                  { backgroundColor: isPlaying ? "#22c55e" : "#eab308" },
                ]}
              />
              <Text
                style={[
                  styles.bannerLiveText,
                  { color: isPlaying ? "#16a34a" : "#ca8a04" },
                ]}
              >
                {isPlaying ? "تستمع الآن مباشرة إلى:" : "متوقف مؤقتاً:"}
              </Text>
            </View>
            <Text
              style={[
                styles.bannerStationName,
                { color: theme.text, fontFamily: FONTS.amiriBold },
              ]}
              numberOfLines={1}
            >
              {activeStation.name}
            </Text>
          </View>

          <View
            style={[
              styles.bannerIconBox,
              { backgroundColor: isDarkMode ? "#103828" : "#d1fae5" },
            ]}
          >
            <RadioIcon size={20} color={theme.primary} />
          </View>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearBtn}
            >
              <X size={16} color={theme.textMuted} />
            </TouchableOpacity>
          )}
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="ابحث عن إذاعة أو قارئ..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
          <Search size={18} color={theme.textMuted} />
        </View>
      </View>

      {/* Categories Filter Tabs */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsContent}
        >
          <TouchableOpacity
            style={[
              styles.filterTab,
              categoryFilter === "ALL"
                ? [styles.filterTabActive, { backgroundColor: theme.primary }]
                : [
                    styles.filterTabInactive,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                    },
                  ],
            ]}
            onPress={() => setCategoryFilter("ALL")}
          >
            <Text
              style={[
                styles.filterTabText,
                {
                  color:
                    categoryFilter === "ALL" ? "#ffffff" : theme.textMuted,
                  fontWeight: categoryFilter === "ALL" ? "bold" : "500",
                },
              ]}
            >
              جميع الإذاعات ({stations.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              categoryFilter === "GENERAL"
                ? [styles.filterTabActive, { backgroundColor: theme.primary }]
                : [
                    styles.filterTabInactive,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                    },
                  ],
            ]}
            onPress={() => setCategoryFilter("GENERAL")}
          >
            <Text
              style={[
                styles.filterTabText,
                {
                  color:
                    categoryFilter === "GENERAL" ? "#ffffff" : theme.textMuted,
                  fontWeight: categoryFilter === "GENERAL" ? "bold" : "500",
                },
              ]}
            >
              الإذاعات العامة والمحلية
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              categoryFilter === "RECITERS"
                ? [styles.filterTabActive, { backgroundColor: theme.primary }]
                : [
                    styles.filterTabInactive,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                    },
                  ],
            ]}
            onPress={() => setCategoryFilter("RECITERS")}
          >
            <Text
              style={[
                styles.filterTabText,
                {
                  color:
                    categoryFilter === "RECITERS" ? "#ffffff" : theme.textMuted,
                  fontWeight: categoryFilter === "RECITERS" ? "bold" : "500",
                },
              ]}
            >
              إذاعات كبار القراء
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Grid of Stations */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.primary} size="large" />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            جاري تحميل الإذاعات المباشرة...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredStations}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
              <RadioIcon size={40} color={theme.textMuted} opacity={0.5} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                لم يتم العثور على إذاعة
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                لا توجد إذاعة تطابق بحثك عن "{searchQuery}"
              </Text>
              <TouchableOpacity
                style={[styles.resetBtn, { backgroundColor: theme.primary }]}
                onPress={() => {
                  setSearchQuery("");
                  setCategoryFilter("ALL");
                }}
              >
                <Text style={styles.resetBtnText}>عرض جميع الإذاعات</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const isCurrent = currentTrack?.id === `radio_${item.id}`;
            const isPlayingThis = isCurrent && isPlaying;
            const customImg =
              item.img ||
              STATION_IMAGES[item.name] ||
              STATION_IMAGES[item.name.trim()];
            const hasValidImage = customImg && !failedImages.has(item.id);

            return (
              <TouchableOpacity
                style={[
                  styles.stationCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: isCurrent ? theme.primary : theme.border,
                    borderWidth: isCurrent ? 2 : 1,
                    shadowColor: isDarkMode ? "#000" : "#64748b",
                  },
                ]}
                onPress={() => handleToggleStation(item)}
                activeOpacity={0.85}
              >
                {/* Square Visual Media Container */}
                <View
                  style={[
                    styles.imageContainer,
                    {
                      backgroundColor: isDarkMode ? "#1e293b" : "#cbd5e1",
                    },
                  ]}
                >
                  {hasValidImage ? (
                    <Image
                      source={{ uri: customImg }}
                      style={styles.cardImage}
                      resizeMode="cover"
                      onError={() => handleImageError(item.id)}
                    />
                  ) : (
                    /* Elegant Metallic Placeholder */
                    <View
                      style={[
                        styles.placeholderContainer,
                        {
                          backgroundColor: isDarkMode ? "#1e2837" : "#8395a7",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.broadcastCircle,
                          {
                            backgroundColor: isDarkMode
                              ? "rgba(16, 185, 129, 0.15)"
                              : "rgba(255, 255, 255, 0.25)",
                          },
                        ]}
                      >
                        <RadioIcon
                          size={32}
                          color={isDarkMode ? "#34d399" : "#ffffff"}
                        />
                      </View>
                      <Text
                        style={[
                          styles.placeholderText,
                          {
                            color: isDarkMode ? "#94a3b8" : "#ffffff",
                            fontFamily: FONTS.amiri,
                          },
                        ]}
                      >
                        بث مباشر
                      </Text>
                    </View>
                  )}

                  {/* Top-Right Red Live Badge */}
                  <View style={styles.liveBadge}>
                    <View style={styles.liveBadgeDot} />
                    <Text style={styles.liveBadgeText}>مباشر</Text>
                  </View>

                  {/* Active Playing / Play Overlay */}
                  {isCurrent && (
                    <View
                      style={[
                        styles.overlayIndicator,
                        {
                          backgroundColor: isPlayingThis
                            ? "rgba(16, 185, 129, 0.45)"
                            : "rgba(0, 0, 0, 0.4)",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.playCircle,
                          {
                            backgroundColor: isPlayingThis
                              ? "#10b981"
                              : "rgba(0,0,0,0.75)",
                          },
                        ]}
                      >
                        {isPlayingThis ? (
                          <Pause size={18} color="#ffffff" />
                        ) : (
                          <Play size={18} color="#ffffff" />
                        )}
                      </View>
                    </View>
                  )}
                </View>

                {/* Station Info Below Image */}
                <View style={styles.infoArea}>
                  <Text
                    style={[
                      styles.stationTitle,
                      {
                        color: isCurrent ? theme.primary : theme.text,
                        fontFamily: FONTS.amiriBold,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>

                  {/* Divider */}
                  <View
                    style={[
                      styles.cardDivider,
                      { backgroundColor: theme.border },
                    ]}
                  />

                  {/* Bottom Meta Row */}
                  <View style={styles.metaRow}>
                    <View style={styles.broadcastTypeRow}>
                      <Headphones
                        size={13}
                        color={isCurrent ? theme.primary : theme.textMuted}
                      />
                      <Text
                        style={[
                          styles.broadcastTypeText,
                          {
                            color: isCurrent
                              ? theme.primary
                              : theme.textMuted,
                          },
                        ]}
                      >
                        بث إذاعي
                      </Text>
                    </View>

                    {isCurrent && (
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: isPlayingThis ? "#16a34a" : "#ca8a04",
                          },
                        ]}
                      >
                        {isPlayingThis ? "شغال" : "مؤقت"}
                      </Text>
                    )}
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
  activeBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerInfo: {
    flex: 1,
    alignItems: "flex-end",
    marginHorizontal: 10,
  },
  bannerBadgeRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  livePingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  bannerLiveText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  bannerStationName: {
    fontSize: 15,
    textAlign: "right",
  },
  bannerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchSection: {
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
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  clearBtn: {
    padding: 4,
  },
  filterSection: {
    marginBottom: 8,
  },
  filterTabsContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: "row-reverse",
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  filterTabActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filterTabInactive: {
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 4,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  stationCard: {
    width: CARD_WIDTH,
    borderRadius: 18,
    padding: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  broadcastCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  liveBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#e11d48",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  liveBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#ffffff",
  },
  liveBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  overlayIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  infoArea: {
    paddingTop: 8,
  },
  stationTitle: {
    fontSize: 14,
    textAlign: "right",
    lineHeight: 20,
    height: 22,
  },
  cardDivider: {
    height: 1,
    marginVertical: 6,
  },
  metaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  broadcastTypeRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  broadcastTypeText: {
    fontSize: 11,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptySubtitle: {
    fontSize: 13,
  },
  resetBtn: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resetBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
});
