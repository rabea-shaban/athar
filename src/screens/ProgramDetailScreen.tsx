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
  Modal,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
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
  X,
} from "lucide-react-native";
import { Program, Episode } from "../types/content";
import { Lecture } from "../data/lectures";
import { useAudioStore } from "../store/audioStore";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme, FONTS } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";

function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

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

  const [activeVideo, setActiveVideo] = useState<{
    id: string;
    title: string;
  } | null>(null);

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
    if (lecture?.videoUrl) {
      const vid = extractYouTubeId(lecture.videoUrl);
      if (vid) return `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
    }
    return "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80";
  };

  const coverUri = getCoverImage();

  const handlePlayEpisode = (episode: Episode) => {
    const youtubeId = episode.youtubeId || extractYouTubeId(episode.youtubeUrl);
    if (youtubeId) {
      setActiveVideo({ id: youtubeId, title: episode.title });
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

  const handlePlayLectureVideo = () => {
    if (lecture?.videoUrl) {
      const youtubeId = extractYouTubeId(lecture.videoUrl);
      if (youtubeId) {
        setActiveVideo({ id: youtubeId, title: lecture.title });
      } else {
        Linking.openURL(lecture.videoUrl);
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
        <TouchableOpacity
          style={styles.coverWrapper}
          onPress={() => {
            if (episodes && episodes[0]) {
              handlePlayEpisode(episodes[0]);
            } else if (lecture?.videoUrl) {
              handlePlayLectureVideo();
            }
          }}
          activeOpacity={0.9}
        >
          <Image source={{ uri: coverUri }} style={styles.coverImage} resizeMode="cover" />
          <View style={styles.vignetteOverlay} />

          <View style={styles.playlistTypeBadge}>
            <Tv size={12} color="#ffffff" />
            <Text style={styles.playlistTypeText}>
              {program?.playlistType || (lecture?.type === "فيديو" ? "سلسلة مرئية" : "شرح صوتي")}
            </Text>
          </View>

          <View style={styles.episodesBadge}>
            <Text style={styles.episodesBadgeText}>
              {program?.badge || `${toArabicNumber(episodes.length || 1)} حلقة`}
            </Text>
          </View>

          {/* Center Play Button Icon matching Web */}
          <View style={styles.centerPlayCircle}>
            <Play size={22} color="#ffffff" fill="#ffffff" style={{ marginLeft: 2 }} />
          </View>
        </TouchableOpacity>

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
            <Text
              style={[styles.presenterNameText, { color: theme.primary, fontFamily: FONTS.amiriBold }]}
              numberOfLines={1}
            >
              {presenter} {presenterTitle ? `• ${presenterTitle}` : ""}
            </Text>
          </View>

          <Text style={[styles.descriptionText, { color: theme.textSecondary, fontFamily: FONTS.amiri }]}>
            {description}
          </Text>

          {lecture?.videoUrl && (
            <TouchableOpacity
              style={[styles.inAppVideoPlayBtn, { backgroundColor: "#dc2626" }]}
              onPress={handlePlayLectureVideo}
              activeOpacity={0.85}
            >
              <Video size={18} color="#ffffff" />
              <Text style={styles.inAppVideoPlayBtnText}>
                مشاهدة الشرح المرئي مباشرة داخل التطبيق
              </Text>
            </TouchableOpacity>
          )}
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
                        { backgroundColor: ep.youtubeId || ep.youtubeUrl ? "#dc2626" : theme.primary },
                      ]}
                    >
                      {ep.youtubeId || ep.youtubeUrl ? (
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

      {/* ─── Embedded Native In-App Video Player Modal ─── */}
      <Modal
        visible={!!activeVideo}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setActiveVideo(null)}
      >
        <View style={styles.videoModalContainer}>
          {/* Header */}
          <View style={[styles.videoModalHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              onPress={() => setActiveVideo(null)}
              style={styles.closeVideoBtn}
            >
              <X size={22} color="#ffffff" />
            </TouchableOpacity>

            <Text style={styles.videoModalTitle} numberOfLines={1}>
              {activeVideo?.title || "مشاهدة الحلقة"}
            </Text>

            <View style={{ width: 36 }} />
          </View>

          {/* Embedded Native WebView Video Player */}
          {activeVideo?.id ? (
            <View style={styles.webViewContainer}>
              <WebView
                style={{ flex: 1, backgroundColor: "#000000" }}
                javaScriptEnabled
                domStorageEnabled
                allowsFullscreenVideo
                source={{
                  html: `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                        <style>
                          * { box-sizing: border-box; }
                          body { margin: 0; padding: 0; background-color: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
                          iframe { width: 100%; height: 100%; border: none; }
                        </style>
                      </head>
                      <body>
                        <iframe
                          src="https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowfullscreen
                        ></iframe>
                      </body>
                    </html>
                  `,
                }}
              />
            </View>
          ) : (
            <View style={styles.videoLoadingBox}>
              <ActivityIndicator size="large" color="#10b981" />
            </View>
          )}
        </View>
      </Modal>
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
  centerPlayCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -25,
    marginLeft: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#d97706",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
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
  inAppVideoPlayBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  inAppVideoPlayBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
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
  videoModalContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  videoModalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#090d16",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  closeVideoBtn: {
    padding: 6,
  },
  videoModalTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  videoLoadingBox: {
    flex: 1,
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
