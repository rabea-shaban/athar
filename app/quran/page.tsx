"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  BookOpen, 
  Headphones, 
  Compass, 
  ArrowUpDown, 
  X, 
  BookmarkCheck, 
  ChevronLeft,
  BookMarked,
  Heart,
  Flower2,
  Gem,
  ShieldCheck,
  Scroll,
  Star,
  Landmark,
  Layers,
  Sun
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSurahList, type Surah } from "@/lib/api/islamic";
import { useReadingStore } from "@/store/readingStore";
import { cn, normalizeArabic, toArabicNumber } from "@/lib/utils";
import Container from "@/components/layout/Container";

// Approximate Madani Mushaf page numbers for each Surah
const SURAH_PAGES: Record<number, { page: number; juz: number }> = {
  1: { page: 1, juz: 1 }, 2: { page: 2, juz: 1 }, 3: { page: 50, juz: 3 }, 4: { page: 77, juz: 4 },
  5: { page: 106, juz: 6 }, 6: { page: 128, juz: 7 }, 7: { page: 151, juz: 8 }, 8: { page: 177, juz: 9 },
  9: { page: 187, juz: 10 }, 10: { page: 208, juz: 11 }, 11: { page: 221, juz: 11 }, 12: { page: 235, juz: 12 },
  13: { page: 249, juz: 13 }, 14: { page: 255, juz: 13 }, 15: { page: 262, juz: 14 }, 16: { page: 267, juz: 14 },
  17: { page: 282, juz: 15 }, 18: { page: 293, juz: 15 }, 19: { page: 305, juz: 16 }, 20: { page: 312, juz: 16 },
  21: { page: 322, juz: 17 }, 22: { page: 332, juz: 17 }, 23: { page: 342, juz: 18 }, 24: { page: 350, juz: 18 },
  25: { page: 359, juz: 18 }, 26: { page: 367, juz: 19 }, 27: { page: 377, juz: 19 }, 28: { page: 385, juz: 20 },
  29: { page: 396, juz: 20 }, 30: { page: 404, juz: 21 }, 31: { page: 411, juz: 21 }, 32: { page: 415, juz: 21 },
  33: { page: 418, juz: 21 }, 34: { page: 428, juz: 22 }, 35: { page: 434, juz: 22 }, 36: { page: 440, juz: 22 },
  37: { page: 446, juz: 23 }, 38: { page: 453, juz: 23 }, 39: { page: 458, juz: 23 }, 40: { page: 467, juz: 24 },
  41: { page: 477, juz: 24 }, 42: { page: 483, juz: 25 }, 43: { page: 489, juz: 25 }, 44: { page: 496, juz: 25 },
  45: { page: 499, juz: 25 }, 46: { page: 502, juz: 26 }, 47: { page: 507, juz: 26 }, 48: { page: 511, juz: 26 },
  49: { page: 515, juz: 26 }, 50: { page: 518, juz: 26 }, 51: { page: 520, juz: 26 }, 52: { page: 523, juz: 27 },
  53: { page: 526, juz: 27 }, 54: { page: 528, juz: 27 }, 55: { page: 531, juz: 27 }, 56: { page: 534, juz: 27 },
  57: { page: 537, juz: 27 }, 58: { page: 542, juz: 28 }, 59: { page: 545, juz: 28 }, 60: { page: 549, juz: 28 },
  61: { page: 551, juz: 28 }, 62: { page: 553, juz: 28 }, 63: { page: 554, juz: 28 }, 64: { page: 556, juz: 28 },
  65: { page: 558, juz: 28 }, 66: { page: 560, juz: 28 }, 67: { page: 562, juz: 29 }, 68: { page: 564, juz: 29 },
  69: { page: 566, juz: 29 }, 70: { page: 568, juz: 29 }, 71: { page: 570, juz: 29 }, 72: { page: 572, juz: 29 },
  73: { page: 574, juz: 29 }, 74: { page: 575, juz: 29 }, 75: { page: 577, juz: 29 }, 76: { page: 578, juz: 29 },
  77: { page: 580, juz: 29 }, 78: { page: 582, juz: 30 }, 79: { page: 583, juz: 30 }, 80: { page: 585, juz: 30 },
  81: { page: 586, juz: 30 }, 82: { page: 587, juz: 30 }, 83: { page: 587, juz: 30 }, 84: { page: 589, juz: 30 },
  85: { page: 590, juz: 30 }, 86: { page: 591, juz: 30 }, 87: { page: 591, juz: 30 }, 88: { page: 592, juz: 30 },
  89: { page: 593, juz: 30 }, 90: { page: 594, juz: 30 }, 91: { page: 595, juz: 30 }, 92: { page: 595, juz: 30 },
  93: { page: 596, juz: 30 }, 94: { page: 596, juz: 30 }, 95: { page: 597, juz: 30 }, 96: { page: 597, juz: 30 },
  97: { page: 598, juz: 30 }, 98: { page: 598, juz: 30 }, 99: { page: 599, juz: 30 }, 100: { page: 599, juz: 30 },
  101: { page: 600, juz: 30 }, 102: { page: 600, juz: 30 }, 103: { page: 601, juz: 30 }, 104: { page: 601, juz: 30 },
  105: { page: 601, juz: 30 }, 106: { page: 602, juz: 30 }, 107: { page: 602, juz: 30 }, 108: { page: 602, juz: 30 },
  109: { page: 603, juz: 30 }, 110: { page: 603, juz: 30 }, 111: { page: 603, juz: 30 }, 112: { page: 604, juz: 30 },
  113: { page: 604, juz: 30 }, 114: { page: 604, juz: 30 },
};

