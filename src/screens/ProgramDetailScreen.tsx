import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  ChevronRight,
  Play,
  Share2,
  Clock,
  User,
  ExternalLink,
  Tv,
  ListVideo,
} from "lucide-react-native";
import { Program, Episode } from "../types/content";
import { usePreferencesStore } from "../store/preferencesStore";
import { useAudioStore } from "../store/audioStore";
import { lightTheme, darkTheme } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";

export const ProgramDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { program } = route.params as { program: Program };

  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { playTrack, currentTrack, isPlaying } = useAudioStore();

  const handleShare = async () => {
    try {
      await Share.share({
        title: program.title,
        message: `${program.title}\nتقديم: ${program.presenter}\nاستمع وشاهد السلسلة عبر تطبيق أَثَر الإسلامي: https://athar-library.vercel.app/programs/${program.slug}`,
      });
    } catch (e) {
      console.warn("Share error:", e);
    }
  };

  const handlePlayEpisode = async (episode: Episode) => {
    if (episode.youtubeUrl) {
      try {
        const canOpen = await Linking.canOpenURL(episode.youtubeUrl);
        if (canOpen) {
          await Linking.openURL(episode.youtubeUrl);
          return;
        }
      } catch (e) {
        console.warn("Cannot open YouTube URL:", e);
      }
    }

    if (episode.audioUrl) {
      playTrack({
        id: episode.id,
        title: episode.title,
        subtitle: program.presenter,
        audioUrl: episode.audioUrl,
        isLive: false,
      });
    }
  };

  const episodes = program.episodes || [];

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
          accessibilityLabel="مشاركة السلسلة"
        >
          <Share2 size={18} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: theme.text }]} numberOfLines={1}>
          {program.title}
        </Text>

        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.border }]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="رجوع"
        >
          <ChevronRight size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={episodes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerComponent}>
            {/* Cover Image */}
            <View style={styles.coverWrapper}>
              <Image
                source={{ uri: program.coverImage }}
                style={styles.coverImage}
                resizeMode="cover"
              />
              <View style={styles.playlistBadge}>
                <Tv size={12} color="#ffffff" />
                <Text style={styles.playlistBadgeText}>
                  {program.playlistType || "سلسلة مرئية"}
                </Text>
              </View>
            </View>

            {/* Info Card */}
            <View
              style={[
                styles.infoCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View style={styles.infoMetaRow}>
                {program.badge ? (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgePillText}>{program.badge}</Text>
                  </View>
                ) : <View />}

                <Text style={[styles.categoryText, { color: "#C9A227" }]}>
                  {program.category}
                </Text>
              </View>

              <Text style={[styles.programTitle, { color: theme.text }]}>
                {program.title}
              </Text>

              <View style={styles.presenterRow}>
                <User size={15} color={theme.primary} />
                <Text style={[styles.presenterText, { color: theme.primary }]}>
                  {program.presenter} {program.presenterTitle ? `• ${program.presenterTitle}` : ""}
                </Text>
              </View>

              <Text
                style={[
                  styles.descriptionText,
                  { color: theme.textSecondary, lineHeight: 24 },
                ]}
              >
                {program.description}
              </Text>

              {/* Episodes Count Bar */}
              <View
                style={[
                  styles.countBar,
                  {
                    backgroundColor: isDarkMode ? "#101d28" : "#f1f5f9",
                    borderColor: theme.border,
                  },
                ]}
              >
                <ListVideo size={16} color={theme.primary} />
                <Text style={[styles.countBarText, { color: theme.text }]}>
                  قائمة الحلقات الكاملة ({toArabicNumber(episodes.length)} حلقة معتمدة)
                </Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.episodeCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={() => handlePlayEpisode(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.playCircle, { backgroundColor: "rgba(6, 78, 53, 0.12)" }]}>
              <Play size={16} color="#064E35" fill="#064E35" />
            </View>

            <View style={styles.episodeTextCol}>
              <View style={styles.episodeMetaTop}>
                <Text style={[styles.orderNumber, { color: theme.primary }]}>
                  الحلقة {toArabicNumber(item.order || index + 1)}
                </Text>
                {item.duration ? (
                  <View style={styles.durationRow}>
                    <Clock size={11} color={theme.textMuted} />
                    <Text style={[styles.durationText, { color: theme.textMuted }]}>
                      {item.duration}
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text style={[styles.episodeTitle, { color: theme.text }]} numberOfLines={2}>
                {item.title}
              </Text>
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
    gap: 10,
    paddingHorizontal: 16,
  },
  headerComponent: {
    marginBottom: 8,
  },
  coverWrapper: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#1e293b",
    marginTop: 12,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  playlistBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  playlistBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    gap: 8,
  },
  infoMetaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgePill: {
    backgroundColor: "rgba(6, 78, 53, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgePillText: {
    fontSize: 11,
    color: "#064E35",
    fontWeight: "bold",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  programTitle: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "right",
    lineHeight: 24,
  },
  presenterRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  presenterText: {
    fontSize: 13,
    fontWeight: "600",
  },
  descriptionText: {
    fontSize: 13,
    textAlign: "right",
  },
  countBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
  },
  countBarText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  episodeCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  playCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  episodeTextCol: {
    flex: 1,
    alignItems: "flex-end",
  },
  episodeMetaTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 11,
    fontWeight: "bold",
  },
  durationRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  durationText: {
    fontSize: 11,
  },
  episodeTitle: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
  },
});
