"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Download, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Check, 
  Clock, 
  ShieldCheck, 
  Scroll, 
  RotateCcw,
  Sparkles,
  BookText
} from "lucide-react";
import { Book } from "@/data/books";
import BookReaderModal from "@/components/books/BookReaderModal";
import { toArabicNumber, cn } from "@/lib/utils";

interface BookDetailClientProps {
  book: Book;
}

export default function BookDetailClient({ book }: BookDetailClientProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState<{
    currentPage: number;
    totalPages: number;
    percentage: number;
  } | null>(null);

  // Load bookmark and progress
  useEffect(() => {
    try {
      const storedSaved = localStorage.getItem("athar_saved_books");
      if (storedSaved) {
        const savedList: string[] = JSON.parse(storedSaved);
        setIsBookmarked(savedList.includes(book.slug));
      }

      const storedProgress = localStorage.getItem("athar_book_progress");
      if (storedProgress) {
        const progressMap = JSON.parse(storedProgress);
        if (progressMap[book.slug]) {
          setReadingProgress(progressMap[book.slug]);
        }
      }
    } catch {
      // Ignore
    }
  }, [book.slug]);

  // Toggle bookmark
  const toggleBookmark = () => {
    try {
      const storedSaved = localStorage.getItem("athar_saved_books");
      let savedList: string[] = storedSaved ? JSON.parse(storedSaved) : [];
      let updated: string[];
      if (savedList.includes(book.slug)) {
        updated = savedList.filter((s) => s !== book.slug);
        setIsBookmarked(false);
      } else {
        updated = [...savedList, book.slug];
        setIsBookmarked(true);
      }
      localStorage.setItem("athar_saved_books", JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Handle Share
  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
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
    <>
      <div className="space-y-4 pt-4 border-t border-border/60">
        {/* Reading progress banner if started */}
        {readingProgress && readingProgress.currentPage > 1 && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs font-arabic">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="font-semibold text-foreground">
                  أنت عند صفحة {toArabicNumber(readingProgress.currentPage)} من أصل {toArabicNumber(readingProgress.totalPages)}
                </span>
                <span className="text-[11px] text-muted-foreground mr-1.5 font-mono">
                  ({toArabicNumber(readingProgress.percentage)}%)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReaderOpen(true)}
              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              متابعة القراءة الآن
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {/* Main Read Online Button */}
          <button
            type="button"
            onClick={() => setIsReaderOpen(true)}
            className="flex-1 min-w-[220px] flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[var(--athar-green)] text-white font-bold text-sm hover:opacity-95 shadow-md shadow-[var(--athar-green)]/20 transition-all text-center cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>
              {readingProgress && readingProgress.currentPage > 1 ? "متابعة القراءة الرقمية" : "قراءة وتصفح الكتاب إلكترونياً"}
            </span>
          </button>

          {/* Download PDF button if authorized */}
          {book.downloadUrl && (
            <a
              href={book.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors shadow-xs"
              title={`تنزيل نسخة PDF الرسمية (${book.fileSize || "مباشر"})`}
            >
              <Download className="w-4 h-4" />
              <span>تحميل {book.fileSize ? `(${book.fileSize})` : "PDF"}</span>
            </a>
          )}

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={toggleBookmark}
            className={cn(
              "px-4 py-3.5 rounded-2xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
              isBookmarked
                ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs"
                : "bg-card border-border/80 hover:bg-muted text-foreground"
            )}
            title={isBookmarked ? "إزالة من كتبي المحفوظة" : "حفظ في مكتبتي"}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
            <span>{isBookmarked ? "في مكتبتي" : "حفظ الكتاب"}</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-3.5 rounded-2xl border border-border/80 hover:bg-muted text-foreground transition-colors cursor-pointer"
            title="مشاركة رابط الكتاب"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* External Source Link */}
          {book.sourceUrl && (
            <a
              href={book.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3.5 rounded-2xl border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors flex items-center gap-1.5"
              title="صفحة الكتاب في المصدر المعتمد"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">المصدر الأصلي</span>
            </a>
          )}
        </div>
      </div>

      {/* ─── Reader Modal ─── */}
      <BookReaderModal
        book={book}
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        onBookmarkToggle={toggleBookmark}
        isBookmarked={isBookmarked}
      />
    </>
  );
}
