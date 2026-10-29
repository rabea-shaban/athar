"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Video,
  GraduationCap,
  Clock,
  User,
  Layers,
  BookOpen,
  Volume2,
  FileText,
  Share2,
  Bookmark,
  Check,
  Star,
  X,
  Pause,
  Sparkles,
  Library,
  Scroll,
  ShieldCheck,
  Scale,
  Landmark,
  Heart,
  Sprout,
  LucideIcon,
} from "lucide-react";
import Container from "@/components/layout/Container";
import ProgramCard from "@/components/programs/ProgramCard";
import { Program } from "@/types/content";
import { Lecture, LECTURES_DATA, LECTURE_CATEGORIES, LECTURE_MEDIA_TYPES } from "@/data/lectures";
import { useAudioStore } from "@/store/audioStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, toArabicNumber } from "@/lib/utils";

interface ProgramsCatalogClientProps {
  initialPrograms: Program[];
  initialLectures?: Lecture[];
}

const LECTURE_CATEGORY_ICONS: Record<string, LucideIcon> = {
  الكل: Library,
  "التفسير وعلوم القرآن": BookOpen,
  "الحديث الشريف": Scroll,
  "العقيدة والتوحيد": ShieldCheck,
  "الفقه وأصوله": Scale,
  "السيرة النبوية": Landmark,
  "الرقائق والتربية": Heart,
  "قصص الأنبياء": Sprout,
};

const LECTURE_TYPE_CONFIG = {
  مقال: {
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    icon: BookOpen,
  },
  صوتي: {
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    icon: Volume2,
  },
  فيديو: {
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    icon: Video,
  },
};

