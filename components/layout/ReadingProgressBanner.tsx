"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Bookmark, 
  BookmarkCheck,
  BookOpen, 
  ChevronLeft, 
  X,
  Compass
} from "lucide-react";
import Container from "@/components/layout/Container";
import { useReadingStore } from "@/store/readingStore";
import { toArabicNumber, cn } from "@/lib/utils";

export default function ReadingProgressBanner() {
  const {
    surahNumber,
    surahName,
    ayahNumber,
    pageNumber,
    mode,
    readingMarker,
    clearProgress,
  } = useReadingStore();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || dismissed || (!surahNumber && !readingMarker)) return null;

  const isMarker = !!readingMarker;
  const targetSurah = readingMarker ? readingMarker.surahNumber : surahNumber;
  const targetAyah = readingMarker ? readingMarker.ayahNumber : ayahNumber;
  const targetPage = readingMarker ? readingMarker.pageNumber : pageNumber;
  const targetName = (readingMarker ? readingMarker.surahName : surahName).replace(/^سُ?و?رَ?ةُ?\s*/, "");

  const href = `/quran/${targetSurah}#ayah-${targetAyah}`;

  return (
    <Container size="xl" className="pt-4 pb-1">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border p-3.5 sm:p-4 shadow-sm backdrop-blur-md transition-all duration-300",
          isMarker
            ? "border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-card to-card"
            : "border-[var(--athar-green)]/35 bg-gradient-to-r from-[var(--athar-green)]/15 via-card to-card"
        )}
      >
        {/* Subtle decorative background glow */}
        <div
          className={cn(
            "absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-40",
            isMarker ? "bg-amber-500" : "bg-[var(--athar-green)]"
          )}
        />

        <div className="relative z-10 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          {/* Right side: Icon + Information */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Status Icon */}
            <div
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs border transition-colors",
                isMarker
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-[var(--athar-green)]/20 text-[var(--athar-green)] border-[var(--athar-green)]/30"
              )}
            >
              {isMarker ? (
                <BookmarkCheck className="h-5 w-5 fill-current" />
              ) : (
                <BookOpen className="h-5 w-5" />
              )}
            </div>

            {/* Labels & Details */}
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[11px] font-semibold px-2 py-0.5 rounded-md",
                    isMarker
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                      : "bg-[var(--athar-green)]/20 text-[var(--athar-green)]"
                  )}
                >
                  {isMarker ? "علامة الوقوف المحفوظة" : "استكمال التلاوة"}
                </span>

                <span className="text-[11px] text-muted-foreground hidden md:inline-block">
                  {isMarker ? "واصل من حيث وقفت" : "وردك القرآني"}
                </span>
              </div>

              <p className="text-sm font-bold text-foreground font-arabic truncate flex items-center gap-2">
                <span>سورة {targetName}</span>
                <span className="text-muted-foreground/60">·</span>
                <span className="text-xs text-muted-foreground font-sans font-medium">
                  آية {toArabicNumber(targetAyah)}
                </span>
                <span className="text-muted-foreground/60">·</span>
                <span className="text-xs text-muted-foreground font-sans font-medium">
                  صفحة {toArabicNumber(targetPage)}
                </span>
              </p>
            </div>
          </div>

          {/* Left side: Action Button + Close */}
          <div className="flex items-center gap-2 shrink-0 mr-auto sm:mr-0">
            <Link
              href={href}
              className={cn(
                "group flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs",
                isMarker
                  ? "bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold shadow-amber-500/20"
                  : "bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white shadow-[var(--athar-green)]/20"
              )}
            >
              <span>{isMarker ? "اذهب لموضع التوقف" : "متابعة القراءة"}</span>
              <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={() => {
                setDismissed(true);
                clearProgress();
              }}
              className="text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 p-2 rounded-xl transition-colors"
              title="إغلاق وإلغاء العلامة"
              aria-label="إغلاق"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
}

