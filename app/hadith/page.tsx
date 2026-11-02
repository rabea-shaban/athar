"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Copy,
  Check,
  Share2,
  Bookmark,
  Plus,
  Minus,
  X,
  BookMarked,
  Layers,
  ArrowUpDown,
  Library,
  Sparkles,
  Info,
  CheckCircle2,
  Award,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Container from "@/components/layout/Container";
import {
  getHadiths,
  getHadeethCategories,
  getHadeethsByCategory,
  getHadeethDetail,
  searchHadeethEnc,
  type Hadith,
  type HadeethCategory,
  type HadeethDetail,
} from "@/lib/api/islamic";
import { cn, toArabicNumber } from "@/lib/utils";

interface HadithBookInfo {
  slug: string;
  name: string;
  author: string;
  color: string;
}

const HADITH_BOOKS: HadithBookInfo[] = [
  { slug: "bukhari", name: "صحيح البخاري", author: "الإمام محمد بن إسماعيل البخاري", color: "emerald" },
  { slug: "muslim", name: "صحيح مسلم", author: "الإمام مسلم بن الحجاج النيسابوري", color: "teal" },
  { slug: "abu-dawud", name: "سنن أبي داود", author: "الإمام أبو داود السجستاني", color: "sky" },
  { slug: "tirmidzi", name: "جامع الترمذي", author: "الإمام محمد بن عيسى الترمذي", color: "amber" },
  { slug: "nasai", name: "سنن النسائي", author: "الإمام أحمد بن شعيب النسائي", color: "blue" },
  { slug: "ibnu-majah", name: "سنن ابن ماجه", author: "الإمام ابن ماجه القزويني", color: "indigo" },
  { slug: "ahmad", name: "مسند أحمد", author: "الإمام أحمد بن حنبل", color: "violet" },
  { slug: "malik", name: "موطأ مالك", author: "الإمام مالك بن أنس", color: "rose" },
  { slug: "darimi", name: "سنن الدارمي", author: "الإمام عبد الله بن عبد الرحمن الدارمي", color: "cyan" },
];

const LIMIT = 20;

