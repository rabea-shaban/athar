import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  Search,
  Video,
  GraduationCap,
  Play,
  Clock,
  User,
  ChevronRight,
  ChevronLeft,
  Layers,
  Volume2,
  Tv,
} from "lucide-react-native";
import { PROGRAMS, PROGRAM_CATEGORIES } from "../data/programs";
import { LECTURES_DATA, Lecture, LECTURE_CATEGORIES } from "../data/lectures";
import { Program } from "../types/content";
import { usePreferencesStore } from "../store/preferencesStore";
import { useAudioStore } from "../store/audioStore";
import { lightTheme, darkTheme } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";

export const ProgramsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { playTrack, currentTrack, isPlaying } = useAudioStore();

  const [activeTab, setActiveTab] = useState<"programs" | "lectures">("programs");
  const [selectedProgCategory, setSelectedProgCategory] = useState("الكل");
  const [selectedLecCategory, setSelectedLecCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrograms = useMemo(() => {
    return PROGRAMS.filter((p) => {
      const matchCat =
        selectedProgCategory === "الكل" || p.category === selectedProgCategory;
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.presenter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedProgCategory, searchQuery]);

  const filteredLectures = useMemo(() => {
    return LECTURES_DATA.filter((l) => {
      const matchCat =
        selectedLecCategory === "الكل" || l.category === selectedLecCategory;
      const matchSearch =
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.scholar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedLecCategory, searchQuery]);

  const handlePlayLecture = (lecture: Lecture) => {
    if (lecture.audioUrl) {
      playTrack({
        id: lecture.id,
        title: lecture.title,
        subtitle: lecture.scholar,
        audioUrl: lecture.audioUrl,
        isLive: true,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Navigation Header */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: theme.card,
            borderBottomColor: theme.border,
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: theme.border }]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="رجوع"
        >
          <ChevronRight size={22} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            البرامج والشروحات الإسلامية
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: theme.textMuted }]}
            numberOfLines={1}
          >
            مكتبة جامعة تجمع بين البرامج والبودكاستات المرئية والشروحات
          </Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      {/* Main Switch Tabs */}
      <View style={styles.topTabs}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            {
              backgroundColor:
                activeTab === "programs"
                  ? theme.primary
                  : isDarkMode
                  ? "#131d2a"
                  : "#e2e8f0",
            },
          ]}
          onPress={() => setActiveTab("programs")}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "programs" ? "#ffffff" : theme.textMuted },
            ]}
          >
            البرامج والبودكاست المرئي ({toArabicNumber(PROGRAMS.length)})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            {
              backgroundColor:
                activeTab === "lectures"
                  ? theme.primary
                  : isDarkMode
                  ? "#131d2a"
                  : "#e2e8f0",
            },
          ]}
          onPress={() => setActiveTab("lectures")}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "lectures" ? "#ffffff" : theme.textMuted },
            ]}
          >
            الشروحات والدروس ({toArabicNumber(LECTURES_DATA.length)})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={
              activeTab === "programs"
                ? "ابحث في ٢٢ برنامجاً وبودكاستاً مرئياً..."
                : "ابحث في ١٤ شرحاً ودرساً علمياً..."
            }
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
          <Search size={18} color={theme.textMuted} />
        </View>
      </View>

      {/* Categories Horizontal Bar */}
      <View style={styles.categoriesBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {(activeTab === "programs" ? PROGRAM_CATEGORIES : LECTURE_CATEGORIES).map(
            (cat) => {
              const isSelected =
                activeTab === "programs"
                  ? selectedProgCategory === cat
                  : selectedLecCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catPill,
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
                    if (activeTab === "programs") setSelectedProgCategory(cat);
                    else setSelectedLecCategory(cat);
                  }}
                >
                  <Text
                    style={[
                      styles.catText,
                      {
                        color: isSelected ? theme.primary : theme.text,
                        fontWeight: isSelected ? "bold" : "500",
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </ScrollView>
      </View>

      {/* Content List */}
      {activeTab === "programs" ? (
        <FlatList
          data={filteredPrograms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.programCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              onPress={() => navigation.navigate("ProgramDetail", { program: item })}
              activeOpacity={0.8}
            >
              <View style={styles.thumbnailWrapper}>
                <Image
                  source={{ uri: item.coverImage }}
                  style={styles.programImage}
                  resizeMode="cover"
                />
                <View style={styles.playlistTypeBadge}>
                  <Tv size={12} color="#ffffff" />
                  <Text style={styles.playlistTypeText}>
                    {item.playlistType || "سلسلة مرئية"}
                  </Text>
                </View>

                {item.badge ? (
                  <View style={styles.episodesCountBadge}>
                    <Text style={styles.episodesCountText}>{item.badge}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.programBody}>
                <View style={styles.programCategoryRow}>
                  <Text style={[styles.programCategory, { color: "#C9A227" }]}>
                    {item.category}
                  </Text>
                  {item.durationPerEpisode ? (
                    <View style={styles.durationCol}>
                      <Clock size={12} color={theme.textMuted} />
                      <Text style={[styles.durationText, { color: theme.textMuted }]}>
                        {item.durationPerEpisode}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text style={[styles.programTitle, { color: theme.text }]} numberOfLines={2}>
                  {item.title}
                </Text>

                <View style={styles.presenterRow}>
                  <User size={13} color={theme.primary} />
                  <Text style={[styles.presenterName, { color: theme.primary }]}>
                    {item.presenter} {item.presenterTitle ? `• ${item.presenterTitle}` : ""}
                  </Text>
                </View>

                <Text
                  style={[styles.programDesc, { color: theme.textSecondary }]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>

                <View style={styles.programFooter}>
                  <View style={styles.actionRow}>
                    <ChevronLeft size={16} color={theme.primary} />
                    <Text style={[styles.actionText, { color: theme.primary }]}>
                      عرض جميع الحلقات ({toArabicNumber(item.episodesCount || item.episodes?.length || 0)})
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={filteredLectures}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isPlayingThis = isPlaying && currentTrack?.id === item.id;

            return (
              <View
                style={[
                  styles.lectureCard,
                  {
                    backgroundColor: isPlayingThis
                      ? isDarkMode
                        ? "#0f3226"
                        : "#ecfdf5"
                      : theme.card,
                    borderColor: isPlayingThis ? theme.primary : theme.border,
                  },
                ]}
              >
                <View style={styles.lectureHeader}>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: "rgba(16,185,129,0.12)" },
                    ]}
                  >
                    <Text style={[styles.typeText, { color: theme.primary }]}>
                      {item.type}
                    </Text>
                  </View>
                  <Text style={[styles.lectureCat, { color: "#C9A227" }]}>
                    {item.category}
                  </Text>
                </View>

                <Text style={[styles.lectureTitle, { color: theme.text }]}>
                  {item.title}
                </Text>

                <View style={styles.scholarRow}>
                  <User size={14} color={theme.textMuted} />
                  <Text style={[styles.scholarName, { color: theme.textMuted }]}>
                    {item.scholar}
                  </Text>
                </View>

                <Text
                  style={[styles.lectureDesc, { color: theme.textSecondary }]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>

                {item.audioUrl ? (
                  <TouchableOpacity
                    style={[
                      styles.lecturePlayBtn,
                      { backgroundColor: theme.primary },
                    ]}
                    onPress={() => handlePlayLecture(item)}
                  >
                    <Play size={16} color="#ffffff" fill="#ffffff" />
                    <Text style={styles.playBtnText}>
                      {isPlayingThis ? "جاري الاستماع الآن" : "استمع للشرح التأصيلي"}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
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
  headerBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
    maxWidth: "90%",
    textAlign: "center",
  },
  topTabs: {
    flexDirection: "row-reverse",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: "center",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
    fontSize: 13,
  },
  categoriesBar: {
    paddingVertical: 10,
  },
  categoriesScroll: {
    flexDirection: "row-reverse",
    paddingHorizontal: 16,
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  catText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 14,
  },
  programCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  thumbnailWrapper: {
    width: "100%",
    height: 180,
    backgroundColor: "#1e293b",
    position: "relative",
  },
  programImage: {
    width: "100%",
    height: "100%",
  },
  playlistTypeBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  playlistTypeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  episodesCountBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(6, 78, 53, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  episodesCountText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  programBody: {
    padding: 16,
  },
  programCategoryRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  programCategory: {
    fontSize: 12,
    fontWeight: "bold",
  },
  durationCol: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  durationText: {
    fontSize: 11,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 24,
    textAlign: "right",
    marginBottom: 6,
  },
  presenterRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  presenterName: {
    fontSize: 12,
    fontWeight: "600",
  },
  programDesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "right",
    marginBottom: 12,
  },
  programFooter: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.1)",
    paddingTop: 10,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  lectureCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  lectureHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  lectureCat: {
    fontSize: 12,
    fontWeight: "bold",
  },
  lectureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
  scholarRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  scholarName: {
    fontSize: 12,
  },
  lectureDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "right",
  },
  lecturePlayBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  playBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
});