const JUZS = Array.from({ length: 30 }, (_, i) => i + 1);

const QUICK_JUMPS = [
  { name: "الفاتحة", num: 1, icon: BookOpen, badge: "أم الكتاب" },
  { name: "الكهف", num: 18, icon: Sun, badge: "سنة الجمعة" },
  { name: "يس", num: 36, icon: Heart, badge: "قلب القرآن" },
  { name: "الرحمن", num: 55, icon: Flower2, badge: "عروس القرآن" },
  { name: "الواقعة", num: 56, icon: Gem, badge: "فضل عظيم" },
  { name: "الملك", num: 67, icon: ShieldCheck, badge: "المنجية" },
  { name: "جزء عمّ", num: 78, icon: Scroll, badge: "الجزء ٣٠" },
  { name: "جزء تبارك", num: 67, icon: Star, badge: "الجزء ٢٩" },
];

export default function QuranPage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [query, setQuery] = useState("");
  const [activeJuz, setActiveJuz] = useState<number | null>(null);
  const [revelationFilter, setRevelationFilter] = useState<"all" | "Meccan" | "Medinan">("all");
  const [sortBy, setSortBy] = useState<"mushaf" | "ayahsDesc" | "ayahsAsc" | "name">("mushaf");
  const [loading, setLoading] = useState(true);

  const { readingMarker } = useReadingStore();

  useEffect(() => {
    getSurahList()
      .then(setSurahs)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return surahs.filter((s) => {
      // Revelation filter
      if (revelationFilter !== "all" && s.revelationType !== revelationFilter) {
        return false;
      }

      // Juz filter
      if (activeJuz !== null) {
        const info = SURAH_PAGES[s.number];
        if (info && info.juz !== activeJuz) {
          return false;
        }
      }

      // Search Query
      if (query.trim()) {
        const q = normalizeArabic(query.trim().toLowerCase());
        const matchName = normalizeArabic(s.name).includes(q);
        const matchEng = s.englishName.toLowerCase().includes(q);
        const matchTrans = s.englishNameTranslation.toLowerCase().includes(q);
        const matchNum = String(s.number) === query.trim();
        if (!matchName && !matchEng && !matchTrans && !matchNum) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "mushaf") return a.number - b.number;
      if (sortBy === "ayahsDesc") return b.numberOfAyahs - a.numberOfAyahs;
      if (sortBy === "ayahsAsc") return a.numberOfAyahs - b.numberOfAyahs;
      if (sortBy === "name") return a.name.localeCompare(b.name, "ar");
      return 0;
    });
  }, [surahs, query, activeJuz, revelationFilter, sortBy]);

  return (
    <div className="min-h-screen pb-16 space-y-8">
      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-emerald-950/40 via-card/70 to-background py-10 px-4">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[var(--athar-green)]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <Container size="xl" className="relative z-10 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--athar-green)]/15 border border-[var(--athar-green)]/30 text-[var(--athar-green)] text-xs font-semibold shadow-sm">
            <BookMarked className="w-3.5 h-3.5" />
            <span>المصحف الشريف المرتل والمجود</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold font-arabic text-foreground tracking-tight">
            فهرس سُوَر القرآن الكريم
          </h1>

          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            تصفح وقراءة آيات الذكر الحكيم بالرسم العثماني المعتمد، مع التفسير الميسر والتلاوات العطبة بأصوات كبار القراء.
          </p>

          {/* Quick Islamic Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-2xl mx-auto">
            <div className="p-3 rounded-2xl bg-card/70 backdrop-blur border border-border/60 shadow-xs">
              <div className="text-xl md:text-2xl font-extrabold text-[var(--athar-green)] font-arabic">١١٤</div>
              <div className="text-xs text-muted-foreground">سورة كريمة</div>
            </div>
            <div className="p-3 rounded-2xl bg-card/70 backdrop-blur border border-border/60 shadow-xs">
              <div className="text-xl md:text-2xl font-extrabold text-amber-500 font-arabic">٣٠</div>
              <div className="text-xs text-muted-foreground">جزءاً شريفاً</div>
            </div>
            <div className="p-3 rounded-2xl bg-card/70 backdrop-blur border border-border/60 shadow-xs">
              <div className="text-xl md:text-2xl font-extrabold text-teal-500 font-arabic">٦,٢٣٦</div>
              <div className="text-xs text-muted-foreground">آية محكمة</div>
            </div>
            <div className="p-3 rounded-2xl bg-card/70 backdrop-blur border border-border/60 shadow-xs">
              <div className="text-xl md:text-2xl font-extrabold text-purple-400 font-arabic">٦٠٤</div>
              <div className="text-xs text-muted-foreground">صفحة بالمصحف</div>
            </div>
          </div>

          {/* ─── Reading Marker Resume Banner (If Exists) ─── */}
          {readingMarker && (
            <div className="max-w-xl mx-auto pt-2 animate-in fade-in slide-in-from-bottom-2">
              <Link
                href={`/quran/${readingMarker.surahNumber}#ayah-${readingMarker.ayahNumber}`}
                className="flex items-center justify-between p-3.5 px-5 rounded-2xl bg-amber-500/15 border border-amber-500/35 hover:bg-amber-500/25 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3 text-right">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center font-bold shadow-xs">
                    <BookmarkCheck className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                      متابعة التلاوة من آخر علامة وقوف:
                    </div>
                    <div className="text-sm font-bold text-foreground font-arabic">
                      سورة {readingMarker.surahName} — آية {toArabicNumber(readingMarker.ayahNumber)} (صفحة {toArabicNumber(readingMarker.pageNumber)})
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 group-hover:-translate-x-1 transition-transform">
                  <span>متابعة</span>
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </Link>
            </div>
          )}
        </Container>
      </div>

      <Container size="2xl" className="space-y-6">
        {/* ─── Quick Virtuous Surahs ─── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground px-1">
            <BookMarked className="w-3.5 h-3.5 text-[var(--athar-green)]" />
            <span>سور مأثورة وفاضلة:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_JUMPS.map((q) => {
              const Icon = q.icon;
              return (
                <Link
                  key={q.name}
                  href={`/quran/${q.num}`}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-card border border-border/80 hover:border-[var(--athar-green)]/60 hover:bg-[var(--athar-green)]/5 text-xs whitespace-nowrap transition-all shadow-xs group"
                >
                  <Icon className="w-3.5 h-3.5 text-[var(--athar-green)] group-hover:scale-110 transition-transform" />
                  <span className="font-arabic font-bold text-foreground group-hover:text-[var(--athar-green)]">
                    سورة {q.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                    {q.badge}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ─── Search & Filters Bar ─── */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (activeJuz !== null) setActiveJuz(null);
                }}
                placeholder="ابحث عن سورة بالاسم، برقم السورة، أو برقم الجزء..."
                className="w-full pl-10 pr-11 py-3 bg-card border border-border/80 rounded-2xl text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[var(--athar-green)]/30 focus:border-[var(--athar-green)] transition-all shadow-sm"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Revelation Filter & Sort */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Revelation tabs */}
              <div className="flex items-center p-1 bg-card border border-border/80 rounded-2xl text-xs shadow-xs">
                <button
                  onClick={() => setRevelationFilter("all")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-medium transition-all",
                    revelationFilter === "all"
                      ? "bg-[var(--athar-green)] text-white shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  الكل ({surahs.length})
                </button>
                <button
                  onClick={() => setRevelationFilter("Meccan")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1",
                    revelationFilter === "Meccan"
                      ? "bg-amber-600 text-white shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>مكية</span>
                  <span className="text-[10px] opacity-80">(٨٦)</span>
                </button>
                <button
                  onClick={() => setRevelationFilter("Medinan")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1",
                    revelationFilter === "Medinan"
                      ? "bg-emerald-600 text-white shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>مدنية</span>
                  <span className="text-[10px] opacity-80">(٢٨)</span>
                </button>
              </div>

              {/* Sort Selector */}
              <div className="relative flex items-center bg-card border border-border/80 rounded-2xl px-3 py-2 text-xs text-muted-foreground shadow-xs">
                <ArrowUpDown className="w-3.5 h-3.5 ml-2 text-[var(--athar-green)]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="ترتيب السور"
                  className="bg-transparent border-none focus:outline-none text-foreground cursor-pointer text-xs font-medium"
                >
                  <option value="mushaf">ترتيب المصحف (١-١١٤)</option>
                  <option value="ayahsDesc">الأكثر آيات</option>
                  <option value="ayahsAsc">الأقل آيات</option>
                  <option value="name">أبجدياً بالاسم</option>
                </select>
              </div>
            </div>
          </div>

          {/* ─── 30 Juz Filter Carousel ─── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>تصفية بحسب الجزء:</span>
              {activeJuz !== null && (
                <button
                  onClick={() => setActiveJuz(null)}
                  className="text-red-400 hover:underline text-[11px]"
                >
                  إلغاء تصفية الجزء
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setActiveJuz(null)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap",
                  activeJuz === null
                    ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-xs"
                    : "bg-card border-border/80 text-muted-foreground hover:border-[var(--athar-green)]/40 hover:text-foreground"
                )}
              >
                كامل القرآن
              </button>

              {JUZS.map((j) => {
                const isActive = activeJuz === j;
                return (
                  <button
                    key={j}
                    onClick={() => setActiveJuz(isActive ? null : j)}
                    className={cn(
                      "min-w-[42px] h-[34px] px-2 rounded-xl text-xs font-arabic border transition-all flex items-center justify-center shrink-0",
                      isActive
                        ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-xs font-bold"
                        : "bg-card border-border/80 text-muted-foreground hover:border-[var(--athar-green)]/40 hover:text-foreground"
                    )}
                    title={`الجزء ${toArabicNumber(j)}`}
                  >
                    جـ {toArabicNumber(j)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Surahs Grid ─── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse bg-card rounded-3xl border border-border/60" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-card/40 rounded-3xl border border-dashed border-border/80 p-8 space-y-3">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <h3 className="text-lg font-bold">لا توجد سور مطابقة لبحثك</h3>
            <p className="text-xs text-muted-foreground">
              يرجى التأكد من كتابة اسم السورة أو تعديل الفلاتر المحددة.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setActiveJuz(null);
                setRevelationFilter("all");
              }}
              className="px-4 py-2 rounded-xl bg-[var(--athar-green)]/15 text-[var(--athar-green)] text-xs font-semibold hover:bg-[var(--athar-green)]/25 transition-colors"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((surah) => {
              const info = SURAH_PAGES[surah.number] || { page: 1, juz: 1 };
              const isMeccan = surah.revelationType === "Meccan";

              return (
                <div
                  key={surah.number}
                  className="group relative flex flex-col justify-between p-4 rounded-3xl border border-border/80 bg-card hover:border-[var(--athar-green)]/60 hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  {/* Subtle Top Gradient Accent */}
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-[var(--athar-green)]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Card Content Top */}
                  <Link href={`/quran/${surah.number}`} className="space-y-3 block">
                    <div className="flex items-center justify-between gap-3">
                      {/* Islamic Star / Polygonal Number Badge */}
                      <div className="relative w-11 h-11 rounded-2xl bg-[var(--athar-green)]/10 group-hover:bg-[var(--athar-green)] group-hover:text-white flex items-center justify-center font-arabic font-bold text-sm text-[var(--athar-green)] transition-colors shrink-0 shadow-2xs border border-[var(--athar-green)]/20">
                        {toArabicNumber(surah.number)}
                      </div>

                      {/* Surah Name in Arabic Calligraphy */}
                      <div className="text-right flex-1 min-w-0">
                        <h3 className="text-lg font-bold font-arabic text-foreground group-hover:text-[var(--athar-green)] transition-colors truncate">
                          سُورَةُ {surah.name.replace(/^سُ?و?رَ?ةُ?\s*/, "")}
                        </h3>
                        <p className="text-[11px] text-muted-foreground truncate font-sans">
                          {surah.englishName} · {surah.englishNameTranslation}
                        </p>
                      </div>

                      {/* Revelation Badge */}
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 border flex items-center gap-1",
                          isMeccan
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        )}
                      >
                        <Landmark className="w-3 h-3" />
                        <span>{isMeccan ? "مكية" : "مدنية"}</span>
                      </span>
                    </div>

                    {/* Metadata strip */}
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                      <span>{toArabicNumber(surah.numberOfAyahs)} آية</span>
                      <span>•</span>
                      <span>الجزء {toArabicNumber(info.juz)}</span>
                      <span>•</span>
                      <span>صفحة {toArabicNumber(info.page)}</span>
                    </div>
                  </Link>

                  {/* Card Actions Bottom */}
                  <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-border/50">
                    <Link
                      href={`/quran/${surah.number}`}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-[var(--athar-green)]/10 hover:bg-[var(--athar-green)] text-[var(--athar-green)] hover:text-white text-xs font-semibold transition-all text-center"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>قراءة</span>
                    </Link>

                    <Link
                      href={`/listen`}
                      className="p-1.5 rounded-xl border border-border/80 hover:border-[var(--athar-green)]/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="استماع للسورة"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href={`/tafsir?surah=${surah.number}`}
                      className="p-1.5 rounded-xl border border-border/80 hover:border-[var(--athar-green)]/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="تفسير السورة"
                    >
                      <Compass className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}

