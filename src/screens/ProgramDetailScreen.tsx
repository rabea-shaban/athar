import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Linking,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  ChevronRight,
  Play,
  Pause,
  Headphones,
  Video,
  User,
  BookOpen,
  CheckCircle2,
  Share2,
  ExternalLink,
  Sparkles,
  Info,
} from "lucide-react-native";
import { Lecture } from "../data/lectures";
import { useAudioStore } from "../store/audioStore";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme, FONTS } from "../constants/theme";

export const ProgramDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { lecture } = (route.params || {}) as { lecture?: Lecture };

  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioStore();

  if (!lecture) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorBox}>
          <Text style={[styles.errorText, { color: theme.text }]}>
            عذراً، لم يتم العثور على بيانات البرنامج أو الشرح.
          </Text>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>العودة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isCurrentAudioPlaying =
    isPlaying && currentTrack?.id === `lecture_${lecture.id}`;

  const handleToggleAudio = () => {
    if (!lecture.audioUrl) return;

    if (currentTrack?.id === `lecture_${lecture.id}`) {
      togglePlay();
    } else {
      playTrack({
        id: `lecture_${lecture.id}`,
        title: lecture.title,
        subtitle: lecture.scholar,
        audioUrl: lecture.audioUrl,
        isLive: false,
      });
    }
  };

  const handleOpenVideo = () => {
    if (lecture.videoUrl) {
      Linking.openURL(lecture.videoUrl).catch((err) =>
        console.warn("Failed to open video URL:", err)
      );
    }
  };

  const handleShare = () => {
    Share.share({
      message: `استمع وشاهد "${lecture.title}" لـ ${lecture.scholar} عبر تطبيق أَثَر الإسلامي: https://athar-library.vercel.app`,
    });
  };

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
          style={[styles.iconBtn, { backgroundColor: theme.border }]}
          onPress={handleShare}
        >
          <Share2 size={18} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: theme.text, fontFamily: FONTS.amiriBold }]}>
          البرامج والشروحات
        </Text>

        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <ChevronRight size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Card */}
        <View
          style={[
            styles.bannerCard,
            {
              backgroundColor: isDarkMode ? "#132332" : "#ecfdf5",
              borderColor: theme.primary,
            },
          ]}
        >
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: theme.primary },
              ]}
            >
              {lecture.type === "فيديو" ? (
                <Video size={12} color="#ffffff" />
              ) : (
                <Headphones size={12} color="#ffffff" />
              )}
              <Text style={styles.typeBadgeText}>{lecture.type}</Text>
            </View>

            <View style={styles.categoryBadge}>
              <Sparkles size={12} color={theme.accentGold} />
              <Text style={[styles.categoryBadgeText, { color: theme.primary }]}>
                {lecture.category}
              </Text>
            </View>
          </View>

          <Text style={[styles.lectureTitle, { color: theme.text, fontFamily: FONTS.amiriBold }]}>
            {lecture.title}
          </Text>

          <View style={styles.scholarRow}>
            <User size={15} color={theme.primary} />
            <Text style={[styles.scholarName, { color: theme.textMuted }]}>
              {lecture.scholar}
            </Text>
          </View>

          {/* Action Button: Native Audio Player or Video Player */}
          {lecture.audioUrl ? (
            <TouchableOpacity
              style={[
                styles.primaryMediaBtn,
                { backgroundColor: theme.primary },
              ]}
              onPress={handleToggleAudio}
              activeOpacity={0.85}
            >
              {isCurrentAudioPlaying ? (
                <Pause size={18} color="#ffffff" fill="#ffffff" />
              ) : (
                <Play size={18} color="#ffffff" fill="#ffffff" />
              )}
              <Text style={styles.primaryMediaBtnText}>
                {isCurrentAudioPlaying
                  ? "إيقاف مؤقت للتلاوة والشرح"
                  : "تشغيل الشرح الصوتي المباشر"}
              </Text>
            </TouchableOpacity>
          ) : lecture.videoUrl ? (
            <TouchableOpacity
              style={[
                styles.primaryMediaBtn,
                { backgroundColor: "#dc2626" },
              ]}
              onPress={handleOpenVideo}
              activeOpacity={0.85}
            >
              <Video size={18} color="#ffffff" />
              <Text style={styles.primaryMediaBtnText}>
                مشاهدة الحلقة والمرئي على يوتيوب
              </Text>
              <ExternalLink size={14} color="#ffffff" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Description Section */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeaderRow}>
            <BookOpen size={16} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: FONTS.amiriBold }]}>
              نبذة وتفاصيل المنهج العلمي:
            </Text>
          </View>

          <Text style={[styles.descriptionParagraph, { color: theme.text, fontFamily: FONTS.amiri }]}>
            {lecture.description}
          </Text>
        </View>

        {/* Topics Section */}
        {lecture.topics && lecture.topics.length > 0 && (
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.sectionHeaderRow}>
              <Sparkles size={16} color={theme.accentGold} />
              <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: FONTS.amiriBold }]}>
                أبرز محاور وقضايا السلسلة:
              </Text>
            </View>

            <View style={styles.listItemsBox}>
              {lecture.topics.map((topic, idx) => (
                <View key={idx} style={styles.listItemRow}>
                  <CheckCircle2 size={16} color={theme.primary} style={{ marginTop: 2 }} />
                  <Text style={[styles.listItemText, { color: theme.text, fontFamily: FONTS.amiri }]}>
                    {topic}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Benefits Section */}
        {lecture.benefits && lecture.benefits.length > 0 && (
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.sectionHeaderRow}>
              <Info size={16} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: FONTS.amiriBold }]}>
                الفوائد والعبر الإيمانية المستفادة:
              </Text>
            </View>

            <View style={styles.listItemsBox}>
              {lecture.benefits.map((benefit, idx) => (
                <View key={idx} style={styles.listItemRow}>
                  <View style={[styles.bulletDot, { backgroundColor: theme.accentGold }]} />
                  <Text style={[styles.listItemText, { color: theme.text, fontFamily: FONTS.amiri }]}>
                    {benefit}
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
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  bannerCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 12,
  },
  badgeRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  typeBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  categoryBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  lectureTitle: {
    fontSize: 18,
    textAlign: "right",
    lineHeight: 28,
  },
  scholarRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  scholarName: {
    fontSize: 13,
    fontWeight: "600",
  },
  primaryMediaBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 6,
  },
  primaryMediaBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
  sectionCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
  },
  descriptionParagraph: {
    fontSize: 14,
    textAlign: "right",
    lineHeight: 26,
  },
  listItemsBox: {
    gap: 10,
  },
  listItemRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 8,
  },
  listItemText: {
    fontSize: 13,
    flex: 1,
    textAlign: "right",
    lineHeight: 22,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  errorBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 15,
    textAlign: "center",
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
