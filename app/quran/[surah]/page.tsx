"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  Copy, Share2, Bookmark, Play, Pause, ChevronRight, ChevronLeft,
  BookOpen, AlignJustify, BookMarked, Minus, Plus, Volume2, BookmarkCheck,
  Headphones, ChevronDown, User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getSurah,
  getSurahList,
  getTafsir,
  getAyahAudioUrl,
  QURAN_RECITERS,
  type QuranReciter,
  type SurahDetail,
  type TafsirAyah,
} from "@/lib/api/islamic";
import { useAudioStore } from "@/store/audioStore";
import { useReadingStore } from "@/store/readingStore";
import QuranPageView, { type PageChangeInfo } from "@/components/quran/QuranPageView";
import QuranTextRenderer from "@/components/quran/QuranTextRenderer";
import ReciterSelectorModal from "@/components/quran/ReciterSelectorModal";
import Container from "@/components/layout/Container";
import { cn, toArabicNumber } from "@/lib/utils";

const FONT_SIZES = [
  "text-lg md:text-xl leading-[2.2] md:leading-[2.4]",
  "text-xl md:text-2xl leading-[2.4] md:leading-[2.6]",
  "text-2xl md:text-3xl leading-[2.6] md:leading-[2.8]",
  "text-3xl md:text-4xl leading-[2.8] md:leading-[3.0]",
  "text-4xl md:text-5xl leading-[3.0] md:leading-[3.2]",
];

function cleanSurahName(name: string): string {
  if (!name) return "";
  return name.replace(/^سُ?و?رَ?ةُ?\s*/, "").trim();
}

