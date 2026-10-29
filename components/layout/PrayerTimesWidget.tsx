"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, MapPin, ArrowLeft, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getPrayerTimes,
  formatArabic12Hour,
  isEgyptianWinterTime,
  type PrayerTimings,
} from "@/lib/api/islamic";
import { cn } from "@/lib/utils";
import Container from "@/components/layout/Container";

const PRAYER_NAMES: Record<keyof PrayerTimings, string> = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

const PRAYER_KEYS: (keyof PrayerTimings)[] = [
  "Fajr",
  "Sunrise",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

function formatDateParam(d: Date): string {
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function PrayerTimesWidget() {
  const [dayOffset, setDayOffset] = useState<0 | 1>(0); // 0 = today, 1 = tomorrow
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [tomorrowFajr, setTomorrowFajr] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{
    key: keyof PrayerTimings;
    label: string;
    timeStr: string;
    remainingText: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const isWinter = isEgyptianWinterTime();

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const targetDate = new Date();
    if (dayOffset === 1) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    const dateStr = formatDateParam(targetDate);

    // Fetch timings for current selected day
    getPrayerTimes("cairo", "egypt", undefined, dateStr)
      .then((data) => {
        if (isCancelled) return;
        setTimings(data);

        // Also fetch tomorrow if on today, so after Isha we know tomorrow's exact Fajr
        if (dayOffset === 0) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          getPrayerTimes("cairo", "egypt", undefined, formatDateParam(tomorrow))
            .then((tmData) => {
              if (isCancelled) return;
              if (tmData?.Fajr) {
                setTomorrowFajr(tmData.Fajr);
                determineNextPrayer(data, tmData.Fajr);
              } else {
                determineNextPrayer(data, null);
              }
            })
            .catch(() => {
              if (!isCancelled) determineNextPrayer(data, null);
            });
        } else {
          determineNextPrayer(data, null);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [dayOffset]);

  // Recalculate countdown every minute
  useEffect(() => {
    if (!timings) return;
    const interval = setInterval(() => {
      determineNextPrayer(timings, tomorrowFajr);
    }, 60000);
    return () => clearInterval(interval);
  }, [timings, tomorrowFajr]);

  function determineNextPrayer(times: PrayerTimings, nextDayFajr: string | null) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // If viewing tomorrow, the next prayer is tomorrow's Fajr
    if (dayOffset === 1) {
      if (times.Fajr) {
        setNextPrayer({
          key: "Fajr",
          label: "فجر الغد",
          timeStr: formatArabic12Hour(times.Fajr),
          remainingText: "",
        });
      }
      return;
    }

    for (const key of PRAYER_KEYS) {
      if (!times[key] || !times[key].includes(":")) continue;
      const [h, m] = times[key].split(":").map(Number);
      const prayerMinutes = h * 60 + m;

      if (prayerMinutes > currentMinutes) {
        const diff = prayerMinutes - currentMinutes;
        const diffH = Math.floor(diff / 60);
        const diffM = diff % 60;
        const remainingText =
          diffH > 0 ? `${diffH} س و ${diffM} د` : `${diffM} د`;

        setNextPrayer({
          key,
          label: PRAYER_NAMES[key],
          timeStr: formatArabic12Hour(times[key]),
          remainingText,
        });
        return;
      }
    }

    // After Isha -> Next is tomorrow's Fajr
    const fajrTime = nextDayFajr || times["Fajr"];
    if (fajrTime && fajrTime.includes(":")) {
      const [fh, fm] = fajrTime.split(":").map(Number);
      const fajrTomorrowMinutes = 24 * 60 - currentMinutes + (fh * 60 + fm);
      const diffH = Math.floor(fajrTomorrowMinutes / 60);
      const diffM = fajrTomorrowMinutes % 60;
      const remainingText =
        diffH > 0 ? `${diffH} س و ${diffM} د` : `${diffM} د`;

      setNextPrayer({
        key: "Fajr",
        label: "فجر الغد",
        timeStr: formatArabic12Hour(fajrTime),
        remainingText,
      });
    }
  }

  return (
    <Container as="section" size="2xl" className="py-4">
      <Card className="border-[var(--athar-green)]/25 bg-gradient-to-l from-[var(--athar-green)]/10 via-card to-background shadow-xs overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--athar-green)]/15 text-[var(--athar-green)] flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base sm:text-lg font-arabic text-foreground">
                    مواقيت الصلاة {dayOffset === 0 ? "اليوم" : "غداً"}
                  </h3>
                  {isWinter && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-arabic font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                      <span>❄️</span>
                      <span>التوقيت الشتوي (UTC+2)</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>القاهرة، جمهورية مصر العربية</span>
                  <span className="text-muted-foreground/60">•</span>
                  <span className="text-[11px]">الهيئة المصرية العامة للمساحة</span>
                </p>
              </div>
            </div>

            {/* Controls & Next Prayer */}
            <div className="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
              {/* Day Switcher */}
              <div className="inline-flex items-center p-0.5 rounded-xl bg-muted/80 border border-border/60 text-xs font-arabic">
                <button
                  type="button"
                  onClick={() => setDayOffset(0)}
                  className={cn(
                    "px-3 py-1 rounded-lg transition-all font-medium",
                    dayOffset === 0
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  اليوم
                </button>
                <button
                  type="button"
                  onClick={() => setDayOffset(1)}
                  className={cn(
                    "px-3 py-1 rounded-lg transition-all font-medium",
                    dayOffset === 1
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  غداً
                </button>
              </div>

              {nextPrayer && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-[var(--athar-green)]/15 text-[var(--athar-green)] border border-[var(--athar-green)]/30 py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    الصلاة القادمة: <strong className="mx-0.5 font-bold">{nextPrayer.label}</strong> ({nextPrayer.timeStr})
                  </span>
                  {nextPrayer.remainingText && (
                    <span className="text-[11px] text-muted-foreground dark:text-emerald-300 font-sans mr-1">
                      [متبقي {nextPrayer.remainingText}]
                    </span>
                  )}
                </Badge>
              )}
            </div>
          </div>

          {/* Timings Grid */}
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse bg-muted/70 rounded-2xl" />
              ))}
            </div>
          ) : timings ? (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {PRAYER_KEYS.map((key) => {
                const isNext = nextPrayer?.key === key;
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl border text-center transition-all",
                      isNext
                        ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-md shadow-[var(--athar-green)]/20 scale-[1.03] ring-2 ring-[var(--athar-green)]/30"
                        : "border-border/70 bg-card/60 hover:bg-card hover:border-[var(--athar-green)]/40 hover:shadow-xs"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-arabic mb-1",
                        isNext ? "text-white font-bold" : "text-muted-foreground font-medium"
                      )}
                    >
                      {PRAYER_NAMES[key]}
                    </span>
                    <span
                      className={cn(
                        "text-sm sm:text-base font-bold font-arabic",
                        isNext ? "text-white" : "text-foreground"
                      )}
                    >
                      {formatArabic12Hour(timings[key])}
                    </span>
                    {isNext && (
                      <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full mt-1 font-arabic">
                        القادمة
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Footer bar with link to full page */}
          <div className="mt-4 pt-3 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
            <span className="font-arabic flex items-center gap-1">
              <span>💡</span>
              <span>
                تم تفعيل التوقيت الشتوي تلقائياً بتأخير الساعة 60 دقيقة في مصر.
              </span>
            </span>
            <Link
              href="/prayer-times"
              className="font-arabic font-semibold text-[var(--athar-green)] hover:underline inline-flex items-center gap-1 group"
            >
              <span>جدول جميع المحافظات ومواقيت العالم</span>
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}