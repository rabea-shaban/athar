import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Linking,
  Image,
  FlatList,
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
  Clock,
  Tv,
  ListOrdered,
} from "lucide-react-native";
import { Program, Episode } from "../types/content";
import { Lecture } from "../data/lectures";
import { useAudioStore } from "../store/audioStore";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme, FONTS } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";

export const ProgramDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { program, lecture } = (route.params || {}) as {
    program?: Program;
    lecture?: Lecture;
  };

  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioStore();

  const activeItem = program || lecture;

  if (!activeItem) {
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

  const title = program?.title || lecture?.title || "";
  const presenter = program?.presenter || lecture?.scholar || "";
  const presenterTitle = program?.presenterTitle || "";
  const category = program?.category || lecture?.category || "";
  const description = program?.description || lecture?.description || "";
  const episodes: Episode[] = program?.episodes || [];

  const getCoverImage = () => {
    if (program?.coverImage && program.coverImage.startsWith("http")) {
      return program.coverImage;
    }
    if (episodes && episodes[0]?.youtubeId) {
      return `https://img.youtube.com/vi/${episodes[0].youtubeId}/hqdefault.jpg`;
    }
    if (episodes && episodes[0]?.thumb) {
      return episodes[0].thumb;
    }
    return "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80";
  };

  const coverUri = getCoverImage();

  const handlePlayEpisode = (episode: Episode) => {
    if (episode.youtubeUrl) {
      Linking.openURL(episode.youtubeUrl).catch((err) =>
        console.warn("Failed to open YouTube video:", err)
      );
    } else if (episode.audioUrl) {
      const isThisPlaying = isPlaying && currentTrack?.id === episode.id;
      if (isThisPlaying) {
        togglePlay();
      } else {
        playTrack({
          id: episode.id,
          title: episode.title,
          subtitle: presenter,
          audioUrl: episode.audioUrl,
        });
      }
    }
  };

  const handleShare = () => {
    Share.share({
      message: `استمع وشاهد "${title}" لـ ${presenter} عبر تطبيق أَثَر الإسلامي: https://athar-library.vercel.app`,
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

        <Text
          style={[
            styles.navTitle,
            { color: theme.text, fontFamily: FONTS.amiriBold },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <ChevronRight size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cover Thumbnail Image Card matching Web */}
        <View style={styles.coverWrapper}>
          <Image source={{ uri: coverUri }} style={styles.coverImage} resizeMode="cover" />
          <View style={styles.vignetteOverlay} />

          <View style={styles.playlistTypeBadge}>
            <Tv size={12} color="#ffffff" />
            <Text style={styles.playlistTypeText}>
              {program?.playlistType || "سلسلة مرئية"}
            </Text>
          </View>

          <View style={styles.episodesBadge}>
            <Text style={styles.episodesBadgeText}>
              {program?.badge || `${toArabicNumber(episodes.length)} حلقة`}
            </Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.categoryBadgeText, { color: theme.accentGold, fontFamily: FONTS.amiriBold }]}>
            {category}
          </Text>

          <Text style={[styles.programMainTitle, { color: theme.text, fontFamily: FONTS.amiriBold }]}>
            {title}
          </Text>

          <View style={styles.presenterRow}>
            <User size={15} color={theme.primary} />
            <Text style={[styles.presenterNameText, { color: theme.primary, fontFamily: FONTS.amiriBold }]}>
              {presenter} {presenterTitle ? `• ${presenterTitle}` : ""}
            </Text>
          </View>

          <Text style={[styles.descriptionText, { color: theme.textSecondary, fontFamily: FONTS.amiri }]}>
            {description}
          </Text>
        </View>

        {/* Episode List Section */}
        {episodes.length > 0 && (
          <View style={styles.episodesSection}>
            <View style={styles.sectionHeaderRow}>
              <ListOrdered size={18} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: FONTS.amiriBold }]}>
                قائمة الحلقات الكاملة ({toArabicNumber(episodes.length)} حلقة معتمدة)
              </Text>
            </View>

            <View style={styles.episodesList}>
              {episodes.map((ep, idx) => {
                const isThisPlaying = isPlaying && currentTrack?.id === ep.id;

                return (
                  <TouchableOpacity
                    key={ep.id || idx}
                    style={[
                      styles.episodeCard,
                      {
                        backgroundColor: isThisPlaying
                          ? isDarkMode
                            ? "#064e3b22"
                            : "#ecfdf5"
                          : theme.card,
                        borderColor: isThisPlaying ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => handlePlayEpisode(ep)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.episodeCardRight}>
                      <View
                        style={[
                          styles.episodeNumBadge,
                          { backgroundColor: isDarkMode ? "#172535" : "#f1f5f9" },
                        ]}
                      >
                        <Text style={[styles.episodeNumText, { color: theme.primary }]}>
                          {toArabicNumber(ep.order || idx + 1)}
                        </Text>
                      </View>

                      <View style={styles.episodeInfoCol}>
                        <Text
                          style={[
                            styles.episodeTitle,
                            { color: theme.text, fontFamily: FONTS.amiriBold },
                          ]}
                          numberOfLines={2}
                        >
                          {ep.title}
                        </Text>
                        {ep.duration ? (
                          <Text style={[styles.episodeDuration, { color: theme.textMuted }]}>
                            المدة: {ep.duration}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <View
                      style={[
                        styles.playIconCircle,
                        { backgroundColor: ep.youtubeUrl ? "#dc2626" : theme.primary },
                      ]}
                    >
                      {ep.youtubeUrl ? (
                        <Video size={14} color="#ffffff" />
                      ) : isThisPlaying ? (
                        <Pause size={14} color="#ffffff" />
                      ) : (
                        <Play size={14} color="#ffffff" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
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
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  coverWrapper: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#0f172a",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  playlistTypeBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  playlistTypeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  episodesBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#059669",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  episodesBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  infoCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
  },
  programMainTitle: {
    fontSize: 19,
    textAlign: "right",
    lineHeight: 28,
  },
  presenterRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  presenterNameText: {
    fontSize: 13,
    flex: 1,
    textAlign: "right",
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: "right",
  },
  episodesSection: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
  },
  episodesList: {
    gap: 10,
  },
  episodeCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  episodeCardRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginLeft: 8,
  },
  episodeNumBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  episodeNumText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  episodeInfoCol: {
    flex: 1,
    alignItems: "flex-end",
  },
  episodeTitle: {
    fontSize: 13,
    textAlign: "right",
    lineHeight: 20,
  },
  episodeDuration: {
    fontSize: 11,
    marginTop: 2,
  },
  playIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
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
