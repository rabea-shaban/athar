"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Vibrate,
  Plus,
  Check,
  Award,
  Flame,
  Layers,
  Heart,
  HelpCircle,
  Clock,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Container from "@/components/layout/Container";
import { cn, toArabicNumber } from "@/lib/utils";

interface TasbeehItem {
  id: string;
  label: string;
  target: number;
  fadl?: string;
  reference?: string;
}

const DEFAULT_TASBEEH_OPTIONS: TasbeehItem[] = [
  {
    id: "subhanallah",
    label: "سُبْحَانَ اللهِ",
    target: 33,
    fadl: "تغرس لك شجرة في الجنة وتمحو الخطايا",
    reference: "صحيح مسلم",
  },
  {
    id: "alhamdulillah",
    label: "الْحَمْدُ لِلَّهِ",
    target: 33,
    fadl: "أفضل الدعاء وتملأ ميزان العبد حسنات",
    reference: "صحيح مسلم",
  },
  {
    id: "allahuakbar",
    label: "اللهُ أَكْبَرُ",
    target: 34,
    fadl: "أحب الكلام إلى الله بعد القرآن",
    reference: "صحيح البخاري",
  },
  {
    id: "tahlil",
    label: "لَا إِلَهَ إِلَّا اللهُ",
    target: 100,
    fadl: "أفضل ما قاله النبي ﷺ والنبيون من قبله",
    reference: "صحيح الترمذي",
  },
  {
    id: "istighfar",
    label: "أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ",
    target: 100,
    fadl: "تفريج الهموم وجلب الرزق ومغفرة الذنوب",
    reference: "سنن أبي داود",
  },
  {
    id: "salawat",
    label: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    target: 100,
    fadl: "من صلى عليّ صلاة صلى الله عليه بها عشراً",
    reference: "صحيح مسلم",
  },
  {
    id: "hawqalah",
    label: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ",
    target: 100,
    fadl: "كنز من كنوز الجنة ودواء لتسعة وتسعين داء",
    reference: "متفق عليه",
  },
  {
    id: "subhan_wa_bihamdihi",
    label: "سُبْحَانَ اللهِ وَبِحَمْدِهِ ، سُبْحَانَ اللهِ الْعَظِيمِ",
    target: 100,
    fadl: "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان",
    reference: "صحيح البخاري",
  },
  {
    id: "yunus",
    label: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    target: 100,
    fadl: "دعاء ذي النون ما دعا به مكروب إلا فرج الله عنه",
    reference: "صحيح الترمذي",
  },
];

