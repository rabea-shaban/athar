"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  BookmarkCheck,
  Bookmark,
  Play,
  Pause,
  BookOpen,
  Copy,
  Share2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getQuranPage,
  getTafsir,
  type QuranPageAyah,
  type Surah,
  type TafsirAyah,
} from "@/lib/api/islamic";
import { useReadingStore } from "@/store/readingStore";
import { useAudioStore } from "@/store/audioStore";
import { cn, stripBismillah } from "@/lib/utils";
import QuranTextRenderer, { toArabicNumerals } from "./QuranTextRenderer";

const FONT_SIZES = [
  "text-base md:text-lg leading-[2.2] md:leading-[2.4]",
  "text-lg md:text-xl leading-[2.3] md:leading-[2.5]",
  "text-xl md:text-2xl leading-[2.5] md:leading-[2.7]",
  "text-2xl md:text-3xl leading-[2.7] md:leading-[2.9]",
  "text-3xl md:text-4xl leading-[2.9] md:leading-[3.1]",
];
const TOTAL_PAGES = 604;

const JUZ_NAMES: Record<number, string> = {
  1: "الجُزْءُ الأَوَّل",
  2: "الجُزْءُ الثَّانِي",
  3: "الجُزْءُ الثَّالِث",
  4: "الجُزْءُ الرَّابِع",
  5: "الجُزْءُ الخَامِس",
  6: "الجُزْءُ السَّادِس",
  7: "الجُزْءُ السَّابِع",
  8: "الجُزْءُ الثَّامِن",
  9: "الجُزْءُ التَّاسِع",
  10: "الجُزْءُ العَاشِر",
  11: "الجُزْءُ الحَادِي عَشَر",
  12: "الجُزْءُ الثَّانِي عَشَر",
  13: "الجُزْءُ الثَّالِث عَشَر",
  14: "الجُزْءُ الرَّابِع عَشَر",
  15: "الجُزْءُ الخَامِس عَشَر",
  16: "الجُزْءُ السَّادِس عَشَر",
  17: "الجُزْءُ السَّابِع عَشَر",
  18: "الجُزْءُ الثَّامِن عَشَر",
  19: "الجُزْءُ التَّاسِع عَشَر",
  20: "الجُزْءُ العِشْرُون",
  21: "الجُزْءُ الحَادِي وَالعِشْرُون",
  22: "الجُزْءُ الثَّانِي وَالعِشْرُون",
  23: "الجُزْءُ الثَّالِث وَالعِشْرُون",
  24: "الجُزْءُ الرَّابِع وَالعِشْرُون",
  25: "الجُزْءُ الخَامِس وَالعِشْرُون",
  26: "الجُزْءُ السَّادِس وَالعِشْرُون",
  27: "الجُزْءُ السَّابِع وَالعِشْرُون",
  28: "الجُزْءُ الثَّامِن وَالعِشْرُون",
  29: "الجُزْءُ التَّاسِع وَالعِشْرُون",
  30: "الجُزْءُ الثَّلَاثُون",
};

function cleanSurahName(name: string): string {
  if (!name) return "";
  return name.replace(/^سُ?و?رَ?ةُ?\s*/, "").trim();
}

export interface PageChangeInfo {
  page: number;
  surah: Surah;
  juz: number;
}

interface Props {
  initialPage?: number;
  fontSize: number;
  onPageChange?: (info: PageChangeInfo) => void;
}

interface ContextMenuData {
  x: number;
  y: number;
  ayah: QuranPageAyah;
}

