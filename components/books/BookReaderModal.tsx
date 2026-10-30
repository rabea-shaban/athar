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
  RotateCcw,
  Clock,
  FileText,
  Library,
  Share2,
  Copy,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles as SparklesIcon
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

interface NoteItem {
  id: string;
  page?: number;
  text: string;
  createdAt: string;
}

type TabType = "read" | "pdf" | "tracker" | "notes" | "dossier";

// List of books that have local, high-quality, verified PDFs hosted locally
const LOCAL_PDF_SLUGS = [
  "abqariyyat-muhammad",
  "al-aqeedah-al-wasitiyyah",
  "al-arbaun-al-nawawiyyah",
  "al-rahiq-al-makhtum",
  "al-shamail-al-muhammadiyyah",
  "kitab-al-tawhid",
  "riyadh-al-salihin",
];

export default function BookReaderModal({
  book,
  isOpen,
  onClose,
  onBookmarkToggle,
  isBookmarked = false,
}: BookReaderModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("read");
  const [progressPage, setProgressPage] = useState<number>(1);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [copiedNotes, setCopiedNotes] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [newNotePage, setNewNotePage] = useState<string>("");

  // Check if book has a local PDF available
  const hasLocalPdf = book ? LOCAL_PDF_SLUGS.includes(book.slug) : false;

  // Load progress and notes for this book
  useEffect(() => {
    if (!book) return;

    // Load progress
    try {
      const storedProgress = localStorage.getItem("athar_book_progress");
      if (storedProgress) {
        const parsed = JSON.parse(storedProgress);
        if (parsed[book.slug]) {
          setProgressPage(parsed[book.slug].currentPage || 1);
        } else {
          setProgressPage(1);
        }
      } else {
        setProgressPage(1);
      }
    } catch {
      setProgressPage(1);
    }

    // Load notes
    try {
      const storedNotes = localStorage.getItem(`athar_notes_${book.slug}`);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
        setNotes([]);
      }
    } catch {
      setNotes([]);
    }

    setActiveTab("read");
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

  // Adjust page by delta
  const handleStepPage = (delta: number) => {
    const newPage = Math.min(totalPages, Math.max(1, progressPage + delta));
    handleSaveProgress(newPage);
  };

  // Share / Copy Link handler
  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.origin + `/library/${book.slug}` : "";
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

  // Academic citation handler
  const academicCitation = `${book.author} (${book.authorEra ? book.authorEra.replace("توفي ", "ت ") : "د.ت"}). ${book.title}. ${book.publisher || "طبعة محققة معتمدة"}.`;

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(academicCitation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  // Add note handler
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: NoteItem = {
      id: Date.now().toString(),
      page: newNotePage ? parseInt(newNotePage) : progressPage,
      text: newNoteText.trim(),
      createdAt: new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" }),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    try {
      localStorage.setItem(`athar_notes_${book.slug}`, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    setNewNoteText("");
    setNewNotePage("");
  };

  // Delete note handler
  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    try {
      localStorage.setItem(`athar_notes_${book.slug}`, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Copy all notes handler
  const handleCopyAllNotes = () => {
    if (notes.length === 0) return;
    const formatted = notes
      .map((n) => `[صفحة ${toArabicNumber(n.page || 1)}]: ${n.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(`فوائد واستنباطات من كتاب: ${book.title}\n\n${formatted}`);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  // Format reading source name
  const getReadSourceName = () => {
    if (!book.readUrl) return "المصدر المعتمد";
    if (book.readUrl.includes("shamela.ws")) return "المكتبة الشاملة";
    if (book.readUrl.includes("ksu.edu.sa")) return "مشروع المصحف (جامعة الملك سعود)";
    if (book.readUrl.includes("hindawi.org")) return "مؤسسة هنداوي";
    if (book.readUrl.includes("waqfeya.net")) return "المكتبة الوقفية";
    return book.originalSource || "المستودع الرقمي";
  };

  // Resolve best download URL
  const effectiveDownloadUrl = hasLocalPdf ? `/books/pdf/${book.slug}.pdf` : book.downloadUrl;

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
            : "max-w-5xl h-[92vh] max-h-[920px]"
        )}
      >
        {/* ─── 1. Header: Islamic Theme & Controls ─── */}
        <div className="bg-gradient-to-r from-[#031d13] via-[#062c1e] to-[#041c14] border-b border-emerald-900/60 text-white px-4 sm:px-6 py-4 flex items-center justify-between gap-3 shrink-0">
          {/* Right: Book Title & Identity */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/25 to-emerald-500/15 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 font-medium">
                  {book.category}
                </span>
                {hasLocalPdf && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>نسخة PDF مدمجة</span>
                  </span>
                )}
                {book.rightsStatus && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 font-medium hidden sm:inline-block">
                    {book.rightsStatus === "PUBLIC_DOMAIN" ? "ملك عام" : "قراءة مصرح بها"}
                  </span>
                )}
                {book.authorEra && (
                  <span className="text-[10px] text-emerald-300/80 hidden md:inline-block">
                    • {book.authorEra}
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base md:text-lg font-bold font-arabic truncate text-white">
                {book.title}
              </h2>
            </div>
          </div>

          {/* Left: Interactive Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Share / Copy */}
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
            {onBookmarkToggle && (
              <button
                type="button"
                onClick={() => onBookmarkToggle(book.slug)}
                className={cn(
                  "p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs transition-colors flex items-center gap-1.5 cursor-pointer",
                  isBookmarked
                    ? "bg-amber-500 text-slate-950 border-amber-400 font-bold"
                    : "bg-white/10 hover:bg-white/15 text-white border-white/15"
                )}
                title={isBookmarked ? "إزالة من كتبي المحفوظة" : "إضافة إلى كتبي المحفوظة"}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
                <span className="hidden sm:inline">{isBookmarked ? "محفوظ" : "حفظ"}</span>
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
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
              title="إغلاق مركز المطالعة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── 2. Tab Navigation Bar ─── */}
        <div className="bg-muted/70 border-b border-border/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs font-arabic overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("read")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
                activeTab === "read"
                  ? "bg-[var(--athar-green)] text-white shadow-xs"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>بوابة القراءة والتحميل</span>
            </button>

            {hasLocalPdf && (
              <button
                type="button"
                onClick={() => setActiveTab("pdf")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
                  activeTab === "pdf"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                    : "hover:bg-muted text-amber-700 dark:text-amber-300"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>القارئ المصور المدمج (PDF)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("tracker")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
                activeTab === "tracker"
                  ? "bg-[var(--athar-green)] text-white shadow-xs"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>سجل القراءة ومتابعة الختمة</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
                activeTab === "notes"
                  ? "bg-[var(--athar-green)] text-white shadow-xs"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>كناشة الفوائد والتحقيقات</span>
              {notes.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-[10px]">
                  {toArabicNumber(notes.length)}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("dossier")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
                activeTab === "dossier"
                  ? "bg-[var(--athar-green)] text-white shadow-xs"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Library className="w-3.5 h-3.5" />
              <span>البطاقة والتوثيق الأكاديمي</span>
            </button>
          </div>

          {/* Quick Page Indicator in header */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-muted-foreground bg-background px-3 py-1 rounded-xl border border-border/80">
            <span>موضعك الحالي:</span>
            <strong className="text-[var(--athar-green)] font-bold">صفحة {toArabicNumber(progressPage)}</strong>
            <span>من أصل {toArabicNumber(totalPages)} ({toArabicNumber(currentPercentage)}%)</span>
          </div>
        </div>

        {/* ─── 3. Main Body Scrollable Area ─── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          {/* ═════════ TAB 1: READ & DOWNLOAD HUB ═════════ */}
          {activeTab === "read" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Introduction Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-amber-500/5 to-transparent border border-emerald-500/20">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-[var(--athar-green)] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-foreground font-arabic">
                      مركز المطالعة والتحقيق الرقمي المعتمد
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground font-arabic mt-1 leading-relaxed">
                      اختر أسلوب القراءة الأنسب لك: القراءة النصية الكاملة المفهرسة للبحث وتصفح الأبواب، أو تحميل ومطالعة النسخة المصورة المحققة (PDF) بصفحاتها الأصلية.
                    </p>
                  </div>
                </div>
              </div>

              {/* Two Primary Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* CARD 1: Full Online Text Reader */}
                <div className="rounded-3xl border-2 border-emerald-600/30 bg-gradient-to-b from-emerald-500/5 to-transparent p-6 flex flex-col justify-between hover:border-emerald-500 transition-all shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-[var(--athar-green)] flex items-center justify-center">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-[var(--athar-green)] border border-emerald-500/30">
                        موصى به للمطالعة والبحث
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-foreground font-arabic">
                        القراءة النصية المفهرسة الكاملة
                      </h4>
                      <p className="text-xs text-muted-foreground font-arabic mt-1.5 leading-relaxed">
                        تصفح إلكتروني محقق وشامل حسب الأجزاء والأبواب والصفحات، مع إمكانية البحث الفوري ونسخ المتون وتكبير الخط.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/60 space-y-2 text-xs font-arabic text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>فهرس تفاعلي للأبواب والأجزاء</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>بحث نصي فوري في كامل المتن</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>عزو الأجزاء والصفحات المطبوعة للباحثين</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>خط عربي محقق متوافق مع جميع الشاشات</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-border/60">
                    <a
                      href={book.readUrl || book.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white font-bold text-sm shadow-md shadow-[var(--athar-green)]/20 transition-all text-center cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>بدء القراءة في {getReadSourceName()}</span>
                      <ExternalLink className="w-4 h-4 opacity-70" />
                    </a>
                    <p className="text-[11px] text-center text-muted-foreground/80 mt-2 font-arabic">
                      تفتح القراءة في نافذة مستقلة نظيفة وسريعة
                    </p>
                  </div>
                </div>

                {/* CARD 2: High-Quality PDF Edition */}
                <div className="rounded-3xl border-2 border-amber-600/30 bg-gradient-to-b from-amber-500/5 to-transparent p-6 flex flex-col justify-between hover:border-amber-500 transition-all shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Download className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        النسخة المصورة المعتمدة
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-foreground font-arabic">
                        النسخة المصورة المعتمدة (PDF)
                      </h4>
                      <p className="text-xs text-muted-foreground font-arabic mt-1.5 leading-relaxed">
                        النسخة الأصلية المصورة عن طبعة التحقيق المعتمدة بصفحاتها وهوامشها وفهارسها الكاملة للتحميل والمطالعة دون إنترنت.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-xs font-arabic">
                      <div className="p-2.5 rounded-xl bg-background border border-border/70">
                        <span className="text-muted-foreground text-[11px] block">حجم الملف</span>
                        <strong className="text-foreground font-mono">{book.fileSize || "طبعة كاملة"}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-background border border-border/70">
                        <span className="text-muted-foreground text-[11px] block">الصفحات الموثقة</span>
                        <strong className="text-foreground">{toArabicNumber(book.pages)} صفحة</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-background border border-border/70 col-span-2">
                        <span className="text-muted-foreground text-[11px] block">دار النشر والتحقيق</span>
                        <strong className="text-foreground truncate block">{book.publisher || "طبعة محققة معتمدة"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-border/60 space-y-2">
                    {/* If local PDF exists, show In-App Reader button */}
                    {hasLocalPdf && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("pdf")}
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/25 transition-all text-center cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>مطالعة وثيقة الكتاب مباشرة داخل المنصة</span>
                      </button>
                    )}

                    {effectiveDownloadUrl && (
                      <a
                        href={effectiveDownloadUrl}
                        download={hasLocalPdf ? `${book.slug}.pdf` : undefined}
                        target={hasLocalPdf ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        className={cn(
                          "w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center cursor-pointer",
                          hasLocalPdf
                            ? "bg-white/10 hover:bg-white/20 text-foreground border border-border/80"
                            : "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
                        )}
                      >
                        <Download className="w-3.5 h-3.5 text-amber-500" />
                        <span>
                          {hasLocalPdf ? "تنزيل النسخة المحلية السريعة (PDF)" : `تحميل نسخة PDF المحققة ${book.fileSize ? `(${book.fileSize})` : ""}`}
                        </span>
                        {!hasLocalPdf && <ExternalLink className="w-3.5 h-3.5 opacity-70" />}
                      </a>
                    )}

                    {book.sourceUrl && !hasLocalPdf && (
                      <a
                        href={book.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-colors text-center cursor-pointer"
                      >
                        <Library className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>صفحة الكتاب في {book.originalSource || "المصدر الأصلي"}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Reading Tracker Strip */}
              <div className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-[var(--athar-green)]/10 text-[var(--athar-green)] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-foreground font-arabic">
                      متابعة موضعك في القراءة
                    </h5>
                    <p className="text-[11px] text-muted-foreground font-arabic">
                      أنت عند صفحة <strong className="text-foreground">{toArabicNumber(progressPage)}</strong> من أصل {toArabicNumber(totalPages)} ({toArabicNumber(currentPercentage)}%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStepPage(5)}
                      className="px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 text-[11px] font-bold font-arabic transition-colors cursor-pointer"
                      title="تقدم 5 صفحات"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepPage(10)}
                      className="px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 text-[11px] font-bold font-arabic transition-colors cursor-pointer"
                      title="تقدم 10 صفحات"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepPage(25)}
                      className="px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 text-[11px] font-bold font-arabic transition-colors cursor-pointer"
                      title="تقدم 25 صفحة"
                    >
                      +25
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("tracker")}
                    className="px-3 py-1.5 rounded-xl bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    لوحة المتابعة الكاملة
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ TAB: NATIVE IN-APP PDF VIEWER ═════════ */}
          {activeTab === "pdf" && hasLocalPdf && (
            <div className="h-full flex flex-col space-y-3">
              {/* PDF Viewer Top Controls Bar */}
              <div className="p-3 sm:p-4 rounded-2xl bg-[#031d13] border border-emerald-900/60 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm font-arabic text-white">
                      القارئ المصور المعتمد (PDF المدمج)
                    </h4>
                    <span className="text-[11px] text-emerald-300/80 font-arabic">
                      نسخة محققة رسمية معتمدة ومحملة محلياً على جهازك
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/books/pdf/${book.slug}.pdf`}
                    download={`${book.slug}.pdf`}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-300" />
                    <span>تنزيل النسخة ({book.fileSize || "مباشر"})</span>
                  </a>

                  <a
                    href={`/books/pdf/${book.slug}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>فتح في نافذة كاملة</span>
                  </a>
                </div>
              </div>

              {/* Native In-App PDF Iframe Viewer */}
              <div className="flex-1 w-full min-h-[580px] rounded-2xl overflow-hidden border border-border/80 bg-slate-900 shadow-inner">
                <iframe
                  src={`/books/pdf/${book.slug}.pdf#toolbar=1&navpanes=1`}
                  title={`المطالعة المصورة لكتاب ${book.title}`}
                  className="w-full h-full min-h-[580px] border-none"
                />
              </div>
            </div>
          )}

          {/* ═════════ TAB 2: PROGRESS & KHATMAH TRACKER ═════════ */}
          {activeTab === "tracker" && (
            <div className="space-y-6 max-w-3xl mx-auto font-arabic">
              {/* Progress Hero */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-card to-muted/40 border border-border/80 text-center space-y-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-[var(--athar-green)] border border-emerald-500/30 inline-block">
                  مؤشر الإنجاز والختمة
                </span>

                <div className="space-y-1">
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground font-arabic">
                    {toArabicNumber(currentPercentage)}%
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    أنجزت قراءة <strong className="text-foreground">{toArabicNumber(progressPage)}</strong> صفحة من أصل {toArabicNumber(totalPages)} صفحة
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3.5 bg-muted rounded-full overflow-hidden p-0.5 border border-border/60 max-w-lg mx-auto">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 via-[var(--athar-green)] to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${currentPercentage}%` }}
                  />
                </div>

                {/* Page Stepper Controls */}
                <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStepPage(-50)}
                    disabled={progressPage <= 1}
                    className="px-2.5 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    -50
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepPage(-10)}
                    disabled={progressPage <= 1}
                    className="px-2.5 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    -10
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepPage(-1)}
                    disabled={progressPage <= 1}
                    className="px-2.5 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    -1
                  </button>

                  <div className="flex items-center gap-1.5 bg-background border-2 border-[var(--athar-green)]/40 px-3 py-1 rounded-xl shadow-xs">
                    <span className="text-xs text-muted-foreground">صفحة:</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={progressPage}
                      onChange={(e) => setProgressPage(parseInt(e.target.value) || 1)}
                      className="w-14 text-center text-sm font-extrabold text-foreground bg-transparent focus:outline-none"
                    />
                    <span className="text-xs text-muted-foreground">/ {toArabicNumber(totalPages)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStepPage(1)}
                    disabled={progressPage >= totalPages}
                    className="px-2.5 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepPage(10)}
                    disabled={progressPage >= totalPages}
                    className="px-2.5 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepPage(50)}
                    disabled={progressPage >= totalPages}
                    className="px-2.5 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    +50
                  </button>
                </div>

                {/* Save Confirmation Button */}
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSaveProgress(progressPage)}
                    className={cn(
                      "px-6 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md",
                      savedSuccess
                        ? "bg-emerald-600 text-white shadow-emerald-600/30"
                        : "bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white shadow-[var(--athar-green)]/20"
                    )}
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>تم حفظ موضع القراءة بنجاح</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4" />
                        <span>تثبيت علامة القراءة في سجلي</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveProgress(1)}
                    className="px-3.5 py-2.5 rounded-2xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="إعادة ضبط القراءة إلى الصفحة الأولى"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>البدء من جديد</span>
                  </button>
                </div>
              </div>

              {/* Khatmah Planner Cards */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--athar-green)]" />
                  <span>خطة إتمام قراءة الكتاب (المعدل اليومي المقترح)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-card border border-border/80 text-center space-y-1">
                    <span className="text-[11px] text-muted-foreground block">ختمة خلال 15 يوماً</span>
                    <strong className="text-lg font-bold text-[var(--athar-green)]">
                      {toArabicNumber(Math.ceil(totalPages / 15))} صفحة
                    </strong>
                    <span className="text-[10px] text-muted-foreground block">معدل يومي</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-card border border-border/80 text-center space-y-1">
                    <span className="text-[11px] text-muted-foreground block">ختمة خلال 30 يوماً</span>
                    <strong className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {toArabicNumber(Math.ceil(totalPages / 30))} صفحة
                    </strong>
                    <span className="text-[10px] text-muted-foreground block">معدل يومي (موصى به)</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-card border border-border/80 text-center space-y-1">
                    <span className="text-[11px] text-muted-foreground block">ختمة خلال 60 يوماً</span>
                    <strong className="text-lg font-bold text-foreground">
                      {toArabicNumber(Math.ceil(totalPages / 60))} صفحة
                    </strong>
                    <span className="text-[10px] text-muted-foreground block">مطالعة متأنية ومدارسة</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ TAB 3: PERSONAL STUDY NOTES ═════════ */}
          {activeTab === "notes" && (
            <div className="space-y-6 max-w-3xl mx-auto font-arabic">
              {/* Note Creation Form */}
              <form onSubmit={handleAddNote} className="p-5 rounded-3xl bg-card border border-border/80 space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--athar-green)]" />
                    <span>تدوين فائدة أو استنباط علمي</span>
                  </h4>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">رقم الصفحة:</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      placeholder={progressPage.toString()}
                      value={newNotePage}
                      onChange={(e) => setNewNotePage(e.target.value)}
                      className="w-16 px-2 py-1 text-center text-xs font-bold rounded-lg bg-background border border-border/80 text-foreground focus:outline-none focus:border-[var(--athar-green)]"
                    />
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="اكتب فائدة، حكماً فقهياً، توجيهاً لغوياً، أو خاطرة مستفادة من هذا المصنف..."
                  className="w-full p-3 rounded-2xl bg-background border border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--athar-green)] resize-none"
                />

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-muted-foreground">
                    تحفظ الفوائد في متصفحك محلياً ومرتبطة بـ «{book.title}».
                  </span>
                  <button
                    type="submit"
                    disabled={!newNoteText.trim()}
                    className="px-4 py-2 rounded-xl bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة الفائدة</span>
                  </button>
                </div>
              </form>

              {/* Notes List Header */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <h4 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-2">
                  <span>الفوائد المدونة ({toArabicNumber(notes.length)})</span>
                </h4>

                {notes.length > 0 && (
                  <button
                    type="button"
                    onClick={handleCopyAllNotes}
                    className="text-xs text-[var(--athar-green)] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    {copiedNotes ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNotes ? "تم نسخ جميع الفوائد" : "نسخ جميع الفوائد"}</span>
                  </button>
                )}
              </div>

              {/* Notes Cards or Empty State */}
              {notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-2xl bg-card border border-border/80 space-y-2 hover:border-[var(--athar-green)]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-[11px]">
                            صفحة {toArabicNumber(note.page || 1)}
                          </span>
                          <span className="text-muted-foreground text-[10px]">{note.createdAt}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(`[صفحة ${toArabicNumber(note.page || 1)}]: ${note.text}`);
                            }}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="نسخ الفائدة"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/15 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                            title="حذف الفائدة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {note.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-muted/30 border border-dashed border-border/80 text-center space-y-2">
                  <FileText className="w-10 h-10 text-muted-foreground/60 mx-auto" />
                  <h5 className="font-bold text-xs sm:text-sm text-foreground">لا توجد فوائد مدونة حتى الآن</h5>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    قيد ما استوقفَك من اللطائف العلمية واستنباطات الآيات والأحاديث لتكون لك كناشة علمية جامعة.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ═════════ TAB 4: ACADEMIC DOSSIER & CITATION ═════════ */}
          {activeTab === "dossier" && (
            <div className="space-y-6 max-w-3xl mx-auto font-arabic">
              {/* Academic Metadata Grid */}
              <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-4 shadow-xs">
                <h4 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
                  <Library className="w-4 h-4 text-[var(--athar-green)]" />
                  <span>البطاقة العلمية وبيانات التحقيق المعتمدة</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block text-[11px]">اسم المصنف الكامل</span>
                    <strong className="text-foreground">{book.title}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block text-[11px]">المؤلف وسنة الوفاة</span>
                    <strong className="text-foreground">{book.author} {book.authorEra && `(${book.authorEra})`}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block text-[11px]">جهة التحقيق والطباعة</span>
                    <strong className="text-foreground">{book.publisher || "طبعة محققة معتمدة"}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block text-[11px]">سنة الطبع ومجموع الصفحات</span>
                    <strong className="text-foreground">
                      {book.publicationYear ? `${toArabicNumber(book.publicationYear)} م` : "د.ت"} • {toArabicNumber(book.pages)} صفحة
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block text-[11px]">التصنيف العلمي الدقيق</span>
                    <strong className="text-foreground">{book.category} » {book.subcategory || "عام"}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block text-[11px]">رخصة الإتاحة والحقوق</span>
                    <strong className="text-foreground">{book.rightsStatus === "PUBLIC_DOMAIN" ? "ملك عام (Public Domain)" : "إتاحة وقفية مصرح بها"}</strong>
                  </div>
                </div>

                {/* Synopsis */}
                <div className="pt-2 border-t border-border/60 space-y-1.5">
                  <span className="text-xs font-bold text-foreground block">نبذة ومنهج الكتاب</span>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {book.description}
                  </p>
                </div>
              </div>

              {/* Academic Citation Box */}
              <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/25 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>صيغة التوثيق المرجعي الأكاديمي (Citation)</span>
                  </h5>

                  <button
                    type="button"
                    onClick={handleCopyCitation}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedCitation ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCitation ? "تم نسخ التوثيق" : "نسخ التوثيق"}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-background border border-border/80 font-mono text-xs text-foreground select-all">
                  {academicCitation}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  مطابق لمعايير العزو التراثي والتوثيق المعتمد في الجامعات ومراكز الأبحاث الإسلامية.
                </p>
              </div>

              {/* Topics / Keywords */}
              {book.topics && book.topics.length > 0 && (
                <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[var(--athar-green)]" />
                    <span>موضوعات ومحاور المصنف</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {book.topics.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-xl bg-muted text-[11px] text-foreground font-arabic border border-border/60"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── 4. Reader Bottom Progress Bar ─── */}
        <div className="bg-card border-t border-border/70 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 text-xs font-arabic shrink-0">
          <div className="flex items-center gap-2.5 flex-1 max-w-md">
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
              الإنجاز القرائي ({toArabicNumber(currentPercentage)}%):
            </span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${currentPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasLocalPdf && activeTab !== "pdf" && (
              <button
                type="button"
                onClick={() => setActiveTab("pdf")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>القارئ المصور (PDF)</span>
              </button>
            )}

            <a
              href={book.readUrl || book.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>متابعة القراءة في {getReadSourceName()}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
