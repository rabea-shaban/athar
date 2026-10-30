"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Download, 
  ExternalLink, 
  BookOpen, 
  Bookmark, 
  BookmarkCheck, 
  Check, 
  HelpCircle,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import { Book } from "@/data/books";
import { toArabicNumber, cn } from "@/lib/utils";

interface BookReaderModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onBookmarkToggle?: (slug: string) => void;
  isBookmarked?: boolean;
}

interface BookProgress {
  currentPage: number;
  totalPages: number;
  percentage: number;
  lastReadAt: string;
}

export default function BookReaderModal({
  book,
  isOpen,
  onClose,
  onBookmarkToggle,
  isBookmarked = false,
}: BookReaderModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progressPage, setProgressPage] = useState<number>(1);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Load reading progress for this book
  useEffect(() => {
    if (!book) return;
    try {
      const stored = localStorage.getItem("athar_book_progress");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[book.slug]) {
          setProgressPage(parsed[book.slug].currentPage || 1);
        } else {
          setProgressPage(1);
        }
      }
    } catch {
      // Ignore
    }
    setIframeLoaded(false);
  }, [book]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isFullscreen, onClose]);

  if (!isOpen || !book) return null;

  const totalPages = book.pages || 100;
  const currentPercentage = Math.min(100, Math.max(1, Math.round((progressPage / totalPages) * 100)));

  // Save progress handler
  const handleSaveProgress = (pageToSave: number) => {
    const validPage = Math.min(totalPages, Math.max(1, pageToSave));
    setProgressPage(validPage);
    try {
      const stored = localStorage.getItem("athar_book_progress");
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[book.slug] = {
        currentPage: validPage,
        totalPages,
        percentage: Math.round((validPage / totalPages) * 100),
        lastReadAt: new Date().toISOString(),
      };
      localStorage.setItem("athar_book_progress", JSON.stringify(parsed));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      // Ignore
    }
  };

  // Determine reader source URL
  const readerSrc = book.embedUrl || book.readUrl;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        className={cn(
          "bg-card border border-border/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 w-full",
          isFullscreen
            ? "fixed inset-0 rounded-none border-none h-screen max-h-screen"
            : "max-w-6xl h-[92vh] max-h-[950px]"
        )}
      >
        {/* ─── Reader Top Control Bar ─── */}
        <div className="bg-[#051c14] border-b border-emerald-900/50 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
          {/* Right: Book Title & Metadata */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  {book.category}
                </span>
                {book.rightsStatus && (
                  <span className="text-[10px] text-emerald-200/80 hidden sm:inline-block">
                    • {book.rightsStatus === "PUBLIC_DOMAIN" ? "ملك عام" : "قراءة مصرح بها"}
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-bold font-arabic truncate text-white">
                {book.title}
              </h2>
            </div>
          </div>

          {/* Left: Interactive Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Download PDF button if authorized */}
            {book.downloadUrl && (
              <a
                href={book.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/15"
                title={`تنزيل نسخة PDF (${book.fileSize || "مباشر"})`}
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                <span>تحميل {book.fileSize ? `(${book.fileSize})` : "PDF"}</span>
              </a>
            )}

            {/* Bookmark Button */}
            {onBookmarkToggle && (
              <button
                type="button"
                onClick={() => onBookmarkToggle(book.slug)}
                className={cn(
                  "p-2 rounded-xl border text-xs transition-colors flex items-center gap-1",
                  isBookmarked
                    ? "bg-amber-500 text-slate-950 border-amber-400 font-bold"
                    : "bg-white/10 hover:bg-white/15 text-white border-white/15"
                )}
                title={isBookmarked ? "إزالة من المفضلة" : "إضافة إلى كتبي المحفوظة"}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
                <span className="hidden md:inline">{isBookmarked ? "محفوظ" : "حفظ"}</span>
              </button>
            )}

            {/* External Original Link */}
            {book.sourceUrl && (
              <a
                href={book.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-colors"
                title="فتح في المصدر الأصلي"
              >
                <ExternalLink className="w-4 h-4 text-emerald-300" />
              </a>
            )}

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-colors"
              title={isFullscreen ? "تصغير النافذة" : "ملء الشاشة"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 transition-colors"
              title="إغلاق القارئ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── Reading Progress Sub-Bar ─── */}
        <div className="bg-muted/60 border-b border-border/70 px-4 sm:px-6 py-2 flex items-center justify-between gap-4 text-xs font-arabic">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <span>المؤلف:</span>
              <strong className="text-foreground">{book.author}</strong>
              {book.authorEra && <span className="opacity-70">({book.authorEra})</span>}
            </span>
            <span className="text-muted-foreground/60 hidden sm:inline">|</span>
            <span className="text-muted-foreground hidden sm:inline">
              المصدر: <span className="text-[var(--athar-green)] font-semibold">{book.originalSource || "الأرشيف العالمي"}</span>
            </span>
          </div>

          {/* Page Tracker Control */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-background border border-border/80 px-2.5 py-1 rounded-xl shadow-xs">
              <span className="text-muted-foreground text-[11px]">أنا في صفحة:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={progressPage}
                onChange={(e) => setProgressPage(parseInt(e.target.value) || 1)}
                className="w-12 text-center text-xs font-bold text-foreground bg-transparent border-b border-border/80 focus:outline-none focus:border-[var(--athar-green)]"
              />
              <span className="text-muted-foreground text-[11px]">/ {toArabicNumber(totalPages)}</span>
            </div>

            <button
              type="button"
              onClick={() => handleSaveProgress(progressPage)}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer",
                savedSuccess
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white shadow-xs"
              )}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>تم الحفظ</span>
                </>
              ) : (
                <span>حفظ الموضع</span>
              )}
            </button>
          </div>
        </div>

        {/* ─── Reader Iframe Container ─── */}
        <div className="relative flex-1 bg-slate-900 overflow-hidden">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80 z-10 bg-slate-950/90">
              <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-arabic font-medium">جاري تحميل وثيقة الكتاب والتصفح الرقمي...</p>
              <p className="text-xs text-white/60">يتم جلب النسخة المعتمدة من {book.originalSource || "المستودع الرقمي"}</p>
            </div>
          )}

          {readerSrc ? (
            <iframe
              src={readerSrc}
              title={`قارئ كتاب: ${book.title}`}
              className="w-full h-full border-none"
              allow="fullscreen"
              loading="lazy"
              onLoad={() => setIframeLoaded(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-white space-y-4">
              <HelpCircle className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="text-lg font-bold font-arabic">عذراً، التصفح المدمج غير متاح لهذا المصنف حالياً</h3>
              <p className="text-xs text-white/70 max-w-md">
                يمكنك الاطلاع على الكتاب وتحميل نسخته الرسمية مباشرة عبر المصدر المعتمد.
              </p>
              {book.sourceUrl && (
                <a
                  href={book.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                >
                  فتح المصدر الأصلي
                </a>
              )}
            </div>
          )}
        </div>

        {/* ─── Reader Bottom Progress Bar ─── */}
        <div className="bg-card border-t border-border/70 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 text-xs font-arabic shrink-0">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
              نسبة التقدم ({toArabicNumber(currentPercentage)}%):
            </span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${currentPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
            <span className="hidden sm:inline">
              رخصة المحتوى: <strong className="text-foreground">{book.rightsStatus === "PUBLIC_DOMAIN" ? "ملك عام" : "ترخيص حر"}</strong>
            </span>
            <button
              type="button"
              onClick={() => handleSaveProgress(1)}
              className="hover:text-foreground transition-colors flex items-center gap-1"
              title="إعادة ضبط القراءة إلى البداية"
            >
              <RotateCcw className="w-3 h-3" />
              <span>البدء من جديد</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
