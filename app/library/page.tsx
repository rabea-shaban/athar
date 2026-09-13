"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  ExternalLink, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Eye, 
  X, 
  Share2, 
  Library, 
  Scroll, 
  Flame, 
  Check, 
  ArrowUpDown, 
  BookText,
  Tag
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BOOKS, CATEGORIES, Book } from "@/data/books";
import Container from "@/components/layout/Container";

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"featured" | "pagesAsc" | "pagesDesc" | "title">("featured");
  const [savedBooks, setSavedBooks] = useState<string[]>([]);
  const [onlySaved, setOnlySaved] = useState(false);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load saved bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("athar_saved_books");
      if (stored) {
        setSavedBooks(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Toggle bookmark
  const toggleBookmark = (slug: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: string[];
    if (savedBooks.includes(slug)) {
      updated = savedBooks.filter((s) => s !== slug);
    } else {
      updated = [...savedBooks, slug];
    }
    setSavedBooks(updated);
    try {
      localStorage.setItem("athar_saved_books", JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Extract all unique topics
  const allTopics = useMemo(() => {
    const topicsSet = new Set<string>();
    BOOKS.forEach((b) => {
      b.topics?.forEach((t) => topicsSet.add(t));
    });
    return Array.from(topicsSet);
  }, []);

  // Filtered and sorted books
  const filteredBooks = useMemo(() => {
    return BOOKS.filter((book) => {
      if (onlySaved && !savedBooks.includes(book.slug)) return false;
      if (activeCategory && book.category !== activeCategory) return false;
      if (selectedTopic && !book.topics?.includes(selectedTopic)) return false;

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
      return 0;
    });
  }, [searchQuery, activeCategory, selectedTopic, sortBy, savedBooks, onlySaved]);

  const handleShare = (book: Book, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = typeof window !== "undefined" ? `${window.location.origin}/library/${book.slug}` : "";
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `${book.title} - ${book.author} | عبر منصة أثر`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <Container size="2xl" className="py-8 space-y-8">
      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/40 via-card/70 to-card border border-border/80 p-6 md:p-10 shadow-lg text-center">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[var(--athar-green)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--athar-green)]/15 border border-[var(--athar-green)]/30 text-[var(--athar-green)] text-xs font-semibold shadow-sm">
            <Library className="w-3.5 h-3.5" />
            <span>مكتبة أَثَر الرقمية الموثقة</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-arabic text-foreground">
            المكتبة الإسلامية الجامعة
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            مجموعة منتقاة من أمهات الكتب ومتون العلم الشرعي في العقيدة، الحديث، التفسير، والفقه، مع روابط تصفح وقراءة رقمية ميسرة.
          </p>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-2xl mx-auto">
            <div className="p-3 rounded-2xl bg-card/60 backdrop-blur border border-border/50 shadow-sm">
              <div className="text-xl md:text-2xl font-bold text-[var(--athar-green)] font-arabic">{BOOKS.length}</div>
              <div className="text-xs text-muted-foreground">أمهات الكتب والمتون</div>
            </div>
            <div className="p-3 rounded-2xl bg-card/60 backdrop-blur border border-border/50 shadow-sm">
              <div className="text-xl md:text-2xl font-bold text-amber-500 font-arabic">{CATEGORIES.length}</div>
              <div className="text-xs text-muted-foreground">أقسام وتصنيفات</div>
            </div>
            <div className="p-3 rounded-2xl bg-card/60 backdrop-blur border border-border/50 shadow-sm">
              <div className="text-xl md:text-2xl font-bold text-teal-500 font-arabic">
                {BOOKS.reduce((acc, b) => acc + b.pages, 0).toLocaleString("ar-EG")}
              </div>
              <div className="text-xs text-muted-foreground">صفحة علمية مؤصلة</div>
            </div>
            <div className="p-3 rounded-2xl bg-card/60 backdrop-blur border border-border/50 shadow-sm">
              <div className="text-xl md:text-2xl font-bold text-purple-400 font-arabic">{savedBooks.length}</div>
              <div className="text-xs text-muted-foreground">كتبك المحفوظة</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Search & Controls Bar ─── */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن كتاب، مؤلف، موضوع أو مسألة..."
              className="w-full pl-10 pr-11 py-3 bg-card/90 border border-border/80 rounded-2xl text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[var(--athar-green)]/30 focus:border-[var(--athar-green)] transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort & Bookmarks Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center bg-card border border-border/80 rounded-2xl px-3 py-2 text-xs text-muted-foreground shadow-sm">
              <ArrowUpDown className="w-3.5 h-3.5 ml-2 text-[var(--athar-green)]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="ترتيب الكتب"
                className="bg-transparent border-none focus:outline-none text-foreground cursor-pointer text-xs"
              >
                <option value="featured">المميزة والموصى بها</option>
                <option value="title">أبجدياً بالاسم</option>
                <option value="pagesDesc">الأكثر صفحات</option>
                <option value="pagesAsc">الأقل صفحات (متون ومختصرات)</option>
              </select>
            </div>

            <button
              onClick={() => setOnlySaved(!onlySaved)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-medium border transition-all shadow-sm ${
                onlySaved
                  ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-[var(--athar-green)]/20"
                  : "bg-card border-border/80 text-muted-foreground hover:border-[var(--athar-green)]/40 hover:text-foreground"
              }`}
            >
              {onlySaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>المحفوظة ({savedBooks.length})</span>
            </button>
          </div>
        </div>

        {/* ─── Category Filter Chips ─── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              setActiveCategory(null);
              setSelectedTopic(null);
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
              !activeCategory
                ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-sm"
                : "bg-card border-border/80 hover:border-[var(--athar-green)]/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            جميع الأقسام ({BOOKS.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = BOOKS.filter((b) => b.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(isActive ? null : cat);
                  setSelectedTopic(null);
                }}
                className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-sm"
                    : "bg-card border-border/80 hover:border-[var(--athar-green)]/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ─── Secondary Topic Tags ─── */}
        {allTopics.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 ml-1">
              <Tag className="w-3 h-3 text-amber-500" /> موضوعات شائعة:
            </span>
            {allTopics.slice(0, 10).map((topic) => {
              const isSelected = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(isSelected ? null : topic)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-semibold"
                      : "bg-card/60 border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  #{topic}
                </button>
              );
            })}
            {selectedTopic && (
              <button
                onClick={() => setSelectedTopic(null)}
                className="text-[11px] text-red-400 hover:underline px-1"
              >
                إلغاء تصفية الموضوع
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── Books Grid ─── */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-16 bg-card/50 rounded-3xl border border-dashed border-border/80 p-8">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1">لم يتم العثور على كتب مطابقة</h3>
          <p className="text-xs text-muted-foreground mb-4">
            جرب البحث بكلمات أخرى أو اختر تصنيفاً أو موضوعاً مختلفاً.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory(null);
              setSelectedTopic(null);
              setOnlySaved(false);
            }}
            className="px-4 py-2 rounded-xl bg-[var(--athar-green)]/15 text-[var(--athar-green)] text-xs font-semibold hover:bg-[var(--athar-green)]/25 transition-colors"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => {
            const isBookmarked = savedBooks.includes(book.slug);
            const themeGradient = book.themeColor || "from-emerald-900 to-teal-950";

            return (
              <div
                key={book.slug}
                className="group relative flex flex-col rounded-3xl border border-border/80 bg-card hover:border-[var(--athar-green)]/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* ─── Luxury 3D Book Spine & Cover Area ─── */}
                <div className={`relative h-48 bg-gradient-to-br ${themeGradient} p-5 flex flex-col justify-between overflow-hidden text-white`}>
                  {/* Decorative Islamic Geometric Pattern Overlay */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                  <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
                  
                  {/* Book spine simulation effect on right */}
                  <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-black/25 border-l border-white/15" />

                  {/* Top Header of the Book Cover */}
                  <div className="relative z-10 flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 font-medium">
                        {book.category}
                      </span>
                      {book.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/90 text-amber-950 font-bold flex items-center gap-1 shadow-sm">
                          <Flame className="w-2.5 h-2.5" />
                          {book.badge}
                        </span>
                      )}
                    </div>

                    {/* Bookmark Toggle Button */}
                    <button
                      onClick={(e) => toggleBookmark(book.slug, e)}
                      aria-label="حفظ في المفضلة"
                      className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
                        isBookmarked
                          ? "bg-amber-400 text-amber-950 border-amber-300 shadow-md"
                          : "bg-black/30 hover:bg-black/50 text-white/80 hover:text-white border-white/10"
                      }`}
                      title={isBookmarked ? "إزالة من المحفوظات" : "حفظ في قائمة القراءة"}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 fill-current" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Book Title & Islamic Motif */}
                  <div className="relative z-10 my-auto text-center px-4">
                    <div className="inline-block p-1.5 rounded-xl bg-white/10 mb-2 border border-white/15 backdrop-blur-sm">
                      <BookText className="w-5 h-5 text-amber-300" />
                    </div>
                    <h3 className="font-arabic font-extrabold text-lg line-clamp-2 leading-relaxed text-white drop-shadow-sm">
                      {book.title}
                    </h3>
                  </div>

                  {/* Cover Bottom: Author & Era */}
                  <div className="relative z-10 flex items-center justify-between text-[11px] text-white/80 border-t border-white/15 pt-2">
                    <span className="font-medium truncate max-w-[170px]">{book.author}</span>
                    {book.authorEra && (
                      <span className="text-white/60 text-[10px] bg-black/20 px-2 py-0.5 rounded-md">
                        {book.authorEra}
                      </span>
                    )}
                  </div>
                </div>

                {/* ─── Book Body Details ─── */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {book.description}
                    </p>

                    {/* Topics */}
                    {book.topics && book.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {book.topics.slice(0, 3).map((topic) => (
                          <span
                            key={topic}
                            onClick={() => setSelectedTopic(topic)}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground hover:bg-[var(--athar-green)]/15 hover:text-[var(--athar-green)] cursor-pointer transition-colors"
                          >
                            #{topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Meta Details */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Scroll className="w-3.5 h-3.5 text-[var(--athar-green)]" />
                      <span>{book.pages.toLocaleString("ar-EG")} صفحة</span>
                    </div>

                    <button
                      onClick={(e) => handleShare(book, e)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="مشاركة الكتاب"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* ─── Action Buttons ─── */}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/library/${book.slug}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[var(--athar-green)] text-white text-xs font-semibold hover:opacity-95 shadow-sm transition-all text-center"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>صفحة الكتاب</span>
                    </Link>

                    <button
                      onClick={() => setPreviewBook(book)}
                      className="px-3.5 py-2.5 rounded-xl border border-border/80 hover:border-[var(--athar-green)]/50 hover:bg-[var(--athar-green)]/5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                      title="معاينة سريعة"
                    >
                      معاينة
                    </button>

                    {book.readUrl && (
                      <a
                        href={book.readUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl border border-border/80 hover:border-[var(--athar-green)]/50 hover:bg-[var(--athar-green)]/5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        title="قراءة في المصدر المفتوح"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Quick Preview Modal ─── */}
      {previewBook && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewBook(null)}
        >
          <div
            className="bg-card border border-border/80 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setPreviewBook(null)}
              className="absolute left-4 top-4 p-2 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Book Header info */}
            <div className="flex gap-4 items-start">
              <div className={`w-20 h-28 rounded-xl bg-gradient-to-br ${previewBook.themeColor || "from-emerald-900 to-teal-950"} p-2.5 flex flex-col justify-between shrink-0 text-white shadow-md`}>
                <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded text-center truncate">
                  {previewBook.category}
                </span>
                <BookOpen className="w-6 h-6 text-amber-300 mx-auto" />
                <span className="text-[9px] text-center text-white/70">أَثَر</span>
              </div>

              <div className="space-y-1.5 flex-1 pr-2">
                <Badge variant="secondary" className="text-[11px] mb-1">
                  {previewBook.category}
                </Badge>
                <h2 className="text-lg md:text-xl font-bold font-arabic text-foreground">
                  {previewBook.title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  تأليف: <strong className="text-foreground">{previewBook.author}</strong> {previewBook.authorEra && `(${previewBook.authorEra})`}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-[var(--athar-green)]" />
                    <span>{previewBook.pages} صفحة</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                    <span>{previewBook.topics?.length || 0} موضوعات</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 bg-muted/40 p-4 rounded-2xl border border-border/60">
              <h4 className="text-xs font-bold text-foreground">نبذة عن الكتاب:</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {previewBook.description}
              </p>
            </div>

            {/* Topics */}
            {previewBook.topics && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground">أبرز المحاور والمباحث:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {previewBook.topics.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-[var(--athar-green)]/10 text-[var(--athar-green)] font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Link
                href={`/library/${previewBook.slug}`}
                className="flex-1 py-3 rounded-xl bg-[var(--athar-green)] text-white text-xs font-bold text-center hover:opacity-90 transition-opacity"
              >
                الانتقال لصفحة الكتاب الكاملة
              </Link>

              {previewBook.readUrl && (
                <a
                  href={previewBook.readUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-border/80 hover:bg-muted text-xs font-medium text-foreground transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>تصفح المخطوط / الكتاب</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Copy notification toast */}
      {copiedLink && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2 rounded-full text-xs shadow-lg flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-3.5 h-3.5 text-[var(--athar-green)]" />
          <span>تم نسخ رابط الكتاب بنجاح</span>
        </div>
      )}
    </Container>
  );
}