function ProgramsCatalogInner({
  initialPrograms,
  initialLectures = LECTURES_DATA,
}: ProgramsCatalogClientProps) {
  const lectures = initialLectures || LECTURES_DATA;
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") === "lectures" ? "lectures" : null;
  const [selectedTab, setSelectedTab] = useState<"programs" | "lectures">(
    tabFromUrl || "programs"
  );

  const activeTab = tabFromUrl || selectedTab;
  const setActiveTab = (tab: "programs" | "lectures") => {
    setSelectedTab(tab);
  };

  // ════════ TAB 1: Programs State ════════
  const [progSearch, setProgSearch] = useState("");
  const [progCategory, setProgCategory] = useState("الكل");

  const programCategories = useMemo(() => {
    const set = new Set<string>();
    initialPrograms.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["الكل", ...Array.from(set)];
  }, [initialPrograms]);

  const filteredPrograms = useMemo(() => {
    return initialPrograms.filter((p) => {
      const matchSearch =
        !progSearch.trim() ||
        p.title.toLowerCase().includes(progSearch.toLowerCase()) ||
        p.presenter.toLowerCase().includes(progSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(progSearch.toLowerCase()) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(progSearch.toLowerCase())));

      const matchCategory =
        progCategory === "الكل" || p.category === progCategory;

      return matchSearch && matchCategory;
    });
  }, [initialPrograms, progSearch, progCategory]);

  // ════════ TAB 2: Lectures State ════════
  const [lecSearch, setLecSearch] = useState("");
  const [lecCategory, setLecCategory] = useState<string>("الكل");
  const [lecType, setLecType] = useState<string>("الكل");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savedLectures, setSavedLectures] = useState<string[]>([]);
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Safely hydrate saved lectures after client mount to prevent SSR mismatch
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("athar_saved_lectures");
      if (saved) setSavedLectures(JSON.parse(saved));
    } catch {}
  }, []);

  const { isPlaying, src: currentSrc, setAudio, togglePlay, claimAudio } = useAudioStore();

  const toggleSaveLecture = (id: string) => {
    setSavedLectures((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("athar_saved_lectures", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleCopyLink = (lecture: Lecture) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${lecture.title} — ${lecture.scholar} | منصة أَثَر`);
      setCopiedId(lecture.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handlePlayLecture = (lecture: Lecture) => {
    if (!lecture.audioUrl) return;

    if (currentSrc === lecture.audioUrl && isPlaying) {
      togglePlay();
      return;
    }

    setAudio(lecture.audioUrl, lecture.title, lecture.scholar, "lecture");
    claimAudio("tab_athar_player");
  };

  const filteredLectures = useMemo(() => {
    return lectures.filter((lec) => {
      const matchCategory = lecCategory === "الكل" || lec.category === lecCategory;
      const matchType = lecType === "الكل" || lec.type === lecType;
      const matchSaved = !showSavedOnly || savedLectures.includes(lec.id);

      const matchSearch =
        !lecSearch.trim() ||
        lec.title.toLowerCase().includes(lecSearch.toLowerCase()) ||
        lec.scholar.toLowerCase().includes(lecSearch.toLowerCase()) ||
        lec.description.toLowerCase().includes(lecSearch.toLowerCase()) ||
        lec.topics.some((t) => t.toLowerCase().includes(lecSearch.toLowerCase()));

      return matchCategory && matchType && matchSaved && matchSearch;
    });
  }, [lectures, lecCategory, lecType, showSavedOnly, savedLectures, lecSearch]);

  return (
    <div className="min-h-screen pb-20 bg-background text-foreground text-right" dir="rtl">
      {/* ─── Top Islamic Hero Banner ─── */}
      <section className="relative overflow-hidden bg-[#061e16] bg-[radial-gradient(#0e4732_1px,transparent_1px)] [background-size:24px_24px] text-white border-b border-emerald-900/50 py-12 md:py-16">
        <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

        <Container size="2xl" className="relative z-10 text-center space-y-4">
          {/* Breadcrumb Navigation */}
          <nav className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-200/90 font-arabic">
            <Link href="/" className="hover:text-white transition-colors">
              الرئيسية
            </Link>
            <span className="opacity-60">/</span>
            <span className="text-amber-300 font-medium">
              البرامج والدروس والشروحات
            </span>
          </nav>

          {/* Big Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-arabic tracking-tight text-white leading-tight">
            البرامج والشروحات الإسلامية
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-emerald-100/80 font-arabic max-w-2xl mx-auto leading-relaxed">
            مكتبة جامعة تجمع بين البرامج والبودكاستات المرئية الهادفة، والشروحات التأصيلية لكتب ومصادر العلم الشرعي.
          </p>

          {/* ─── Interactive Primary Tab Switcher ─── */}
          <div className="flex items-center justify-center gap-2.5 pt-4">
            <button
              type="button"
              onClick={() => setActiveTab("programs")}
              className={cn(
                "px-5 sm:px-6 py-2.5 rounded-2xl font-arabic text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-xs",
                activeTab === "programs"
                  ? "bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300/40 scale-[1.02]"
                  : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/15"
              )}
            >
              <Video className="h-4 w-4" />
              <span>البرامج والبودكاست المرئي ({toArabicNumber(initialPrograms.length)})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("lectures")}
              className={cn(
                "px-5 sm:px-6 py-2.5 rounded-2xl font-arabic text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-xs",
                activeTab === "lectures"
                  ? "bg-[var(--athar-green)] text-white shadow-md ring-2 ring-emerald-400/40 scale-[1.02]"
                  : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/15"
              )}
            >
              <GraduationCap className="h-4 w-4" />
              <span>الشروحات والدروس العلمية ({toArabicNumber(lectures.length)})</span>
            </button>
          </div>
        </Container>
      </section>

      {/* ─── Decorative Golden Star Ornament ─── */}
      <div className="pt-6 pb-2 text-center" aria-hidden="true">
        <div className="inline-flex items-center justify-center gap-2 text-amber-500/80 select-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-500/70" />
          <span className="w-2 h-2 rotate-45 bg-amber-500 rounded-[1px]" />
          <Sparkles className="w-3.5 h-3.5 text-amber-500/70" />
        </div>
      </div>

      <Container size="2xl" className="pt-4">
        {/* ═══════════════════════════════════════════════════════ */}
        {/* ─── TAB 1: البرامج والبودكاستات المرئية ─── */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "programs" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-arabic text-foreground">
                السلاسل والبرامج المرئية
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-arabic">
                شاهد واستمع إلى سلاسل إيمانية وتفسيرية مع إمكانية التنقل بين الحلقات والتحويل إلى مشغل صوتي.
              </p>
            </div>

            {/* Search & Categories Filter */}
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="relative">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={progSearch}
                  onChange={(e) => setProgSearch(e.target.value)}
                  placeholder="ابحث عن برنامج أو مقدم أو موضوع..."
                  className="w-full pr-10 pl-10 h-11 text-xs sm:text-sm rounded-2xl bg-card border border-border/80 focus:border-[var(--athar-green)] focus:ring-2 focus:ring-[var(--athar-green)]/20 outline-hidden font-arabic transition-all shadow-xs"
                />
                {progSearch && (
                  <button
                    type="button"
                    onClick={() => setProgSearch("")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    aria-label="مسح البحث"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Category Chips */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {programCategories.map((cat) => {
                  const isSelected = progCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setProgCategory(cat)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-arabic font-semibold transition-all duration-200 cursor-pointer",
                        isSelected
                          ? "bg-[var(--athar-green)] text-white shadow-xs"
                          : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60"
                      )}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results counter */}
            <div className="flex items-center justify-between text-xs text-muted-foreground font-arabic px-1">
              <span>
                عرض {toArabicNumber(filteredPrograms.length)} من أصل {toArabicNumber(initialPrograms.length)} برنامجاً
              </span>
            </div>

            {/* Programs Grid */}
            {filteredPrograms.length === 0 ? (
              <div className="text-center py-16 rounded-3xl border border-dashed border-border/80 bg-card p-8 max-w-md mx-auto space-y-3">
                <Video className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <h3 className="font-bold text-base font-arabic">لا توجد برامج مطابقة للبحث</h3>
                <p className="text-xs text-muted-foreground font-arabic">
                  جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setProgSearch("");
                    setProgCategory("الكل");
                  }}
                  className="px-4 py-2 rounded-xl bg-muted text-xs font-semibold font-arabic"
                >
                  إعادة تعيين الفلاتر
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {filteredPrograms.map((prog, idx) => (
                  <ProgramCard key={prog.id} program={prog} priority={idx < 3} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ─── TAB 2: الشروحات والدروس التأصيلية ─── */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "lectures" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-arabic text-foreground">
                الشروحات والدروس المنهجية
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-arabic">
                شروحات تأصيلية لكتب الحديث والعقيدة والتفسير والفقه مع بيان المحاور والفوائد المستنبطة.
              </p>
            </div>

            {/* Search, Types, and Bookmarks Row */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={lecSearch}
                  onChange={(e) => setLecSearch(e.target.value)}
                  placeholder="ابحث عن درس، شيخ، موضوع، أو مسألة..."
                  className="pr-10 h-10 rounded-2xl bg-card border-border/80 text-xs sm:text-sm font-arabic"
                  dir="rtl"
                />
                {lecSearch && (
                  <button
                    onClick={() => setLecSearch("")}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Media Types & Bookmarks Filter */}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/70">
                  {LECTURE_MEDIA_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setLecType(type)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-arabic font-medium transition-all cursor-pointer",
                        lecType === type
                          ? "bg-card text-foreground font-bold shadow-xs border border-border/50"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowSavedOnly(!showSavedOnly)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-arabic font-medium transition-colors border flex items-center gap-1.5 cursor-pointer shadow-xs",
                    showSavedOnly
                      ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                      : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border/70"
                  )}
                >
                  <Star className={cn("h-3.5 w-3.5", showSavedOnly && "fill-current")} />
                  <span>المحفوظات ({toArabicNumber(savedLectures.length)})</span>
                </button>
              </div>
            </div>

            {/* Categories Pills Horizontal Scroll */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {LECTURE_CATEGORIES.map((cat) => {
                const Icon = LECTURE_CATEGORY_ICONS[cat] || BookOpen;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setLecCategory(cat)}
                    className={cn(
                      "px-3.5 py-2 rounded-2xl text-xs font-arabic font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 shadow-xs cursor-pointer",
                      lecCategory === cat
                        ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-md font-bold scale-[1.02]"
                        : "bg-card border-border/70 text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground font-arabic px-1">
              <span>
                عرض {toArabicNumber(filteredLectures.length)} من أصل {toArabicNumber(lectures.length)} درساً ومحاضرة
              </span>
            </div>

            {/* Lectures Cards Grid */}
            {filteredLectures.length === 0 ? (
              <div className="text-center py-16 rounded-3xl border border-dashed border-border/80 bg-card p-8 max-w-md mx-auto shadow-xs space-y-3">
                <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <h3 className="font-bold text-base font-arabic">لا توجد شروحات مطابقة</h3>
                <p className="text-xs text-muted-foreground font-arabic">
                  جرب البحث بكلمات أخرى أو تغيير تصنيف الدروس.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setLecCategory("الكل");
                    setLecType("الكل");
                    setShowSavedOnly(false);
                    setLecSearch("");
                  }}
                  className="rounded-xl font-arabic text-xs"
                >
                  إعادة تعيين الفلاتر
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredLectures.map((lecture) => {
                  const isPlayingThis = currentSrc === lecture.audioUrl && isPlaying;
                  const isSaved = savedLectures.includes(lecture.id);
                  const TypeIcon = LECTURE_TYPE_CONFIG[lecture.type]?.icon || Volume2;

                  return (
                    <div
                      key={lecture.id}
                      className={cn(
                        "group flex flex-col justify-between rounded-3xl border bg-card p-5 md:p-6 transition-all duration-300 hover:shadow-xl text-right relative overflow-hidden",
                        isPlayingThis
                          ? "border-[var(--athar-green)] ring-2 ring-[var(--athar-green)]/30 bg-gradient-to-b from-[var(--athar-green)]/10 to-card shadow-md"
                          : "border-border/80 hover:border-emerald-700/50 hover:-translate-y-1"
                      )}
                    >
                      <div>
                        {/* Top Badges Row */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[11px] font-semibold text-[var(--athar-green)] bg-[var(--athar-green)]/10 px-2.5 py-0.5 rounded-full border border-[var(--athar-green)]/20 font-arabic truncate">
                            {lecture.category}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border font-arabic shrink-0",
                              LECTURE_TYPE_CONFIG[lecture.type]?.color
                            )}
                          >
                            <TypeIcon className="h-3 w-3" />
                            <span>{lecture.type}</span>
                          </span>
                        </div>

                        {/* Title & Scholar */}
                        <h3
                          onClick={() => setActiveLecture(lecture)}
                          className="font-bold text-base font-arabic text-foreground group-hover:text-[var(--athar-green)] transition-colors mb-1.5 cursor-pointer line-clamp-2 leading-snug"
                        >
                          {lecture.title}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-arabic mb-3">
                          <User className="h-3.5 w-3.5 text-amber-600/80 shrink-0" />
                          <span className="truncate">{lecture.scholar}</span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground font-arabic leading-relaxed line-clamp-3 mb-4">
                          {lecture.description}
                        </p>
                      </div>

                      {/* Meta info & Action bar */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50 pt-3 mb-3 font-arabic">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-amber-500" />
                            {lecture.duration}
                          </span>
                          {lecture.episodesCount && (
                            <span className="flex items-center gap-1 font-mono">
                              <Layers className="h-3 w-3 text-emerald-600" />
                              {toArabicNumber(lecture.episodesCount)} حلقة
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-1.5 pt-1">
                          {/* Audio Play button */}
                          {lecture.audioUrl ? (
                            <Button
                              size="sm"
                              onClick={() => handlePlayLecture(lecture)}
                              className={cn(
                                "gap-1.5 text-xs h-9 rounded-xl font-arabic font-semibold transition-all flex-1 cursor-pointer",
                                isPlayingThis
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                  : "bg-[#0c2e22] hover:bg-[#072418] text-white"
                              )}
                            >
                              {isPlayingThis ? (
                                <>
                                  <Pause className="h-3.5 w-3.5" />
                                  <span>إيقاف مؤقت</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="h-3.5 w-3.5" />
                                  <span>استماع للشرح</span>
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActiveLecture(lecture)}
                              className="gap-1.5 text-xs h-9 rounded-xl font-arabic flex-1 border-border/80 hover:border-[var(--athar-green)] hover:text-[var(--athar-green)] cursor-pointer"
                            >
                              <BookOpen className="h-3.5 w-3.5" />
                              <span>عرض الفوائد</span>
                            </Button>
                          )}

                          {/* Quick Actions (Benefits, Share, Bookmark) */}
                          <div className="flex items-center gap-0.5">
                            {lecture.audioUrl && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setActiveLecture(lecture)}
                                className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-xl cursor-pointer"
                                title="عرض الفوائد والمحاور"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleCopyLink(lecture)}
                              className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-xl cursor-pointer"
                              title={copiedId === lecture.id ? "تم النسخ!" : "مشاركة"}
                            >
                              {copiedId === lecture.id ? (
                                <Check className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Share2 className="h-4 w-4" />
                              )}
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => toggleSaveLecture(lecture.id)}
                              className={cn(
                                "h-9 w-9 rounded-xl transition-colors cursor-pointer",
                                isSaved
                                  ? "text-amber-500 fill-amber-500 bg-amber-500/10"
                                  : "text-muted-foreground hover:text-amber-500"
                              )}
                              title={isSaved ? "إلغاء الحفظ" : "حفظ في المفضلة"}
                            >
                              <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Container>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ─── Comprehensive Lecture Details Modal ─── */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeLecture && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setActiveLecture(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-2xl text-foreground font-arabic animate-in zoom-in-95 duration-150 relative text-right"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-border/60 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-[var(--athar-green)] bg-[var(--athar-green)]/10 px-2.5 py-0.5 rounded-full border border-[var(--athar-green)]/20">
                    {activeLecture.category}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {activeLecture.duration}
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-black text-foreground">
                  {activeLecture.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  تقديم وإلقاء: <span className="text-foreground font-bold">{activeLecture.scholar}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveLecture(null)}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Description */}
            <div className="mb-6 bg-muted/40 p-4 rounded-2xl border border-border/60">
              <h4 className="text-xs font-bold text-muted-foreground mb-1">نبذة عن المحاضرة:</h4>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                {activeLecture.description}
              </p>
            </div>

            {/* Topics Covered */}
            {activeLecture.topics && activeLecture.topics.length > 0 && (
              <div className="mb-6 space-y-2.5">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>محاور الدرس وموضوعات الشرح:</span>
                </h4>
                <div className="grid gap-2 pr-2">
                  {activeLecture.topics.map((topic, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground bg-card p-2.5 rounded-xl border border-border/50"
                    >
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Benefits */}
            {activeLecture.benefits && activeLecture.benefits.length > 0 && (
              <div className="mb-6 space-y-2.5">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>الفوائد الإيمانية والتربوية المستنبطة:</span>
                </h4>
                <div className="grid gap-2 pr-2">
                  {activeLecture.benefits.map((benefit, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-900 dark:text-amber-200 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20"
                    >
                      <Star className="h-4 w-4 text-amber-500 shrink-0 mt-0.5 fill-amber-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
              {activeLecture.audioUrl && (
                <Button
                  onClick={() => {
                    handlePlayLecture(activeLecture);
                    setActiveLecture(null);
                  }}
                  className="bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white text-xs rounded-xl gap-2 font-arabic font-bold cursor-pointer"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>استماع للشرح الآن</span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setActiveLecture(null)}
                className="rounded-xl text-xs font-arabic cursor-pointer"
              >
                إغلاق النافذة
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProgramsCatalogClient(props: ProgramsCatalogClientProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ProgramsCatalogInner {...props} />
    </Suspense>
  );
}
