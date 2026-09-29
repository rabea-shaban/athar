import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
} from "react-native";
import { X, Search, Check, Mic } from "lucide-react-native";
import { QURAN_RECITERS, QuranReciter } from "../api/islamic";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";

interface ReciterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectReciter?: (reciter: QuranReciter) => void;
}

export const ReciterModal: React.FC<ReciterModalProps> = ({
  visible,
  onClose,
  onSelectReciter,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { isDarkMode, preferredReciter, setPreferredReciter } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const filteredReciters = useMemo(() => {
    if (!searchQuery.trim()) return QURAN_RECITERS;
    return QURAN_RECITERS.filter(
      (r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.style.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSelect = (reciter: QuranReciter) => {
    setPreferredReciter(reciter.identifier);
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
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>اختيار القارئ</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBox,
              { backgroundColor: isDarkMode ? "#172233" : "#f1f5f9", borderColor: theme.border },
            ]}
          >
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="ابحث عن قارئ أو رواية..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign="right"
            />
            <Search size={18} color={theme.textMuted} />
          </View>
        </View>

        {/* Reciters List */}
        <FlatList
          data={filteredReciters}
          keyExtractor={(item) => item.identifier}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSelected = item.identifier === preferredReciter;
            return (
              <TouchableOpacity
                style={[
                  styles.reciterItem,
                  {
                    backgroundColor: isSelected
                      ? isDarkMode
                        ? "#0f372a"
                        : "#ecfdf5"
                      : isDarkMode
                      ? "#131d2a"
                      : "#ffffff",
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <View style={styles.leftCol}>
                  {isSelected ? (
                    <View style={[styles.checkCircle, { backgroundColor: theme.primary }]}>
                      <Check size={14} color="#ffffff" />
                    </View>
                  ) : null}
                  <View
                    style={[
                      styles.styleBadge,
                      {
                        backgroundColor: isDarkMode ? "#1e293b" : "#e2e8f0",
                      },
                    ]}
                  >
                    <Text style={[styles.styleText, { color: theme.textMuted }]}>
                      {item.style}
                    </Text>
                  </View>
                </View>

                <View style={styles.rightCol}>
                  <Text
                    style={[
                      styles.reciterName,
                      {
                        color: isSelected ? theme.primary : theme.text,
                        fontWeight: isSelected ? "bold" : "600",
                      },
                    ]}
                  >
                    {item.name}
                  </Text>
                  <View style={styles.iconTag}>
                    <Mic size={14} color={isSelected ? theme.primary : theme.textMuted} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
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
    padding: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    paddingHorizontal: 10,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 10,
  },
  reciterItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  rightCol: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  iconTag: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(16,185,129,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  reciterName: {
    fontSize: 15,
  },
  leftCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  styleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  styleText: {
    fontSize: 11,
    fontWeight: "500",
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});
