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
  FileText,
  TrendingUp,
  Tv,
} from "lucide-react-native";
import { Header } from "../components/Header";
import { BOOKS, Book, BOOK_CATEGORIES } from "../data/books";
import { ARTICLES, ARTICLE_CATEGORIES } from "../data/articles";
import { LECTURES_DATA, Lecture, LECTURE_CATEGORIES } from "../data/lectures";
import { Article } from "../types/content";
import { usePreferencesStore } from "../store/preferencesStore";
import { useAudioStore } from "../store/audioStore";
import { lightTheme, darkTheme } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";

export const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { playTrack, currentTrack, isPlaying } = useAudioStore();

  const [activeTab, setActiveTab] = useState<"books" | "articles" | "lectures">("books");
  const [selectedBookCategory, setSelectedBookCategory] = useState("الكل");
  const [selectedArticleCategory, setSelectedArticleCategory] = useState("الكل");
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

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((a) => {
      const matchCat =
        selectedArticleCategory === "الكل" || a.category === selectedArticleCategory;
      const matchSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedArticleCategory, searchQuery]);

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

  const getSearchPlaceholder = () => {
    if (activeTab === "books") return "ابحث في ٦٧ كتاباً من أمهات التراث...";
    if (activeTab === "articles") return "ابحث في المقالات والبحوث الإيمانية...";
    return "ابحث في الشروحات والعلماء...";
  };

  const currentCategories = useMemo(() => {
    if (activeTab === "books") return BOOK_CATEGORIES;
    if (activeTab === "articles") return ARTICLE_CATEGORIES;
    return LECTURE_CATEGORIES;
  }, [activeTab]);

  const currentSelectedCategory = () => {
    if (activeTab === "books") return selectedBookCategory;
    if (activeTab === "articles") return selectedArticleCategory;
    return selectedLectureCategory;
  };

  const handleSelectCategory = (cat: string) => {
    if (activeTab === "books") setSelectedBookCategory(cat);
    else if (activeTab === "articles") setSelectedArticleCategory(cat);
    else setSelectedLectureCategory(cat);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="المعرفة والعلوم الإسلامية"
        subtitle="المكتبة التراثية والمقالات والشروحات العلمية"
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
                activeTab === "articles"
                  ? theme.primary
                  : isDarkMode
                  ? "#131d2a"
                  : "#e2e8f0",
            },
          ]}
          onPress={() => setActiveTab("articles")}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "articles" ? "#ffffff" : theme.textMuted },
            ]}
          >
            المقالات والتزكية ({toArabicNumber(ARTICLES.length)})
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
            الشروحات ({toArabicNumber(LECTURES_DATA.length)})
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
            placeholder={getSearchPlaceholder()}
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
          <Search size={18} color={theme.textMuted} />
        </View>
      </View>

      {/* Quick Access to Visual Programs & Podcasts */}
      <TouchableOpacity
        style={[
          styles.programsBanner,
          {
            backgroundColor: isDarkMode ? "#0e201b" : "#e6f4ea",
            borderColor: isDarkMode ? "#194a3a" : "#bbf7d0",
          },
        ]}
        onPress={() => navigation.navigate("Programs")}
        activeOpacity={0.8}
      >
        <View style={styles.programsBannerRight}>
          <Tv size={20} color={theme.primary} />
          <View style={styles.programsBannerTextCol}>
            <Text style={[styles.programsBannerTitle, { color: theme.text }]}>
              البرامج والبودكاست المرئي (٢٢ برنامجاً)
            </Text>
            <Text style={[styles.programsBannerSubtitle, { color: theme.textMuted }]}>
              خواطر التفسير، بودكاست وعي وفنجان، وسلاسل السيرة والأنبياء
            </Text>
          </View>
        </View>
        <ChevronLeft size={16} color={theme.primary} />
      </TouchableOpacity>

      {/* Categories Horizontal Bar */}
      <View style={styles.categoriesBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {currentCategories.map((cat) => {
            const isSelected = currentSelectedCategory() === cat;
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
                onPress={() => handleSelectCategory(cat)}
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
          })}
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

                <Text style={[styles.bookCategory, { color: "#C9A227" }]}>
                  {item.category}
                </Text>
              </View>

              <Text style={[styles.bookTitle, { color: theme.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.bookAuthor, { color: theme.textMuted }]}>
                {item.author} {item.authorEra ? `• ${item.authorEra}` : ""}
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
                    عرض وقراءة الكتاب
                  </Text>
                </View>
                <Text style={[styles.pagesText, { color: theme.textMuted }]}>
                  {toArabicNumber(item.pages)} صفحة معتمدة
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : activeTab === "articles" ? (
        <FlatList
          data={filteredArticles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.articleCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              onPress={() => navigation.navigate("ArticleDetail", { article: item })}
              activeOpacity={0.8}
            >
              {item.coverImage ? (
                <Image
                  source={{ uri: item.coverImage }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : null}

              <View style={styles.articleBody}>
                <View style={styles.bookHeader}>
                  {item.trending ? (
                    <View style={styles.trendingBadge}>
                      <TrendingUp size={12} color="#C9A227" />
                      <Text style={styles.trendingText}>رائج الآن</Text>
                    </View>
                  ) : <View />}

                  <Text style={[styles.bookCategory, { color: theme.primary }]}>
                    {item.category}
                  </Text>
                </View>

                <Text style={[styles.bookTitle, { color: theme.text }]} numberOfLines={2}>
                  {item.title}
                </Text>

                <Text
                  style={[styles.bookDesc, { color: theme.textSecondary }]}
                  numberOfLines={2}
                >
                  {item.summary}
                </Text>

                <View style={styles.bookFooter}>
                  <View style={styles.readMoreRow}>
                    <ChevronLeft size={16} color={theme.primary} />
                    <Text style={[styles.readMoreText, { color: theme.primary }]}>
                      قراءة المقال كاملاً
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 4 }}>
                    <Clock size={12} color={theme.textMuted} />
                    <Text style={[styles.pagesText, { color: theme.textMuted }]}>
                      {toArabicNumber(item.readingTimeMinutes)} دقائق
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
                    style={[styles.lectureCat, { color: "#C9A227" }]}
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
    gap: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
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
  programsBanner: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  programsBannerRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  programsBannerTextCol: {
    flex: 1,
    alignItems: "flex-end",
  },
  programsBannerTitle: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "right",
  },
  programsBannerSubtitle: {
    fontSize: 11,
    marginTop: 2,
    textAlign: "right",
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
  articleCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#1e293b",
  },
  articleBody: {
    padding: 16,
  },
  trendingBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(201, 162, 39, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trendingText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#C9A227",
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
