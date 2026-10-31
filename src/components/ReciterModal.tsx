import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  StyleSheet,
} from "react-native";
import { X, Search, Check, User } from "lucide-react-native";
import {
  VERIFIED_RECITERS,
  RECITER_LOCAL_AVATARS,
  QuranReciterItem,
} from "../data/reciters";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme, FONTS } from "../constants/theme";
import { toArabicNumber } from "../utils/arabic";

interface ReciterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectReciter?: (reciter: QuranReciterItem) => void;
  selectedReciterId?: number | string;
  selectedReciterStyle?: string;
}

export const ReciterModal: React.FC<ReciterModalProps> = ({
  visible,
  onClose,
  onSelectReciter,
  selectedReciterId,
  selectedReciterStyle,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [styleFilter, setStyleFilter] = useState<"ALL" | "مرتل" | "مجود" | "معلم">("ALL");

  const { isDarkMode, preferredReciter, setPreferredReciter } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const filteredReciters = useMemo(() => {
    return VERIFIED_RECITERS.filter((r) => {
      const matchSearch =
        r.name.includes(searchQuery) ||
        r.style.includes(searchQuery);
      const matchStyle = styleFilter === "ALL" || r.style === styleFilter;
      return matchSearch && matchStyle;
    });
  }, [searchQuery, styleFilter]);

  const handleSelect = (reciter: QuranReciterItem) => {
    setPreferredReciter(reciter.id);
    if (onSelectReciter) {
      onSelectReciter(reciter);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        {/* Modal Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="إغلاق">
            <X size={20} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.amiriBold }]}>
              قائمة القراء المعتمدين
            </Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              اختر القارئ وأسلوب التلاوة للاستماع إلى المصحف الشريف
            </Text>
          </View>

          <View style={styles.userIconBox}>
            <User size={18} color="#064E35" />
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBox,
              { backgroundColor: isDarkMode ? "#101d28" : "#f8fafc", borderColor: theme.border },
            ]}
          >
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearBtn}>
                <X size={15} color={theme.textMuted} />
              </TouchableOpacity>
            )}
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="ابحث باسم القارئ (مثال: عبد الباسط، المنشاوي، الحصري...)"
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign="right"
            />
            <Search size={18} color={theme.textMuted} />
          </View>

          {/* Style Filter Pills */}
          <View style={styles.stylePillsRow}>
            {(["ALL", "مرتل", "مجود", "معلم"] as const).map((style) => {
              const isSelected = styleFilter === style;
              return (
                <TouchableOpacity
                  key={style}
                  style={[
                    styles.stylePill,
                    {
                      backgroundColor: isSelected
                        ? "#064E35"
                        : isDarkMode
                        ? "#15202e"
                        : "#f1f5f9",
                      borderColor: isSelected ? "#064E35" : theme.border,
                    },
                  ]}
                  onPress={() => setStyleFilter(style)}
                >
                  <Text
                    style={[
                      styles.stylePillText,
                      {
                        color: isSelected ? "#ffffff" : theme.textMuted,
                        fontWeight: isSelected ? "bold" : "500",
                      },
                    ]}
                  >
                    {style === "ALL"
                      ? `جميع القراء (${toArabicNumber(VERIFIED_RECITERS.length)})`
                      : style}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reciters List with Real Portrait Photos */}
        <FlatList
          data={filteredReciters}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected =
              (selectedReciterId !== undefined
                ? item.listenId === Number(selectedReciterId) &&
                  (!selectedReciterStyle || item.style === selectedReciterStyle)
                : item.id === preferredReciter);

            return (
              <TouchableOpacity
                style={[
                  styles.reciterCard,
                  {
                    backgroundColor: isSelected
                      ? isDarkMode
                        ? "#082218"
                        : "#edf8f3"
                      : isDarkMode
                      ? "#101d28"
                      : "#ffffff",
                    borderColor: isSelected ? "#064E35" : theme.border,
                  },
                ]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.75}
              >
                {/* Right: Avatar Image and Names */}
                <View style={styles.cardRightGroup}>
                  <View
                    style={[
                      styles.avatarWrapper,
                      { borderColor: isSelected ? "#064E35" : theme.border },
                    ]}
                  >
                    <Image
                      source={
                        RECITER_LOCAL_AVATARS[item.avatarKey] || {
                          uri: item.avatar,
                        }
                      }
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  </View>

                  <View style={styles.cardInfoGroup}>
                    <Text
                      style={[
                        styles.reciterNameText,
                        { color: theme.text, fontFamily: FONTS.amiriBold },
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text style={[styles.riwayahText, { color: theme.textMuted }]}>
                      {item.riwayah}
                    </Text>
                  </View>
                </View>

                {/* Left: Style Badge & Checkmark */}
                <View style={styles.cardLeftGroup}>
                  <View
                    style={[
                      styles.styleBadge,
                      {
                        backgroundColor:
                          item.style === "مرتل"
                            ? isDarkMode
                              ? "rgba(16, 185, 129, 0.15)"
                              : "#ecfdf5"
                            : item.style === "مجود"
                            ? isDarkMode
                              ? "rgba(245, 158, 11, 0.15)"
                              : "#fef3c7"
                            : isDarkMode
                            ? "rgba(14, 165, 233, 0.15)"
                            : "#e0f2fe",
                        borderColor:
                          item.style === "مرتل"
                            ? "#10b981"
                            : item.style === "مجود"
                            ? "#f59e0b"
                            : "#0ea5e9",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.styleBadgeText,
                        {
                          color:
                            item.style === "مرتل"
                              ? "#059669"
                              : item.style === "مجود"
                              ? "#d97706"
                              : "#0284c7",
                        },
                      ]}
                    >
                      {item.style}
                    </Text>
                  </View>

                  {isSelected && (
                    <View style={styles.checkCircle}>
                      <Check size={12} color="#ffffff" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />

        {/* Modal Footer */}
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.closeModalBtn, { backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9" }]}
            onPress={onClose}
          >
            <Text style={[styles.closeModalText, { color: theme.text }]}>إغلاق</Text>
          </TouchableOpacity>
          <Text style={[styles.footerNote, { color: theme.textMuted }]}>
            جميع التلاوات مسجلة برواية حفص عن عاصم
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleGroup: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
  },
  userIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(6, 78, 53, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  clearBtn: {
    padding: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingHorizontal: 8,
  },
  stylePillsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  stylePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  stylePillText: {
    fontSize: 11,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  reciterCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  cardRightGroup: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    backgroundColor: "#1e293b",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  cardInfoGroup: {
    flex: 1,
    alignItems: "flex-end",
  },
  reciterNameText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
  },
  riwayahText: {
    fontSize: 11,
    marginTop: 2,
    textAlign: "right",
  },
  cardLeftGroup: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  styleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  styleBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#064E35",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  footerNote: {
    fontSize: 11,
  },
  closeModalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  closeModalText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