export default function SurahPage() {
  const { surah: surahParam } = useParams<{ surah: string }>();
  const router = useRouter();
  const surahNum = Number(surahParam);

  // Validate surah number
  if (!surahNum || surahNum < 1 || surahNum > 114 || !Number.isInteger(surahNum)) {
    notFound();
  }

  const [selectedReciter, setSelectedReciter] = useState<QuranReciter>(QURAN_RECITERS[0]);
  const [isReciterModalOpen, setIsReciterModalOpen] = useState(false);
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [prevSurah, setPrevSurah] = useState<{ name: string } | null>(null);
  const [nextSurah, setNextSurah] = useState<{ name: string } | null>(null);
  const [tafsir, setTafsir] = useState<TafsirAyah[]>([]);
  const [openTafsir, setOpenTafsir] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePageInfo, setActivePageInfo] = useState<PageChangeInfo | null>(null);

  // Load preferred reciter from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("athar_preferred_reciter_identifier");
      if (saved) {
        const found = QURAN_RECITERS.find((r) => r.identifier === saved);
        if (found) setSelectedReciter(found);
      }
    }
  }, []);

  const {
    setAudio,
    isPlaying,
    surahNumber: currentPlayingSurah,
    ayahNumber: currentPlayingAyah,
    setOnEnded,
    togglePlay,
  } = useAudioStore();

  const {
    mode,
    fontSize,
    setMode,
    setFontSize,
    setProgress,
    toggleBookmark,
    isBookmarked,
    readingMarker,
    setReadingMarker,
    clearReadingMarker,
    isReadingMarker,
  } = useReadingStore();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    ayahNumber: number;
    text: string;
    audio?: string;
  } | null>(null);

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

  useEffect(() => {
    setLoading(true);
    setOpenTafsir(null);
    setTafsir([]);
    setActivePageInfo(null);
    Promise.all([
      getSurah(surahNum, selectedReciter.identifier),
      surahNum > 1 ? getSurah(surahNum - 1, selectedReciter.identifier) : Promise.resolve(null),
      surahNum < 114 ? getSurah(surahNum + 1, selectedReciter.identifier) : Promise.resolve(null),
    ])
      .then(([data, prev, next]) => {
        setSurah(data);
        setPrevSurah(prev ? { name: prev.name } : null);
        setNextSurah(next ? { name: next.name } : null);
        const startPage = data.ayahs[0]?.page || 1;
        setProgress({
          surahNumber: data.number,
          surahName: data.name,
          ayahNumber: 1,
          pageNumber: startPage,
        });
      })
      .finally(() => setLoading(false));
  }, [surahNum, selectedReciter.identifier, setProgress]);

  function handleSelectReciter(reciter: QuranReciter) {
    setSelectedReciter(reciter);
    if (typeof window !== "undefined") {
      localStorage.setItem("athar_preferred_reciter_identifier", reciter.identifier);
    }
    // If currently playing, seamlessly switch audio to the new reciter
    if (surah && currentPlayingSurah === surah.number && isPlaying && currentPlayingAyah) {
      const currentAyahObj = surah.ayahs.find((a) => a.numberInSurah === currentPlayingAyah);
      if (currentAyahObj) {
        const newAudioUrl = getAyahAudioUrl(currentAyahObj.number, reciter.identifier);
        setAudio(newAudioUrl, surah.name, `آية ${currentPlayingAyah} (${reciter.name})`, "surah", {
          surahNumber: surah.number,
          ayahNumber: currentPlayingAyah,
        });
      }
    }
  }

  // Setup auto-progression when an ayah finishes
  useEffect(() => {
    if (!surah) return;

    setOnEnded(() => {
      const state = useAudioStore.getState();
      if (state.surahNumber !== surah.number) return;
      const currentAyah = state.ayahNumber;
      if (!currentAyah) return;

      const nextAyah = surah.ayahs.find(
        (a) => a.numberInSurah === currentAyah + 1
      );
      if (nextAyah && nextAyah.audio) {
        const audioUrl = getAyahAudioUrl(nextAyah.number, selectedReciter.identifier);
        setAudio(audioUrl, surah.name, `آية ${nextAyah.numberInSurah} (${selectedReciter.name})`, "surah", {
          surahNumber: surah.number,
          ayahNumber: nextAyah.numberInSurah,
        });

        // Auto-scroll to next ayah smoothly
        const el = document.getElementById(`ayah-${nextAyah.numberInSurah}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });

    return () => {
      setOnEnded(null);
    };
  }, [surah, selectedReciter, setAudio, setOnEnded]);

  // Auto-scroll to hash or saved readingMarker on load
  useEffect(() => {
    if (loading || !surah) return;

    let targetAyahNum: number | null = null;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash && hash.startsWith("#ayah-")) {
      targetAyahNum = parseInt(hash.replace("#ayah-", ""), 10);
    } else if (readingMarker && readingMarker.surahNumber === surah.number) {
      targetAyahNum = readingMarker.ayahNumber;
    }

    if (targetAyahNum) {
      const timeout = setTimeout(() => {
        const el = document.getElementById(`ayah-${targetAyahNum}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [loading, surah, readingMarker]);

  function handleTafsir(ayahNum: number) {
    if (openTafsir === ayahNum) { setOpenTafsir(null); return; }
    setOpenTafsir(ayahNum);
    if (tafsir.length === 0) getTafsir(surahNum).then(setTafsir).catch(() => {});
  }

  function handlePlayAyah(audioUrl: string, ayahNum: number) {
    if (!surah) return;
    if (currentPlayingSurah === surah.number && currentPlayingAyah === ayahNum && isPlaying) {
      togglePlay();
      return;
    }
    setAudio(audioUrl, surah.name, `آية ${ayahNum}`, "surah", {
      surahNumber: surah.number,
      ayahNumber: ayahNum,
    });
  }

  function handlePlayFullSurah() {
    if (!surah) return;
    const firstAyah = surah.ayahs[0];
    if (!firstAyah || !firstAyah.audio) return;
    if (currentPlayingSurah === surah.number) {
      togglePlay();
      return;
    }
    handlePlayAyah(firstAyah.audio, firstAyah.numberInSurah);
    const el = document.getElementById(`ayah-${firstAyah.numberInSurah}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleAyahVisible(ayahNum: number) {
    setProgress({ ayahNumber: ayahNum });
  }

  function handlePageChange(info: PageChangeInfo) {
    setActivePageInfo(info);
    if (typeof window !== "undefined" && window.location.pathname !== `/quran/${info.surah.number}`) {
      window.history.replaceState(null, "", `/quran/${info.surah.number}`);
    }
  }

  if (loading) {
    return (
      <Container size="md" className="py-8 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse bg-muted rounded-xl" />
        ))}
      </Container>
    );
  }

  if (!surah) return null;

  const surahStartPage = surah.ayahs[0]?.page || 1;
  const isCurrentSurahPlaying = currentPlayingSurah === surah.number && isPlaying;

  // In Page mode, reflect currently visible page & surah; in Ayah mode, reflect loaded surah
  const isPageMode = mode === "page";
  const displayedSurahName = isPageMode && activePageInfo ? activePageInfo.surah.name : surah.name;
  const displayedRevelationType = isPageMode && activePageInfo ? activePageInfo.surah.revelationType : surah.revelationType;
  const displayedNumberOfAyahs = isPageMode && activePageInfo ? activePageInfo.surah.numberOfAyahs : surah.numberOfAyahs;
  const displayedSurahNumber = isPageMode && activePageInfo ? activePageInfo.surah.number : surah.number;
  const displayedPageNumber = isPageMode && activePageInfo ? activePageInfo.page : surahStartPage;
  const displayedJuz = isPageMode && activePageInfo ? activePageInfo.juz : undefined;

  return (
    <Container size="lg" className="py-6 max-w-4xl">
      {/* 1. Sleek Islamic Surah Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-[var(--athar-green)]/8 via-card to-card p-5 md:p-6 mb-6 text-center shadow-xs">
        {/* Navigation / Breadcrumb Row */}
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
          <Link
            href="/quran"
            className="inline-flex items-center gap-1 text-[var(--athar-green)] font-semibold hover:underline font-arabic"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            فهرس القرآن الكريم
          </Link>

          <div className="flex items-center gap-1.5 font-arabic">
            {prevSurah && (
              <Link
                href={`/quran/${surahNum - 1}`}
                className="px-2.5 py-1 rounded-lg border border-border/70 hover:bg-muted text-[11px] text-foreground transition-colors"
                title={`السورة السابقة: ${prevSurah.name}`}
              >
                السورة السابقة
              </Link>
            )}
            {nextSurah && (
              <Link
                href={`/quran/${surahNum + 1}`}
                className="px-2.5 py-1 rounded-lg border border-border/70 hover:bg-muted text-[11px] text-foreground transition-colors"
                title={`السورة التالية: ${nextSurah.name}`}
              >
                السورة التالية
              </Link>
            )}
          </div>
        </div>

        {/* Surah Title */}
        <h1 className="text-2xl md:text-4xl font-bold font-arabic text-[var(--athar-green)] mb-2">
          سُورَةُ {cleanSurahName(displayedSurahName)}
        </h1>

        {/* Metadata Badges */}
        <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap text-xs text-muted-foreground mb-3 font-arabic">
          <span className={cn(
            "px-2 py-0.5 rounded-md text-[11px] font-medium",
            displayedRevelationType === "Meccan"
              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
              : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
          )}>
            {displayedRevelationType === "Meccan" ? "مكية" : "مدنية"}
          </span>
          <span>•</span>
          <span>{toArabicNumber(displayedNumberOfAyahs)} آية</span>
          <span>•</span>
          <span>الجزء {displayedJuz ? toArabicNumber(displayedJuz) : "١"}</span>
          <span>•</span>
          <span>صفحة {toArabicNumber(displayedPageNumber)}</span>
          {surah.englishName && (
            <>
              <span>•</span>
              <span className="font-sans text-[11px]">{surah.englishName}</span>
            </>
          )}
        </div>

        {/* Quick Action Links */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-2.5 border-t border-border/40 text-xs">
          <Button
            size="sm"
            onClick={handlePlayFullSurah}
            className="h-8 gap-1.5 bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white shadow-xs text-xs rounded-lg"
          >
            {isCurrentSurahPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                إيقاف مؤقت
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                استماع للسورة
              </>
            )}
          </Button>

          {/* Sheikh / Reciter Selection Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsReciterModalOpen(true)}
            className="h-8 gap-1.5 text-xs rounded-lg border-border/80 hover:border-[var(--athar-green)] text-foreground bg-background shadow-2xs"
            title="تغيير القارئ"
          >
            <Headphones className="h-3.5 w-3.5 text-[var(--athar-green)]" />
            <span className="font-arabic">القارئ: {selectedReciter.name}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>

          <Link href={`/tafsir?surah=${surahNum}`}>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs rounded-lg">
              <BookOpen className="h-3.5 w-3.5 text-[var(--athar-green)]" />
              التفسير الميسر
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Compact Modern Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap p-2 rounded-xl bg-card border border-border/70 shadow-2xs">
        {/* View mode switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/60 border border-border/50">
          <button
            onClick={() => {
              setMode("ayah");
              if (activePageInfo && activePageInfo.surah.number !== surahNum) {
                router.push(`/quran/${activePageInfo.surah.number}`);
              }
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
              mode === "ayah"
                ? "bg-card text-foreground font-bold shadow-xs border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <AlignJustify className="h-3.5 w-3.5" />
            عرض الآيات
          </button>
          <button
            onClick={() => setMode("page")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
              mode === "page"
                ? "bg-card text-foreground font-bold shadow-xs border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookMarked className="h-3.5 w-3.5" />
            صفحات المصحف
          </button>
        </div>

        {/* Reading Marker Jump button (if exists) */}
        {readingMarker && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (mode === "ayah") {
                if (readingMarker.surahNumber !== surahNum) {
                  router.push(`/quran/${readingMarker.surahNumber}#ayah-${readingMarker.ayahNumber}`);
                } else {
                  const el = document.getElementById(`ayah-${readingMarker.ayahNumber}`);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              } else {
                const el = document.getElementById(`page-ayah-${readingMarker.ayahNumber}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            className="h-8 gap-1.5 text-xs rounded-lg border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 shadow-xs"
          >
            <BookmarkCheck className="h-3.5 w-3.5" />
            <span>علامة الوقوف ({readingMarker.surahName}، آية {readingMarker.ayahNumber})</span>
          </Button>
        )}

        {/* Font size control */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground font-arabic">حجم الخط:</span>
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/60 border border-border/50">
            <button
              onClick={() => setFontSize(Math.max(1, fontSize - 1))}
              disabled={fontSize <= 1}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors disabled:opacity-30 cursor-pointer"
              title="تصغير الخط"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-xs font-bold px-1.5 font-arabic">{toArabicNumber(fontSize)}</span>
            <button
              onClick={() => setFontSize(Math.min(5, fontSize + 1))}
              disabled={fontSize >= 5}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors disabled:opacity-30 cursor-pointer"
              title="تكبير الخط"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Page mode */}
      {mode === "page" ? (
        <QuranPageView
          key={`${surahNum}-${surahStartPage}`}
          initialPage={surahStartPage}
          fontSize={fontSize}
          selectedReciter={selectedReciter}
          onPageChange={handlePageChange}
        />
      ) : (
        <>
          {/* Bismillah */}
          {surah.number !== 1 && surah.number !== 9 && (
            <div className="my-8 text-center">
              <p className="font-arabic text-3xl md:text-4xl text-foreground font-medium select-none tracking-wider">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </p>
            </div>
          )}

          {/* Ayahs */}
          <div className="space-y-3">
            {surah.ayahs.map((ayah) => {
              const tafsirAyah = tafsir.find((t) => t.aya === ayah.numberInSurah);
              const isSaved = isBookmarked(surah.number, ayah.numberInSurah);
              const isThisReadingMarker = isReadingMarker(surah.number, ayah.numberInSurah);
              const isCurrentlyPlayingThisAyah =
                currentPlayingSurah === surah.number &&
                currentPlayingAyah === ayah.numberInSurah &&
                isPlaying;

              return (
                <div
                  key={ayah.number}
                  id={`ayah-${ayah.numberInSurah}`}
                  className={cn(
                    "group rounded-2xl border transition-all duration-300 p-4 scroll-mt-28 relative",
                    isCurrentlyPlayingThisAyah
                      ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/40 shadow-lg ring-2 ring-emerald-500/30 scale-[1.01]"
                      : isThisReadingMarker
                      ? "border-amber-500/80 bg-amber-500/10 dark:bg-amber-950/30 shadow-md ring-2 ring-amber-500/30"
                      : "border-border/40 hover:border-border/80 hover:bg-muted/30 bg-card/40"
                  )}
                  onMouseEnter={() => handleAyahVisible(ayah.numberInSurah)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const menuWidth = 230;
                    const menuHeight = 280;
                    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 12);
                    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 12);
                    setContextMenu({
                      x,
                      y,
                      ayahNumber: ayah.numberInSurah,
                      text: ayah.text,
                      audio: ayah.audio,
                    });
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1 select-none font-sans transition-all",
                        isCurrentlyPlayingThisAyah
                          ? "bg-emerald-600 text-white animate-pulse shadow-md"
                          : isThisReadingMarker
                          ? "bg-amber-500 text-white shadow-md font-bold"
                          : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      )}
                    >
                      ({ayah.numberInSurah})
                    </div>
                    <div className="flex-1">
                      {/* Active Recitation Badge */}
                      {isCurrentlyPlayingThisAyah && (
                        <div className="flex items-center gap-1.5 mb-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium font-arabic animate-in fade-in slide-in-from-top-1">
                          <Volume2 className="h-4 w-4 animate-bounce" />
                          <span>يتلوها الشيخ الآن...</span>
                        </div>
                      )}

                      {/* Active Reading Stop Marker Badge */}
                      {isThisReadingMarker && (
                        <div className="flex items-center gap-1.5 mb-2 text-amber-700 dark:text-amber-400 text-xs font-bold font-arabic animate-in fade-in slide-in-from-top-1 bg-amber-500/15 border border-amber-500/30 w-fit px-2.5 py-1 rounded-full">
                          <BookmarkCheck className="h-3.5 w-3.5 fill-current" />
                          <span>علامة الوقوف الحالية (موضع التوقف للمتابعة)</span>
                        </div>
                      )}

                      <p
                        className={cn(
                          "quran-text text-right select-text transition-colors",
                          isCurrentlyPlayingThisAyah
                            ? "text-foreground font-semibold"
                            : isThisReadingMarker
                            ? "text-foreground font-semibold"
                            : "text-foreground/95",
                          FONT_SIZES[fontSize - 1]
                        )}
                      >
                        <QuranTextRenderer text={ayah.text} />
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-1 mt-3 justify-end flex-wrap">
                        {/* Reading Marker Button */}
                        <Button
                          variant={isThisReadingMarker ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "h-8 gap-1.5 text-xs transition-all",
                            isThisReadingMarker
                              ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs font-medium"
                              : "text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                          )}
                          onClick={() => {
                            if (isThisReadingMarker) {
                              clearReadingMarker();
                            } else {
                              setReadingMarker({
                                surahNumber: surah.number,
                                surahName: surah.name,
                                ayahNumber: ayah.numberInSurah,
                                pageNumber: ayah.page || surahStartPage,
                                text: ayah.text,
                              });
                            }
                          }}
                          title={isThisReadingMarker ? "إزالة علامة الوقوف" : "وضع علامة وقوف على هذه الآية"}
                        >
                          <BookmarkCheck className={cn("h-3.5 w-3.5", isThisReadingMarker && "fill-current")} />
                          <span>{isThisReadingMarker ? "علامة وقوف" : "وضع علامة"}</span>
                        </Button>

                        {ayah.audio && (
                          <Button
                            variant={isCurrentlyPlayingThisAyah ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                              "h-8 gap-1.5 text-xs transition-all",
                              isCurrentlyPlayingThisAyah
                                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                                : "text-muted-foreground hover:text-[var(--athar-green)]"
                            )}
                            onClick={() => handlePlayAyah(ayah.audio!, ayah.numberInSurah)}
                            title={isCurrentlyPlayingThisAyah ? "إيقاف مؤقت" : "استماع لهذه الآية"}
                          >
                            {isCurrentlyPlayingThisAyah ? (
                              <>
                                <Pause className="h-3.5 w-3.5" />
                                <span>إيقاف</span>
                              </>
                            ) : (
                              <>
                                <Play className="h-3.5 w-3.5" />
                                <span>تشغيل</span>
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-[var(--athar-green)]"
                          onClick={() => handleTafsir(ayah.numberInSurah)}
                          title="التفسير"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-[var(--athar-green)]"
                          onClick={() => navigator.clipboard.writeText(ayah.text).catch(() => {})}
                          title="نسخ"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-[var(--athar-green)]"
                          onClick={() =>
                            navigator.share?.({
                              text: `${ayah.text}\n\n— ${surah.name}، آية ${ayah.numberInSurah}`,
                            }).catch(() => {})
                          }
                          title="مشاركة"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-8 w-8 transition-colors",
                            isSaved
                              ? "text-[var(--athar-gold)] fill-[var(--athar-gold)]"
                              : "text-muted-foreground hover:text-[var(--athar-gold)]"
                          )}
                          onClick={() =>
                            toggleBookmark({
                              surahNumber: surah.number,
                              surahName: surah.name,
                              ayahNumber: ayah.numberInSurah,
                              text: ayah.text,
                            })
                          }
                          title={isSaved ? "إلغاء الحفظ" : "حفظ الآية"}
                        >
                          <Bookmark className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
                        </Button>
                      </div>

                      {/* Tafsir */}
                      {openTafsir === ayah.numberInSurah && (
                        <div className="mt-3 p-4 rounded-xl bg-[var(--athar-green)]/5 border border-[var(--athar-green)]/15 text-sm text-right leading-relaxed animate-in fade-in">
                          {tafsirAyah ? (
                            <>
                              <p className="text-foreground/90 leading-loose">{tafsirAyah.translation}</p>
                              <p className="text-xs text-muted-foreground mt-2">المصدر: التفسير الميسر</p>
                            </>
                          ) : (
                            <div className="h-12 animate-pulse bg-muted rounded" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Surah Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/60 gap-3">
            {/* Previous = smaller number = RIGHT in RTL */}
            <Button
              variant="outline"
              onClick={() => router.push(`/quran/${surahNum - 1}`)}
              disabled={surahNum <= 1}
              className="flex-1 max-w-[160px] flex items-center gap-2 justify-start h-auto py-2.5 px-3"
            >
              <ChevronRight className="h-4 w-4 shrink-0" />
              <div className="text-right min-w-0">
                <p className="text-[10px] text-muted-foreground">السابقة</p>
                {prevSurah && <p className="text-xs font-medium truncate font-arabic">{prevSurah.name}</p>}
              </div>
            </Button>

            <span className="text-xs text-muted-foreground shrink-0">{surahNum} / 114</span>

            {/* Next = larger number = LEFT in RTL */}
            <Button
              variant="outline"
              onClick={() => router.push(`/quran/${surahNum + 1}`)}
              disabled={surahNum >= 114}
              className="flex-1 max-w-[160px] flex items-center gap-2 justify-end h-auto py-2.5 px-3"
            >
              <div className="text-left min-w-0">
                <p className="text-[10px] text-muted-foreground">التالية</p>
                {nextSurah && <p className="text-xs font-medium truncate font-arabic">{nextSurah.name}</p>}
              </div>
              <ChevronLeft className="h-4 w-4 shrink-0" />
            </Button>
          </div>
        </>
      )}

      {/* Floating Right Click Context Menu in Ayah mode */}
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
          <div className="px-3 py-2 border-b border-border/60 mb-1 flex items-center justify-between">
            <span className="font-bold text-xs text-[var(--athar-green)] truncate">
              سورة {surah.name}
            </span>
            <span className="text-[11px] bg-[var(--athar-green)]/10 text-[var(--athar-green)] px-1.5 py-0.5 rounded font-bold">
              آية {contextMenu.ayahNumber}
            </span>
          </div>

          <div className="space-y-0.5">
            <button
              onClick={() => {
                if (isReadingMarker(surah.number, contextMenu.ayahNumber)) {
                  clearReadingMarker();
                } else {
                  setReadingMarker({
                    surahNumber: surah.number,
                    surahName: surah.name,
                    ayahNumber: contextMenu.ayahNumber,
                    pageNumber: surahStartPage,
                    text: contextMenu.text,
                  });
                }
                setContextMenu(null);
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all text-right cursor-pointer",
                isReadingMarker(surah.number, contextMenu.ayahNumber)
                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30"
                  : "text-foreground hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-400"
              )}
            >
              <BookmarkCheck className="h-4 w-4 shrink-0 text-amber-600 fill-current" />
              <span>
                {isReadingMarker(surah.number, contextMenu.ayahNumber)
                  ? "إزالة علامة الوقوف"
                  : "أضف علامة وقوف هنا"}
              </span>
            </button>

            {contextMenu.audio && (
              <button
                onClick={() => {
                  handlePlayAyah(contextMenu.audio!, contextMenu.ayahNumber);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all text-right text-foreground hover:bg-muted cursor-pointer"
              >
                {currentPlayingSurah === surah.number &&
                currentPlayingAyah === contextMenu.ayahNumber &&
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
            )}

            <button
              onClick={() => {
                handleTafsir(contextMenu.ayahNumber);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all text-right text-foreground hover:bg-muted cursor-pointer"
            >
              <BookOpen className="h-4 w-4 shrink-0 text-blue-600" />
              <span>عرض التفسير</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(contextMenu.text);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all text-right text-foreground hover:bg-muted cursor-pointer"
            >
              <Copy className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>نسخ نص الآية</span>
            </button>

            <button
              onClick={() => {
                toggleBookmark({
                  surahNumber: surah.number,
                  surahName: surah.name,
                  ayahNumber: contextMenu.ayahNumber,
                  text: contextMenu.text,
                });
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all text-right text-foreground hover:bg-muted cursor-pointer"
            >
              <Bookmark className="h-4 w-4 shrink-0 text-[var(--athar-gold)]" />
              <span>
                {isBookmarked(surah.number, contextMenu.ayahNumber)
                  ? "إلغاء من المفضلة"
                  : "حفظ في المفضلة"}
              </span>
            </button>

            <button
              onClick={() => {
                navigator.share?.({
                  text: `${contextMenu.text}\n\n— ${surah.name}، آية ${contextMenu.ayahNumber}`,
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

    {/* Reciter Selection Modal */}
    <ReciterSelectorModal
      isOpen={isReciterModalOpen}
      onClose={() => setIsReciterModalOpen(false)}
      selectedReciter={selectedReciter}
      onSelectReciter={handleSelectReciter}
    />
  </Container>
);
}
