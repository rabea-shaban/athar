import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  ChevronRight,
  BookOpen,
  User,
  Clock,
  Share2,
  ExternalLink,
  Layers,
} from "lucide-react-native";
import { Book } from "../data/books";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";

export const BookDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { book } = route.params as { book: Book };

  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `كتاب: ${book.title}\nالمؤلف: ${book.author}\nتصفحه عبر تطبيق أَثَر الإسلامي: https://athar-library.vercel.app/library/${book.slug}`,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const handleOpenReadUrl = () => {
    if (book.readUrl) {
      Linking.openURL(book.readUrl);
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
        >
          <Share2 size={18} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: theme.text }]} numberOfLines={1}>
          {book.title}
        </Text>

        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <ChevronRight size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Book Header Card */}
        <View
          style={[
            styles.bookHeroCard,
            {
              backgroundColor: isDarkMode ? "#0e201b" : "#e6f4ea",
              borderColor: isDarkMode ? "#194a3a" : "#bbf7d0",
            },
          ]}
        >
          <View style={styles.bookIconBadge}>
            <BookOpen size={36} color={theme.primary} />
          </View>

          <Text style={[styles.heroTitle, { color: theme.text }]}>
            {book.title}
          </Text>

          <View style={styles.authorRow}>
            <User size={14} color={theme.textMuted} />
            <Text style={[styles.heroAuthor, { color: theme.textMuted }]}>
              {book.author} ({book.authorEra})
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.metaPill, { backgroundColor: theme.card }]}>
              <Text style={[styles.metaPillText, { color: theme.accentGold }]}>
                {book.category}
              </Text>
            </View>
            <View style={[styles.metaPill, { backgroundColor: theme.card }]}>
              <Text style={[styles.metaPillText, { color: theme.primary }]}>
                {toArabicNumber(book.pages)} صفحة
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            عن الكتاب
          </Text>
          <Text
            style={[
              styles.sectionDesc,
              { color: theme.textSecondary, lineHeight: 28 },
            ]}
          >
            {book.description}
          </Text>
        </View>

        {/* Topics */}
        {book.topics && book.topics.length > 0 && (
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              أهم أبواب وموضوعات الكتاب
            </Text>
            <View style={styles.topicsGrid}>
              {book.topics.map((t, i) => (
                <View
                  key={i}
                  style={[
                    styles.topicBadge,
                    {
                      backgroundColor: isDarkMode ? "#172535" : "#f1f5f9",
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.topicText, { color: theme.text }]}>
                    {t}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Read Online Button */}
        {book.readUrl ? (
          <TouchableOpacity
            style={[styles.readBtn, { backgroundColor: theme.primary }]}
            onPress={handleOpenReadUrl}
          >
            <ExternalLink size={18} color="#ffffff" />
            <Text style={styles.readBtnText}>قراءة الكتاب كاملاً (المصدر الأصلي)</Text>
          </TouchableOpacity>
        ) : null}
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
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  bookHeroCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
  },
  bookIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(16,185,129,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  authorRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  heroAuthor: {
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row-reverse",
    gap: 10,
    marginTop: 14,
  },
  metaPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  sectionCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "right",
  },
  sectionDesc: {
    fontSize: 14,
    textAlign: "right",
  },
  topicsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  topicBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  topicText: {
    fontSize: 12,
    fontWeight: "500",
  },
  readBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  readBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
