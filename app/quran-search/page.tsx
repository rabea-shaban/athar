"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Loader2,
  BookOpen,
  FileText,
  Copy,
  Check,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Bookmark,
  Layers,
  HelpCircle,
  Sprout,
  TreePine,
  Heart,
  Landmark,
  ShieldCheck,
  HeartHandshake,
  Droplets,
  Sun,
  Compass,
  Sunrise,
  Star,
  LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Container from "@/components/layout/Container";
import { searchQuran, type QuranSearchResult } from "@/lib/api/islamic";
import { cn, toArabicNumber, normalizeArabic, isDivineWord } from "@/lib/utils";
import { toArabicNumerals } from "@/components/quran/QuranTextRenderer";

const POPULAR_SEARCHES: { label: string; icon: LucideIcon }[] = [
  { label: "الصبر", icon: Sprout },
  { label: "الجنة", icon: TreePine },
  { label: "الرحمة", icon: Heart },
  { label: "الصلاة", icon: Landmark },
  { label: "التقوى", icon: ShieldCheck },
  { label: "الوالدين", icon: HeartHandshake },
  { label: "الاستغفار", icon: Droplets },
  { label: "النور", icon: Sun },
  { label: "الهدى", icon: Compass },
  { label: "التوبة", icon: Sunrise },
  { label: "الفرقان", icon: BookOpen },
  { label: "الإحسان", icon: Star },
];

const ITEMS_PER_PAGE = 12;

function HighlightedQuranText({
  text,
  query,
  ayahNumber,
}: {
  text: string;
  query: string;
  ayahNumber?: number;
}) {
  const normQuery = normalizeArabic(query);
  const words = text.split(" ");

  return (
    <p className="quran-text text-right text-lg sm:text-xl md:text-2xl leading-[2.2] md:leading-[2.4] text-foreground select-text font-arabic">
      {words.map((word, idx) => {
        const normWord = normalizeArabic(word);
        const isMatch = normQuery.length > 0 && normWord.includes(normQuery);
        const isDivine = isDivineWord(word);

        return (
          <React.Fragment key={idx}>
            {isMatch ? (
              <mark className="bg-amber-200/60 dark:bg-amber-500/30 text-amber-950 dark:text-amber-100 rounded px-1 py-0.5 font-semibold mx-0.5 border border-amber-300 dark:border-amber-700/50">
                {word}
              </mark>
            ) : isDivine ? (
              <span className="text-red-600 dark:text-red-400 font-semibold">{word}</span>
            ) : (
              word
            )}
            {idx < words.length - 1 ? " " : ""}
          </React.Fragment>
        );
      })}
      {ayahNumber !== undefined && (
        <span className="text-emerald-700 dark:text-emerald-400 font-arabic font-normal mx-1.5 select-none whitespace-nowrap inline-block">
          {"\u200F"}﴿{toArabicNumerals(ayahNumber)}﴾
        </span>
      )}
    </p>
  );
}