export default function QuranPageView({ initialPage = 1, fontSize, onPageChange }: Props) {
  const {
    setProgress,
    readingMarker,
    setReadingMarker,
    clearReadingMarker,
    toggleBookmark,
    isBookmarked,
  } = useReadingStore();

  const {
    setAudio,
    isPlaying,
    surahNumber: currentPlayingSurah,
    ayahNumber: currentPlayingAyah,
    togglePlay,
  } = useAudioStore();

  const [page, setPage] = useState(initialPage);
  const [ayahs, setAyahs] = useState<QuranPageAyah[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Ayah for modal/actions
  const [selectedAyah, setSelectedAyah] = useState<QuranPageAyah | null>(null);
  const [tafsirData, setTafsirData] = useState<TafsirAyah | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [copied, setCopied] = useState(false);

  // Context Menu state for Right Click
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);

  // Close context menu on Escape key
  useEffect(() => {
    if (!contextMenu) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextMenu]);

  // Sync state if initialPage changes
  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  const loadPage = useCallback(
    (p: number) => {
      setLoading(true);
      setSelectedAyah(null);
      setContextMenu(null);
      setShowTafsir(false);
      setTafsirData(null);
      getQuranPage(p)
        .then((data) => {
          setAyahs(data.ayahs);
          const first = data.ayahs[0];
          if (first) {
            setProgress({
              pageNumber: p,
              surahNumber: first.surah.number,
              surahName: first.surah.name,
              ayahNumber: first.numberInSurah,
            });
            onPageChange?.({
              page: p,
              surah: first.surah,
              juz: first.juz,
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    },
    [setProgress, onPageChange]
  );

  useEffect(() => {
    loadPage(page);
  }, [page, loadPage]);

  // Auto-scroll to marked ayah on page load
  useEffect(() => {
    if (loading || ayahs.length === 0 || !readingMarker) return;
    const isTargetOnThisPage = ayahs.some(
      (a) =>
        a.surah.number === readingMarker.surahNumber &&
        a.numberInSurah === readingMarker.ayahNumber
    );
    if (isTargetOnThisPage) {
      const timeout = setTimeout(() => {
        const el = document.getElementById(`page-ayah-${readingMarker.ayahNumber}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [loading, ayahs, readingMarker]);

  // Group ayahs by surah for surah headers
  const groups: { surahName: string; surahNumber: number; ayahs: QuranPageAyah[] }[] = [];
  for (const ayah of ayahs) {
    const last = groups[groups.length - 1];
    if (!last || last.surahNumber !== ayah.surah.number) {
      groups.push({ surahName: ayah.surah.name, surahNumber: ayah.surah.number, ayahs: [ayah] });
    } else {
      last.ayahs.push(ayah);
    }
  }

  const firstAyah = ayahs[0];
  const juz = firstAyah?.juz;
  const currentSurahName = firstAyah?.surah.name || "";
  const juzTitle = juz ? JUZ_NAMES[juz] || `الجُزْءُ ${toArabicNumerals(juz)}` : "";
  const isThisPageMarked = readingMarker?.pageNumber === page;

  const handleTogglePageMarker = () => {
    if (isThisPageMarked && readingMarker?.ayahNumber) {
      const el = document.getElementById(`page-ayah-${readingMarker.ayahNumber}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      if (firstAyah) {
        setReadingMarker({
          surahNumber: firstAyah.surah.number,
          surahName: firstAyah.surah.name,
          ayahNumber: firstAyah.numberInSurah,
          pageNumber: page,
          text: firstAyah.text,
        });
      }
    }
  };

  const openAyahMenu = (e: React.MouseEvent, ayah: QuranPageAyah) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 240;
    const menuHeight = 310;
    const x = Math.max(12, Math.min(e.clientX, window.innerWidth - menuWidth - 16));
    const y = Math.max(12, Math.min(e.clientY, window.innerHeight - menuHeight - 16));
    setContextMenu({ x, y, ayah });
  };

  const handleToggleSpecificAyahMarker = (ayah: QuranPageAyah) => {
    const isMarked =
      readingMarker?.surahNumber === ayah.surah.number &&
      readingMarker?.ayahNumber === ayah.numberInSurah;
    if (isMarked) {
      clearReadingMarker();
    } else {
      setReadingMarker({
        surahNumber: ayah.surah.number,
        surahName: ayah.surah.name,
        ayahNumber: ayah.numberInSurah,
        pageNumber: page,
        text: ayah.text,
      });
    }
  };

  const handlePlayAyah = (ayah: QuranPageAyah) => {
    if (
      currentPlayingSurah === ayah.surah.number &&
      currentPlayingAyah === ayah.numberInSurah &&
      isPlaying
    ) {
      togglePlay();
      return;
    }
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
    setAudio(audioUrl, ayah.surah.name, `آية ${ayah.numberInSurah}`, "surah", {
      surahNumber: ayah.surah.number,
      ayahNumber: ayah.numberInSurah,
    });
  };

  const handleFetchTafsir = async (ayah: QuranPageAyah) => {
    if (showTafsir) {
      setShowTafsir(false);
      return;
    }
    setShowTafsir(true);
    if (!tafsirData) {
      setLoadingTafsir(true);
      try {
        const list = await getTafsir(ayah.surah.number);
        const item = list.find((t) => t.aya === ayah.numberInSurah);
        setTafsirData(item || null);
      } catch {
        setTafsirData(null);
      } finally {
        setLoadingTafsir(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Page Info & Bookmark Button */}
      <div className="flex items-center justify-between w-full max-w-2xl md:max-w-[700px] mb-3 text-xs text-muted-foreground flex-wrap gap-2 px-1">
        <div className="flex items-center gap-2 font-arabic">
          <span className="font-bold text-foreground">صفحة {toArabicNumerals(page)}</span>
          {juz && (
            <>
              <span>•</span>
              <span className="font-medium text-[var(--athar-green)]">{juzTitle}</span>
            </>
          )}
          <span>•</span>
          <span>{toArabicNumerals(page)} / {toArabicNumerals(TOTAL_PAGES)}</span>
        </div>

        <Button
          size="sm"
          variant={isThisPageMarked ? "default" : "outline"}
          onClick={handleTogglePageMarker}
          disabled={loading || ayahs.length === 0}
          className={cn(
            "h-7 text-xs gap-1.5 transition-all cursor-pointer rounded-lg",
            isThisPageMarked
              ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs font-semibold"
              : "border-border text-muted-foreground hover:text-amber-600 hover:border-amber-500/40"
          )}
        >
          <BookmarkCheck className={cn("h-3.5 w-3.5", isThisPageMarked && "fill-current")} />
          <span>{isThisPageMarked ? "علامة الوقوف محفوظة" : "حفظ علامة وقوف"}</span>
        </Button>
      </div>

      {/* Mushaf Authentic Page Frame */}
      <div
        className={cn(
          "w-full max-w-2xl md:max-w-[700px] min-h-[520px] rounded-2xl p-5 md:p-8 relative transition-all mushaf-page-container mushaf-page-border shadow-xl",
          isThisPageMarked && "ring-2 ring-amber-500/40"
        )}
      >
        {/* Saved stop marker ribbon */}
        {isThisPageMarked && (
          <div className="absolute -top-3 right-6 bg-amber-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-md flex items-center gap-1.5 z-10 font-arabic">
            <BookmarkCheck className="h-3 w-3 fill-current" />
            <span>موضع التوقف (صفحة {toArabicNumerals(page)})</span>
          </div>
        )}

        {/* Traditional Header inside Mushaf Page Border */}
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-teal-700/20 dark:border-teal-500/20 text-xs md:text-sm font-arabic font-bold text-teal-900 dark:text-teal-200">
          <div className="px-3 py-0.5 rounded-full border border-amber-600/30 bg-amber-500/10 shadow-2xs">
            <span>سُورَةُ {cleanSurahName(currentSurahName)}</span>
          </div>
          {juzTitle && (
            <div className="px-3 py-0.5 rounded-full border border-amber-600/30 bg-amber-500/10 shadow-2xs">
              <span>{juzTitle}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-7 w-7 animate-spin text-[var(--athar-green)]" />
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.surahNumber}>
                {/* Traditional Surah Header Banner (if starts at Ayah 1) */}
                {group.ayahs[0]?.numberInSurah === 1 && (
                  <div className="my-3">
                    <div className="py-1.5 px-4 rounded-xl border border-amber-600/40 bg-gradient-to-r from-amber-500/15 via-teal-700/15 to-amber-500/15 text-center shadow-xs">
                      <span className="font-arabic font-bold text-sm md:text-base text-teal-950 dark:text-amber-200 tracking-wide">
                        سُورَةُ {cleanSurahName(group.surahName)}
                      </span>
                    </div>

                    {/* Bismillah */}
                    {group.surahNumber !== 1 && group.surahNumber !== 9 && (
                      <div className="my-2.5 text-center">
                        <p className="font-arabic text-lg md:text-xl text-foreground/90 font-medium select-none tracking-wide">
                          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* All Ayahs as ONE solid justified continuous block */}
                <div
                  className={cn(
                    "quran-mushaf-text select-text",
                    FONT_SIZES[fontSize - 1]
                  )}
                  dir="rtl"
                >
                  {group.ayahs.map((ayah) => {
                    const isAyahMarker =
                       readingMarker?.surahNumber === group.surahNumber &&
                       readingMarker?.ayahNumber === ayah.numberInSurah;
                    const isPlayingThis =
                      currentPlayingSurah === group.surahNumber &&
                      currentPlayingAyah === ayah.numberInSurah &&
                      isPlaying;
                    const isSelected =
                      selectedAyah?.surah.number === group.surahNumber &&
                      selectedAyah?.numberInSurah === ayah.numberInSurah;

                    const cleanText = stripBismillah(ayah.text, group.surahNumber, ayah.numberInSurah);

                    return (
                      <span
                        key={ayah.number}
                        id={`page-ayah-${ayah.numberInSurah}`}
                        onClick={(e) => openAyahMenu(e, ayah)}
                        onContextMenu={(e) => openAyahMenu(e, ayah)}
                        className={cn(
                          "cursor-pointer transition-colors duration-150 inline rounded-md px-1 py-0.5",
                          isPlayingThis
                            ? "bg-emerald-500/30 text-emerald-950 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500/50"
                            : isAyahMarker
                            ? "bg-amber-500/25 dark:bg-amber-500/30 text-amber-950 dark:text-amber-100 font-semibold ring-2 ring-amber-500/70 shadow-xs"
                            : isSelected
                            ? "bg-teal-600/20 text-foreground"
                            : "hover:bg-teal-600/15"
                        )}
                        title={`سورة ${cleanSurahName(group.surahName)}، آية ${ayah.numberInSurah}`}
                      >
                        {isAyahMarker && (
                          <span
                            className="inline-flex items-center gap-1 bg-amber-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full mx-1 shadow-xs select-none align-middle font-arabic"
                            title="علامة الوقوف الحالية"
                          >
                            <BookmarkCheck className="h-3 w-3 fill-current inline" />
                            <span>علامة وقوف</span>
                          </span>
                        )}
                        <QuranTextRenderer
                          text={cleanText}
                          ayahNumber={ayah.numberInSurah}
                        />
                        {" "}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Traditional Footer with Page Number */}
        <div className="flex items-center justify-center pt-3 mt-5 border-t border-teal-700/20 dark:border-teal-500/20">
          <div className="px-4 py-0.5 rounded-full border border-amber-600/30 bg-amber-500/10 text-teal-900 dark:text-teal-200 font-arabic font-bold text-xs shadow-2xs">
            <span>{toArabicNumerals(page)}</span>
          </div>
        </div>
      </div>

      {/* Floating Right-Click / Tap Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-[105] bg-black/20"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu(null);
            }}
          />
          <div
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
            className="fixed z-[110] w-60 rounded-2xl border-2 border-amber-600/40 bg-card/98 backdrop-blur-md p-1.5 shadow-2xl text-foreground animate-in fade-in zoom-in-95 duration-100 font-arabic text-sm"
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-3 py-2 border-b border-border/60 mb-1 flex items-center justify-between">
              <span className="font-bold text-xs text-[var(--athar-green)] truncate">
                سورة {cleanSurahName(contextMenu.ayah.surah.name)}
              </span>
              <span className="text-[11px] bg-[var(--athar-green)]/10 text-[var(--athar-green)] px-1.5 py-0.5 rounded font-bold">
                آية {toArabicNumerals(contextMenu.ayah.numberInSurah)}
              </span>
            </div>

            {/* Menu Items */}
            <div className="space-y-0.5">
              {/* 1. Add / Remove Reading Stop Marker */}
              <button
                onClick={() => {
                  handleToggleSpecificAyahMarker(contextMenu.ayah);
                  setContextMenu(null);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all text-right cursor-pointer",
                  readingMarker?.surahNumber === contextMenu.ayah.surah.number &&
                    readingMarker?.ayahNumber === contextMenu.ayah.numberInSurah
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30"
                    : "text-foreground hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-400"
                )}
              >
                <BookmarkCheck className="h-4 w-4 shrink-0 text-amber-600 fill-current" />
                <span>
                  {readingMarker?.surahNumber === contextMenu.ayah.surah.number &&
                  readingMarker?.ayahNumber === contextMenu.ayah.numberInSurah
                    ? "إزالة علامة الوقوف"
                    : "أضف علامة وقوف هنا"}
                </span>
              </button>

              {/* 2. Play Audio */}
              <button
                onClick={() => {
                  handlePlayAyah(contextMenu.ayah);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all text-right text-foreground hover:bg-muted cursor-pointer"
              >
                {currentPlayingSurah === contextMenu.ayah.surah.number &&
                currentPlayingAyah === contextMenu.ayah.numberInSurah &&
                isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>إيقاف التلاوة</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>استماع للآية</span>
                  </>
                )}
              </button>

              {/* 3. Tafsir */}
              <button
                onClick={() => {
                  setSelectedAyah(contextMenu.ayah);
                  handleFetchTafsir(contextMenu.ayah);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all text-right text-foreground hover:bg-muted cursor-pointer"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-blue-600" />
                <span>عرض التفسير والمعاني</span>
              </button>

              {/* 4. Copy */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(contextMenu.ayah.text);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all text-right text-foreground hover:bg-muted cursor-pointer"
              >
                <Copy className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>نسخ نص الآية</span>
              </button>

              {/* 5. Bookmark */}
              <button
                onClick={() => {
                  toggleBookmark({
                    surahNumber: contextMenu.ayah.surah.number,
                    surahName: contextMenu.ayah.surah.name,
                    ayahNumber: contextMenu.ayah.numberInSurah,
                    text: contextMenu.ayah.text,
                  });
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all text-right text-foreground hover:bg-muted cursor-pointer"
              >
                <Bookmark className="h-4 w-4 shrink-0 text-[var(--athar-gold)]" />
                <span>
                  {isBookmarked(contextMenu.ayah.surah.number, contextMenu.ayah.numberInSurah)
                    ? "إلغاء من المفضلة"
                    : "حفظ في المفضلة"}
                </span>
              </button>

              {/* 6. Share */}
              <button
                onClick={() => {
                  navigator.share?.({
                    text: `${contextMenu.ayah.text}\n\n— سورة ${contextMenu.ayah.surah.name}، آية ${contextMenu.ayah.numberInSurah}`,
                  }).catch(() => {});
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all text-right text-foreground hover:bg-muted cursor-pointer"
              >
                <Share2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>مشاركة</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Selected Ayah Action Centered Modal Dialog */}
      {selectedAyah && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setSelectedAyah(null)}
        >
          <div
            className="w-full max-w-xl max-h-[85vh] overflow-y-auto p-5 md:p-6 rounded-2xl border border-border/80 bg-card shadow-2xl animate-in zoom-in-95 duration-150 text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-arabic font-bold text-foreground text-base">
                  سورة {cleanSurahName(selectedAyah.surah.name)}
                </span>
                <span className="text-xs bg-[var(--athar-green)]/10 text-[var(--athar-green)] font-semibold px-2 py-0.5 rounded-md font-arabic">
                  آية {toArabicNumerals(selectedAyah.numberInSurah)}
                </span>
                <span className="text-xs text-muted-foreground font-arabic">
                  (صفحة {toArabicNumerals(page)})
                </span>
              </div>
              <button
                onClick={() => setSelectedAyah(null)}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Ayah Text Display */}
            <p className="quran-text text-right text-lg md:text-xl font-arabic leading-loose mb-4 p-4 rounded-xl bg-muted/40 text-foreground">
              <QuranTextRenderer
                text={selectedAyah.text}
                ayahNumber={selectedAyah.numberInSurah}
              />
            </p>

            {/* Actions */}
            {(() => {
              const isAyahMarker =
                readingMarker?.surahNumber === selectedAyah.surah.number &&
                readingMarker?.ayahNumber === selectedAyah.numberInSurah;
              const isSaved = isBookmarked(
                selectedAyah.surah.number,
                selectedAyah.numberInSurah
              );
              const isPlayingThis =
                currentPlayingSurah === selectedAyah.surah.number &&
                currentPlayingAyah === selectedAyah.numberInSurah &&
                isPlaying;

              return (
                <div className="flex items-center gap-2 flex-wrap justify-between pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Reading Stop Marker Button */}
                    <Button
                      size="sm"
                      variant={isAyahMarker ? "default" : "outline"}
                      onClick={() => handleToggleSpecificAyahMarker(selectedAyah)}
                      className={cn(
                        "gap-1.5 text-xs h-8 font-medium transition-all cursor-pointer",
                        isAyahMarker
                          ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                          : "border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                      )}
                    >
                      <BookmarkCheck
                        className={cn("h-3.5 w-3.5", isAyahMarker && "fill-current")}
                      />
                      <span>
                        {isAyahMarker ? "علامة الوقوف محفوظة هنا" : "وضع علامة وقوف على هذه الآية"}
                      </span>
                    </Button>

                    {/* Audio Play Button */}
                    <Button
                      size="sm"
                      variant={isPlayingThis ? "default" : "outline"}
                      onClick={() => handlePlayAyah(selectedAyah)}
                      className={cn(
                        "gap-1.5 text-xs h-8 cursor-pointer",
                        isPlayingThis
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "border-border text-foreground hover:text-[var(--athar-green)]"
                      )}
                    >
                      {isPlayingThis ? (
                        <>
                          <Pause className="h-3.5 w-3.5" />
                          <span>إيقاف مؤقت</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5" />
                          <span>استماع للآية</span>
                        </>
                      )}
                    </Button>

                    {/* Tafsir Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFetchTafsir(selectedAyah)}
                      className="gap-1.5 text-xs h-8 border-border text-foreground hover:text-[var(--athar-green)] cursor-pointer"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{showTafsir ? "إخفاء التفسير" : "تفسير الآية"}</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Copy Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedAyah.text).then(() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        });
                      }}
                      title={copied ? "تم النسخ!" : "نسخ الآية"}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>

                    {/* Share Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() =>
                        navigator.share?.({
                          text: `${selectedAyah.text}\n\n— سورة ${cleanSurahName(selectedAyah.surah.name)}، آية ${selectedAyah.numberInSurah}`,
                        }).catch(() => {})
                      }
                      title="مشاركة الآية"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>

                    {/* Bookmark Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "h-8 w-8 transition-colors cursor-pointer",
                        isSaved
                          ? "text-[var(--athar-gold)] fill-[var(--athar-gold)]"
                          : "text-muted-foreground hover:text-[var(--athar-gold)]"
                      )}
                      onClick={() =>
                        toggleBookmark({
                          surahNumber: selectedAyah.surah.number,
                          surahName: selectedAyah.surah.name,
                          ayahNumber: selectedAyah.numberInSurah,
                          text: selectedAyah.text,
                        })
                      }
                      title={isSaved ? "إلغاء الحفظ" : "حفظ في المفضلة"}
                    >
                      <Bookmark
                        className={cn("h-3.5 w-3.5", isSaved && "fill-current")}
                      />
                    </Button>
                  </div>
                </div>
              );
            })()}

            {/* Tafsir Content */}
            {showTafsir && (
              <div className="mt-4 p-4 rounded-xl bg-[var(--athar-green)]/5 border border-[var(--athar-green)]/20 text-sm text-right leading-relaxed animate-in fade-in">
                <p className="font-semibold text-xs text-[var(--athar-green)] mb-1 font-arabic">
                  التفسير الميسر:
                </p>
                {loadingTafsir ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--athar-green)]" />
                    <span>جاري تحميل التفسير...</span>
                  </div>
                ) : tafsirData ? (
                  <p className="text-foreground/90 leading-loose text-sm font-arabic">
                    {tafsirData.translation}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    لا يتوفر تفسير حالياً لهذه الآية
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-center gap-3 mt-6 w-full max-w-2xl md:max-w-[700px]">
        {/* Previous page: in RTL ChevronRight points Right (Previous) */}
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page <= 1 || loading}
          className="gap-1.5 font-arabic h-9 px-4 text-xs rounded-xl cursor-pointer hover:border-[var(--athar-green)] hover:text-[var(--athar-green)] transition-all shadow-xs"
        >
          <ChevronRight className="h-3.5 w-3.5" />
          الصفحة السابقة
        </Button>

        {/* Page jump */}
        <div className="flex items-center gap-1.5 font-arabic bg-card border border-border px-3 py-1 rounded-xl shadow-xs">
          <span className="text-xs text-muted-foreground">صفحة</span>
          <input
            type="number"
            min={1}
            max={TOTAL_PAGES}
            value={page}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v >= 1 && v <= TOTAL_PAGES) setPage(v);
            }}
            className="w-12 text-center font-bold text-xs bg-muted/60 rounded-md py-0.5 border border-border/80 focus:outline-none focus:border-[var(--athar-green)] text-foreground"
          />
          <span className="text-xs text-muted-foreground">من {TOTAL_PAGES}</span>
        </div>

        {/* Next page: in RTL ChevronLeft points Left (Next) */}
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.min(p + 1, TOTAL_PAGES))}
          disabled={page >= TOTAL_PAGES || loading}
          className="gap-1.5 font-arabic h-9 px-4 text-xs rounded-xl cursor-pointer hover:border-[var(--athar-green)] hover:text-[var(--athar-green)] transition-all shadow-xs"
        >
          الصفحة التالية
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
