import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Search,
  BookOpen,
  Mic,
  Star,
  ChevronLeft,
  Headphones,
} from "lucide-react-native";
import { Header } from "../components/Header";
import { ReciterModal } from "../components/ReciterModal";
import { getSurahList, Surah, QURAN_RECITERS } from "../api/islamic";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme, FONTS } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";

export const QuranScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isDarkMode, preferredReciter, favoriteSurahs, toggleFavoriteSurah } =
    usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "meccan" | "medinan" | "fav">(
    "all"
  );
  const [reciterModalOpen, setReciterModalOpen] = useState(false);

  useEffect(() => {
    getSurahList()
      .then((data) => {
        setSurahs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Failed to fetch surah list", err);
        setLoading(false);
      });
  }, []);

  const currentReciter = useMemo(() => {
    return (
      QURAN_RECITERS.find((r) => r.identifier === preferredReciter) ||
      QURAN_RECITERS[0]
    );
  }, [preferredReciter]);

  const filteredSurahs = useMemo(() => {
    return surahs.filter((s) => {
      const matchSearch =
        s.name.includes(searchQuery) ||
        s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(s.number).includes(searchQuery);

      if (!matchSearch) return false;

      if (activeTab === "meccan") return s.revelationType === "Meccan";
      if (activeTab === "medinan") return s.revelationType === "Medinan";
      if (activeTab === "fav") return favoriteSurahs.includes(s.number);
      return true;
    });
  }, [surahs, searchQuery, activeTab, favoriteSurahs]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="المصحف الشريف"
        subtitle="تصفح وتلاوة سور القرآن الكريم"
        onSearchPress={() => navigation.navigate("QuranSearch")}
      />

      {/* Reciter Selector & Listen Audio Mode Bar */}
      <View style={styles.reciterBar}>
        <TouchableOpacity
          style={[
            styles.listenLinkBtn,
            {
              backgroundColor: isDarkMode ? "#064e3b" : "#ecfdf5",
              borderColor: isDarkMode ? "#059669" : "#a7f3d0",
            },
          ]}
          onPress={() => navigation.navigate("Listen")}
          activeOpacity={0.8}
        >
          <ChevronLeft size={16} color={theme.primary} />
          <View style={styles.listenLinkInfo}>
            <Text
              style={[
                styles.listenLinkTitle,
                { color: theme.primary, fontFamily: FONTS.amiriBold },
              ]}
            >
              الاستماع لكبار القراء
            </Text>
            <Text
              style={[styles.listenLinkSubtitle, { color: theme.textMuted }]}
            >
              تلاوات كاملة ومجودة
            </Text>
          </View>
          <View
            style={[
              styles.micBadge,
              { backgroundColor: "rgba(16,185,129,0.15)" },
            ]}
          >
            <Headphones size={18} color={theme.primary} />
          </View>
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
            placeholder="ابحث باسم السورة أو رقمها..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
          <Search size={18} color={theme.textMuted} />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: "all", label: "الكل" },
          { key: "meccan", label: "مكية" },
          { key: "medinan", label: "مدنية" },
          { key: "fav", label: "المفضلة" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabBtn,
                {
                  backgroundColor: isActive
                    ? theme.primary
                    : isDarkMode
                    ? "#131d2a"
                    : "#e2e8f0",
                },
              ]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? "#ffffff" : theme.textMuted,
                    fontWeight: isActive ? "bold" : "500",
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Surahs List */}
      {loading ? (
        <ActivityIndicator
          color={theme.primary}
          size="large"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={filteredSurahs}
          keyExtractor={(item) => String(item.number)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isFav = favoriteSurahs.includes(item.number);
            return (
              <TouchableOpacity
                style={[
                  styles.surahCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                onPress={() =>
                  navigation.navigate("SurahDetail", {
                    surahNumber: item.number,
                    surahName: item.name,
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.surahLeft}>
                  <TouchableOpacity
                    onPress={() => toggleFavoriteSurah(item.number)}
                    style={styles.favBtn}
                  >
                    <Star
                      size={18}
                      color={isFav ? theme.accentGold : theme.textMuted}
                      fill={isFav ? theme.accentGold : "transparent"}
                    />
                  </TouchableOpacity>
                  <View style={styles.ayahsBadge}>
                    <Text style={[styles.ayahsText, { color: theme.textMuted }]}>
                      {toArabicNumber(item.numberOfAyahs)} آية
                    </Text>
                  </View>
                </View>

                <View style={styles.surahRight}>
                  <View style={styles.surahNames}>
                    <Text style={[styles.surahNameAr, { color: theme.text }]}>
                      {item.name}
                    </Text>
                    <Text
                      style={[styles.revelationType, { color: theme.textMuted }]}
                    >
                      {item.revelationType === "Meccan" ? "مكية" : "مدنية"} •{" "}
                      {item.englishName}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.numberBadge,
                      {
                        backgroundColor: isDarkMode ? "#172535" : "#ecfdf5",
                        borderColor: isDarkMode ? "#1e3a4b" : "#bbf7d0",
                      },
                    ]}
                  >
                    <Text
                      style={[styles.numberText, { color: theme.primary }]}
                    >
                      {toArabicNumber(item.number)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <ReciterModal
        visible={reciterModalOpen}
        onClose={() => setReciterModalOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  reciterBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listenLinkBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  listenLinkInfo: {
    alignItems: "flex-end",
    flex: 1,
    marginHorizontal: 10,
  },
  listenLinkTitle: {
    fontSize: 14,
  },
  listenLinkSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  reciterBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  reciterRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  micBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  reciterInfo: {
    alignItems: "flex-end",
  },
  reciterLabel: {
    fontSize: 10,
  },
  reciterName: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 2,
  },
  reciterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
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
  tabsRow: {
    flexDirection: "row-reverse",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 8,
  },
  surahCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  surahRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  numberText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  surahNames: {
    alignItems: "flex-end",
  },
  surahNameAr: {
    fontSize: 16,
    fontWeight: "bold",
  },
  revelationType: {
    fontSize: 11,
    marginTop: 2,
  },
  surahLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  favBtn: {
    padding: 6,
  },
  ayahsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ayahsText: {
    fontSize: 11,
  },
});
