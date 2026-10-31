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
  Clock,
  User,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Share2,
  FileText,
} from "lucide-react-native";
import { ARTICLES, ARTICLE_CATEGORIES } from "../data/articles";
import { Article } from "../types/content";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";

export const ArticlesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((a) => {
      const matchCat =
        selectedCategory === "الكل" || a.category === selectedCategory;
      const matchSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
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
            المقالات والتزكية
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
            دراسات وبحوث إيمانية وتربوية موثقة
          </Text>
        </View>

        <View style={{ width: 36 }} />
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
            placeholder="ابحث في المقالات والموضوعات الإيمانية..."
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
          {ARTICLE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
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
                onPress={() => setSelectedCategory(cat)}
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

      {/* Articles List */}
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

            <View style={styles.cardBody}>
              <View style={styles.cardHeaderRow}>
                {item.trending ? (
                  <View style={styles.trendingBadge}>
                    <TrendingUp size={12} color="#C9A227" />
                    <Text style={styles.trendingText}>رائج الآن</Text>
                  </View>
                ) : <View />}

                <Text style={[styles.categoryBadge, { color: theme.primary }]}>
                  {item.category}
                </Text>
              </View>

              <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
                {item.title}
              </Text>

              <Text
                style={[styles.cardSummary, { color: theme.textSecondary }]}
                numberOfLines={2}
              >
                {item.summary}
              </Text>

              <View style={styles.cardFooter}>
                <View style={styles.metaCol}>
                  <User size={13} color={theme.textMuted} />
                  <Text style={[styles.metaText, { color: theme.textMuted }]}>
                    {item.author}
                  </Text>
                </View>

                <View style={styles.metaCol}>
                  <Clock size={13} color={theme.textMuted} />
                  <Text style={[styles.metaText, { color: theme.textMuted }]}>
                    {toArabicNumber(item.readingTimeMinutes)} دقائق قراءة
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
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
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
    marginRight: 8,
  },
  categoriesBar: {
    paddingVertical: 10,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    flexDirection: "row-reverse",
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  catText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 16,
  },
  articleCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#1e293b",
  },
  cardBody: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
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
  categoryBadge: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 24,
    textAlign: "right",
    marginBottom: 6,
  },
  cardSummary: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "right",
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
    paddingTop: 10,
  },
  metaCol: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 11,
  },
});
