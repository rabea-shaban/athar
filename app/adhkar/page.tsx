"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  RotateCcw,
  Check,
  Copy,
  Share2,
  ChevronLeft,
  ChevronRight,
  Heart,
  LayoutList,
  Target,
  Plus,
  Minus,
  CheckCircle2,
  Layers,
  Sun,
  Moon,
  Landmark,
  CircleDot,
  MoonStar,
  Sunrise,
  BookOpen,
  HeartHandshake,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Container from "@/components/layout/Container";
import { getAzkar, type AzkarCategory, type Zikr } from "@/lib/api/islamic";
import { cn, toArabicNumber } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "أذكار الصباح": Sunrise,
  "أذكار المساء": Moon,
  "أذكار بعد الصلاة": Landmark,
  "تسابيح": CircleDot,
  "أذكار النوم": MoonStar,
  "أذكار الاستيقاظ": Sun,
  "أدعية قرآنية": BookOpen,
  "أدعية الأنبياء": HeartHandshake,
};

export default function AdhkarPage() {
  const [categories, setCategories] = useState<AzkarCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<AzkarCategory | null>(null);
  const [loading, setLoading] = useState(true);

  // View mode: 'list' (all zikrs in cards) or 'focus' (1 zikr at a time)
  const [viewMode, setViewMode] = useState<"list" | "focus">("list");
  const [focusIndex, setFocusIndex] = useState(0);

  // Counters map: { [zikrIndex]: currentCount }
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [fontSize, setFontSize] = useState<number>(2); // 1: sm, 2: base, 3: lg, 4: xl
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    getAzkar()
      .then((data) => {
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategory(data[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleSelectCategory(cat: AzkarCategory) {
    setSelectedCategory(cat);
    setFocusIndex(0);
    setCounts({});
  }

  const handleIncrement = (index: number, maxCount: number) => {
    const current = counts[index] || 0;
    if (current < maxCount) {
      const next = current + 1;
      setCounts((prev) => ({ ...prev, [index]: next }));

      // Auto-advance in focus mode if done
      if (next >= maxCount && viewMode === "focus" && selectedCategory) {
        if (focusIndex < selectedCategory.array.length - 1) {
          setTimeout(() => {
            setFocusIndex((prev) => prev + 1);
          }, 350);
        }
      }
    }
  };

  const handleResetCount = (index: number) => {
    setCounts((prev) => ({ ...prev, [index]: 0 }));
  };

  const handleResetAllCounts = () => {
    setCounts({});
  };

  const handleCopyZikr = async (zikr: Zikr, index: number) => {
    const text = `${zikr.content}\n${zikr.description ? `\n[الفضل]: ${zikr.description}` : ""}\n${zikr.reference ? `[المصدر]: ${zikr.reference}` : ""}\n— أذكار منصة أَثَر`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Ignored
    }
  };

  const handleShareZikr = async (zikr: Zikr) => {
    const text = `${zikr.content}\n${zikr.description ? `\n[الفضل]: ${zikr.description}` : ""}\n— منصة أَثَر`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedCategory?.category ?? "أذكار المسلم",
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

  // Calculate completed count in selected category
  const totalCompleted = useMemo(() => {
    if (!selectedCategory) return 0;
    return selectedCategory.array.reduce((acc, z, idx) => {
      const target = Number(z.count) || 1;
      const current = counts[idx] || 0;
      return current >= target ? acc + 1 : acc;
    }, 0);
  }, [selectedCategory, counts]);

  const totalItems = selectedCategory?.array.length || 0;
  const progressPercentage = totalItems > 0 ? (totalCompleted / totalItems) * 100 : 0;

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
            <Heart className="h-4 w-4" />
            <span>حصن المسلم والأذكار اليومية</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3 font-arabic">
            الأذكار والأدعية النبوية
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            أذكار الصباح والمساء، أدعية بعد الصلوات، والتسابيح المأثورة من القرآن الكريم والسنة النبوية المطهرة مع عداد تفاعلي ذكي.
          </p>

          {/* Categories Pill Selector (Horizontal Scroll) */}
          <div className="flex items-center justify-center gap-2 flex-wrap max-w-4xl mx-auto">
            {categories.map((cat) => {
              const isSelected = selectedCategory?.category === cat.category;
              const Icon = CATEGORY_ICONS[cat.category] || CircleDot;

              return (
                <button
                  key={cat.category}
                  onClick={() => handleSelectCategory(cat)}
                  className={cn(
                    "text-xs sm:text-sm px-3.5 py-2 rounded-2xl border transition-all duration-200 flex items-center gap-2 shadow-xs",
                    isSelected
                      ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-md font-bold scale-[1.03]"
                      : "bg-card hover:bg-muted/80 border-border/70 text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.category}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {toArabicNumber(cat.count)}
                  </span>
                </button>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Main Content Area */}
      <Container size="2xl" className="py-8">
        {loading ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse bg-muted/60 rounded-3xl" />
            ))}
          </div>
        ) : selectedCategory ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Action Bar / Status Dashboard */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
              {/* Category Title & Progress info */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-2xl bg-[var(--athar-green)]/10 text-[var(--athar-green)] flex items-center justify-center shrink-0">
                  {(() => {
                    const HeaderIcon = CATEGORY_ICONS[selectedCategory.category] || CircleDot;
                    return <HeaderIcon className="w-5 h-5" />;
                  })()}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-base text-foreground font-arabic">
                    {selectedCategory.category}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    أنجزت <strong className="text-[var(--athar-green)]">{toArabicNumber(totalCompleted)}</strong> من أصل{" "}
                    <strong>{toArabicNumber(totalItems)}</strong> ذكراً
                  </p>
                </div>
              </div>

              {/* View Mode & Font controls */}
              <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
                {/* View Mode Switcher */}
                <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/60">
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium",
                      viewMode === "list"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <LayoutList className="h-3.5 w-3.5" />
                    <span>قائمة الأذكار</span>
                  </button>

                  <button
                    onClick={() => setViewMode("focus")}
                    className={cn(
                      "text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium",
                      viewMode === "focus"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Target className="h-3.5 w-3.5" />
                    <span>المسبحة والتركيز</span>
                  </button>
                </div>

                {/* Font Size Controls */}
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

                {/* Reset All Counters */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetAllCounts}
                  className="h-8 text-xs rounded-xl text-muted-foreground hover:text-destructive gap-1"
                  title="تصفير جميع العدادات"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">تصفير</span>
                </Button>
              </div>
            </div>

            {/* Overall Category Progress Bar */}
            <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/40">
              <div
                className="h-full bg-[var(--athar-green)] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* ================= MODE 1: LIST VIEW ================= */}
            {viewMode === "list" && (
              <div className="space-y-4">
                {selectedCategory.array.map((zikr, idx) => {
                  const requiredCount = Number(zikr.count) || 1;
                  const currentCount = counts[idx] || 0;
                  const isDone = currentCount >= requiredCount;
                  const remaining = Math.max(0, requiredCount - currentCount);
                  const isCopied = copiedIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-3xl border p-5 md:p-6 transition-all duration-200 bg-card text-right relative overflow-hidden shadow-xs",
                        isDone
                          ? "border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20"
                          : "border-border/80 hover:border-[var(--athar-green)]/50 hover:shadow-md"
                      )}
                    >
                      {/* Top Header info */}
                      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-muted/60 text-xs font-semibold px-2.5 py-1"
                          >
                            الذكر {toArabicNumber(idx + 1)} من {toArabicNumber(totalItems)}
                          </Badge>
                          <Badge
                            className={cn(
                              "text-xs font-bold px-2.5 py-1",
                              isDone
                                ? "bg-emerald-600 text-white"
                                : "bg-[var(--athar-green)]/10 text-[var(--athar-green)]"
                            )}
                          >
                            التكرار: {toArabicNumber(requiredCount)} {requiredCount > 1 ? "مرات" : "مرة"}
                          </Badge>
                        </div>

                        {/* Status Checkmark */}
                        {isDone && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>اكتمل</span>
                          </div>
                        )}
                      </div>

                      {/* Zikr Main Text */}
                      <div className="py-2 mb-4">
                        <p
                          className={cn(
                            "font-arabic text-foreground font-normal text-right select-text leading-relaxed tracking-wide",
                            fontClasses[fontSize]
                          )}
                        >
                          {zikr.content}
                        </p>
                      </div>

                      {/* Fadl / Description / Reference Box */}
                      {(zikr.description || zikr.reference) && (
                        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 text-xs text-muted-foreground space-y-1.5 mb-5">
                          {zikr.description && (
                            <p className="leading-relaxed">
                              <span className="font-semibold text-foreground">الفضل / البيان: </span>
                              {zikr.description}
                            </p>
                          )}
                          {zikr.reference && (
                            <p className="text-[11px] opacity-80">
                              <span className="font-semibold">المصدر: </span>
                              {zikr.reference}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Bottom Action Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50 flex-wrap gap-3">
                        {/* Interactive Counter Button */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleIncrement(idx, requiredCount)}
                            disabled={isDone}
                            className={cn(
                              "h-11 px-5 rounded-2xl font-bold text-sm transition-all duration-150 flex items-center gap-2 shadow-sm active:scale-95 select-none",
                              isDone
                                ? "bg-emerald-600 text-white cursor-default shadow-none"
                                : "bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white hover:shadow-md"
                            )}
                          >
                            {isDone ? (
                              <>
                                <Check className="h-4 w-4" />
                                <span>تم بحمد الله ({toArabicNumber(requiredCount)}/{toArabicNumber(requiredCount)})</span>
                              </>
                            ) : (
                              <>
                                <span className="text-base font-mono font-extrabold">{toArabicNumber(currentCount)}</span>
                                <span className="opacity-80">/ {toArabicNumber(requiredCount)}</span>
                                <span className="mr-1 text-xs">اضغط للتسبيح</span>
                              </>
                            )}
                          </button>

                          {currentCount > 0 && !isDone && (
                            <button
                              onClick={() => handleResetCount(idx)}
                              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted text-xs transition-colors"
                              title="إعادة تعيين العداد"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Copy & Share Actions */}
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyZikr(zikr, idx)}
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                            title="نسخ الذكر"
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
                            onClick={() => handleShareZikr(zikr)}
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                            title="مشاركة الذكر"
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
            )}

            {/* ================= MODE 2: FOCUS / MASBAHA VIEW ================= */}
            {viewMode === "focus" && selectedCategory.array[focusIndex] && (
              <div className="py-4">
                {(() => {
                  const zikr = selectedCategory.array[focusIndex];
                  const requiredCount = Number(zikr.count) || 1;
                  const currentCount = counts[focusIndex] || 0;
                  const isDone = currentCount >= requiredCount;
                  const remaining = Math.max(0, requiredCount - currentCount);
                  const isCopied = copiedIndex === focusIndex;

                  return (
                    <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-lg text-center relative overflow-hidden">
                      {/* Top status */}
                      <div className="flex items-center justify-between pb-4 mb-6 border-b border-border/50">
                        <span className="text-xs text-muted-foreground font-medium">
                          الذكر {toArabicNumber(focusIndex + 1)} من {toArabicNumber(totalItems)}
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-[var(--athar-green)]/10 text-[var(--athar-green)] font-bold text-xs"
                        >
                          التكرار المطلوب: {toArabicNumber(requiredCount)} مرات
                        </Badge>
                      </div>

                      {/* Zikr Content */}
                      <p
                        className={cn(
                          "font-arabic text-foreground font-normal leading-loose mb-6 select-text max-w-2xl mx-auto",
                          fontClasses[fontSize]
                        )}
                      >
                        {zikr.content}
                      </p>

                      {/* Fadl / Note */}
                      {zikr.description && (
                        <p className="text-xs text-muted-foreground max-w-xl mx-auto mb-6 bg-muted/40 p-3.5 rounded-2xl border border-border/40 leading-relaxed">
                          <strong className="text-foreground">الفضل: </strong> {zikr.description}
                        </p>
                      )}

                      {/* Big Circular Counter Button */}
                      <div className="my-8 flex flex-col items-center justify-center">
                        <button
                          onClick={() => handleIncrement(focusIndex, requiredCount)}
                          disabled={isDone}
                          className={cn(
                            "w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-200 shadow-xl active:scale-95 border-4 select-none group",
                            isDone
                              ? "bg-emerald-600 border-emerald-500 text-white cursor-default"
                              : "bg-gradient-to-br from-[var(--athar-green)] to-[var(--athar-green-dark)] border-white/20 text-white hover:scale-105 hover:shadow-2xl"
                          )}
                        >
                          {isDone ? (
                            <>
                              <Check className="h-10 w-10 mb-1 animate-bounce" />
                              <span className="text-xs font-bold">اكتمل التكرار</span>
                            </>
                          ) : (
                            <>
                              <span className="text-3xl font-extrabold font-mono mb-0.5">
                                {toArabicNumber(currentCount)}
                              </span>
                              <span className="text-xs opacity-80">
                                من {toArabicNumber(requiredCount)}
                              </span>
                              <span className="text-[10px] opacity-70 mt-1">اضغط للتسبيح</span>
                            </>
                          )}
                        </button>

                        <p className="text-xs text-muted-foreground mt-4 font-medium">
                          {isDone
                            ? "تم إنهاء تكرار هذا الذكر بحمد الله"
                            : `متبقي ${toArabicNumber(remaining)} ${remaining > 1 ? "مرات" : "مرة"}`}
                        </p>
                      </div>

                      {/* Stepper Navigation */}
                      <div className="flex items-center justify-between pt-6 border-t border-border/50">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFocusIndex((i) => Math.max(0, i - 1))}
                          disabled={focusIndex === 0}
                          className="rounded-xl gap-1 text-xs"
                        >
                          <ChevronRight className="h-4 w-4" />
                          <span>الذكر السابق</span>
                        </Button>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetCount(focusIndex)}
                            className="text-muted-foreground text-xs gap-1"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>تصفير</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyZikr(zikr, focusIndex)}
                            className="text-muted-foreground text-xs gap-1"
                          >
                            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{isCopied ? "تم النسخ" : "نسخ"}</span>
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFocusIndex((i) => Math.min(totalItems - 1, i + 1))}
                          disabled={focusIndex >= totalItems - 1}
                          className="rounded-xl gap-1 text-xs"
                        >
                          <span>الذكر التالي</span>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        ) : null}
      </Container>
    </div>
  );
}

