import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  Heart,
  Compass,
  Check,
  RotateCcw,
  Share2,
} from "lucide-react-native";
import { Header } from "../components/Header";
import { getAzkar, AzkarCategory, Zikr } from "../api/islamic";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";

export const AdhkarScreen: React.FC = () => {
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [mode, setMode] = useState<"adhkar" | "tasbeeh">("adhkar");
  const [categories, setCategories] = useState<AzkarCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

  // Local counter for current category items
  const [itemCounts, setItemCounts] = useState<Record<number, number>>({});

  // Digital Tasbeeh State
  const [tasbeehCount, setTasbeehCount] = useState(0);
  const [tasbeehTarget, setTasbeehTarget] = useState(33);
  const [tasbeehDhikr, setTasbeehDhikr] = useState("سُبْحَانَ اللَّهِ");

  const tasbeehPresets = [
    "سُبْحَانَ اللَّهِ",
    "الْحَمْدُ لِلَّهِ",
    "لَا إِلَهَ إِلَّا اللَّهُ",
    "اللَّهُ أَكْبَرُ",
    "أَسْتَغْفِرُ اللَّهَ",
    "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
  ];

  useEffect(() => {
    getAzkar()
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Failed to load azkar:", err);
        setLoading(false);
      });
  }, []);

  const handleZikrTap = (index: number, maxCountStr: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const maxCount = parseInt(maxCountStr, 10) || 1;
    const current = itemCounts[index] || 0;
    if (current < maxCount) {
      setItemCounts((prev) => ({ ...prev, [index]: current + 1 }));
    }
  };

  const handleTasbeehPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTasbeehCount((prev) => {
      const next = prev + 1;
      if (tasbeehTarget > 0 && next % tasbeehTarget === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      return next;
    });
  };

  const handleResetTasbeeh = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setTasbeehCount(0);
  };

  const currentCategory = categories[selectedCategoryIndex];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={mode === "adhkar" ? "الأذكار والأدعية" : "السبحة الإلكترونية"}
        subtitle="حصن المسلم اليومي وذكر الله الدائم"
      />

      {/* Main Switch Tabs */}
      <View style={styles.topTabs}>
        <TouchableOpacity
          style={[
            styles.modeTab,
            {
              backgroundColor:
                mode === "adhkar"
                  ? theme.primary
                  : isDarkMode
                  ? "#131d2a"
                  : "#e2e8f0",
            },
          ]}
          onPress={() => setMode("adhkar")}
        >
          <Text
            style={[
              styles.modeTabText,
              { color: mode === "adhkar" ? "#ffffff" : theme.textMuted },
            ]}
          >
            الأذكار اليومية
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeTab,
            {
              backgroundColor:
                mode === "tasbeeh"
                  ? theme.primary
                  : isDarkMode
                  ? "#131d2a"
                  : "#e2e8f0",
            },
          ]}
          onPress={() => setMode("tasbeeh")}
        >
          <Text
            style={[
              styles.modeTabText,
              { color: mode === "tasbeeh" ? "#ffffff" : theme.textMuted },
            ]}
          >
            السبحة الإلكترونية
          </Text>
        </TouchableOpacity>
      </View>

      {mode === "adhkar" ? (
        <>
          {/* Categories Horizontal Scroll */}
          <View style={styles.categoriesBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {categories.map((cat, idx) => {
                const isSelected = selectedCategoryIndex === idx;
                return (
                  <TouchableOpacity
                    key={cat.category}
                    style={[
                      styles.categoryPill,
                      {
                        backgroundColor: isSelected
                          ? isDarkMode
                            ? "#0f372a"
                            : "#ecfdf5"
                          : theme.card,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedCategoryIndex(idx);
                      setItemCounts({});
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        {
                          color: isSelected ? theme.primary : theme.text,
                          fontWeight: isSelected ? "bold" : "500",
                        },
                      ]}
                    >
                      {cat.category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Adhkar List */}
          {loading ? (
            <ActivityIndicator
              color={theme.primary}
              size="large"
              style={{ marginTop: 40 }}
            />
          ) : currentCategory ? (
            <FlatList
              data={currentCategory.array}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={styles.adhkarList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => {
                const target = parseInt(item.count, 10) || 1;
                const current = itemCounts[index] || 0;
                const isDone = current >= target;

                return (
                  <TouchableOpacity
                    style={[
                      styles.zikrCard,
                      {
                        backgroundColor: isDone
                          ? isDarkMode
                            ? "#0e261e"
                            : "#f0fdf4"
                          : theme.card,
                        borderColor: isDone ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => handleZikrTap(index, item.count)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.zikrContent,
                        { color: theme.text, lineHeight: 30 },
                      ]}
                    >
                      {item.content}
                    </Text>

                    {item.description ? (
                      <Text
                        style={[
                          styles.zikrDescription,
                          { color: theme.textMuted },
                        ]}
                      >
                        {item.description}
                      </Text>
                    ) : null}

                    {item.reference ? (
                      <Text
                        style={[
                          styles.zikrReference,
                          { color: theme.accentGold },
                        ]}
                      >
                        {item.reference}
                      </Text>
                    ) : null}

                    {/* Progress Counter Pill */}
                    <View style={styles.counterRow}>
                      <View
                        style={[
                          styles.counterBadge,
                          {
                            backgroundColor: isDone
                              ? theme.primary
                              : isDarkMode
                              ? "#172535"
                              : "#f1f5f9",
                          },
                        ]}
                      >
                        {isDone ? (
                          <View style={styles.doneRow}>
                            <Check size={14} color="#ffffff" />
                            <Text style={styles.doneText}>تم بحمد الله</Text>
                          </View>
                        ) : (
                          <Text
                            style={[
                              styles.counterText,
                              { color: theme.primary },
                            ]}
                          >
                            {toArabicNumber(current)} / {toArabicNumber(target)}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          ) : null}
        </>
      ) : (
        /* Digital Sebha Screen */
        <ScrollView
          contentContainerStyle={styles.tasbeehContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Preset Dhikr Selector */}
          <Text style={[styles.tasbeehLabel, { color: theme.textMuted }]}>
            اختر الذكر المبارك:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetsRow}
          >
            {tasbeehPresets.map((dhikr) => {
              const isSelected = tasbeehDhikr === dhikr;
              return (
                <TouchableOpacity
                  key={dhikr}
                  style={[
                    styles.presetPill,
                    {
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.card,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setTasbeehDhikr(dhikr)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      { color: isSelected ? "#ffffff" : theme.text },
                    ]}
                  >
                    {dhikr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Target Selector */}
          <View style={styles.targetRow}>
            <Text style={[styles.targetLabel, { color: theme.textMuted }]}>
              الهدف:
            </Text>
            {[33, 100, 0].map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.targetBtn,
                  {
                    backgroundColor:
                      tasbeehTarget === t ? theme.primary : theme.card,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => setTasbeehTarget(t)}
              >
                <Text
                  style={{
                    color: tasbeehTarget === t ? "#ffffff" : theme.text,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  {t === 0 ? "مفتوح" : toArabicNumber(t)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Giant Tasbeeh Circle Button */}
          <TouchableOpacity
            style={[
              styles.giantCircle,
              {
                backgroundColor: isDarkMode ? "#102a20" : "#e6f4ea",
                borderColor: theme.primary,
              },
            ]}
            onPress={handleTasbeehPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.activeDhikrText, { color: theme.text }]}>
              {tasbeehDhikr}
            </Text>
            <Text style={[styles.giantNumber, { color: theme.primary }]}>
              {toArabicNumber(tasbeehCount)}
            </Text>
            <Text style={[styles.tapHint, { color: theme.textMuted }]}>
              اضغط للتسبيح
            </Text>
          </TouchableOpacity>

          {/* Reset Button */}
          <TouchableOpacity
            style={[
              styles.resetBtn,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={handleResetTasbeeh}
          >
            <RotateCcw size={16} color={theme.textMuted} />
            <Text style={[styles.resetText, { color: theme.textMuted }]}>
              تصفير العداد
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topTabs: {
    flexDirection: "row-reverse",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  categoriesBar: {
    paddingVertical: 12,
  },
  categoriesScroll: {
    flexDirection: "row-reverse",
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 13,
  },
  adhkarList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
  zikrCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  zikrContent: {
    fontSize: 16,
    textAlign: "right",
    fontWeight: "500",
  },
  zikrDescription: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "right",
  },
  zikrReference: {
    fontSize: 11,
    marginTop: 6,
    textAlign: "right",
    fontWeight: "bold",
  },
  counterRow: {
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  counterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  doneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  doneText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  tasbeehContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  tasbeehLabel: {
    fontSize: 13,
    fontWeight: "bold",
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: "row-reverse",
    gap: 8,
    paddingBottom: 16,
  },
  presetPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 13,
  },
  targetRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    marginVertical: 14,
  },
  targetLabel: {
    fontSize: 13,
    fontWeight: "bold",
  },
  targetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  giantCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  activeDhikrText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  giantNumber: {
    fontSize: 54,
    fontWeight: "bold",
  },
  tapHint: {
    fontSize: 12,
    marginTop: 8,
  },
  resetBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  resetText: {
    fontSize: 13,
    fontWeight: "bold",
  },
});
