"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  ChevronDown,
  Check,
  Search,
  Headphones,
  Volume2,
  BookOpen,
  FileText,
  Download,
  Filter,
  X,
  User,
  Radio,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Container from "@/components/layout/Container";
import { getSurahList, getQuranAudio, type Surah, type QuranAudioFile } from "@/lib/api/islamic";
import { useAudioStore } from "@/store/audioStore";
import { cn, toArabicNumber } from "@/lib/utils";

const RECITERS = [
  { id: 2,  name: "عبد الباسط عبد الصمد",     style: "مرتل", riwayah: "حفص عن عاصم" },
  { id: 1,  name: "عبد الباسط عبد الصمد",     style: "مجود", riwayah: "حفص عن عاصم" },
  { id: 6,  name: "محمود خليل الحصري",         style: "مرتل", riwayah: "حفص عن عاصم" },
  { id: 12, name: "محمود خليل الحصري",         style: "معلم", riwayah: "حفص عن عاصم" },
  { id: 9,  name: "محمد صديق المنشاوي",        style: "مرتل", riwayah: "حفص عن عاصم" },
  { id: 8,  name: "محمد صديق المنشاوي",        style: "مجود", riwayah: "حفص عن عاصم" },
  { id: 7,  name: "مشاري راشد العفاسي",        style: "مرتل", riwayah: "حفص عن عاصم" },
  { id: 3,  name: "عبد الرحمن السديس",         style: "مرتل", riwayah: "حفص عن عاصم" },
  { id: 10, name: "سعود الشريم",               style: "مرتل", riwayah: "حفص عن عاصم" },
  { id: 4,  name: "أبو بكر الشاطري",           style: "مرتل", riwayah: "حفص عن عاصم" },
  { id: 5,  name: "هاني الرفاعي",              style: "مرتل", riwayah: "حفص عن عاصم" },
  { id: 11, name: "عبد المحسن القاسم",         style: "مرتل", riwayah: "حفص عن عاصم" },
];

const STYLE_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  مرتل: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
  },
  مجود: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/30",
  },
  معلم: {
    bg: "bg-sky-500/10 dark:bg-sky-500/20",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-500/30",
  },
};

type Reciter = typeof RECITERS[0];

function AudioEqualizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end justify-center gap-[3px] h-4 w-4">
      <span
        className={cn(
          "w-1 bg-[var(--athar-green)] rounded-full transition-all duration-300",
          isPlaying ? "h-4 animate-[bounce_0.8s_ease-in-out_infinite]" : "h-1.5"
        )}
      />
      <span
        className={cn(
          "w-1 bg-[var(--athar-green)] rounded-full transition-all duration-300",
          isPlaying ? "h-3 animate-[bounce_0.6s_ease-in-out_infinite_0.2s]" : "h-3"
        )}
      />
      <span
        className={cn(
          "w-1 bg-[var(--athar-green)] rounded-full transition-all duration-300",
          isPlaying ? "h-4 animate-[bounce_0.9s_ease-in-out_infinite_0.4s]" : "h-1.5"
        )}
      />
    </div>
  );
}

