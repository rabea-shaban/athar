"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { ReaderBook, ReadingTheme } from "./types";
import { useReadingProgress } from "./hooks/useReadingProgress";
import { usePdfBookmarks } from "./hooks/usePdfBookmarks";
import { usePdfNotes } from "./hooks/usePdfNotes";
import PdfReaderHeader from "./PdfReaderHeader";
import PdfReaderToolbar from "./PdfReaderToolbar";
import PdfBookmarksDrawer from "./PdfBookmarksDrawer";
import PdfNotesDrawer from "./PdfNotesDrawer";
import PdfDossierDrawer from "./PdfDossierDrawer";
import PdfLoadingState from "./PdfLoadingState";
import PdfErrorState from "./PdfErrorState";

// Dynamically load the client-only EmbedPDF viewer with ssr: false
const DynamicEmbedPdf = dynamic(() => import("./EmbedPdfViewerInner"), {
  ssr: false,
  loading: () => <PdfLoadingState />,
});

// Verified books with full local PDFs inside the platform
export const LOCAL_PDF_SLUGS = [
  "abqariyyat-al-siddiq",
  "abqariyyat-muhammad",
  "abqariyyat-umar",
  "akhlaq-hamalat-al-quran-ajurri",
  "al-adab-al-mufrad",
  "al-akhlaq-al-islamiyyah-maydani",
  "al-aqeedah-al-tahawiyyah",
  "al-aqeedah-al-wasitiyyah",
  "al-aqeedah-wal-shariah-fi-al-islam",
  "al-arbaun-al-nawawiyyah",
  "al-balaghah-al-wadihah",
  "al-bidayah-wan-nihayah",
  "al-daa-wad-dawaa",
  "al-fiqh-al-muyassar",
  "al-itqan-fi-ulum-al-quran",
  "al-mukhtasar-fi-tafsir-al-quran",
  "al-muqaddimah-al-jazariyyah",
  "al-rahiq-al-makhtum",
  "al-risalah-al-shafii",
  "al-shamail-al-muhammadiyyah",
  "al-tibyan-fi-adab-hamalat-al-quran",
  "al-wabil-al-sayyib",
  "al-waraqat-fi-usul-al-fiqh",
  "asbab-al-nuzul-al-wahidi",
  "bidayat-al-mujtahid",
  "bulugh-al-maram",
  "dhuha-al-islam",
  "fajr-al-islam",
  "fath-al-bari-ibn-hajar",
  "hisn-al-muslim",
  "ihya-ulum-al-din",
  "ijaz-al-quran-al-rafii",
  "jami-al-ulum-wal-hikam",
  "kitab-al-tawhid",
  "lum-at-al-itiqad",
  "madarij-al-salikin",
  "matn-abi-shuja",
  "matn-al-ajrumiyyah",
  "mukhtasar-al-seerah",
  "muqaddimat-ibn-al-salah",
  "muqaddimat-ibn-khaldun",
  "nukhbat-al-fikar",
  "qasas-al-anbiya-ibn-kathir",
  "qasas-al-anbiya-lil-atfal-kilani",
  "qatr-al-nada",
  "qawaid-al-ahkam-al-izz",
  "qawaid-al-tadabbur-al-amthal",
  "qawaid-al-tahdith",
  "riyadh-al-salihin",
  "sahih-al-bukhari",
  "sahih-muslim",
  "sayd-al-khatir",
  "sharh-al-aqeedah-al-tahawiyyah",
  "shudhur-al-dhahab",
  "sifat-al-safwah",
  "siyar-alam-al-nubala",
  "suwar-min-hayat-al-sahabah",
  "suwar-min-hayat-al-tabieen",
  "tafsir-al-qurtubi",
  "tafsir-al-tabari",
  "tafsir-ibn-kathir",
  "tarbiyat-al-awlad-fi-al-islam",
  "tarikh-adab-al-arab",
  "tarikh-al-khulafa-al-suyuti",
  "tarikh-al-tabari",
  "tuhfat-al-mawdud-ibn-al-qayyim",
  "wahy-al-qalam",
  "zad-al-maad",
];

interface AtharPdfReaderModalProps {
  book: ReaderBook | null;
  isOpen: boolean;
  onClose: () => void;
  onBookmarkToggle?: (slug: string) => void;
  isBookmarked?: boolean;
}

