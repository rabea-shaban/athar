import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  ChevronRight,
  Share2,
  Clock,
  User,
  Calendar,
  Quote,
  Tag,
} from "lucide-react-native";
import { Article } from "../types/content";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";

export const ArticleDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { article } = route.params as { article: Article };

  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleShare = async () => {
    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n\n${article.summary}\n\nبقلم: ${article.author}\nعبر تطبيق ومكتبة أَثَر الإسلامية: https://athar-library.vercel.app/articles/${article.slug}`,
      });
    } catch (e) {
      console.warn("Share error:", e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Navigation Header */}
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
          style={[styles.iconBtn, { backgroundColor: theme.border }]}
          onPress={handleShare}
          accessibilityLabel="مشاركة المقال"
        >
          <Share2 size={18} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: theme.text }]} numberOfLines={1}>
          {article.title}
        </Text>

        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.border }]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="رجوع"
        >
          <ChevronRight size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cover Image */}
        {article.coverImage ? (
          <Image
            source={{ uri: article.coverImage }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : null}

        {/* Title & Metadata Card */}
        <View
          style={[
            styles.headerCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.categoryRow}>
            <Text style={[styles.categoryText, { color: theme.primary }]}>
              {article.category}
            </Text>
            <View style={styles.timeBadge}>
              <Clock size={12} color={theme.textMuted} />
              <Text style={[styles.timeText, { color: theme.textMuted }]}>
                {toArabicNumber(article.readingTimeMinutes)} دقائق قراءة
              </Text>
            </View>
          </View>

          <Text style={[styles.articleTitle, { color: theme.text }]}>
            {article.title}
          </Text>

          <View style={styles.authorMetaRow}>
            <User size={14} color={theme.textMuted} />
            <Text style={[styles.authorName, { color: theme.textMuted }]}>
              {article.author} {article.authorRole ? `— ${article.authorRole}` : ""}
            </Text>
          </View>

          {/* Summary Lead */}
          <Text
            style={[
              styles.summaryText,
              {
                color: theme.textSecondary,
                backgroundColor: isDarkMode ? "#101d28" : "#f8fafc",
                borderColor: theme.border,
              },
            ]}
          >
            {article.summary}
          </Text>
        </View>

        {/* Article Body Sections */}
        {article.sections.map((sec, idx) => (
          <View
            key={idx}
            style={[
              styles.sectionCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            {sec.heading && (
              <Text style={[styles.sectionHeading, { color: theme.text }]}>
                {sec.heading}
              </Text>
            )}

            {sec.paragraphs.map((p, pIdx) => (
              <Text
                key={pIdx}
                style={[
                  styles.paragraph,
                  { color: theme.text, lineHeight: 28 },
                ]}
              >
                {p}
              </Text>
            ))}

            {sec.quote && (
              <View
                style={[
                  styles.quoteBox,
                  {
                    backgroundColor: isDarkMode ? "#0e201b" : "#f0fdf4",
                    borderRightColor: theme.primary,
                  },
                ]}
              >
                <Quote size={20} color={theme.primary} style={{ marginBottom: 6 }} />
                <Text style={[styles.quoteText, { color: theme.text }]}>
                  {sec.quote.text}
                </Text>
                {sec.quote.source && (
                  <Text style={[styles.quoteSource, { color: theme.textMuted }]}>
                    — {sec.quote.source}
                  </Text>
                )}
              </View>
            )}
          </View>
        ))}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <View
            style={[
              styles.tagsCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.tagsHeader}>
              <Tag size={15} color={theme.textMuted} />
              <Text style={[styles.tagsTitle, { color: theme.textMuted }]}>
                الموضوعات الدلالية:
              </Text>
            </View>

            <View style={styles.tagsWrap}>
              {article.tags.map((tag, tIdx) => (
                <View
                  key={tIdx}
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor: isDarkMode ? "#172535" : "#f1f5f9",
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.tagText, { color: theme.text }]}>
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Share Button Bottom */}
        <TouchableOpacity
          style={[styles.shareBottomBtn, { backgroundColor: theme.primary }]}
          onPress={handleShare}
          activeOpacity={0.85}
        >
          <Share2 size={18} color="#ffffff" />
          <Text style={styles.shareBottomText}>مشاركة هذا المقال الإيماني</Text>
        </TouchableOpacity>
      </ScrollView>
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
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 15,
    fontWeight: "bold",
    maxWidth: "70%",
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 16,
  },
  coverImage: {
    width: "100%",
    height: 220,
    backgroundColor: "#1e293b",
  },
  headerCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: -20,
  },
  categoryRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  timeBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 11,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 28,
    textAlign: "right",
    marginBottom: 10,
  },
  authorMetaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  authorName: {
    fontSize: 12,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: "right",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  sectionCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
  paragraph: {
    fontSize: 15,
    textAlign: "right",
  },
  quoteBox: {
    padding: 14,
    borderRadius: 12,
    borderRightWidth: 4,
    marginTop: 6,
    alignItems: "flex-end",
  },
  quoteText: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 24,
    textAlign: "right",
  },
  quoteSource: {
    fontSize: 12,
    marginTop: 6,
    textAlign: "right",
  },
  tagsCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagsHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  tagsTitle: {
    fontSize: 12,
  },
  tagsWrap: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
  },
  shareBottomBtn: {
    marginHorizontal: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  shareBottomText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
