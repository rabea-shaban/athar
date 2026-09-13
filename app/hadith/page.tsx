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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Container from "@/components/layout/Container";
import { getHadiths, type Hadith } from "@/lib/api/islamic";
import { cn, toArabicNumber } from "@/lib/utils";

interface HadithBookInfo {
  slug: string;
  name: string;
  author: string;
  color: string;
}

const HADITH_BOOKS: HadithBookInfo[] = [
  {
    slug: "bukhari",
    name: "صحيح البخاري",
    author: "الإمام محمد بن إسماعيل البخاري",
    color: "emerald",
  },
  {
    slug: "muslim",
    name: "صحيح مسلم",
    author: "الإمام مسلم بن الحجاج النيسابوري",
    color: "teal",
  },
  {
    slug: "abu-dawud",
    name: "سنن أبي داود",
    author: "الإمام أبو داود السجستاني",
    color: "sky",
  },
  {
    slug: "tirmidzi",
    name: "جامع الترمذي",
    author: "الإمام محمد بن عيسى الترمذي",
    color: "amber",
  },
  {
    slug: "nasai",
    name: "سنن النسائي",
    author: "الإمام أحمد بن شعيب النسائي",
    color: "blue",
  },
  {
    slug: "ibnu-majah",
    name: "سنن ابن ماجه",
    author: "الإمام ابن ماجه القزويني",
    color: "indigo",
  },
  {
    slug: "ahmad",
    name: "مسند أحمد",
    author: "الإمام أحمد بن حنبل",
    color: "violet",
  },
  {
    slug: "malik",
    name: "موطأ مالك",
    author: "الإمام مالك بن أنس",
    color: "rose",
  },
  {
    slug: "darimi",
    name: "سنن الدارمي",
    author: "الإمام عبد الله بن عبد الرحمن الدارمي",
    color: "cyan",
  },
];

const LIMIT = 20;

