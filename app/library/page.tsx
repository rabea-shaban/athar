"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  X, 
  Library, 
  Scroll, 
  ShieldCheck, 
  ArrowUpDown, 
  Tag,
  Clock,
  Download,
  Filter,
  Flame,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { BOOKS, CATEGORIES, Book, RightsStatus } from "@/data/books";
import Container from "@/components/layout/Container";
import PageHero from "@/components/layout/PageHero";
import BookCard from "@/components/books/BookCard";
import BookReaderModal from "@/components/books/BookReaderModal";
import { toArabicNumber, cn } from "@/lib/utils";

interface BookProgressData {
  [slug: string]: {
    currentPage: number;
    totalPages: number;
    percentage: number;
    lastReadAt: string;
  };
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "my-library">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [rightsFilter, setRightsFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "pagesAsc" | "pagesDesc" | "title" | "downloadable">("featured");
  
  // Local storage state
  const [savedBooks, setSavedBooks] = useState<string[]>([]);
  const [readingProgress, setReadingProgress] = useState<BookProgressData>({});
  
  // Active reading modal
  const [activeReaderBook, setActiveReaderBook] = useState<Book | null>(null);

  // Load saved bookmarks & progress from localStorage
  useEffect(() => {
    try {
      const storedSaved = localStorage.getItem("athar_saved_books");
      if (storedSaved) setSavedBooks(JSON.parse(storedSaved));

      const storedProgress = localStorage.getItem("athar_book_progress");
      if (storedProgress) setReadingProgress(JSON.parse(storedProgress));
    } catch {
      // Ignore
    }
  }, []);

  // Toggle bookmark handler
  const toggleBookmark = (slug: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSavedBooks((prev) => {
      const updated = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      try {
        localStorage.setItem("athar_saved_books", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Extract all unique topics
  const allTopics = useMemo(() => {
    const topicsSet = new Set<string>();
    BOOKS.forEach((b) => {
      b.topics?.forEach((t) => topicsSet.add(t));
    });
    return Array.from(topicsSet);
  }, []);

  // Total in-progress books
  const inProgressSlugs = useMemo(() => {
    return Object.keys(readingProgress).filter((slug) => (readingProgress[slug]?.currentPage || 0) > 1);
  }, [readingProgress]);

  // Filtered and sorted books
  const filteredBooks = useMemo(() => {
    return BOOKS.filter((book) => {
      // Tab 2: My Library filter
      if (activeTab === "my-library") {
        const isSaved = savedBooks.includes(book.slug);
        const hasProgress = inProgressSlugs.includes(book.slug);
        if (!isSaved && !hasProgress) return false;
      }

      // Category filter
      if (activeCategory && book.category !== activeCategory) return false;

      // Topic filter
      if (selectedTopic && !book.topics?.includes(selectedTopic)) return false;

      // Rights status filter
      if (rightsFilter === "downloadable" && !book.downloadUrl) return false;
      if (rightsFilter === "public-domain" && book.rightsStatus !== "PUBLIC_DOMAIN") return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = book.title.toLowerCase().includes(q);
        const matchAuthor = book.author.toLowerCase().includes(q);
        const matchDesc = book.description.toLowerCase().includes(q);
        const matchCategory = book.category.toLowerCase().includes(q);
        const matchTopic = book.topics?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchAuthor && !matchDesc && !matchCategory && !matchTopic) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "featured") {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      }
      if (sortBy === "pagesAsc") return a.pages - b.pages;
      if (sortBy === "pagesDesc") return b.pages - a.pages;
      if (sortBy === "title") return a.title.localeCompare(b.title, "ar");
      if (sortBy === "downloadable") {
        if (a.downloadUrl && !b.downloadUrl) return -1;
        if (!a.downloadUrl && b.downloadUrl) return 1;
        return 0;
      }
      return 0;
    });
  }, [BOOKS, activeTab, savedBooks, inProgressSlugs, activeCategory, selectedTopic, rightsFilter, searchQuery, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setActiveCategory(null);
    setSelectedTopic(null);
    setRightsFilter("all");
    setSortBy("featured");
  };

  return (
    <div className="min-h-screen pb-20 space-y-8 text-right" dir="rtl">
      {/* ─── Unified Luxury Islamic PageHero ─── */}
      <PageHero
        breadcrumbs={[
          { label: "الرئيسية", href: "/" },
          { label: "المكتبة الإسلامية الجامعة" },
        ]}
        title="المكتبة الإسلامية الجامعة"
        subtitle="خزانة علمية تراثية ومعاصرة تضم أمهات كتب التفسير، الحديث، العقيدة، الفقه، والتزكية، متاحة للقراءة الرقمية المباشرة والتحميل القانوني المصرح به."
        badges={[
          { label: `${toArabicNumber(BOOKS.length)} مصنفاً إسلامياً معتمداً`, icon: Library, variant: "emerald" },
          { label: `${toArabicNumber(CATEGORIES.length)} أبواب علمية تخصصية`, icon: Scroll, variant: "gold" },
          { label: "تراث قانوني وموثق 100%", icon: ShieldCheck, variant: "default" },
        ]}
        tabs={[
          { id: "catalog", label: "المكتبة الشاملة", icon: Library, count: toArabicNumber(BOOKS.length) },
          { id: "my-library", label: "مكتبتي وسجل القراءة", icon: BookmarkCheck, count: toArabicNumber(savedBooks.length + inProgressSlugs.length) },
        ]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as any)}
        theme="emerald"
      />

      <Container size="2xl" className="space-y-8">
        {/* ─── Search, Filters & Controls Bar ─── */}
        <div className="space-y-4 bg-card/60 backdrop-blur-md border border-border/80 p-5 rounded-3xl shadow-xs">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن كتاب، مؤلف، مسألة، أو موضوع في المكتبة..."
                className="w-full pl-10 pr-11 py-3 bg-background border border-border/80 rounded-2xl text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[var(--athar-green)]/30 focus:border-[var(--athar-green)] transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort & Rights Selector Controls */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Rights Filter */}
              <div className="flex items-center bg-background border border-border/80 rounded-2xl px-3 py-2 text-xs text-muted-foreground shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 ml-1.5 text-[var(--athar-green)]" />
                <select
                  value={rightsFilter}
                  onChange={(e) => setRightsFilter(e.target.value)}
                  aria-label="تصفية حسب حقوق التحميل"
                  className="bg-transparent border-none focus:outline-none text-foreground cursor-pointer text-xs"
                >
                  <option value="all">كل الحقوق والرخص</option>
                  <option value="downloadable">تحميل مباشر متاح (PDF)</option>
                  <option value="public-domain">الملك العام التراثي</option>
                </select>
              </div>

              {/* Sorting Selector */}
              <div className="flex items-center bg-background border border-border/80 rounded-2xl px-3 py-2 text-xs text-muted-foreground shadow-xs">
                <ArrowUpDown className="w-3.5 h-3.5 ml-1.5 text-amber-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="ترتيب الكتب"
                  className="bg-transparent border-none focus:outline-none text-foreground cursor-pointer text-xs"
                >
                  <option value="featured">المميزة والموصى بها</option>
                  <option value="title">أبجدياً بالاسم</option>
                  <option value="pagesDesc">الأكثر صفحات (الموسوعات)</option>
                  <option value="pagesAsc">المختصرات والمتون</option>
                  <option value="downloadable">المصرح بتحميلها أولاً</option>
                </select>
              </div>
            </div>
          </div>

          {/* ─── 10 Core Category Filter Chips ─── */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setActiveCategory(null);
                setSelectedTopic(null);
              }}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer",
                !activeCategory
                  ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-xs"
                  : "bg-background border-border/80 hover:border-[var(--athar-green)]/40 text-muted-foreground hover:text-foreground"
              )}
            >
              جميع الأبواب ({toArabicNumber(BOOKS.length)})
            </button>
            {CATEGORIES.map((cat) => {
              const count = BOOKS.filter((b) => b.category === cat).length;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(isActive ? null : cat);
                    setSelectedTopic(null);
                  }}
                  className={cn(
                    "px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-all flex items-center gap-1.5 cursor-pointer",
                    isActive
                      ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-xs"
                      : "bg-background border-border/80 hover:border-[var(--athar-green)]/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{cat}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full",
                      isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {toArabicNumber(count)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ─── Popular Topics Hashtags ─── */}
          {allTopics.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-border/40">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 ml-1">
                <Tag className="w-3 h-3 text-amber-500" /> مباحث شائعة:
              </span>
              {allTopics.slice(0, 12).map((topic) => {
                const isSelected = selectedTopic === topic;
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSelectedTopic(isSelected ? null : topic)}
                    className={cn(
                      "text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer",
                      isSelected
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-semibold"
                        : "bg-background border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    #{topic}
                  </button>
                );
              })}
              {selectedTopic && (
                <button
                  type="button"
                  onClick={() => setSelectedTopic(null)}
                  className="text-[11px] text-red-500 hover:underline px-1 cursor-pointer"
                >
                  إلغاء تصفية المبحث
                </button>
              )}
            </div>
          )}
        </div>

        {/* ─── Active Tab 2 Header Banner: My Library ─── */}
        {activeTab === "my-library" && (
          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-arabic text-foreground">
                  مكتبتي الشخصية وسجل متابعة القراءة
                </h3>
                <p className="text-xs text-muted-foreground font-arabic">
                  جميع الكتب التي قمت بحفظها أو بدأت في قراءتها وتصفحها داخل المنصة.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-arabic">
              <span className="px-3 py-1.5 rounded-xl bg-background border border-border/80 font-medium">
                المحفوظة: <strong className="text-[var(--athar-green)]">{toArabicNumber(savedBooks.length)}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-background border border-border/80 font-medium">
                قيد القراءة: <strong className="text-amber-600">{toArabicNumber(inProgressSlugs.length)}</strong>
              </span>
            </div>
          </div>
        )}

        {/* ─── Books Grid ─── */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl border border-dashed border-border/80 p-8 space-y-3">
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <h3 className="text-lg font-bold font-arabic text-foreground">لم يتم العثور على كتب مطابقة</h3>
            <p className="text-xs text-muted-foreground font-arabic max-w-md mx-auto leading-relaxed">
              {activeTab === "my-library"
                ? "لم تقم بحفظ أي كتاب في مكتبتك بعد. تصفح المكتبة الشاملة وانقر على علامة الحفظ أو ابدأ القراءة."
                : "جرب البحث بكلمات أخرى أو اختر تصنيفاً أو موضوعاً مختلفاً."}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-[var(--athar-green)]/15 hover:bg-[var(--athar-green)] text-[var(--athar-green)] hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                إعادة ضبط خيارات البحث والتصفية
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-arabic">
              <span>
                عرض {toArabicNumber(filteredBooks.length)} مصنفاً إسلامياً
              </span>
              {(activeCategory || selectedTopic || searchQuery || rightsFilter !== "all") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>مسح جميع الفلاتر</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const isBookmarked = savedBooks.includes(book.slug);
                const progress = readingProgress[book.slug];

                return (
                  <BookCard
                    key={book.slug}
                    book={book}
                    isBookmarked={isBookmarked}
                    onBookmarkToggle={toggleBookmark}
                    onOpenReader={(b) => setActiveReaderBook(b)}
                    progress={progress}
                  />
                );
              })}
            </div>
          </div>
        )}
      </Container>

      {/* ─── Interactive In-Browser Reading Modal ─── */}
      <BookReaderModal
        book={activeReaderBook}
        isOpen={!!activeReaderBook}
        onClose={() => setActiveReaderBook(null)}
        onBookmarkToggle={toggleBookmark}
        isBookmarked={activeReaderBook ? savedBooks.includes(activeReaderBook.slug) : false}
      />
    </div>
  );
}
