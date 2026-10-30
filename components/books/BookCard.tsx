"use client";

import React from "react";
import Link from "next/link";
import { 
  BookOpen, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  Download, 
  Share2, 
  Check, 
  Clock, 
  Scroll, 
  Flame, 
  ShieldCheck,
  BookText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Book } from "@/data/books";
import { toArabicNumber, cn } from "@/lib/utils";

interface BookCardProps {
  book: Book;
  isBookmarked: boolean;
  onBookmarkToggle: (slug: string, e?: React.MouseEvent) => void;
  onOpenReader?: (book: Book) => void;
  progress?: { currentPage: number; totalPages: number; percentage: number };
}

export default function BookCard({
  book,
  isBookmarked,
  onBookmarkToggle,
  onOpenReader,
  progress,
}: BookCardProps) {
  const [copiedLink, setCopiedLink] = React.useState(false);
  const themeGradient = book.themeColor || "from-emerald-900 to-teal-950";

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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
    <div
      className={cn(
        "group relative bg-card border border-border/80 hover:border-[var(--athar-green)]/40 rounded-3xl p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden",
        isBookmarked && "ring-1 ring-amber-400/40"
      )}
    >
      {/* Ambient background glow on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--athar-green)]/5 rounded-full blur-2xl group-hover:bg-[var(--athar-green)]/15 transition-all pointer-events-none" />

      <div>
        {/* ─── Top Badges & Actions ─── */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--athar-green)]/10 text-[var(--athar-green)] border border-[var(--athar-green)]/20 font-arabic">
              {book.category}
            </span>
            {book.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Flame className="w-2.5 h-2.5" />
                <span>{book.badge}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-xl border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="مشاركة رابط الكتاب"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            {/* Bookmark Button */}
            <button
              type="button"
              onClick={(e) => onBookmarkToggle(book.slug, e)}
              className={cn(
                "p-1.5 rounded-xl border transition-all cursor-pointer",
                isBookmarked
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs"
                  : "border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title={isBookmarked ? "إزالة من كتبي المحفوظة" : "حفظ في مكتبتي"}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* ─── 3D Book Cover & Basic Info Row ─── */}
        <div className="flex gap-4 items-start mb-3.5">
          {/* 3D Simulated Book Cover */}
          <Link
            href={`/library/${book.slug}`}
            className="relative shrink-0 w-24 sm:w-28 aspect-[3/4.2] rounded-xl shadow-md overflow-hidden group-hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
          >
            <div
              className={cn(
                "w-full h-full bg-gradient-to-br p-2.5 flex flex-col justify-between text-white relative border border-white/20 select-none",
                themeGradient
              )}
            >
              {/* Spine texture */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-black/35 border-l border-white/20" />
              
              <div className="text-[8px] font-mono opacity-80 truncate pl-2">
                {book.subcategory || book.category}
              </div>

              <div className="text-center my-auto px-1">
                <BookText className="w-4 h-4 text-amber-300 mx-auto mb-1 opacity-90" />
                <h4 className="font-arabic font-extrabold text-[11px] leading-tight text-white line-clamp-3 drop-shadow-sm">
                  {book.title}
                </h4>
              </div>

              <div className="text-[8px] text-center pt-1 border-t border-white/20 opacity-90 truncate">
                {book.author.split(" ").slice(0, 3).join(" ")}
              </div>
            </div>
          </Link>

          {/* Book Information */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <Link href={`/library/${book.slug}`} className="block group-hover:text-[var(--athar-green)] transition-colors">
              <h3 className="font-bold font-arabic text-base sm:text-lg text-foreground leading-snug line-clamp-2">
                {book.title}
              </h3>
            </Link>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-arabic">
              <span className="font-medium text-foreground">{book.author}</span>
              {book.authorEra && (
                <span className="text-[11px] text-muted-foreground/70">({book.authorEra})</span>
              )}
            </div>

            <p className="text-xs text-muted-foreground font-arabic leading-relaxed line-clamp-2 pt-0.5">
              {book.description}
            </p>

            {/* Metadata Pills */}
            <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md font-mono">
                <Scroll className="w-3 h-3 text-[var(--athar-green)]" />
                <span>{toArabicNumber(book.pages)} صفحة</span>
              </span>

              {book.rightsStatus && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{book.rightsStatus === "PUBLIC_DOMAIN" ? "ملك عام" : "مرخص للنشر"}</span>
                </span>
              )}

              {book.fileSize && (
                <span className="text-[10px] font-mono text-muted-foreground/80 hidden sm:inline">
                  [{book.fileSize}]
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ─── Reading Progress if Available ─── */}
        {progress && progress.currentPage > 1 && (
          <div className="mb-3.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-arabic space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>واصلت لصفحة {toArabicNumber(progress.currentPage)}</span>
              </span>
              <span className="font-mono text-amber-900 dark:text-amber-200">
                {toArabicNumber(progress.percentage)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-amber-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* ─── Topic Tags ─── */}
        {book.topics && book.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {book.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-arabic"
              >
                #{topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ─── Bottom Actions Bar ─── */}
      <div className="pt-3 border-t border-border/60 flex items-center gap-2">
        {/* Read Button (Triggers embedded reader or details) */}
        <button
          type="button"
          onClick={() => onOpenReader ? onOpenReader(book) : null}
          className="flex-1 py-2 px-3.5 rounded-xl bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{progress && progress.currentPage > 1 ? "متابعة القراءة" : "اقرأ الآن"}</span>
        </button>

        {/* Details Link */}
        <Link
          href={`/library/${book.slug}`}
          className="py-2 px-3 rounded-xl border border-border/80 hover:border-[var(--athar-green)]/40 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors text-center"
          title="عرض تفاصيل الكتاب والتحقيق"
        >
          <span>التفاصيل</span>
        </Link>

        {/* Direct Download button if present */}
        {book.downloadUrl && (
          <a
            href={book.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl border border-border/80 hover:border-[var(--athar-green)]/40 hover:bg-muted text-muted-foreground hover:text-[var(--athar-green)] transition-colors"
            title={`تنزيل نسخة PDF (${book.fileSize || "مباشر"})`}
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
