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
  Download,
  ShieldCheck,
  Building,
  Calendar,
  Layers,
  FileText,
  CheckCircle2,
} from "lucide-react-native";
import { Book, getBookDownloadUrl, getBookReaderUrl } from "../data/books";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";

export const BookDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { book } = route.params as { book: Book };

  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const downloadUrl = getBookDownloadUrl(book);
  const readerUrl = getBookReaderUrl(book);

  const handleShare = async () => {
    try {
      await Share.share({
        title: book.title,
        message: `كتاب: ${book.title}\nالمؤلف: ${book.author}\nتصفحه وقراءته عبر تطبيق ومكتبة أَثَر الإسلامية:\n${readerUrl}`,
      });
    } catch (e) {
      console.warn("Share error:", e);
    }
  };

  const handleOpenInAppReader = () => {
    navigation.navigate("PdfReader", { book });
  };

  const handleDownloadPdf = async () => {
    try {
      const supported = await Linking.canOpenURL(downloadUrl);
      if (supported) {
        await Linking.openURL(downloadUrl);
      }
    } catch (e) {
      console.warn("Download error:", e);
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
          accessibilityLabel="مشاركة الكتاب"
        >
          <Share2 size={18} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: theme.text }]} numberOfLines={1}>
          {book.title}
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
        {/* Book Header Card */}
        <View
          style={[
            styles.bookHeroCard,
            {
              backgroundColor: isDarkMode ? "#091712" : "#f4f8f4",
              borderColor: isDarkMode ? "#133e2e" : "#d1fae5",
            },
          ]}
        >
          <View style={styles.bookIconBadge}>
            <BookOpen size={36} color="#064E35" />
          </View>

          {book.badge && (
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>{book.badge}</Text>
            </View>
          )}

          <Text style={[styles.heroTitle, { color: theme.text }]}>
            {book.title}
          </Text>

          <View style={styles.authorRow}>
            <User size={14} color={theme.textMuted} />
            <Text style={[styles.heroAuthor, { color: theme.textMuted }]}>
              {book.author} {book.authorEra ? `(${book.authorEra})` : ""}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.metaPill, { backgroundColor: theme.card }]}>
              <Text style={[styles.metaPillText, { color: "#C9A227" }]}>
                {book.category}
              </Text>
            </View>
            <View style={[styles.metaPill, { backgroundColor: theme.card }]}>
              <Text style={[styles.metaPillText, { color: "#064E35" }]}>
                {toArabicNumber(book.pages)} صفحة معتمدة
              </Text>
            </View>
            {book.fileSize && (
              <View style={[styles.metaPill, { backgroundColor: theme.card }]}>
                <Text style={[styles.metaPillText, { color: theme.textMuted }]}>
                  {book.fileSize}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Primary Reading and Download Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.primaryReadBtn, { backgroundColor: "#064E35" }]}
            onPress={handleOpenInAppReader}
            activeOpacity={0.85}
          >
            <BookOpen size={20} color="#ffffff" />
            <View style={styles.readBtnTextCol}>
              <Text style={styles.primaryReadText}>
                قراءة الكتاب في القارئ الرقمي المدمج
              </Text>
              <Text style={styles.primaryReadSubtext}>
                تصفح مصور سريع بتقنية WebAssembly وملاءمة كاملة للشاشة
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryDownloadBtn,
              {
                backgroundColor: isDarkMode ? "#101d28" : "#ffffff",
                borderColor: "#C9A227",
              },
            ]}
            onPress={handleDownloadPdf}
            activeOpacity={0.85}
          >
            <Download size={18} color="#C9A227" />
            <Text style={[styles.secondaryDownloadText, { color: "#C9A227" }]}>
              تحميل نسخة الـ PDF المعتمدة ({book.fileSize || "مباشر"})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            عن الكتاب والمنهج
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

        {/* Academic Dossier / البطاقة والتوثيق */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.dossierHeader}>
            <ShieldCheck size={18} color="#C9A227" />
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>
              البطاقة والتوثيق الأكاديمي
            </Text>
          </View>

          <View style={styles.dossierGrid}>
            {book.publisher && (
              <View style={styles.dossierRow}>
                <Building size={15} color={theme.textMuted} />
                <Text style={[styles.dossierLabel, { color: theme.textMuted }]}>
                  دار النشر والتحقيق:
                </Text>
                <Text style={[styles.dossierValue, { color: theme.text }]}>
                  {book.publisher}
                </Text>
              </View>
            )}

            {book.publicationYear && (
              <View style={styles.dossierRow}>
                <Calendar size={15} color={theme.textMuted} />
                <Text style={[styles.dossierLabel, { color: theme.textMuted }]}>
                  سنة النشر:
                </Text>
                <Text style={[styles.dossierValue, { color: theme.text }]}>
                  {toArabicNumber(book.publicationYear)} م
                </Text>
              </View>
            )}

            {book.subcategory && (
              <View style={styles.dossierRow}>
                <Layers size={15} color={theme.textMuted} />
                <Text style={[styles.dossierLabel, { color: theme.textMuted }]}>
                  التصنيف الفرعي:
                </Text>
                <Text style={[styles.dossierValue, { color: theme.text }]}>
                  {book.subcategory}
                </Text>
              </View>
            )}

            {book.license && (
              <View style={styles.dossierRow}>
                <CheckCircle2 size={15} color="#059669" />
                <Text style={[styles.dossierLabel, { color: theme.textMuted }]}>
                  حقوق الملكية الفكرية:
                </Text>
                <Text style={[styles.dossierValue, { color: theme.text }]}>
                  {book.license}
                </Text>
              </View>
            )}

            {book.originalSource && (
              <View style={styles.dossierRow}>
                <FileText size={15} color={theme.textMuted} />
                <Text style={[styles.dossierLabel, { color: theme.textMuted }]}>
                  المصدر المعتمد:
                </Text>
                <Text style={[styles.dossierValue, { color: theme.text }]}>
                  {book.originalSource}
                </Text>
              </View>
            )}
          </View>
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
    backgroundColor: "rgba(6, 78, 53, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  badgePill: {
    backgroundColor: "rgba(201, 162, 39, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(201, 162, 39, 0.3)",
  },
  badgePillText: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "bold",
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
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
  },
  metaPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionsContainer: {
    gap: 10,
  },
  primaryReadBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 12,
  },
  readBtnTextCol: {
    flex: 1,
    alignItems: "flex-end",
  },
  primaryReadText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "right",
  },
  primaryReadSubtext: {
    color: "#d1fae5",
    fontSize: 11,
    marginTop: 2,
    textAlign: "right",
  },
  secondaryDownloadBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  secondaryDownloadText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "right",
  },
  sectionDesc: {
    fontSize: 14,
    textAlign: "right",
  },
  dossierHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  dossierGrid: {
    gap: 10,
  },
  dossierRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 8,
  },
  dossierLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  dossierValue: {
    flex: 1,
    fontSize: 12,
    textAlign: "right",
  },
  topicsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  topicBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  topicText: {
    fontSize: 12,
  },
});