export default function AtharPdfReaderModal({
  book,
  isOpen,
  onClose,
  onBookmarkToggle,
  isBookmarked = false,
}: AtharPdfReaderModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [themeMode, setThemeMode] = useState<ReadingTheme>("ivory");
  const [hasError, setHasError] = useState(false);

  // Drawers state
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const slug = book?.slug || "";
  const hasLocalPdf = book ? LOCAL_PDF_SLUGS.includes(slug) : false;
  const pdfUrl = hasLocalPdf ? `/books/pdf/${slug}.pdf` : book?.downloadUrl || "";

  // Custom reading hooks
  const {
    currentPage,
    totalPages,
    percentage,
    saveProgress,
    setCurrentPage,
    setTotalPages,
  } = useReadingProgress(slug, book?.pages || 100);

  const { bookmarks, addBookmark, removeBookmark } = usePdfBookmarks(slug);
  const { notes, addNote, deleteNote } = usePdfNotes(slug);

  // Load theme preference
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("athar_reader_theme") as ReadingTheme;
      if (savedTheme && ["ivory", "green", "dark"].includes(savedTheme)) {
        setThemeMode(savedTheme);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleThemeChange = (newTheme: ReadingTheme) => {
    setThemeMode(newTheme);
    try {
      localStorage.setItem("athar_reader_theme", newTheme);
    } catch {
      // Ignore
    }
  };

  // Step page
  const handlePageStep = useCallback(
    (delta: number) => {
      const targetPage = Math.max(1, Math.min(totalPages, currentPage + delta));
      saveProgress(targetPage);
    },
    [currentPage, totalPages, saveProgress]
  );

  // Direct Jump
  const handlePageJump = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(totalPages, page));
      saveProgress(validPage);
    },
    [totalPages, saveProgress]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "Escape") {
        if (isBookmarksOpen || isNotesOpen || isDossierOpen) {
          setIsBookmarksOpen(false);
          setIsNotesOpen(false);
          setIsDossierOpen(false);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === "f" || e.key === "F") {
        setIsFullscreen((prev) => !prev);
      } else if (e.key === "ArrowLeft") {
        handlePageStep(1); // RTL Next
      } else if (e.key === "ArrowRight") {
        handlePageStep(-1); // RTL Prev
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [
    isOpen,
    isFullscreen,
    isBookmarksOpen,
    isNotesOpen,
    isDossierOpen,
    handlePageStep,
    onClose,
  ]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !book || !mounted) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 99999 }}
      className="fixed inset-0 flex items-center justify-center p-0 sm:p-2 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden"
      dir="rtl"
    >
      <div
        className={`bg-white dark:bg-[#0E1E17] border border-[#E8E3D8] dark:border-[#1E3A2C] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 w-full ${
          isFullscreen
            ? "fixed inset-0 rounded-none border-none h-[100dvh] max-h-[100dvh]"
            : "max-w-7xl h-[100dvh] sm:h-[97vh] sm:rounded-3xl max-h-[1000px]"
        }`}
      >
        {/* ─── 1. Header (hidden in distraction-free mode) ─── */}
        {!isDistractionFree && (
          <PdfReaderHeader
            book={book}
            pdfUrl={pdfUrl}
            currentPage={currentPage}
            totalPages={totalPages}
            percentage={percentage}
            isFullscreen={isFullscreen}
            isBookmarked={isBookmarked}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            onToggleBookmark={() => onBookmarkToggle && onBookmarkToggle(book.slug)}
            onClose={onClose}
          />
        )}

        {/* ─── 2. Reading Controls & Toolbar ─── */}
        <PdfReaderToolbar
          currentPage={currentPage}
          totalPages={totalPages}
          themeMode={themeMode}
          isDistractionFree={isDistractionFree}
          notesCount={notes.length}
          bookmarksCount={bookmarks.length}
          onPageStep={handlePageStep}
          onPageJump={handlePageJump}
          onThemeChange={handleThemeChange}
          onToggleDistractionFree={() => setIsDistractionFree(!isDistractionFree)}
          onOpenBookmarks={() => setIsBookmarksOpen(true)}
          onOpenNotes={() => setIsNotesOpen(true)}
          onOpenDossier={() => setIsDossierOpen(true)}
          onPrint={() => window.print()}
        />

        {/* ─── 3. Main Reading Area (EmbedPDF Engine) ─── */}
        <main className="flex-1 w-full h-full relative overflow-hidden bg-[#F8F6EF] dark:bg-[#0A1510] flex flex-col">
          {hasError ? (
            <PdfErrorState
              title={book.title}
              pdfUrl={pdfUrl}
              onRetry={() => setHasError(false)}
            />
          ) : (
            <DynamicEmbedPdf
              pdfUrl={pdfUrl}
              themeMode={themeMode}
              onPageChange={(page, total) => {
                saveProgress(page, total);
              }}
              className="w-full flex-1"
            />
          )}
        </main>

        {/* ─── 4. Drawers ─── */}
        <PdfBookmarksDrawer
          isOpen={isBookmarksOpen}
          currentPage={currentPage}
          bookmarks={bookmarks}
          onClose={() => setIsBookmarksOpen(false)}
          onAddBookmark={(page, title) => addBookmark(page, title)}
          onRemoveBookmark={(id) => removeBookmark(id)}
          onJumpToPage={handlePageJump}
        />

        <PdfNotesDrawer
          isOpen={isNotesOpen}
          bookTitle={book.title}
          currentPage={currentPage}
          notes={notes}
          onClose={() => setIsNotesOpen(false)}
          onAddNote={(text, page) => addNote(text, page)}
          onDeleteNote={(id) => deleteNote(id)}
          onJumpToPage={handlePageJump}
        />

        <PdfDossierDrawer
          isOpen={isDossierOpen}
          book={book}
          pdfUrl={pdfUrl}
          onClose={() => setIsDossierOpen(false)}
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
