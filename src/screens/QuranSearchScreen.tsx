import React, { useState } from "react";
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
  ChevronRight,
  BookOpen,
  X,
} from "lucide-react-native";
import { searchQuran, QuranSearchMatch } from "../api/islamic";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";

export const QuranSearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QuranSearchMatch[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchQuran(query.trim());
      setResults(data?.matches || []);
      setCount(data?.count || (data?.matches ? data.matches.length : 0));
    } catch (err) {
      console.warn("Search error:", err);
      setResults([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Nav Header */}
      <View
        style={[
          styles.navBar,
          { backgroundColor: theme.card, borderBottomColor: theme.border },
        ]}
      >
        <View style={{ width: 36 }} />
        <Text style={[styles.navTitle, { color: theme.text }]}>
          البحث في القرآن الكريم
        </Text>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <ChevronRight size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          {query ? (
            <TouchableOpacity onPress={() => setQuery("")}>
              <X size={16} color={theme.textMuted} />
            </TouchableOpacity>
          ) : null}
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="اكتب كلمة أو آية للبحث..."
            placeholderTextColor={theme.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
            textAlign="right"
          />
          <TouchableOpacity onPress={handleSearch}>
            <Search size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Header */}
      {searched && (
        <View style={styles.resultsInfo}>
          <Text style={[styles.resultsCount, { color: theme.textMuted }]}>
            {loading
              ? "جاري البحث..."
              : count > 0
              ? `تم العثور على ${toArabicNumber(count)} موضع في القرآن`
              : "لم يتم العثور على نتائج مطابقة"}
          </Text>
        </View>
      )}

      {/* Results List */}
      {loading ? (
        <ActivityIndicator
          color={theme.primary}
          size="large"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, i) => `${item.number}_${i}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.resultCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              onPress={() =>
                navigation.navigate("SurahDetail", {
                  surahNumber: item.surah.number,
                  surahName: item.surah.name,
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.ayahBadge,
                    {
                      backgroundColor: isDarkMode ? "#172535" : "#ecfdf5",
                    },
                  ]}
                >
                  <Text style={[styles.ayahBadgeText, { color: theme.primary }]}>
                    آية {toArabicNumber(item.numberInSurah)}
                  </Text>
                </View>

                <Text style={[styles.surahName, { color: theme.text }]}>
                  {item.surah.name} (الجزء {toArabicNumber(item.juz)})
                </Text>
              </View>

              <Text
                style={[
                  styles.ayahText,
                  { color: theme.text, lineHeight: 28 },
                ]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
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
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 15,
  },
  resultsInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "flex-end",
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 10,
  },
  resultCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  surahName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  ayahBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ayahBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  ayahText: {
    fontSize: 15,
    textAlign: "right",
  },
});
