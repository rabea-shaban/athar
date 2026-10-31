import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
  Linking,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import {
  ChevronRight,
  Download,
  Share2,
  RotateCw,
  ExternalLink,
  BookOpen,
  AlertCircle,
} from "lucide-react-native";
import { Book, getBookDownloadUrl, getBookReaderUrl } from "../data/books";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";

export const PdfReaderScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const { book } = route.params as { book: Book };
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const readerUrl = getBookReaderUrl(book);
  const downloadUrl = getBookDownloadUrl(book);

  const handleShare = async () => {
    try {
      await Share.share({
        title: book.title,
        message: `كتاب: ${book.title}\nالمؤلف: ${book.author}\nتصفح وقراءة الكتاب عبر تطبيق ومكتبة أَثَر الإسلامية:\n${readerUrl}`,
      });
    } catch (e) {
      console.warn("Share error:", e);
    }
  };

  const handleDownload = async () => {
    try {
      const supported = await Linking.canOpenURL(downloadUrl);
      if (supported) {
        await Linking.openURL(downloadUrl);
      }
    } catch (e) {
      console.warn("Download error:", e);
    }
  };

  const handleReload = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#081018" : "#f8f6ef" }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? "#0c1520" : "#064E35"}
      />

      {/* Top Header Bar */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 6,
            backgroundColor: isDarkMode ? "#0c1520" : "#064E35",
            borderBottomColor: isDarkMode ? "#192636" : "#0B6245",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="العودة"
        >
          <ChevronRight size={24} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {book.title}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {book.author} {book.authorEra ? `• ${book.authorEra}` : ""}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={handleDownload}
            accessibilityLabel="تحميل ملف الـ PDF"
          >
            <Download size={19} color="#C9A227" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={handleShare}
            accessibilityLabel="مشاركة الكتاب"
          >
            <Share2 size={19} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Reader WebView or Error Fallback */}
      <View style={styles.webviewWrapper}>
        {hasError ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconBadge}>
              <AlertCircle size={40} color="#e11d48" />
            </View>
            <Text style={[styles.errorTitle, { color: theme.text }]}>
              تعذر تحميل القارئ الرقمي المباشر
            </Text>
            <Text style={[styles.errorDesc, { color: theme.textMuted }]}>
              يرجى التحقق من اتصال الإنترنت، أو يمكنك تنزيل ملف الـ PDF المعتمد للكتاب مباشرة وقراءته في أي وقت.
            </Text>

            <View style={styles.errorActions}>
              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: "#064E35" }]}
                onPress={handleReload}
              >
                <RotateCw size={18} color="#ffffff" />
                <Text style={styles.retryBtnText}>إعادة المحاولة</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.downloadFallbackBtn, { borderColor: "#C9A227" }]}
                onPress={handleDownload}
              >
                <Download size={18} color="#C9A227" />
                <Text style={[styles.downloadFallbackText, { color: "#C9A227" }]}>
                  تنزيل ملف الـ PDF ({book.fileSize || "مباشر"})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ uri: readerUrl }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View
                style={[
                  styles.loadingOverlay,
                  { backgroundColor: isDarkMode ? "#081018" : "#f8f6ef" },
                ]}
              >
                <BookOpen size={48} color="#064E35" style={{ marginBottom: 16 }} />
                <ActivityIndicator size="large" color="#C9A227" />
                <Text
                  style={[
                    styles.loadingText,
                    { color: isDarkMode ? "#cbd5e1" : "#202820" },
                  ]}
                >
                  جاري تهيئة القارئ الرقمي لكتاب: {book.title}
                </Text>
                <Text style={styles.loadingSubtext}>
                  محرك قراءة إسلامي متقدم معتمد على WebAssembly
                </Text>
              </View>
            )}
            onLoadStart={() => {
              setIsLoading(true);
              setHasError(false);
            }}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            allowsFullscreenVideo={true}
            allowsInlineMediaPlayback={true}
          />
        )}
      </View>
    </View>
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
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "flex-end",
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "right",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#d1fae5",
    marginTop: 2,
    textAlign: "right",
  },
  headerActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  headerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  webviewWrapper: {
    flex: 1,
    position: "relative",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: 10,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 14,
    textAlign: "center",
  },
  loadingSubtext: {
    fontSize: 12,
    color: "#77776d",
    marginTop: 6,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(225, 29, 72, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  errorDesc: {
    fontSize: 13,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  errorActions: {
    width: "100%",
    maxWidth: 320,
    gap: 12,
  },
  retryBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  retryBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  downloadFallbackBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  downloadFallbackText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
