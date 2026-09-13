"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Search,
  Share2,
  Copy,
  Check,
  Play,
  Pause,
  Minus,
  Plus,
  ArrowRight,
  Filter,
  Volume2,
  X,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Container from "@/components/layout/Container";
import QuranTextRenderer, { toArabicNumerals } from "@/components/quran/QuranTextRenderer";
import { getSurahList, getTafsir, type Surah, type TafsirAyah } from "@/lib/api/islamic";
import { useAudioStore } from "@/store/audioStore";
import { cn, toArabicNumber } from "@/lib/utils";

function cleanSurahName(name: string): string {
  if (!name) return "";
  return name.replace(/^سُ?و?رَ?ةُ?\s*/, "").trim();
}

function TafsirContent() {
  const searchParams = useSearchParams();
  const surahParam = searchParams.get("surah");

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(() => {
    const p = Number(surahParam);
    return p >= 1 && p <= 114 ? p : 1;
  });
  const [tafsir, setTafsir] = useState<TafsirAyah[]>([]);
  const [loadingTafsir, setLoadingTafsir] = useState(true);
  const [loadingSurahs, setLoadingSurahs] = useState(true);

  // Filters
  const [surahSearchQuery, setSurahSearchQuery] = useState("");
  const [revelationFilter, setRevelationFilter] = useState<"ALL" | "Meccan" | "Medinan">("ALL");
  const [ayahSearchQuery, setAyahSearchQuery] = useState("");
  const [tafsirFontSize, setTafsirFontSize] = useState(2); // 1 to 4
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [mobileSurahMenuOpen, setMobileSurahMenuOpen] = useState(false);

  const { setAudio, isPlaying, surahNumber: currentPlayingSurah, togglePlay } = useAudioStore();

  // Load Surahs list
  useEffect(() => {
    getSurahList()
      .then((list) => setSurahs(list))
      .catch(() => {})
      .finally(() => setLoadingSurahs(false));
  }, []);

  // Sync if URL query param changes
  useEffect(() => {
    if (surahParam) {
      const p = Number(surahParam);
      if (p >= 1 && p <= 114 && p !== selectedSurahNumber) {
        setSelectedSurahNumber(p);
      }
    }
  }, [surahParam]);

  // Load Tafsir when selected surah changes
  useEffect(() => {
    setLoadingTafsir(true);
    setAyahSearchQuery("");
    getTafsir(selectedSurahNumber)
      .then((data) => setTafsir(data || []))
      .catch(() => setTafsir([]))
      .finally(() => setLoadingTafsir(false));
  }, [selectedSurahNumber]);

  const currentSurah = useMemo(() => {
    return surahs.find((s) => s.number === selectedSurahNumber) || null;
  }, [surahs, selectedSurahNumber]);

  // Filtered Surahs for sidebar
  const filteredSurahs = useMemo(() => {
    return surahs.filter((s) => {
      const matchType =
        revelationFilter === "ALL" || s.revelationType === revelationFilter;
      const q = surahSearchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        s.name.includes(q) ||
        cleanSurahName(s.name).includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        String(s.number).includes(q);
      return matchType && matchQuery;
    });
  }, [surahs, surahSearchQuery, revelationFilter]);

  // Filtered Ayahs inside current surah
  const filteredAyahs = useMemo(() => {
    if (!ayahSearchQuery.trim()) return tafsir;
    const q = ayahSearchQuery.trim().toLowerCase();
    return tafsir.filter(
      (item) =>
        item.arabic_text.includes(q) ||
        item.translation.includes(q) ||
        String(item.aya) === q
    );
  }, [tafsir, ayahSearchQuery]);

  const handleCopy = (item: TafsirAyah) => {
    const text = `﴿${item.arabic_text}﴾ [سورة ${cleanSurahName(currentSurah?.name || "")}، آية ${item.aya}]\n\nالتفسير الميسر:\n${item.translation}\n\n— عبر منصة أَثَر للمعرفة الإسلامية`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAyah(item.aya);
      setTimeout(() => setCopiedAyah(null), 2000);
    });
  };

  const handleShare = (item: TafsirAyah) => {
    const text = `﴿${item.arabic_text}﴾ [سورة ${cleanSurahName(currentSurah?.name || "")}، آية ${item.aya}]\n\nالتفسير الميسر:\n${item.translation}\n\n— عبر منصة أَثَر للمعرفة الإسلامية`;
    navigator.share?.({ text }).catch(() => {});
  };

  const handlePlayFullSurah = () => {
    if (!currentSurah) return;
    const surahAudioUrl = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${currentSurah.number}.mp3`;
    if (currentPlayingSurah === currentSurah.number && isPlaying) {
      togglePlay();
      return;
    }
    setAudio(surahAudioUrl, currentSurah.name, "مشاري راشد العفاسي", "surah", {
      surahNumber: currentSurah.number,
      ayahNumber: 1,
    });
  };

  const isCurrentSurahPlaying =
    currentPlayingSurah === selectedSurahNumber && isPlaying;

  const FONT_CLASSES = [
    "text-sm md:text-base leading-[2.2]",
    "text-base md:text-lg leading-[2.4]",
    "text-lg md:text-xl leading-[2.6]",
    "text-xl md:text-2xl leading-[2.8]",
  ];

  return (
    <Container size="2xl" className="py-6">
      {/* 1. Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 mb-8 border border-border/70 bg-gradient-to-br from-[var(--athar-green)]/10 via-amber-500/5 to-card text-center shadow-xs">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--athar-green)]/10 text-[var(--athar-green)] text-xs font-bold font-arabic mb-3 border border-[var(--athar-green)]/20">
          <BookOpen className="h-3.5 w-3.5" />
          <span>نُورُ البَيَانِ • التَّفْسِيرُ المُيَسَّرُ</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-bold font-arabic text-foreground mb-2">
          تفسير القرآن الكريم
        </h1>
        <p className="text-muted-foreground text-xs md:text-sm max-w-xl mx-auto leading-relaxed font-arabic">
          بيان معاني الآيات الكريمة وإيضاح دلالاتها بأسلوب ميسر وموجز من «التفسير الميسر» المعتمد لنخبة من كبار علماء التفسير.
        </p>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* RIGHT (in RTL): Surah List Sidebar */}
        <aside className="w-full">
          {/* Mobile Surah Toggle Button */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              onClick={() => setMobileSurahMenuOpen((o) => !o)}
              className="w-full flex items-center justify-between p-3.5 h-auto rounded-2xl border-border/80 bg-card font-arabic shadow-xs"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[var(--athar-green)]" />
                <span className="font-bold text-sm">
                  السورة: {cleanSurahName(currentSurah?.name || "")}
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {currentSurah?.revelationType === "Meccan" ? "مكية" : "مدنية"}
                </Badge>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  mobileSurahMenuOpen && "rotate-180"
                )}
              />
            </Button>
          </div>

          {/* Sidebar Card */}
          <div
            className={cn(
              "rounded-2xl border border-border/70 bg-card p-4 shadow-xs lg:sticky lg:top-20",
              mobileSurahMenuOpen ? "block" : "hidden lg:block"
            )}
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[var(--athar-green)]" />
                <h3 className="font-bold text-sm font-arabic">سور القرآن الكريم</h3>
              </div>
              <span className="text-xs text-muted-foreground font-arabic">
                {toArabicNumber(114)} سورة
              </span>
            </div>

            {/* Search Surah */}
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={surahSearchQuery}
                onChange={(e) => setSurahSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو الرقم..."
                className="pr-9 h-9 text-xs rounded-xl bg-muted/40 font-arabic"
              />
              {surahSearchQuery && (
                <button
                  onClick={() => setSurahSearchQuery("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-muted/50 border border-border/50 mb-3 text-xs font-arabic">
              <button
                onClick={() => setRevelationFilter("ALL")}
                className={cn(
                  "py-1 rounded-lg text-center transition-all cursor-pointer",
                  revelationFilter === "ALL"
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                الكل
              </button>
              <button
                onClick={() => setRevelationFilter("Meccan")}
                className={cn(
                  "py-1 rounded-lg text-center transition-all cursor-pointer",
                  revelationFilter === "Meccan"
                    ? "bg-card text-amber-700 dark:text-amber-400 font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                مكية
              </button>
              <button
                onClick={() => setRevelationFilter("Medinan")}
                className={cn(
                  "py-1 rounded-lg text-center transition-all cursor-pointer",
                  revelationFilter === "Medinan"
                    ? "bg-card text-emerald-700 dark:text-emerald-400 font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                مدنية
              </button>
            </div>

            {/* Surahs Scrollable List */}
            <div className="h-[480px] lg:h-[calc(100vh-340px)] overflow-y-auto space-y-1 pr-0.5">
              {loadingSurahs ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-11 animate-pulse bg-muted rounded-xl" />
                ))
              ) : filteredSurahs.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-6 font-arabic">
                  لا توجد سور مطابقة
                </p>
              ) : (
                filteredSurahs.map((s) => {
                  const isSelected = s.number === selectedSurahNumber;
                  return (
                    <button
                      key={s.number}
                      onClick={() => {
                        setSelectedSurahNumber(s.number);
                        setMobileSurahMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-2.5 rounded-xl text-right transition-all cursor-pointer",
                        isSelected
                          ? "bg-[var(--athar-green)] text-white shadow-xs font-bold"
                          : "hover:bg-muted/70 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={cn(
                            "w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0",
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-muted text-muted-foreground font-arabic"
                          )}
                        >
                          {toArabicNumber(s.number)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-arabic text-sm leading-none truncate">
                            سورة {cleanSurahName(s.name)}
                          </p>
                          <span
                            className={cn(
                              "text-[10px] mt-0.5 block truncate",
                              isSelected ? "text-white/80" : "text-muted-foreground"
                            )}
                          >
                            {toArabicNumber(s.numberOfAyahs)} آية
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[9px] px-1.5 py-0 shrink-0 font-normal",
                          isSelected
                            ? "bg-white/20 text-white border-0"
                            : s.revelationType === "Meccan"
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-0"
                            : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0"
                        )}
                      >
                        {s.revelationType === "Meccan" ? "مكية" : "مدنية"}
                      </Badge>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* LEFT (in RTL): Tafsir Feed & Active Surah Bar */}
        <main className="w-full space-y-4">
          {/* Active Surah Hero Card */}
          {currentSurah && (
            <div className="rounded-2xl border border-border/70 bg-gradient-to-b from-[var(--athar-green)]/8 via-card to-card p-5 md:p-6 shadow-xs text-center">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-xl md:text-3xl font-bold font-arabic text-[var(--athar-green)]">
                      سُورَةُ {cleanSurahName(currentSurah.name)}
                    </h2>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs px-2 py-0.5",
                        currentSurah.revelationType === "Meccan"
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      )}
                    >
                      {currentSurah.revelationType === "Meccan" ? "مكية" : "مدنية"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-arabic">
                    رقم السورة: {toArabicNumber(currentSurah.number)} • عدد آياتها: {toArabicNumber(currentSurah.numberOfAyahs)} • {currentSurah.englishName}
                  </p>
                </div>

                {/* Surah Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/quran/${currentSurah.number}`}>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs rounded-xl h-9">
                      <BookOpen className="h-3.5 w-3.5 text-[var(--athar-green)]" />
                      <span>قراءة في المصحف</span>
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    onClick={handlePlayFullSurah}
                    className="gap-1.5 bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white text-xs rounded-xl h-9 shadow-xs"
                  >
                    {isCurrentSurahPlaying ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>إيقاف مؤقت</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>استماع للسورة</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Search & Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/70 shadow-2xs">
            {/* Search within ayahs */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={ayahSearchQuery}
                onChange={(e) => setAyahSearchQuery(e.target.value)}
                placeholder="ابحث في آيات وتفسير السورة..."
                className="pr-9 h-9 text-xs rounded-xl bg-muted/40 font-arabic"
              />
              {ayahSearchQuery && (
                <button
                  onClick={() => setAyahSearchQuery("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Quick Ayah Jump & Font size */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Ayah Jump Selector */}
              {tafsir.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-arabic">
                  <span>الانتقال لآية:</span>
                  <select
                    onChange={(e) => {
                      const ayahNum = e.target.value;
                      if (ayahNum) {
                        const el = document.getElementById(`tafsir-ayah-${ayahNum}`);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }}
                    className="h-8 px-2 rounded-lg bg-muted/50 border border-border text-xs font-arabic text-foreground focus:outline-none focus:border-[var(--athar-green)] cursor-pointer"
                  >
                    <option value="">اختر آية</option>
                    {tafsir.map((t) => (
                      <option key={t.aya} value={t.aya}>
                        آية {toArabicNumber(t.aya)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Font Size Adjuster */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-arabic hidden md:inline">
                  حجم الخط:
                </span>
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/50 border border-border/50">
                  <button
                    onClick={() => setTafsirFontSize((s) => Math.max(0, s - 1))}
                    disabled={tafsirFontSize <= 0}
                    className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors disabled:opacity-30 cursor-pointer"
                    title="تصغير خط التفسير"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-xs font-bold px-1 font-arabic">
                    {toArabicNumber(tafsirFontSize + 1)}
                  </span>
                  <button
                    onClick={() => setTafsirFontSize((s) => Math.min(3, s + 1))}
                    disabled={tafsirFontSize >= 3}
                    className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors disabled:opacity-30 cursor-pointer"
                    title="تكبير خط التفسير"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tafsir Cards Stream */}
          {loadingTafsir ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl border border-border/60 bg-card space-y-3 animate-pulse"
                >
                  <div className="h-5 w-24 bg-muted rounded-md" />
                  <div className="h-12 bg-muted rounded-xl" />
                  <div className="h-16 bg-muted/70 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredAyahs.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card">
              <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground font-arabic mb-1">
                لا توجد نتائج بحث مطابقة
              </p>
              <p className="text-xs text-muted-foreground font-arabic">
                جرب البحث بكلمة أخرى أو تصفح كامل آيات السورة.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAyahs.map((item) => {
                const isCopied = copiedAyah === item.aya;
                return (
                  <article
                    key={item.aya}
                    id={`tafsir-ayah-${item.aya}`}
                    className="rounded-2xl border border-border/70 bg-card p-5 md:p-6 transition-all hover:border-[var(--athar-green)]/40 hover:shadow-sm"
                  >
                    {/* Card Header: Ayah Number & Quick Actions */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-[var(--athar-green)]/15 text-[var(--athar-green)] text-xs font-bold font-arabic flex items-center justify-center">
                          {toArabicNumber(item.aya)}
                        </span>
                        <span className="text-xs font-bold font-arabic text-foreground">
                          الآية {toArabicNumber(item.aya)}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(item)}
                          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
                          title="نسخ الآية وتفسيرها"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-emerald-600 text-[11px] font-bold">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span className="text-[11px] hidden sm:inline">نسخ</span>
                            </>
                          )}
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleShare(item)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                          title="مشاركة"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Quranic Ayah Text */}
                    <div className="p-4 rounded-xl bg-muted/40 border border-border/40 mb-4 text-right">
                      <p className="quran-text text-lg md:text-xl font-arabic leading-loose text-foreground">
                        <QuranTextRenderer text={item.arabic_text} ayahNumber={item.aya} />
                      </p>
                    </div>

                    {/* Tafsir Explanation */}
                    <div className="pr-1 text-right">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--athar-green)]" />
                        <h4 className="text-xs font-bold text-[var(--athar-green)] font-arabic">
                          التفسير الميسر:
                        </h4>
                      </div>
                      <p
                        className={cn(
                          "text-foreground/90 font-arabic leading-loose select-text",
                          FONT_CLASSES[tafsirFontSize]
                        )}
                      >
                        {item.translation}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </Container>
  );
}

export default function TafsirPage() {
  return (
    <Suspense
      fallback={
        <Container size="2xl" className="py-8">
          <div className="h-40 animate-pulse bg-muted rounded-3xl mb-8" />
          <div className="grid lg:grid-cols-[300px_1fr] gap-6">
            <div className="h-96 animate-pulse bg-muted rounded-2xl" />
            <div className="h-96 animate-pulse bg-muted rounded-2xl" />
          </div>
        </Container>
      }
    >
      <TafsirContent />
    </Suspense>
  );
}
