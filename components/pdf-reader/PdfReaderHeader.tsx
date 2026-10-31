"use client";

import React, { useState } from "react";
import {
  X,
  Maximize2,
  Minimize2,
  Download,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
} from "lucide-react";
import { ReaderBook } from "./types";
import { toArabicNumber } from "@/lib/utils";

interface PdfReaderHeaderProps {
  book: ReaderBook;
  pdfUrl: string;
  currentPage: number;
  totalPages: number;
  percentage: number;
  isFullscreen: boolean;
  isBookmarked: boolean;
  onToggleFullscreen: () => void;
  onToggleBookmark: () => void;
  onClose: () => void;
}

export default function PdfReaderHeader({
  book,
  pdfUrl,
  currentPage,
  totalPages,
  percentage,
  isFullscreen,
  isBookmarked,
  onToggleFullscreen,
  onToggleBookmark,
  onClose,
}: PdfReaderHeaderProps) {
  const [copiedLink, setCopiedLink] = useState(false);

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
    <header className="bg-gradient-to-r from-[#031d13] via-[#064E35] to-[#041c14] border-b border-[#0B6245]/70 text-white px-3 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0 shadow-md select-none">
      {/* Right Section: Branding & Book Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C9A227]/25 to-emerald-500/20 border border-[#C9A227]/40 text-[#C9A227] flex items-center justify-center shrink-0 shadow-sm">
          <BookOpen className="w-5 h-5" />
        </div>

        <div className="min-w-0 font-arabic">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-medium">
              {book.category}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A227]/25 text-amber-200 border border-[#C9A227]/40 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>محرك أثر الرقمي المعتمد</span>
            </span>
            {book.authorEra && (
              <span className="text-[10px] text-emerald-200/80 hidden lg:inline-block">
                • {book.authorEra}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <h1 className="text-sm sm:text-base md:text-lg font-bold truncate text-white">
              {book.title}
            </h1>
            <span className="text-xs text-emerald-200/80 hidden sm:inline truncate max-w-[200px]">
              — {book.author}
            </span>
          </div>
        </div>
      </div>

      {/* Center Section: Reading Progress Pill */}
      <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/25 border border-white/10 text-xs font-arabic">
        <span className="text-emerald-300">موضع القراءة:</span>
        <strong className="text-[#C9A227] font-bold">
          صفحة {toArabicNumber(currentPage)}
        </strong>
        <span className="text-white/60">من أصل {toArabicNumber(totalPages)}</span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
          {toArabicNumber(percentage)}%
        </span>
      </div>

      {/* Left Section: Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Direct Download Button */}
        {pdfUrl && (
          <a
            href={pdfUrl}
            download={`${book.slug}.pdf`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C9A227] hover:bg-[#B38F20] text-slate-950 font-bold text-xs transition-colors shadow-sm cursor-pointer"
            title="تنزيل نسخة PDF إلى جهازك"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تحميل {book.fileSize ? `(${book.fileSize})` : "PDF"}</span>
          </a>
        )}

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          title="مشاركة رابط الكتاب"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4 text-emerald-300" />}
          <span className="hidden md:inline">{copiedLink ? "تم النسخ" : "مشاركة"}</span>
        </button>

        {/* Bookmark Toggle */}
        <button
          type="button"
          onClick={onToggleBookmark}
          className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
            isBookmarked
              ? "bg-[#C9A227] text-slate-950 border-[#C9A227] font-bold"
              : "bg-white/10 hover:bg-white/15 text-white border-white/15"
          }`}
          title={isBookmarked ? "إزالة من كتبي المحفوظة" : "إضافة إلى كتبي المحفوظة"}
        >
          {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
          <span className="hidden sm:inline">{isBookmarked ? "محفوظ" : "حفظ"}</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-colors cursor-pointer"
          title={isFullscreen ? "تصغير النافذة" : "ملء الشاشة"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 transition-colors cursor-pointer"
          title="الرجوع إلى تفاصيل الكتاب"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