export default function QuranSearchPage() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [results, setResults] = useState<QuranSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSurahFilter, setSelectedSurahFilter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);

  async function performSearch(searchTerm: string) {
    const term = searchTerm.trim();
    if (!term) return;

    setLoading(true);
    setError(null);
    setSelectedSurahFilter(null);
    setCurrentPage(1);
    setActiveQuery(term);

    try {
      const data = await searchQuran(term);
      setResults(data);
    } catch {
      setError("حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    performSearch(query);
  }

  function handleQuickTagClick(tag: string) {
    setQuery(tag);
    performSearch(tag);
  }

  function handleClear() {
    setQuery("");
    setActiveQuery("");
    setResults(null);
    setError(null);
    setSelectedSurahFilter(null);
    setCurrentPage(1);
  }

  // Filtered results by Surah
  const filteredMatches = useMemo(() => {
    if (!results || !results.matches) return [];
    if (selectedSurahFilter === null) return results.matches;
    return results.matches.filter((m) => m.surah.number === selectedSurahFilter);
  }, [results, selectedSurahFilter]);

  // Grouped surahs for filter bar
  const surahsSummary = useMemo(() => {
    if (!results || !results.matches) return [];
    const map = new Map<number, { number: number; name: string; count: number }>();
    for (const match of results.matches) {
      const s = match.surah;
      const current = map.get(s.number);
      if (current) {
        current.count += 1;
      } else {
        map.set(s.number, {
          number: s.number,
          name: s.name.replace(/^سُ?و?رَ?ةُ?\s*/, "").trim(),
          count: 1,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.number - b.number);
  }, [results]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredMatches.length / ITEMS_PER_PAGE);
  const paginatedMatches = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMatches.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMatches, currentPage]);

  const handleCopyAyah = async (text: string, surahName: string, ayahNumber: number, matchKey: number) => {
    const copyText = `﴿ ${text} ﴾ [${surahName}: ${ayahNumber}]`;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopiedAyah(matchKey);
      setTimeout(() => setCopiedAyah(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShareAyah = async (text: string, surahName: string, ayahNumber: number) => {
    const shareText = `﴿ ${text} ﴾ [${surahName}: ${ayahNumber}] — منصة أَثَر`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `آية من سورة ${surahName}`,
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // Ignored
      }
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-muted/10 to-background">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-muted/20 py-10 md:py-14">
        {/* Subtle Decorative Background Circles */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--athar-green)]/10 blur-3xl rounded-full" />

        <Container size="xl" className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--athar-green)]/10 text-[var(--athar-green)] text-xs md:text-sm font-medium mb-4 border border-[var(--athar-green)]/20 shadow-xs">
            <Compass className="h-4 w-4" />
            <span>البحث الدقيق في المصحف الشريف</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3">
            البحث في القرآن الكريم
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            ابحث في جميع آيات القرآن الكريم وسوره عن أي كلمة، جزء من آية، أو موضوع بدقة فائقة وربط فوري مع التفسير الميسر.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={handleFormSubmit}
              className="relative flex items-center shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl bg-card border border-border/80 p-1.5 focus-within:border-[var(--athar-green)] focus-within:ring-2 focus-within:ring-[var(--athar-green)]/20"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="absolute right-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="اكتب كلمة أو جزءاً من آية (مثال: الصبر، إن مع العسر...)"
                  className="pr-11 pl-10 h-12 text-sm sm:text-base border-none shadow-none focus-visible:ring-0 bg-transparent"
                  dir="rtl"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute left-2 text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted transition-colors"
                    title="مسح البحث"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="h-12 px-6 rounded-xl bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white font-medium shadow-sm transition-all duration-200 shrink-0 gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>جاري البحث...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>بحث</span>
                  </>
                )}
              </Button>
            </form>

            {/* Popular / Suggestion Tags */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <span className="text-xs text-muted-foreground ml-1 font-medium">كلمات شائعة:</span>
              {POPULAR_SEARCHES.map((tag) => {
                const Icon = tag.icon;
                return (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => handleQuickTagClick(tag.label)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-lg border transition-all duration-150 flex items-center gap-1",
                      activeQuery === tag.label
                        ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-xs"
                        : "bg-background/80 hover:bg-muted border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tag.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content Area */}
      <Container size="xl" className="py-8">
        {/* Error State */}
        {error && (
          <div className="text-center py-10 bg-destructive/10 border border-destructive/20 rounded-2xl max-w-lg mx-auto p-6">
            <p className="text-destructive font-medium mb-3">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performSearch(activeQuery)}
              className="gap-1.5"
            >
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--athar-green)]/10 text-[var(--athar-green)] animate-pulse">
              <Search className="h-7 w-7 animate-spin" />
            </div>
            <p className="text-sm font-medium text-foreground">جاري البحث في آيات المصحف الشريف...</p>
            <p className="text-xs text-muted-foreground">نبحث عن: «{activeQuery}»</p>
          </div>
        )}

        {/* Results View */}
        {!loading && results && results.count > 0 && (
          <div className="space-y-6">
            {/* Results Header / Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-5 rounded-2xl bg-card border border-border/70 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--athar-green)]/10 flex items-center justify-center text-[var(--athar-green)]">
                  <Bookmark className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    نتائج البحث عن: <span className="text-[var(--athar-green)]">«{activeQuery}»</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    تم العثور على <span className="font-semibold text-foreground">{toArabicNumber(results.count)}</span> آية في{" "}
                    <span className="font-semibold text-foreground">{toArabicNumber(surahsSummary.length)}</span> سورة مختلفة
                  </p>
                </div>
              </div>

              {/* Total Count Badge */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1 bg-muted/50 text-xs font-semibold">
                  {toArabicNumber(filteredMatches.length)} آية معروضة
                </Badge>
              </div>
            </div>

            {/* Surah Filter Chips */}
            {surahsSummary.length > 1 && (
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-muted-foreground">
                  <Filter className="h-3.5 w-3.5 text-[var(--athar-green)]" />
                  <span>تصفية حسب السورة:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSurahFilter(null);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium",
                      selectedSurahFilter === null
                        ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)]"
                        : "bg-card hover:bg-muted border-border/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    الكل ({toArabicNumber(results.count)})
                  </button>
                  {surahsSummary.map((s) => (
                    <button
                      key={s.number}
                      type="button"
                      onClick={() => {
                        setSelectedSurahFilter(s.number);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1",
                        selectedSurahFilter === s.number
                          ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)]"
                          : "bg-card hover:bg-muted border-border/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span>سورة {s.name}</span>
                      <span className="opacity-70 text-[10px]">({toArabicNumber(s.count)})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Verses List */}
            <div className="space-y-4">
              {paginatedMatches.map((match) => {
                const surahNameClean = match.surah.name.replace(/^سُ?و?رَ?ةُ?\s*/, "").trim();
                const isCopied = copiedAyah === match.number;

                return (
                  <div
                    key={match.number}
                    className="group rounded-2xl border border-border/70 bg-card p-5 md:p-6 transition-all duration-200 hover:border-[var(--athar-green)]/40 hover:shadow-md relative overflow-hidden"
                  >
                    {/* Top Decorative accent line */}
                    <div className="absolute top-0 right-0 left-0 h-1 bg-transparent group-hover:bg-[var(--athar-green)] transition-all" />

                    {/* Verse Header Info */}
                    <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-border/50">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="secondary"
                          className="bg-[var(--athar-green)]/10 text-[var(--athar-green)] hover:bg-[var(--athar-green)]/20 font-bold px-2.5 py-1 text-xs"
                        >
                          سورة {surahNameClean}
                        </Badge>
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          {match.surah.revelationType === "Meccan" ? "مكية" : "مدنية"}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-medium">
                          الآية {toArabicNumber(match.numberInSurah)}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground hidden sm:block">
                        رقم السورة: {toArabicNumber(match.surah.number)}
                      </div>
                    </div>

                    {/* Quran Text */}
                    <div className="py-2 mb-4 bg-muted/10 rounded-xl p-4 border border-border/30">
                      <HighlightedQuranText
                        text={match.text}
                        query={activeQuery}
                        ayahNumber={match.numberInSurah}
                      />
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 flex-wrap gap-2 text-xs">
                      {/* Left: Quick Navigation Links */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/quran/${match.surah.number}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground font-medium transition-colors border border-border/50"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-[var(--athar-green)]" />
                          <span>قراءة السورة</span>
                        </Link>
                        <Link
                          href={`/tafsir?surah=${match.surah.number}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--athar-green)]/10 hover:bg-[var(--athar-green)]/20 text-[var(--athar-green)] font-semibold transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>التفسير الميسر</span>
                        </Link>
                      </div>

                      {/* Right: Copy & Share */}
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopyAyah(
                              match.text,
                              match.surah.name,
                              match.numberInSurah,
                              match.number
                            )
                          }
                          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                          title="نسخ الآية"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                تم النسخ
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>نسخ</span>
                            </>
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleShareAyah(
                              match.text,
                              match.surah.name,
                              match.numberInSurah
                            )
                          }
                          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                          title="مشاركة الآية"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span>مشاركة</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 pb-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 250, behavior: "smooth" });
                  }}
                  className="gap-1 text-xs"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span>السابق</span>
                </Button>

                <div className="flex items-center gap-1 px-2">
                  <span className="text-xs text-muted-foreground">
                    صفحة <strong className="text-foreground">{toArabicNumber(currentPage)}</strong> من{" "}
                    <strong className="text-foreground">{toArabicNumber(totalPages)}</strong>
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 250, behavior: "smooth" });
                  }}
                  className="gap-1 text-xs"
                >
                  <span>التالي</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty State: No results found */}
        {!loading && results && results.count === 0 && (
          <div className="text-center py-16 bg-card border border-border/70 rounded-2xl max-w-lg mx-auto p-8 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mx-auto mb-4">
              <Search className="h-7 w-7 opacity-50" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">لم يتم العثور على نتائج</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              لم نجد أي آية تطابق بحثك عن &quot;{activeQuery}&quot;. جرّب البحث بدون تشكيل، أو استخدام كلمة مفردة، أو مرادف آخر.
            </p>
            <div className="text-xs text-muted-foreground space-y-1.5 border-t border-border/50 pt-4 text-right">
              <p className="font-semibold text-foreground mb-1">نصائح للبحث:</p>
              <p>• كتابة الكلمة بدون حركات وتنوين (مثل: &quot;صبر&quot; بدلاً من &quot;صَبْرٌ&quot;).</p>
              <p>• تجنب ال التعريف والضمائر المتصلة إن لم تظهر النتيجة.</p>
            </div>
          </div>
        )}

        {/* Intro State: Initial landing without search */}
        {!loading && !results && !error && (
          <div className="space-y-8 py-4">
            {/* 3 Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 rounded-2xl bg-card border border-border/70 shadow-xs hover:border-[var(--athar-green)]/40 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-[var(--athar-green)]/10 text-[var(--athar-green)] flex items-center justify-center mb-4">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground mb-2">بحث نصي فوري</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  محرك بحث سريع ودقيق يبحث في الكلمات، الجمل، والألفاظ القرآنية عبر جميع سور القرآن الكريم.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border/70 shadow-xs hover:border-[var(--athar-green)]/40 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground mb-2">ربط مباشر بالتفسير</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  انتقل بضغطة زر واحدة من نتيجة البحث إلى التفسير الميسر المعتمد أو قراءة السورة في المصحف.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border/70 shadow-xs hover:border-[var(--athar-green)]/40 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <Share2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground mb-2">نسخ ومشاركة سهلة</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  انسخ نص الآيات القرآنية بدقة مع إسناد اسم السورة ورقم الآية الجاهز للنشر والمشاركة.
                </p>
              </div>
            </div>

            {/* Quick guidance box */}
            <div className="p-5 rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-[var(--athar-green)] shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground block mb-0.5">كيفية البحث؟</span>
                يمكنك كتابة أي كلمة مثل (الرحمة، الصلاة، الجنة) أو كتابة شطر من آية قرآنية، وسيتم جلب جميع الآيات المطابقة مع إبراز موضع الكلمة داخل النص القرآني.
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
