import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  BookOpen,
  GraduationCap,
  Search,
  Bookmark,
  Play,
  Clock,
  User,
  ChevronLeft,
} from "lucide-react-native";
import { Header } from "../components/Header";
import { BOOKS, Book, BOOK_CATEGORIES } from "../data/books";
import { LECTURES_DATA, Lecture, LECTURE_CATEGORIES } from "../data/lectures";
import { usePreferencesStore } from "../store/preferencesStore";
import { useAudioStore } from "../store/audioStore";
import { lightTheme, darkTheme } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";

export const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isDarkMode, favoriteBooks, toggleFavoriteBook } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { playTrack, currentTrack, isPlaying } = useAudioStore();

  const [activeTab, setActiveTab] = useState<"books" | "lectures">("books");
  const [selectedBookCategory, setSelectedBookCategory] = useState("الكل");
  const [selectedLectureCategory, setSelectedLectureCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = useMemo(() => {
    return BOOKS.filter((b) => {
      const matchCat =
        selectedBookCategory === "الكل" || b.category === selectedBookCategory;
      const matchSearch =
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedBookCategory, searchQuery]);

  const filteredLectures = useMemo(() => {
    return LECTURES_DATA.filter((l) => {
      const matchCat =
        selectedLectureCategory === "الكل" ||
        l.category === selectedLectureCategory;
      const matchSearch =
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.scholar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedLectureCategory, searchQuery]);

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
      <Header
        title="المعرفة الإسلامية"
        subtitle="المكتبة التراثية والشروحات والدروس العلمية"
      />

      {/* Main Switch Tabs */}
      <View style={styles.topTabs}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            {
              backgroundColor:
                activeTab === "books"
                  ? theme.primary
                  : isDarkMode
                  ? "#131d2a"
                  : "#e2e8f0",
            },
          ]}
          onPress={() => setActiveTab("books")}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "books" ? "#ffffff" : theme.textMuted },
            ]}
          >
            كتب التراث ({toArabicNumber(BOOKS.length)})
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

      {/* Search Input */}
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
              activeTab === "books"
                ? "ابحث في كتب التراث والمؤلفين..."
                : "ابحث في الشروحات والعلماء..."
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
          {(activeTab === "books" ? BOOK_CATEGORIES : LECTURE_CATEGORIES).map(
            (cat) => {
              const isSelected =
                activeTab === "books"
                  ? selectedBookCategory === cat
                  : selectedLectureCategory === cat;
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
                    if (activeTab === "books") {
                      setSelectedBookCategory(cat);
                    } else {
                      setSelectedLectureCategory(cat);
                    }
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
      {activeTab === "books" ? (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.bookCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              onPress={() => navigation.navigate("BookDetail", { book: item })}
              activeOpacity={0.7}
            >
              <View style={styles.bookHeader}>
                {item.badge ? (
                  <View
                    style={[
                      styles.badgeContainer,
                      {
                        backgroundColor: isDarkMode ? "#172535" : "#ecfdf5",
                      },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: theme.primary }]}>
                      {item.badge}
                    </Text>
                  </View>
                ) : <View />}

                <Text style={[styles.bookCategory, { color: theme.accentGold }]}>
                  {item.category}
                </Text>
              </View>

              <Text style={[styles.bookTitle, { color: theme.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.bookAuthor, { color: theme.textMuted }]}>
                {item.author} • {item.authorEra}
              </Text>
              <Text
                style={[styles.bookDesc, { color: theme.textSecondary }]}
                numberOfLines={2}
              >
                {item.description}
              </Text>

              <View style={styles.bookFooter}>
                <View style={styles.readMoreRow}>
                  <ChevronLeft size={16} color={theme.primary} />
                  <Text style={[styles.readMoreText, { color: theme.primary }]}>
                    عرض الكتاب
                  </Text>
                </View>
                <Text style={[styles.pagesText, { color: theme.textMuted }]}>
                  {toArabicNumber(item.pages)} صفحة
                </Text>
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
            const isPlayingThis =
              isPlaying && currentTrack?.id === item.id;

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
                  <Text
                    style={[styles.lectureCat, { color: theme.accentGold }]}
                  >
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
                      {isPlayingThis ? "جاري الاستماع الآن" : "استمع للشرح"}
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
  topTabs: {
    flexDirection: "row-reverse",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  tabText: {
    fontSize: 13,
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
    fontSize: 14,
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
    gap: 12,
  },
  bookCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  bookHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  bookCategory: {
    fontSize: 12,
    fontWeight: "bold",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
  bookAuthor: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
  bookDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "right",
  },
  bookFooter: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(150,150,150,0.1)",
  },
  pagesText: {
    fontSize: 11,
  },
  readMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  readMoreText: {
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