export default function HadithPage() {
  // Mode switcher: "encyclopedia" (HadeethEnc) vs "books" (Nine classical books)
  const [activeTab, setActiveTab] = useState<"encyclopedia" | "books">("encyclopedia");

  // --- Classical Books State ---
  const [selectedBook, setSelectedBook] = useState<HadithBookInfo>(HADITH_BOOKS[0]);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [jumpPageInput, setJumpPageInput] = useState("");

  // --- HadeethEnc Encyclopedia State ---
  const [categories, setCategories] = useState<HadeethCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<HadeethCategory | null>(null);
  const [encyclopediaItems, setEncyclopediaItems] = useState<HadeethDetail[]>([]);
  const [encyclopediaLoading, setEncyclopediaLoading] = useState(true);
  const [encyclopediaSearch, setEncyclopediaSearch] = useState("");
  const [encyclopediaPage, setEncyclopediaPage] = useState(1);
  const [encyclopediaTotalPages, setEncyclopediaTotalPages] = useState(1);
  const [expandedHadithId, setExpandedHadithId] = useState<string | null>(null);

  // Common UI State
  const [fontSize, setFontSize] = useState<number>(1); // 0 to 3
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  // Load Classical Books when active
  useEffect(() => {
    if (activeTab !== "books") return;
    setLoading(true);
    getHadiths(selectedBook.slug, page, LIMIT)
      .then((res) => {
        setHadiths(res.items ?? []);
        setTotalPages(res.pagination?.totalPages ?? 1);
        setTotalItems(res.pagination?.totalItems ?? res.total ?? 0);
      })
      .catch(() => {
        setHadiths([]);
      })
      .finally(() => setLoading(false));
  }, [activeTab, selectedBook, page]);

  // Load HadeethEnc Categories on mount
  useEffect(() => {
    getHadeethCategories()
      .then((cats) => {
        if (cats && cats.length > 0) {
          setCategories(cats);
          setSelectedCategory(cats[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Load HadeethEnc Hadiths by Category or Search
  useEffect(() => {
    if (activeTab !== "encyclopedia") return;
    if (!selectedCategory && !encyclopediaSearch.trim()) return;

    let isMounted = true;
    setEncyclopediaLoading(true);

    if (encyclopediaSearch.trim()) {
      // Search mode
      searchHadeethEnc(encyclopediaSearch.trim())
        .then(async (results) => {
          if (!isMounted) return;
          // Fetch full details for the top results (up to 10)
          const topResults = results.slice(0, 10);
          const detailed = await Promise.all(
            topResults.map(async (item) => {
              const full = await getHadeethDetail(item.id);
              if (full) return full;
              return {
                id: item.id,
                title: item.title,
                hadeeth: item.hadith_text,
                attribution: "موسوعة الأحاديث النبوية",
                grade: "معتمد",
                explanation: "",
                hints: [],
                words_meanings: [],
                reference: "HadeethEnc.com",
              } as HadeethDetail;
            })
          );
          if (isMounted) {
            setEncyclopediaItems(detailed);
            setEncyclopediaTotalPages(1);
          }
        })
        .catch(() => {
          if (isMounted) setEncyclopediaItems([]);
        })
        .finally(() => {
          if (isMounted) setEncyclopediaLoading(false);
        });
    } else if (selectedCategory) {
      // Category mode
      getHadeethsByCategory(selectedCategory.id, encyclopediaPage, 10)
        .then(async (res) => {
          if (!isMounted) return;
          setEncyclopediaTotalPages(res.meta?.last_page || 1);
          // Fetch details for each hadith in the page
          const detailed = await Promise.all(
            res.data.map(async (item) => {
              const full = await getHadeethDetail(item.id);
              return (
                full ||
                ({
                  id: item.id,
                  title: item.title,
                  hadeeth: item.title,
                  attribution: "موسوعة الأحاديث",
                  grade: "",
                  explanation: "",
                  hints: [],
                  words_meanings: [],
                  reference: "HadeethEnc.com",
                } as HadeethDetail)
              );
            })
          );
          if (isMounted) {
            setEncyclopediaItems(detailed);
          }
        })
        .catch(() => {
          if (isMounted) setEncyclopediaItems([]);
        })
        .finally(() => {
          if (isMounted) setEncyclopediaLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedCategory, encyclopediaPage, encyclopediaSearch]);

  const handleCopyHadith = async (textToCopy: string, identifier: string | number) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(identifier);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignored
    }
  };

  const handleShareHadith = async (title: string, textToShare: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: textToShare,
          url: window.location.href,
        });
      } catch {
        // Ignored
      }
    } else {
      await navigator.clipboard.writeText(textToShare);
      alert("تم نسخ الحديث لمشاركته بنجاح!");
    }
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setPage(p);
      setJumpPageInput("");
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };

  const filteredHadiths = useMemo(() => {
    if (!query.trim()) return hadiths;
    return hadiths.filter(
      (h) => h.arab.includes(query.trim()) || String(h.number) === query.trim()
    );
  }, [hadiths, query]);

  const fontClasses = [
    "text-base md:text-lg leading-[2.2]",
    "text-lg md:text-xl leading-[2.3]",
    "text-xl md:text-2xl leading-[2.4]",
    "text-2xl md:text-3xl leading-[2.5]",
  ];

  return (
    <div className="min-h-screen bg-background pb-20 text-right" dir="rtl">
      {/* Luxury Islamic PageHero */}
      <PageHero
        breadcrumbs={[
          { label: "الرئيسية", href: "/" },
          { label: "الحديث النبوي الشريف" },
        ]}
        title="الحديث النبوي الشريف"
        subtitle="موسوعة موثقة تضم أحاديث المصطفى ﷺ مشروحة ومخرجة مع بيان درجات صحتها وفوائدها المستنبطة، بالإضافة لدواوين السنة التسعة المعتمدة."
        badges={[
          { label: "السنة النبوية الشريفة", icon: BookMarked, variant: "emerald" },
          { label: "شروح وتخريج معتمد", icon: Award, variant: "gold" },
          { label: "بحث موضوعي ونقدي", icon: Search, variant: "default" },
        ]}
        theme="emerald"
      >
        {/* Top Switcher: Encyclopedia vs Classical Books */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            onClick={() => setActiveTab("encyclopedia")}
            className={cn(
              "px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-sm cursor-pointer",
              activeTab === "encyclopedia"
                ? "bg-amber-400 text-slate-950 font-bold scale-[1.03] shadow-md ring-2 ring-amber-300/40"
                : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/15"
            )}
          >
            <Sparkles className="h-4 w-4" />
            <span>الموسوعة المشروحة (HadeethEnc)</span>
          </button>

          <button
            onClick={() => setActiveTab("books")}
            className={cn(
              "px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-sm cursor-pointer",
              activeTab === "books"
                ? "bg-amber-400 text-slate-950 font-bold scale-[1.03] shadow-md ring-2 ring-amber-300/40"
                : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/15"
            )}
          >
            <Library className="h-4 w-4" />
            <span>دواوين السنة التسعة</span>
          </button>
        </div>

        {/* Sub-header pills depending on active tab */}
        {activeTab === "books" ? (
          <div className="flex items-center justify-center gap-2 flex-wrap max-w-4xl mx-auto pt-4">
            {HADITH_BOOKS.map((book) => {
              const isSelected = selectedBook.slug === book.slug;
              return (
                <button
                  key={book.slug}
                  onClick={() => {
                    setSelectedBook(book);
                    setPage(1);
                    setQuery("");
                  }}
                  className={cn(
                    "text-xs sm:text-sm px-3.5 py-2 rounded-2xl border transition-all duration-200 font-arabic flex items-center gap-2 shadow-xs cursor-pointer",
                    isSelected
                      ? "bg-amber-400 text-slate-950 border-amber-300 font-bold scale-[1.03] shadow-md ring-2 ring-amber-300/40"
                      : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/15"
                  )}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{book.name}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 flex-wrap max-w-4xl mx-auto pt-4">
            {categories.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id && !encyclopediaSearch.trim();
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setEncyclopediaSearch("");
                    setEncyclopediaPage(1);
                  }}
                  className={cn(
                    "text-xs sm:text-sm px-3.5 py-2 rounded-2xl border transition-all duration-200 font-arabic flex items-center gap-2 shadow-xs cursor-pointer",
                    isSelected
                      ? "bg-amber-400 text-slate-950 border-amber-300 font-bold scale-[1.03] shadow-md ring-2 ring-amber-300/40"
                      : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/15"
                  )}
                >
                  <BookMarked className="h-3.5 w-3.5" />
                  <span>{cat.title}</span>
                  {cat.hadeeths_count && (
                    <span className="text-[10px] opacity-75 font-mono">({toArabicNumber(cat.hadeeths_count)})</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </PageHero>

      {/* Main Content Area */}
      <Container size="xl" className="py-8">
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Controls Bar: Search & Font Size */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
            {/* Info Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--athar-green)]/10 text-[var(--athar-green)] flex items-center justify-center text-lg shrink-0">
                {activeTab === "encyclopedia" ? <Award className="h-5 w-5" /> : <BookMarked className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="font-bold text-base text-foreground font-arabic">
                  {activeTab === "encyclopedia"
                    ? encyclopediaSearch.trim()
                      ? `نتائج البحث عن: "${encyclopediaSearch}"`
                      : selectedCategory?.title || "الموسوعة الحديثية الموثقة"
                    : selectedBook.name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {activeTab === "encyclopedia"
                    ? "تخريج معتمد • درجات الصحة • شرح العبارات • الفوائد المستنبطة"
                    : `${selectedBook.author} ${totalItems > 0 ? `• (${toArabicNumber(totalItems)} حديث)` : ""}`}
                </p>
              </div>
            </div>

            {/* Actions: Search Input & Font Controls */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {activeTab === "encyclopedia" ? (
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={encyclopediaSearch}
                    onChange={(e) => {
                      setEncyclopediaSearch(e.target.value);
                      setEncyclopediaPage(1);
                    }}
                    placeholder="ابحث في متن الحديث أو موضوعه..."
                    className="h-9 text-xs pr-8 rounded-xl bg-background border-border/70"
                    dir="rtl"
                  />
                  {encyclopediaSearch && (
                    <button
                      onClick={() => setEncyclopediaSearch("")}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative flex-1 md:w-56">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث في الأحاديث..."
                    className="h-9 text-xs pr-8 rounded-xl bg-background border-border/70"
                    dir="rtl"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Font controls */}
              <div className="flex items-center border border-border/70 rounded-xl p-0.5 bg-background">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setFontSize((s) => Math.max(0, s - 1))}
                  disabled={fontSize <= 0}
                  title="تصغير الخط"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs px-2 text-muted-foreground font-arabic">حجم الخط</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setFontSize((s) => Math.min(3, s + 1))}
                  disabled={fontSize >= 3}
                  title="تكبير الخط"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* TAB 1: ENCYCLOPEDIA (HadeethEnc) */}
          {activeTab === "encyclopedia" && (
            <>
              {encyclopediaLoading ? (
                <div className="p-12 text-center text-muted-foreground rounded-2xl bg-card border border-border/70">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[var(--athar-green)] border-t-transparent mb-3"></div>
                  <p className="font-arabic text-sm">جاري جلب الأحاديث النبوية وشروحها المعتمدة...</p>
                </div>
              ) : encyclopediaItems.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground rounded-2xl bg-card border border-border/70">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-arabic">لم يتم العثور على أحاديث تطابق بحثك في هذا الباب.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {encyclopediaItems.map((item) => {
                    const isExpanded = expandedHadithId === item.id;
                    const gradeIsSahih = item.grade?.includes("صحيح");
                    const gradeIsHasan = item.grade?.includes("حسن");

                    return (
                      <div
                        key={item.id}
                        className="p-6 rounded-2xl bg-card border border-border/70 hover:border-[var(--athar-green)]/40 transition-all duration-200 shadow-xs space-y-4"
                      >
                        {/* Header: Title + Grade + Attribution */}
                        <div className="flex items-start justify-between gap-3 border-b border-border/50 pb-3 flex-wrap">
                          <div className="space-y-1">
                            <h3 className="font-bold text-foreground text-base md:text-lg font-arabic flex items-center gap-2">
                              <span>{item.title}</span>
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                              {item.attribution && (
                                <span className="bg-muted px-2 py-0.5 rounded-md font-arabic">
                                  {item.attribution}
                                </span>
                              )}
                              {item.reference && (
                                <span className="text-[11px] text-muted-foreground/80">
                                  {item.reference}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.grade && (
                              <Badge
                                className={cn(
                                  "font-arabic text-xs px-2.5 py-1",
                                  gradeIsSahih
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : gradeIsHasan
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {item.grade}
                              </Badge>
                            )}

                            {/* Copy button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              onClick={() =>
                                handleCopyHadith(
                                  `« ${item.hadeeth} »\n[الراوي/المخرج: ${item.attribution} — الدرجة: ${item.grade}] — المصدر: ${item.reference} — منصة أَثَر`,
                                  item.id
                                )
                              }
                              title="نسخ الحديث"
                            >
                              {copiedId === item.id ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>

                            {/* Share button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              onClick={() =>
                                handleShareHadith(
                                  item.title,
                                  `« ${item.hadeeth} »\n[${item.attribution} — ${item.grade}] — منصة أَثَر`
                                )
                              }
                              title="مشاركة الحديث"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Matn with full Tashkeel */}
                        <div
                          className={cn(
                            "font-quran text-foreground leading-loose text-justify",
                            fontClasses[fontSize]
                          )}
                        >
                          « {item.hadeeth} »
                        </div>

                        {/* Explanation Toggle */}
                        {(item.explanation || (item.hints && item.hints.length > 0) || (item.words_meanings && item.words_meanings.length > 0)) && (
                          <div className="pt-2">
                            <button
                              onClick={() => setExpandedHadithId(isExpanded ? null : item.id)}
                              className="text-xs text-[var(--athar-green)] hover:underline flex items-center gap-1 font-arabic font-bold cursor-pointer"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-3.5 w-3.5" />
                                  <span>إخفاء الشرح والفوائد</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3.5 w-3.5" />
                                  <span>عرض شرح الحديث والفوائد ومعاني الكلمات</span>
                                </>
                              )}
                            </button>

                            {/* Expandable Explanation Details */}
                            {isExpanded && (
                              <div className="mt-3 p-4 rounded-xl bg-muted/40 border border-border/60 space-y-4 animate-in fade-in duration-200">
                                {item.explanation && (
                                  <div>
                                    <h4 className="font-bold text-xs text-foreground font-arabic flex items-center gap-1.5 mb-1.5 text-emerald-700 dark:text-emerald-400">
                                      <Info className="h-3.5 w-3.5" />
                                      <span>الشرح والبيان:</span>
                                    </h4>
                                    <p className="text-xs md:text-sm text-foreground/90 leading-relaxed font-arabic whitespace-pre-line">
                                      {item.explanation}
                                    </p>
                                  </div>
                                )}

                                {item.hints && item.hints.length > 0 && (
                                  <div>
                                    <h4 className="font-bold text-xs text-foreground font-arabic flex items-center gap-1.5 mb-1.5 text-amber-700 dark:text-amber-400">
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      <span>الفوائد والاستنباطات:</span>
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1 text-xs md:text-sm text-foreground/90 font-arabic">
                                      {item.hints.map((hint, idx) => (
                                        <li key={idx} className="leading-relaxed">
                                          {hint}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {item.words_meanings && item.words_meanings.length > 0 && (
                                  <div>
                                    <h4 className="font-bold text-xs text-foreground font-arabic flex items-center gap-1.5 mb-1.5 text-sky-700 dark:text-sky-400">
                                      <HelpCircle className="h-3.5 w-3.5" />
                                      <span>معاني الكلمات الغريبة:</span>
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {item.words_meanings.map((wm, idx) => (
                                        <div
                                          key={idx}
                                          className="p-2 rounded-lg bg-background border border-border/50 text-xs font-arabic"
                                        >
                                          <strong className="text-[var(--athar-green)]">{wm.word}</strong>:{" "}
                                          <span className="text-muted-foreground">{wm.meaning}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Pagination for Encyclopedia */}
                  {encyclopediaTotalPages > 1 && !encyclopediaSearch.trim() && (
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/80">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEncyclopediaPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        disabled={encyclopediaPage <= 1}
                        className="rounded-xl gap-1 text-xs"
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span>السابق</span>
                      </Button>

                      <span className="text-xs text-muted-foreground">
                        صفحة <strong className="text-foreground">{toArabicNumber(encyclopediaPage)}</strong> من{" "}
                        <strong className="text-foreground">{toArabicNumber(encyclopediaTotalPages)}</strong>
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEncyclopediaPage((p) => Math.min(encyclopediaTotalPages, p + 1));
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        disabled={encyclopediaPage >= encyclopediaTotalPages}
                        className="rounded-xl gap-1 text-xs"
                      >
                        <span>التالي</span>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* TAB 2: CLASSICAL BOOKS */}
          {activeTab === "books" && (
            <>
              {loading ? (
                <div className="p-12 text-center text-muted-foreground rounded-2xl bg-card border border-border/70">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[var(--athar-green)] border-t-transparent mb-3"></div>
                  <p className="font-arabic text-sm">جاري تحميل الأحاديث من {selectedBook.name}...</p>
                </div>
              ) : filteredHadiths.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground rounded-2xl bg-card border border-border/70">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-arabic">لم يتم العثور على أحاديث تطابق بحثك في هذا الديوان.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHadiths.map((hadith) => (
                    <div
                      key={hadith.number}
                      className="p-6 rounded-2xl bg-card border border-border/70 hover:border-[var(--athar-green)]/40 transition-all duration-200 shadow-xs space-y-4"
                    >
                      {/* Top Bar: Number + Actions */}
                      <div className="flex items-center justify-between border-b border-border/50 pb-3">
                        <Badge variant="outline" className="font-arabic text-xs gap-1.5 px-3 py-1">
                          <span>حديث رقم:</span>
                          <span className="font-mono font-bold text-[var(--athar-green)]">
                            {toArabicNumber(hadith.number)}
                          </span>
                        </Badge>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() =>
                              handleCopyHadith(
                                `« ${hadith.arab} »\n[${selectedBook.name} — حديث: ${hadith.number}] — منصة أَثَر`,
                                hadith.number
                              )
                            }
                            title="نسخ الحديث"
                          >
                            {copiedId === hadith.number ? (
                              <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() =>
                              handleShareHadith(
                                `${selectedBook.name} - حديث ${hadith.number}`,
                                `« ${hadith.arab} »\n[${selectedBook.name} — رقم: ${hadith.number}] — منصة أَثَر`
                              )
                            }
                            title="مشاركة الحديث"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Hadith Arabic Text */}
                      <div
                        className={cn(
                          "font-quran text-foreground leading-loose text-justify",
                          fontClasses[fontSize]
                        )}
                      >
                        « {hadith.arab} »
                      </div>

                      {/* Attribution footer */}
                      <div className="text-xs text-muted-foreground flex items-center justify-between pt-2 border-t border-border/40 font-arabic">
                        <span>{selectedBook.name}</span>
                        <span>{selectedBook.author}</span>
                      </div>
                    </div>
                  ))}

                  {/* Pagination Bar */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPage((p) => Math.max(1, p - 1));
                            window.scrollTo({ top: 300, behavior: "smooth" });
                          }}
                          disabled={page <= 1}
                          className="rounded-xl gap-1 text-xs"
                        >
                          <ChevronRight className="h-4 w-4" />
                          <span>السابق</span>
                        </Button>

                        <span className="text-xs text-muted-foreground px-2">
                          صفحة <strong className="text-foreground">{toArabicNumber(page)}</strong> من{" "}
                          <strong className="text-foreground">{toArabicNumber(totalPages)}</strong>
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPage((p) => Math.min(totalPages, p + 1));
                            window.scrollTo({ top: 300, behavior: "smooth" });
                          }}
                          disabled={page >= totalPages}
                          className="rounded-xl gap-1 text-xs"
                        >
                          <span>التالي</span>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Jump directly to Page form */}
                      <form onSubmit={handleJumpPage} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">انتقل للصفحة:</span>
                        <Input
                          type="number"
                          min={1}
                          max={totalPages}
                          value={jumpPageInput}
                          onChange={(e) => setJumpPageInput(e.target.value)}
                          placeholder={String(page)}
                          className="w-16 h-8 text-xs text-center rounded-lg bg-background"
                        />
                        <Button type="submit" variant="secondary" size="sm" className="h-8 text-xs rounded-lg">
                          انتقال
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