export default function TasbeehPage() {
  const [selected, setSelected] = useState<TasbeehItem>(DEFAULT_TASBEEH_OPTIONS[0]);
  const [count, setCount] = useState<number>(0);
  const [cycles, setCycles] = useState<number>(0);
  const [totalDailyCount, setTotalDailyCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(true);
  const [customTarget, setCustomTarget] = useState<string>("");
  const [customZikrText, setCustomZikrText] = useState<string>("");
  const [customTargetInputOpen, setCustomTargetInputOpen] = useState<boolean>(false);
  const [isPressing, setIsPressing] = useState<boolean>(false);

  // Load daily total from localStorage
  useEffect(() => {
    const savedDate = localStorage.getItem("athar-tasbeeh-date");
    const today = new Date().toDateString();

    if (savedDate === today) {
      const savedTotal = Number(localStorage.getItem("athar-tasbeeh-total")) || 0;
      setTotalDailyCount(savedTotal);
    } else {
      localStorage.setItem("athar-tasbeeh-date", today);
      localStorage.setItem("athar-tasbeeh-total", "0");
      setTotalDailyCount(0);
    }
  }, []);

  // Keyboard Spacebar listener to count
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        handleTap();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Synthesize soft click audio
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio context fallback
    }
  };

  const triggerVibration = () => {
    if (!vibrateEnabled) return;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(35);
    }
  };

  const handleTap = () => {
    playClickSound();
    triggerVibration();
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 120);

    const nextCount = count + 1;
    setCount(nextCount);

    // Increment Total Daily
    const nextDaily = totalDailyCount + 1;
    setTotalDailyCount(nextDaily);
    localStorage.setItem("athar-tasbeeh-total", String(nextDaily));

    // Check if cycle is completed
    if (selected.target > 0 && nextCount >= selected.target) {
      setCycles((c) => c + 1);
      // Extra feedback on cycle complete
      if (vibrateEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([60, 50, 90]);
      }
    }
  };

  const handleSelectOption = (opt: TasbeehItem) => {
    setSelected(opt);
    setCount(0);
    setCycles(0);
    setCustomTargetInputOpen(false);
  };

  const handleReset = () => {
    setCount(0);
    setCycles(0);
  };

  const handleResetDaily = () => {
    if (confirm("هل تريد تصفير إجمالي تسبيحات اليوم؟")) {
      setTotalDailyCount(0);
      localStorage.setItem("athar-tasbeeh-total", "0");
    }
  };

  const handleSetCustomTarget = (targetNum: number) => {
    setSelected((prev) => ({
      ...prev,
      target: targetNum,
    }));
    setCount(0);
    setCustomTargetInputOpen(false);
  };

  const handleAddCustomZikr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customZikrText.trim()) return;
    const target = Number(customTarget) > 0 ? Number(customTarget) : 100;
    const newItem: TasbeehItem = {
      id: `custom-${Date.now()}`,
      label: customZikrText.trim(),
      target: target,
      fadl: "ذكر ودعاء مخصص",
    };
    setSelected(newItem);
    setCount(0);
    setCycles(0);
    setCustomZikrText("");
    setCustomTarget("");
    setCustomTargetInputOpen(false);
  };

  const isFreeTarget = selected.target === 0;
  const target = selected.target || 1;
  const progressPercent = isFreeTarget ? 100 : Math.min((count / target) * 100, 100);
  const isDone = !isFreeTarget && count >= target;
  const currentCycleProgress = !isFreeTarget ? count % target : count;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-muted/10 to-background pb-20 select-none">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-muted/20 py-10 md:py-12">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--athar-green)]/10 blur-3xl rounded-full" />

        <Container size="2xl" className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--athar-green)]/10 text-[var(--athar-green)] text-xs md:text-sm font-medium mb-4 border border-[var(--athar-green)]/20 shadow-xs">
            <Heart className="h-4 w-4" />
            <span>السبحة الإلكترونية الذكية</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3 font-arabic">
            التسابيح والأذكار
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            سبحة تفاعلية حديثة مع دعم المؤثرات الصوتية والاهتزاز، وتتبع عدد التسبيحات اليومية مع فضل كل ذكر.
          </p>

          {/* Quick Zikr Selector Carousel */}
          <div className="flex items-center justify-center gap-2 flex-wrap max-w-4xl mx-auto">
            {DEFAULT_TASBEEH_OPTIONS.map((opt) => {
              const isSelected = selected.id === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  className={cn(
                    "text-xs sm:text-sm px-3.5 py-2 rounded-2xl border transition-all duration-200 font-arabic flex items-center gap-2 shadow-xs",
                    isSelected
                      ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-md font-bold scale-[1.03]"
                      : "bg-card hover:bg-muted/80 border-border/70 text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <span>{opt.label}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full",
                      isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {toArabicNumber(opt.target)}
                  </span>
                </button>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Main Masbaha Area */}
      <Container size="lg" className="py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Top Control & Stats Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs text-center">
            {/* Today's Total */}
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground mb-0.5">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span>تسبيحات اليوم</span>
              </div>
              <span className="text-lg font-bold font-mono text-foreground">
                {toArabicNumber(totalDailyCount)}
              </span>
            </div>

            {/* Completed Cycles */}
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground mb-0.5">
                <Award className="h-3.5 w-3.5 text-emerald-600" />
                <span>الدورات المكتملة</span>
              </div>
              <span className="text-lg font-bold font-mono text-foreground">
                {toArabicNumber(cycles)}
              </span>
            </div>

            {/* Target Selector / Pill */}
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40">
              <div className="text-[11px] text-muted-foreground mb-0.5">الهدف الحالي</div>
              <div className="flex items-center justify-center gap-1">
                {[33, 100].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleSetCustomTarget(t)}
                    className={cn(
                      "text-[11px] px-1.5 py-0.5 rounded font-bold transition-colors",
                      selected.target === t
                        ? "bg-[var(--athar-green)] text-white"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {toArabicNumber(t)}
                  </button>
                ))}
                <button
                  onClick={() => handleSetCustomTarget(0)}
                  className={cn(
                    "text-[11px] px-1.5 py-0.5 rounded font-bold transition-colors",
                    selected.target === 0
                      ? "bg-[var(--athar-green)] text-white"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  حر
                </button>
              </div>
            </div>

            {/* Sound & Haptics Toggles */}
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  soundEnabled
                    ? "bg-[var(--athar-green)]/10 text-[var(--athar-green)]"
                    : "text-muted-foreground hover:bg-muted"
                )}
                title={soundEnabled ? "كتم الصوت" : "تفعيل صوت النقر"}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setVibrateEnabled(!vibrateEnabled)}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  vibrateEnabled
                    ? "bg-[var(--athar-green)]/10 text-[var(--athar-green)]"
                    : "text-muted-foreground hover:bg-muted"
                )}
                title={vibrateEnabled ? "إيقاف الاهتزاز" : "تفعيل الاهتزاز"}
              >
                <Vibrate className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main Masbaha Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-lg text-center relative overflow-hidden flex flex-col items-center">
            {/* Active Zikr Text */}
            <div className="mb-6">
              <h2 className="font-arabic text-2xl sm:text-3xl font-bold text-foreground mb-2 leading-relaxed">
                {selected.label}
              </h2>
              {selected.fadl && (
                <p className="text-xs sm:text-sm text-muted-foreground bg-[var(--athar-green)]/5 border border-[var(--athar-green)]/20 px-4 py-2 rounded-2xl inline-block max-w-lg">
                  <span className="text-[var(--athar-green)] font-semibold">الفضل: </span>
                  {selected.fadl}
                  {selected.reference && <span className="opacity-70"> ({selected.reference})</span>}
                </p>
              )}
            </div>

            {/* Circular Progress & Display Counter */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 my-4 flex items-center justify-center">
              {/* Radial SVG Ring */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-muted/30"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="var(--athar-green)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - (isFreeTarget ? 1 : progressPercent / 100))}`}
                  className="transition-all duration-200"
                />
              </svg>

              {/* Counter Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
                <span className="text-5xl sm:text-6xl font-black font-mono text-foreground tracking-tight">
                  {toArabicNumber(count)}
                </span>
                <span className="text-xs text-muted-foreground mt-1 font-semibold">
                  {isFreeTarget ? "عد حر مستمر" : `الهدف: ${toArabicNumber(selected.target)}`}
                </span>
                {cycles > 0 && (
                  <Badge variant="secondary" className="mt-2 text-[10px] px-2 py-0.2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    أتممت {toArabicNumber(cycles)} {cycles > 1 ? "دورات" : "دورة"}
                  </Badge>
                )}
              </div>
            </div>

            {/* Big Interactive Tap Button */}
            <div className="mt-6 mb-4">
              <button
                onClick={handleTap}
                className={cn(
                  "w-40 h-40 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-150 border-4 border-white/20 select-none active:scale-95 group",
                  isDone
                    ? "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                    : "bg-gradient-to-br from-[var(--athar-green)] to-[var(--athar-green-dark)] hover:opacity-95 text-white",
                  isPressing && "scale-95 ring-8 ring-[var(--athar-green)]/30"
                )}
              >
                <span className="text-xl sm:text-2xl font-bold font-arabic tracking-wide drop-shadow-xs">
                  {isDone ? "مبارك! أتممت الدورة" : "سَبِّحْ"}
                </span>
                <span className="text-[11px] opacity-80 mt-1 font-medium">
                  {isDone ? "اضغط للمتابعة" : "أو اضغط Space باللوحة"}
                </span>
              </button>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-border/50 w-full flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="rounded-xl gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>تصفير العداد</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCustomTargetInputOpen(!customTargetInputOpen)}
                className="rounded-xl gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة ذكر مخصص</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetDaily}
                className="rounded-xl gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                title="تصفير إجمالي اليوم"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>تصفير إجمالي اليوم</span>
              </Button>
            </div>

            {/* Custom Zikr Input Form */}
            {customTargetInputOpen && (
              <form
                onSubmit={handleAddCustomZikr}
                className="mt-6 w-full p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-3 text-right animate-in fade-in-50 duration-150"
              >
                <h4 className="text-xs font-bold text-foreground">إضافة صيغة تسبيح أو دعاء مخصص:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    value={customZikrText}
                    onChange={(e) => setCustomZikrText(e.target.value)}
                    placeholder="اكتب صيغة الذكر..."
                    className="sm:col-span-2 text-xs h-9 rounded-xl bg-background"
                    dir="rtl"
                    required
                  />
                  <Input
                    type="number"
                    value={customTarget}
                    onChange={(e) => setCustomTarget(e.target.value)}
                    placeholder="الهدف (مثال: 100)"
                    className="text-xs h-9 rounded-xl bg-background"
                    dir="rtl"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCustomTargetInputOpen(false)}
                    className="h-8 text-xs rounded-lg"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-8 text-xs rounded-lg bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white"
                  >
                    بدء التسبيح به
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