export default function HadithPage() {
  const [selectedBook, setSelectedBook] = useState<HadithBookInfo>(HADITH_BOOKS[0]);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [jumpPageInput, setJumpPageInput] = useState("");
  const [fontSize, setFontSize] = useState<number>(1); // 0 to 3
  const [copiedNumber, setCopiedNumber] = useState<number | null>(null);

  useEffect(() => {
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
  }, [selectedBook, page]);

  function handleSelectBook(book: HadithBookInfo) {
    setSelectedBook(book);
    setPage(1);
    setQuery("");
  }

  const handleCopyHadith = async (hadith: Hadith) => {
    const text = `« ${hadith.arab} »\n[${selectedBook.name} — رقم الحديث: ${hadith.number}] — منصة أَثَر`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedNumber(hadith.number);
      setTimeout(() => setCopiedNumber(null), 2000);
    } catch {
      // Ignored
    }
  };

  const handleShareHadith = async (hadith: Hadith) => {
    const text = `« ${hadith.arab} »\n[${selectedBook.name} — رقم: ${hadith.number}] — منصة أَثَر`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${selectedBook.name} - حديث رقم ${hadith.number}`,
          text,
          url: window.location.href,
        });
      } catch {
        // Ignored
      }
    } else {
      await navigator.clipboard.writeText(text);
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-muted/10 to-background pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-muted/20 py-10 md:py-12">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--athar-green)]/10 blur-3xl rounded-full" />

        <Container size="2xl" className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--athar-green)]/10 text-[var(--athar-green)] text-xs md:text-sm font-medium mb-4 border border-[var(--athar-green)]/20 shadow-xs">
            <BookMarked className="h-4 w-4" />
            <span>السنة النبوية ودواوين الحديث المعتمدة</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3 font-arabic">
            الحديث النبوي الشريف
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            تصفح وابحث في آلاف الأحاديث النبوية الشريفة من كتب الصحاح والسنن والمسانيد برواياتها المعتمدة وترقيمها الدقيق.
          </p>

          {/* Books Selection Horizontal Carousel / Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap max-w-4xl mx-auto">
            {HADITH_BOOKS.map((book) => {
              const isSelected = selectedBook.slug === book.slug;
              return (
                <button
                  key={book.slug}
                  onClick={() => handleSelectBook(book)}
                  className={cn(
                    "text-xs sm:text-sm px-3.5 py-2 rounded-2xl border transition-all duration-200 font-arabic flex items-center gap-2 shadow-xs",
                    isSelected
                      ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-md font-bold scale-[1.03]"
                      : "bg-card hover:bg-muted/80 border-border/70 text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{book.name}</span>
                </button>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Main Content Area */}
      <Container size="xl" className="py-8">
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Controls Bar: Book Title + Search + Font Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
            {/* Book Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--athar-green)]/10 text-[var(--athar-green)] flex items-center justify-center text-lg shrink-0">
                <BookMarked className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-foreground font-arabic">
                  {selectedBook.name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {selectedBook.author} {totalItems > 0 && `• (${toArabicNumber(totalItems)} حديث)`}
                </p>
              </div>
            </div>

            {/* Actions: Search & Font Size */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* Search Box in current page */}
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
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Font Size Buttons */}
              <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/60">
                <button
                  onClick={() => setFontSize((f) => Math.max(0, f - 1))}
                  disabled={fontSize === 0}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
                  title="تصغير الخط"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-[11px] px-1 font-mono text-muted-foreground">
                  Aa
                </span>
                <button
                  onClick={() => setFontSize((f) => Math.min(fontClasses.length - 1, f + 1))}
                  disabled={fontSize === fontClasses.length - 1}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
                  title="تكبير الخط"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse bg-muted/60 rounded-3xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Hadith Cards List */}
              <div className="space-y-4">
                {filteredHadiths.map((hadith) => {
                  const isCopied = copiedNumber === hadith.number;

                  return (
                    <div
                      key={hadith.number}
                      className="group rounded-3xl border border-border/80 bg-card p-5 md:p-6 transition-all duration-200 hover:border-[var(--athar-green)]/50 hover:shadow-md text-right relative overflow-hidden"
                    >
                      {/* Top Accent bar */}
                      <div className="absolute top-0 right-0 left-0 h-1 bg-transparent group-hover:bg-[var(--athar-green)] transition-all" />

                      {/* Header info */}
                      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-[var(--athar-green)]/10 text-[var(--athar-green)] font-bold text-xs px-2.5 py-1"
                          >
                            {selectedBook.name}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            رقم الحديث: {toArabicNumber(hadith.number)}
                          </Badge>
                        </div>
                      </div>

                      {/* Hadith Text */}
                      <div className="py-2 mb-4">
                        <p
                          className={cn(
                            "font-arabic text-foreground font-normal text-right select-text leading-relaxed tracking-wide",
                            fontClasses[fontSize]
                          )}
                        >
                          {hadith.arab}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs">
                        <span className="text-muted-foreground text-[11px]">
                          من كتاب: {selectedBook.name}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyHadith(hadith)}
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                            title="نسخ الحديث الشريف"
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">تم النسخ</span>
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
                            onClick={() => handleShareHadith(hadith)}
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                            title="مشاركة الحديث"
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

              {/* Empty Search results */}
              {filteredHadiths.length === 0 && (
                <div className="text-center py-16 bg-card border border-border/70 rounded-2xl p-8 shadow-xs">
                  <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <h3 className="text-base font-bold text-foreground mb-1">لم يتم العثور على أحاديث</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    لا توجد أحاديث تطابق &quot;{query}&quot; في الصفحة الحالية.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setQuery("")} className="text-xs">
                    إلغاء البحث
                  </Button>
                </div>
              )}

              {/* Pagination & Jump Page Footer */}
              {!query && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/60">
                  {/* Prev / Next buttons */}
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
            </>
          )}
        </div>
      </Container>
    </div>
  );
}