export default function ListenPage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [audioFiles, setAudioFiles] = useState<QuranAudioFile[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(RECITERS[0]);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [isReciterModalOpen, setIsReciterModalOpen] = useState(false);
  const [reciterSearchQuery, setReciterSearchQuery] = useState("");
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<"ALL" | "مرتل" | "مجود" | "معلم">("ALL");
  const [surahSearch, setSurahSearch] = useState("");
  const [revelationFilter, setRevelationFilter] = useState<"ALL" | "Meccan" | "Medinan">("ALL");

  const { setAudio, src, isPlaying, togglePlay } = useAudioStore();

  useEffect(() => {
    getSurahList().then(setSurahs).catch(() => {});
  }, []);

  useEffect(() => {
    setLoadingAudio(true);
    getQuranAudio(selectedReciter.id)
      .then(setAudioFiles)
      .catch(() => {})
      .finally(() => setLoadingAudio(false));
  }, [selectedReciter]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isReciterModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isReciterModalOpen]);

  function selectReciter(r: Reciter) {
    setSelectedReciter(r);
    setIsReciterModalOpen(false);
    setReciterSearchQuery("");
  }

  function handlePlay(surah: Surah) {
    const file = audioFiles.find((f) => f.chapter_id === surah.number);
    if (!file) return;
    if (src === file.audio_url) {
      togglePlay();
      return;
    }
    setAudio(file.audio_url, `سورة ${surah.name.replace(/^سُ?و?رَ?ةُ?\s*/, "")}`, `الشيخ ${selectedReciter.name} (${selectedReciter.style})`, "surah", {
      surahNumber: surah.number,
    });
  }

  // Filtered reciters in modal
  const filteredReciters = useMemo(() => {
    return RECITERS.filter((r) => {
      const matchSearch = r.name.includes(reciterSearchQuery) || r.style.includes(reciterSearchQuery);
      const matchStyle = selectedStyleFilter === "ALL" || r.style === selectedStyleFilter;
      return matchSearch && matchStyle;
    });
  }, [reciterSearchQuery, selectedStyleFilter]);

  // Filtered surahs in grid
  const filteredSurahs = useMemo(() => {
    return surahs.filter((s) => {
      const cleanName = s.name.replace(/^سُ?و?رَ?ةُ?\s*/, "");
      const matchSearch =
        s.name.includes(surahSearch) ||
        cleanName.includes(surahSearch) ||
        String(s.number).includes(surahSearch);
      const matchRev =
        revelationFilter === "ALL" || s.revelationType === revelationFilter;
      return matchSearch && matchRev;
    });
  }, [surahs, surahSearch, revelationFilter]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-muted/10 to-background pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-muted/20 py-10 md:py-12">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--athar-green)]/10 blur-3xl rounded-full" />

        <Container size="2xl" className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--athar-green)]/10 text-[var(--athar-green)] text-xs md:text-sm font-medium mb-4 border border-[var(--athar-green)]/20 shadow-xs">
            <Headphones className="h-4 w-4" />
            <span>تلاوات خاشعة بأصوات كبار القراء</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3">
            الاستماع إلى القرآن الكريم
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            استمع إلى سور القرآن الكريم كاملة برواية حفص عن عاصم بمختلف أساليب التلاوة (مرتل، مجود، ومعلم) بصوت نخبة من أعلام التلاوة.
          </p>

          {/* Active Reciter Selector Box */}
          <div className="max-w-2xl mx-auto">
            <div
              onClick={() => setIsReciterModalOpen(true)}
              role="button"
              tabIndex={0}
              className="cursor-pointer flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-border/80 hover:border-[var(--athar-green)] transition-all duration-200 bg-card shadow-md hover:shadow-lg group text-right"
            >
              {/* Reciter Details */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--athar-green)] to-[var(--athar-green-dark)] text-white flex items-center justify-center text-lg font-bold shadow-sm shrink-0">
                  {selectedReciter.name.split(" ")[0][0]}
                </div>
                <div className="text-right min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground font-medium">القارئ المختار:</span>
                    <h3 className="font-bold text-base text-foreground truncate">
                      الشيخ {selectedReciter.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[11px] px-2 py-0.5 rounded-md font-semibold border",
                        STYLE_BADGES[selectedReciter.style]?.bg,
                        STYLE_BADGES[selectedReciter.style]?.text,
                        STYLE_BADGES[selectedReciter.style]?.border
                      )}
                    >
                      {selectedReciter.style}
                    </span>
                    <span className="text-xs text-muted-foreground">{selectedReciter.riwayah}</span>
                  </div>
                </div>
              </div>

              {/* Change Button */}
              <div className="flex items-center gap-2 pl-1 shrink-0">
                <span className="hidden sm:inline-block text-xs font-semibold text-[var(--athar-green)] group-hover:underline">
                  قائمة القراء ({toArabicNumber(RECITERS.length)})
                </span>
                <div className="w-8 h-8 rounded-full bg-muted/70 group-hover:bg-[var(--athar-green)]/10 text-muted-foreground group-hover:text-[var(--athar-green)] flex items-center justify-center transition-colors">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Quick Horizontal Reciter Switcher */}
            <div className="mt-4 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground ml-1 font-medium hidden sm:inline">أبرز القراء:</span>
              {RECITERS.slice(0, 6).map((r) => {
                const isSelected = selectedReciter.id === r.id && selectedReciter.style === r.style;
                return (
                  <button
                    key={`${r.id}-${r.style}`}
                    type="button"
                    onClick={() => selectReciter(r)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-xl border transition-all duration-150 flex items-center gap-1.5",
                      isSelected
                        ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-xs"
                        : "bg-background/80 hover:bg-muted border-border/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{r.name.split(" ")[0]} {r.name.split(" ")[1] ?? ""}</span>
                    <span className="opacity-75 text-[10px]">({r.style})</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setIsReciterModalOpen(true)}
                className="text-xs px-2.5 py-1 rounded-xl border border-dashed border-[var(--athar-green)]/50 text-[var(--athar-green)] hover:bg-[var(--athar-green)]/10 transition-colors font-medium"
              >
                + المزيد
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* Reciters Modal / Dialog */}
      {isReciterModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsReciterModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--athar-green)]/10 text-[var(--athar-green)] flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    قائمة القراء المعتمدين
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    اختر القارئ وأسلوب التلاوة للاستماع إلى المصحف الشريف
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReciterModalOpen(false)}
                className="w-8 h-8 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                title="إغلاق"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Filter & Search Bar */}
            <div className="p-3.5 sm:p-4 border-b border-border/60 bg-muted/10 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={reciterSearchQuery}
                  onChange={(e) => setReciterSearchQuery(e.target.value)}
                  placeholder="ابحث باسم القارئ (مثال: عبد الباسط، المنشاوي، الحصري...)"
                  className="h-10 text-sm pr-10 rounded-xl bg-background border-border/70"
                  autoFocus
                />
                {reciterSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setReciterSearchQuery("")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Style Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["ALL", "مرتل", "مجود", "معلم"] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setSelectedStyleFilter(style)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-xl border transition-colors font-medium",
                      selectedStyleFilter === style
                        ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-xs"
                        : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
                    )}
                  >
                    {style === "ALL" ? `جميع القراء (${toArabicNumber(RECITERS.length)})` : style}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Reciters Grid / List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {filteredReciters.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  لم يتم العثور على أي قارئ يطابق بحثك.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredReciters.map((r) => {
                    const isSelected =
                      selectedReciter.id === r.id && selectedReciter.style === r.style;

                    return (
                      <button
                        key={`${r.id}-${r.style}`}
                        type="button"
                        onClick={() => selectReciter(r)}
                        className={cn(
                          "flex items-center justify-between p-3.5 rounded-2xl border text-right transition-all group",
                          isSelected
                            ? "bg-[var(--athar-green)]/15 border-[var(--athar-green)] shadow-xs ring-1 ring-[var(--athar-green)]/30"
                            : "bg-card hover:bg-muted/60 border-border/70 hover:border-[var(--athar-green)]/40"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors",
                              isSelected
                                ? "bg-[var(--athar-green)] text-white shadow-xs"
                                : "bg-muted text-muted-foreground group-hover:bg-[var(--athar-green)]/10 group-hover:text-[var(--athar-green)]"
                            )}
                          >
                            {r.name.split(" ")[0][0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground truncate">
                              الشيخ {r.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {r.riwayah}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded-md font-semibold border",
                              STYLE_BADGES[r.style]?.bg,
                              STYLE_BADGES[r.style]?.text,
                              STYLE_BADGES[r.style]?.border
                            )}
                          >
                            {r.style}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[var(--athar-green)] text-white flex items-center justify-center shrink-0">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground px-5">
              <span>جميع التلاوات مسجلة برواية حفص عن عاصم</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReciterModalOpen(false)}
                className="h-8 text-xs rounded-xl"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Controls & Surahs Grid */}
      <Container size="2xl" className="py-8">
        {/* Controls Bar: Search & Revelation Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-card border border-border/70 shadow-xs">
          {/* Surah Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={surahSearch}
              onChange={(e) => setSurahSearch(e.target.value)}
              placeholder="ابحث باسم السورة أو رقمها..."
              className="pr-10 h-10 rounded-xl bg-background"
              dir="rtl"
            />
            {surahSearch && (
              <button
                type="button"
                onClick={() => setSurahSearch("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Revelation Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setRevelationFilter("ALL")}
              className={cn(
                "text-xs px-3 py-2 rounded-xl border transition-colors font-medium",
                revelationFilter === "ALL"
                  ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-xs"
                  : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
              )}
            >
              جميع السور ({toArabicNumber(114)})
            </button>
            <button
              type="button"
              onClick={() => setRevelationFilter("Meccan")}
              className={cn(
                "text-xs px-3 py-2 rounded-xl border transition-colors font-medium",
                revelationFilter === "Meccan"
                  ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-xs"
                  : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
              )}
            >
              مكية ({toArabicNumber(86)})
            </button>
            <button
              type="button"
              onClick={() => setRevelationFilter("Medinan")}
              className={cn(
                "text-xs px-3 py-2 rounded-xl border transition-colors font-medium",
                revelationFilter === "Medinan"
                  ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-xs"
                  : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
              )}
            >
              مدنية ({toArabicNumber(28)})
            </button>
          </div>
        </div>

        {/* Loading Surah Audio Indicator */}
        {loadingAudio && (
          <div className="py-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--athar-green)] animate-ping" />
            <span>جاري تحميل ملفات التلاوة للشيخ {selectedReciter.name}...</span>
          </div>
        )}

        {/* Surahs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredSurahs.map((surah) => {
            const file = audioFiles.find((f) => f.chapter_id === surah.number);
            const isCurrent = src === file?.audio_url;
            const playing = isCurrent && isPlaying;
            const cleanName = surah.name.replace(/^سُ?و?رَ?ةُ?\s*/, "");

            return (
              <div
                key={surah.number}
                className={cn(
                  "group relative rounded-2xl border p-4 transition-all duration-200 bg-card text-right flex flex-col justify-between overflow-hidden",
                  isCurrent
                    ? "border-[var(--athar-green)] bg-gradient-to-b from-[var(--athar-green)]/10 to-card shadow-md ring-1 ring-[var(--athar-green)]/30"
                    : "border-border/70 hover:border-[var(--athar-green)]/50 hover:shadow-sm"
                )}
              >
                {/* Top Row: Number, Name, Badges */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Surah Number Icon */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors border",
                        isCurrent
                          ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)]"
                          : "bg-muted/60 text-muted-foreground border-border/50 group-hover:border-[var(--athar-green)]/40 group-hover:text-foreground"
                      )}
                    >
                      {toArabicNumber(surah.number)}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-base font-arabic text-foreground truncate">
                        سورة {cleanName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 font-medium bg-muted/60"
                        >
                          {surah.revelationType === "Meccan" ? "مكية" : "مدنية"}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {toArabicNumber(surah.numberOfAyahs)} آية
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Equalizer animation icon if playing */}
                  {isCurrent && <AudioEqualizer isPlaying={playing} />}
                </div>

                {/* Bottom Row: Play Button & Direct Action Links */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50 gap-2">
                  {/* Play / Pause Primary Action */}
                  <Button
                    size="sm"
                    onClick={() => handlePlay(surah)}
                    disabled={loadingAudio || !file}
                    className={cn(
                      "h-9 px-3 rounded-xl font-medium text-xs transition-all gap-1.5 shrink-0",
                      isCurrent
                        ? "bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white shadow-xs"
                        : "bg-muted/70 hover:bg-[var(--athar-green)] hover:text-white text-foreground border border-border/50"
                    )}
                  >
                    {playing ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>إيقاف مؤقت</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 ml-0.5" />
                        <span>{isCurrent ? "استئناف" : "استماع"}</span>
                      </>
                    )}
                  </Button>

                  {/* Secondary Quick Links (Read & Tafsir) */}
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/quran/${surah.number}`}
                      title="قراءة السورة"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <BookOpen className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/tafsir?surah=${surah.number}`}
                      title="تفسير السورة"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                    </Link>
                    {file && (
                      <a
                        href={file.audio_url}
                        download={`Surah_${surah.number}_${selectedReciter.name}.mp3`}
                        target="_blank"
                        rel="noreferrer"
                        title="تحميل الملف الصوتي"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Search State */}
        {filteredSurahs.length === 0 && (
          <div className="text-center py-16 bg-card border border-border/70 rounded-2xl max-w-md mx-auto p-8 shadow-xs">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-bold text-foreground mb-1">لم يتم العثور على سورة</h3>
            <p className="text-xs text-muted-foreground mb-4">
              لا توجد سورة تطابق بحثك عن &quot;{surahSearch}&quot;.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSurahSearch("");
                setRevelationFilter("ALL");
              }}
              className="text-xs"
            >
              عرض جميع السور
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
}

