"use client";

import { useState, useEffect, useMemo, useId } from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import PageHero from "@/components/layout/PageHero";
import {
  Clock,
  MapPin,
  Compass,
  Navigation,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Sun,
  Snowflake,
  Sunrise as SunriseIcon,
  Sunset as SunsetIcon,
  Moon,
  CloudSun,
  Radio as RadioIcon,
  BookOpen,
  Info,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatArabic12Hour,
  isEgyptianWinterTime,
  ensureEgyptianWinterTimings,
  type PrayerTimings,
} from "@/lib/api/islamic";
import { cn } from "@/lib/utils";

interface CityPreset {
  id: string;
  nameAr: string;
  countryAr: string;
  country: string;
  lat: number;
  lng: number;
  method: number;
}

const CITY_PRESETS: CityPreset[] = [
  // جمهورية مصر العربية
  { id: "cairo", nameAr: "القاهرة", countryAr: "مصر", country: "egypt", lat: 30.0444, lng: 31.2357, method: 5 },
  { id: "alexandria", nameAr: "الإسكندرية", countryAr: "مصر", country: "egypt", lat: 31.2001, lng: 29.9187, method: 5 },
  { id: "giza", nameAr: "الجيزة", countryAr: "مصر", country: "egypt", lat: 30.0131, lng: 31.2089, method: 5 },
  { id: "mansoura", nameAr: "المنصورة", countryAr: "مصر", country: "egypt", lat: 31.0409, lng: 31.3785, method: 5 },
  { id: "tanta", nameAr: "طنطا", countryAr: "مصر", country: "egypt", lat: 30.7865, lng: 31.0004, method: 5 },
  { id: "portsaid", nameAr: "بورسعيد", countryAr: "مصر", country: "egypt", lat: 31.2653, lng: 32.3019, method: 5 },
  { id: "suez", nameAr: "السويس", countryAr: "مصر", country: "egypt", lat: 29.9668, lng: 32.5498, method: 5 },
  { id: "ismailia", nameAr: "الإسماعيلية", countryAr: "مصر", country: "egypt", lat: 30.5965, lng: 32.2715, method: 5 },
  { id: "asyut", nameAr: "أسيوط", countryAr: "مصر", country: "egypt", lat: 27.1809, lng: 31.1837, method: 5 },
  { id: "aswan", nameAr: "أسوان", countryAr: "مصر", country: "egypt", lat: 24.0889, lng: 32.8998, method: 5 },
  // العالم العربي والإسلامي
  { id: "makkah", nameAr: "مكة المكرمة", countryAr: "السعودية", country: "saudi", lat: 21.3891, lng: 39.8579, method: 4 },
  { id: "madinah", nameAr: "المدينة المنورة", countryAr: "السعودية", country: "saudi", lat: 24.5247, lng: 39.5692, method: 4 },
  { id: "riyadh", nameAr: "الرياض", countryAr: "السعودية", country: "saudi", lat: 24.7136, lng: 46.6753, method: 4 },
  { id: "jeddah", nameAr: "جدة", countryAr: "السعودية", country: "saudi", lat: 21.4858, lng: 39.1925, method: 4 },
  { id: "jerusalem", nameAr: "القدس الشريف", countryAr: "فلسطين", country: "palestine", lat: 31.7683, lng: 35.2137, method: 3 },
  { id: "dubai", nameAr: "دبي", countryAr: "الإمارات", country: "uae", lat: 25.2048, lng: 55.2708, method: 4 },
  { id: "abudhabi", nameAr: "أبوظبي", countryAr: "الإمارات", country: "uae", lat: 24.4539, lng: 54.3773, method: 4 },
  { id: "kuwait", nameAr: "الكويت", countryAr: "الكويت", country: "kuwait", lat: 29.3759, lng: 47.9774, method: 9 },
  { id: "doha", nameAr: "الدوحة", countryAr: "قطر", country: "qatar", lat: 25.2854, lng: 51.5310, method: 4 },
  { id: "istanbul", nameAr: "إسطنبول", countryAr: "تركيا", country: "turkey", lat: 41.0082, lng: 28.9784, method: 13 },
];

const PRAYER_CARDS = [
  { name: "الفجر", key: "Fajr" as const, icon: SunriseIcon, description: "صلاة الصبح وسنة الفجر" },
  { name: "الشروق", key: "Sunrise" as const, icon: Sun, description: "وقت شروق الشمس وانتهاء وقت الفجر" },
  { name: "الظهر", key: "Dhuhr" as const, icon: Sun, description: "أول صلوات النهار عند زوال الشمس" },
  { name: "العصر", key: "Asr" as const, icon: CloudSun, description: "الصلاة الوسطى" },
  { name: "المغرب", key: "Maghrib" as const, icon: SunsetIcon, description: "أول صلوات الليل عند غروب الشمس" },
  { name: "العشاء", key: "Isha" as const, icon: Moon, description: "صلاة العشاء يعقبها قيام الليل والوتر" },
];

function formatDateParam(d: Date): string {
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function PrayerTimesPage() {
  const citySelectId = useId();
  const [selectedCity, setSelectedCity] = useState<CityPreset>(CITY_PRESETS[0]);
  const [dayOffset, setDayOffset] = useState<0 | 1>(0); // 0 = today, 1 = tomorrow
  const [dstMode, setDstMode] = useState<"auto" | "winter" | "summer">("auto");
  const [prayers, setPrayers] = useState<PrayerTimings | null>(null);
  const [tomorrowFajr, setTomorrowFajr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nowDate, setNowDate] = useState<Date>(new Date());
  const [hijriDate, setHijriDate] = useState<string>("");

  const isEgypt =
    selectedCity.country === "egypt" ||
    selectedCity.id === "cairo" ||
    selectedCity.id === "alexandria" ||
    (selectedCity.lat >= 21.5 && selectedCity.lat <= 32.5 && selectedCity.lng >= 24.5 && selectedCity.lng <= 37.0);

  const isWinterActive = dstMode === "winter" || (dstMode === "auto" && isEgyptianWinterTime());

  // Clock ticker for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNowDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch prayer timings
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const targetDate = new Date();
    if (dayOffset === 1) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    const dateStr = formatDateParam(targetDate);

    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${selectedCity.lat}&longitude=${selectedCity.lng}&method=${selectedCity.method}`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (isCancelled) return;
        if (json?.data?.timings) {
          let timingsData = json.data.timings as PrayerTimings;
          if (isEgypt) {
            timingsData = ensureEgyptianWinterTimings(timingsData, dstMode);
          }
          setPrayers(timingsData);

          // Format Hijri Date
          if (json?.data?.date?.hijri) {
            const h = json.data.date.hijri;
            setHijriDate(`${h.day} ${h.month.ar} ${h.year} هـ`);
          }
        }

        // Fetch tomorrow Fajr if on today for accurate next prayer after Isha
        if (dayOffset === 0) {
          const tmDate = new Date();
          tmDate.setDate(tmDate.getDate() + 1);
          const tmUrl = `https://api.aladhan.com/v1/timings/${formatDateParam(tmDate)}?latitude=${selectedCity.lat}&longitude=${selectedCity.lng}&method=${selectedCity.method}`;
          fetch(tmUrl)
            .then((r) => r.json())
            .then((tmJson) => {
              if (isCancelled) return;
              if (tmJson?.data?.timings?.Fajr) {
                let tmTimings = tmJson.data.timings;
                if (isEgypt) {
                  tmTimings = ensureEgyptianWinterTimings(tmTimings, dstMode);
                }
                setTomorrowFajr(tmTimings.Fajr);
              }
            })
            .catch(() => {});
        }
      })
      .catch((e) => {
        console.warn("Prayer times fetch error:", e);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedCity, dayOffset, dstMode, isEgypt]);

  // Calculate Next Prayer and Live Countdown
  const nextPrayerData = useMemo(() => {
    if (!prayers) return null;

    const currentSeconds =
      nowDate.getHours() * 3600 +
      nowDate.getMinutes() * 60 +
      nowDate.getSeconds();
    const currentMinutes = Math.floor(currentSeconds / 60);

    // If viewing tomorrow, the next is tomorrow's Fajr
    if (dayOffset === 1) {
      return {
        name: "فجر الغد",
        key: "Fajr",
        time: prayers.Fajr,
        formattedTime: formatArabic12Hour(prayers.Fajr),
        countdown: null,
      };
    }

    // Check today's remaining prayers
    for (const p of PRAYER_CARDS) {
      const timeStr = prayers[p.key];
      if (!timeStr || !timeStr.includes(":")) continue;
      const [h, m] = timeStr.split(":").map(Number);
      const prayerSeconds = (h * 60 + m) * 60;

      if (prayerSeconds > currentSeconds) {
        const diffSec = prayerSeconds - currentSeconds;
        const diffH = Math.floor(diffSec / 3600);
        const diffM = Math.floor((diffSec % 3600) / 60);
        const diffS = diffSec % 60;
        const countdown = `${diffH.toString().padStart(2, "0")}:${diffM
          .toString()
          .padStart(2, "0")}:${diffS.toString().padStart(2, "0")}`;

        return {
          name: p.name,
          key: p.key,
          time: timeStr,
          formattedTime: formatArabic12Hour(timeStr),
          countdown,
          hours: diffH,
          minutes: diffM,
        };
      }
    }

    // All today's prayers finished -> Next is tomorrow's Fajr
    const targetFajr = tomorrowFajr || prayers.Fajr;
    if (targetFajr && targetFajr.includes(":")) {
      const [fh, fm] = targetFajr.split(":").map(Number);
      const fajrSeconds = (fh * 60 + fm) * 60;
      const diffSec = 24 * 3600 - currentSeconds + fajrSeconds;
      const diffH = Math.floor(diffSec / 3600);
      const diffM = Math.floor((diffSec % 3600) / 60);
      const diffS = diffSec % 60;
      const countdown = `${diffH.toString().padStart(2, "0")}:${diffM
        .toString()
        .padStart(2, "0")}:${diffS.toString().padStart(2, "0")}`;

      return {
        name: "فجر الغد",
        key: "Fajr",
        time: targetFajr,
        formattedTime: formatArabic12Hour(targetFajr),
        countdown,
        hours: diffH,
        minutes: diffM,
      };
    }

    return null;
  }, [prayers, nowDate, dayOffset, tomorrowFajr]);

  // GPS handler
  const handleUseGps = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setSelectedCity({
            id: "gps",
            nameAr: "موقعي الحالي (GPS)",
            countryAr: "موقعك",
            country: latitude >= 21.5 && latitude <= 32.5 && longitude >= 24.5 && longitude <= 37.0 ? "egypt" : "other",
            lat: latitude,
            lng: longitude,
            method: latitude >= 21.5 && latitude <= 32.5 && longitude >= 24.5 && longitude <= 37.0 ? 5 : 3,
          });
        },
        () => {
          setLoading(false);
        }
      );
    }
  };

  const gregorianDateText = useMemo(() => {
    const d = new Date();
    if (dayOffset === 1) d.setDate(d.getDate() + 1);
    return d.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [dayOffset]);

  return (
    <div className="min-h-screen pb-20 space-y-8 text-right" dir="rtl">
      {/* ─── Unified Luxury Islamic PageHero ─── */}
      <PageHero
        breadcrumbs={[
          { label: "الرئيسية", href: "/" },
          { label: "مواقيت الصلاة" },
        ]}
        title="مواقيت الصلاة الدقيقة"
        subtitle="حساب دقيق لمواقيت الصلوات الخمس والشروق في محافظات مصر والعالم وفق الحسابات الفلكية المعتمدة مع الدعم الكامل للتوقيت الشتوي والتنبيه بالصلاة القادمة."
        badges={[
          { label: "حساب فلكي معتمد", icon: Clock, variant: "emerald" },
          { label: `${selectedCity.nameAr} — ${selectedCity.countryAr}`, icon: MapPin, variant: "gold" },
          {
            label: isWinterActive ? "التوقيت الشتوي (UTC+2) معتمد" : "التوقيت الصيفي (UTC+3)",
            icon: isWinterActive ? Snowflake : Sun,
            variant: "default",
          },
        ]}
        theme="emerald"
      />

      <Container size="xl" className="space-y-6">
        {/* Winter Time Alert Banner for Egypt */}
        {isEgypt && isWinterActive && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-l from-blue-500/10 via-card to-background border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Snowflake className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base font-arabic text-foreground flex items-center gap-2">
                  <span>تم تفعيل التوقيت الشتوي رسمياً في جمهورية مصر العربية</span>
                  <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                    UTC+2
                  </Badge>
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 font-arabic">
                  تم تأخير الساعة 60 دقيقة وتحديث كافة مواقيت الصلاة تلقائياً وفقاً للهيئة المصرية العامة للمساحة ودار الإفتاء المصرية.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDstMode(dstMode === "winter" ? "auto" : "winter")}
                className="text-xs font-arabic border-blue-500/30 hover:bg-blue-500/10"
              >
                {dstMode === "winter" ? "إلغاء التثبيت" : "تثبيت الشتوي دائماً"}
              </Button>
            </div>
          </div>
        )}

        {/* City & Date Controls Card */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-5">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* City Selector & GPS */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 flex-1">
              <Button
                variant="outline"
                onClick={handleUseGps}
                className="font-arabic text-xs gap-2 shrink-0 border-border/80 hover:border-primary/50"
              >
                <Navigation className="w-4 h-4 text-primary" />
                <span>تحديد موقعي (GPS)</span>
              </Button>

              <div className="relative flex-1 min-w-[200px]">
                <MapPin className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <label htmlFor={citySelectId} className="sr-only">
                  اختر المدينة أو المحافظة
                </label>
                <select
                  id={citySelectId}
                  value={selectedCity.id}
                  onChange={(e) => {
                    const found = CITY_PRESETS.find((c) => c.id === e.target.value);
                    if (found) setSelectedCity(found);
                  }}
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-background border border-border/70 text-sm font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <optgroup label="جمهورية مصر العربية (التوقيت الشتوي)">
                    {CITY_PRESETS.filter((c) => c.country === "egypt").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr} — {c.countryAr}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="العالم العربي والإسلامي">
                    {CITY_PRESETS.filter((c) => c.country !== "egypt").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr} — {c.countryAr}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Day Toggle & Timezone Settings */}
            <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
              {/* Day Switcher */}
              <div className="inline-flex items-center p-1 rounded-2xl bg-muted/80 border border-border/70 text-xs font-arabic">
                <button
                  type="button"
                  onClick={() => setDayOffset(0)}
                  className={cn(
                    "px-4 py-1.5 rounded-xl transition-all font-medium",
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
                    "px-4 py-1.5 rounded-xl transition-all font-medium",
                    dayOffset === 1
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  غداً
                </button>
              </div>

              {/* Timezone Switcher */}
              {isEgypt && (
                <div className="inline-flex items-center p-1 rounded-2xl bg-muted/80 border border-border/70 text-xs font-arabic">
                  <button
                    type="button"
                    onClick={() => setDstMode("winter")}
                    title="التوقيت الشتوي (تأخير ساعة - UTC+2)"
                    className={cn(
                      "px-3 py-1.5 rounded-xl transition-all font-medium flex items-center gap-1.5",
                      isWinterActive
                        ? "bg-blue-500 text-white shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Snowflake className="w-3.5 h-3.5" />
                    <span>شتوي</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDstMode("summer")}
                    title="التوقيت الصيفي (تقديم ساعة - UTC+3)"
                    className={cn(
                      "px-3 py-1.5 rounded-xl transition-all font-medium flex items-center gap-1.5",
                      dstMode === "summer"
                        ? "bg-amber-500 text-white shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>صيفي</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Date Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/60 text-xs text-muted-foreground font-arabic">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{gregorianDateText}</span>
              {hijriDate && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="font-semibold text-foreground/80">{hijriDate}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                {selectedCity.method === 5
                  ? "الهيئة المصرية العامة للمساحة (الفجر 19.5° • العشاء 17.5°)"
                  : selectedCity.method === 4
                  ? "جامعة أم القرى (مكة المكرمة)"
                  : "رابطة العالم الإسلامي"}
              </span>
            </div>
          </div>
        </div>

        {/* Next Prayer Live Banner */}
        {nextPrayerData && (
          <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-gradient-to-l from-[var(--athar-green)]/15 via-card to-background border-2 border-[var(--athar-green)]/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 text-right">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--athar-green)]/20 text-[var(--athar-green)] font-arabic">
                  الصلاة القادمة
                </span>
                {dayOffset === 1 && (
                  <Badge variant="outline" className="text-[10px] font-arabic">
                    جدول الغد
                  </Badge>
                )}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-arabic text-foreground flex items-center gap-3">
                <span>صلاة {nextPrayerData.name}</span>
                <span className="text-primary font-sans font-bold">
                  {nextPrayerData.formattedTime}
                </span>
              </h3>
              <p className="text-xs text-muted-foreground font-arabic">
                {isWinterActive && isEgypt
                  ? "المواقيت معتمدة وفق التوقيت الشتوي الجديد (تأخير 60 دقيقة - UTC+2)"
                  : "وفق التوقيت المحلي للمدينة المحددة"}
              </p>
            </div>

            {/* Live Countdown Box */}
            {nextPrayerData.countdown && (
              <div className="flex flex-col items-center md:items-end gap-1.5 bg-background/80 backdrop-blur-sm border border-[var(--athar-green)]/30 p-4 rounded-2xl shrink-0 w-full md:w-auto shadow-xs">
                <span className="text-xs font-arabic text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>الوقت المتبقي لرفع الأذان</span>
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[var(--athar-green)] tracking-wider" dir="ltr">
                  {nextPrayerData.countdown}
                </span>
                <span className="text-[11px] font-arabic text-muted-foreground/80">
                  {nextPrayerData.hours > 0
                    ? `${nextPrayerData.hours} ساعة و ${nextPrayerData.minutes} دقيقة`
                    : `${nextPrayerData.minutes} دقيقة`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Prayer Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {PRAYER_CARDS.map((p) => {
            const time24 = prayers ? prayers[p.key] : "--:--";
            const formattedTime = formatArabic12Hour(time24);
            const isNext = nextPrayerData?.key === p.key && (dayOffset === 0 || p.key === "Fajr");
            const Icon = p.icon;

            // Check if passed
            let isPassed = false;
            if (dayOffset === 0 && prayers && time24 && time24.includes(":")) {
              const [h, m] = time24.split(":").map(Number);
              const pMin = h * 60 + m;
              const currentMin = nowDate.getHours() * 60 + nowDate.getMinutes();
              isPassed = pMin <= currentMin && !isNext;
            }

            return (
              <div
                key={p.key}
                className={cn(
                  "relative p-5 rounded-3xl border text-center transition-all duration-300 flex flex-col justify-between overflow-hidden",
                  loading && "opacity-60",
                  isNext
                    ? "bg-gradient-to-b from-[var(--athar-green)]/20 via-card to-background border-[var(--athar-green)] shadow-lg shadow-[var(--athar-green)]/15 scale-[1.03] ring-2 ring-[var(--athar-green)]/40"
                    : isPassed
                    ? "bg-card/40 border-border/50 opacity-75"
                    : "bg-card border-border/80 hover:border-[var(--athar-green)]/40 hover:shadow-xs"
                )}
              >
                {/* Header with icon and name */}
                <div>
                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl mx-auto flex items-center justify-center mb-3 transition-colors",
                      isNext
                        ? "bg-[var(--athar-green)] text-white shadow-xs"
                        : "bg-muted/80 text-muted-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span
                    className={cn(
                      "text-base font-bold font-arabic block mb-1",
                      isNext ? "text-[var(--athar-green)]" : "text-foreground"
                    )}
                  >
                    {p.name}
                  </span>
                </div>

                {/* Main time display */}
                <div className="my-3 space-y-0.5">
                  <span
                    className={cn(
                      "text-xl sm:text-2xl font-extrabold font-arabic block",
                      isNext ? "text-[var(--athar-green)]" : "text-foreground"
                    )}
                  >
                    {formattedTime || "--:--"}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground/70 block" dir="ltr">
                    {time24}
                  </span>
                </div>

                {/* Status tag */}
                <div className="pt-2 border-t border-border/40">
                  {isNext ? (
                    <span className="inline-block text-[11px] font-bold font-arabic text-[var(--athar-green)] bg-[var(--athar-green)]/15 px-2.5 py-0.5 rounded-full">
                      الصلاة القادمة
                    </span>
                  ) : isPassed ? (
                    <span className="inline-block text-[10px] font-arabic text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                      مضت
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] font-arabic text-muted-foreground/70">
                      {p.description}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanatory Guide & Features Section */}
        <div className="grid md:grid-cols-3 gap-5 pt-4">
          {/* Card 1: Winter Time Guide */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3 text-right">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-blue-500" />
            </div>
            <h4 className="font-bold text-base font-arabic text-foreground">
              التوقيت الشتوي في مصر (UTC+2)
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-arabic">
              وفقاً للقانون رقم 24 لسنة 2023، ينتهي التوقيت الصيفي ليلة الجمعة الأخيرة من شهر أكتوبر بتأخير الساعة 60 دقيقة. جميع مواقيت الصلاة في منصة أثر يتم تحديثها فورياً وحسابها فلكياً لتتوافق بدقة متناهية مع مساجد جمهورية مصر العربية.
            </p>
          </div>

          {/* Card 2: Calculation Method */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3 text-right">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base font-arabic text-foreground">
              الهيئة المصرية العامة للمساحة
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-arabic">
              تعتمد أثر معادلات الهيئة المصرية العامة للمساحة المعتمدة رسمياً من دار الإفتاء المصرية، والتي تحدد زاوية انخفاض الشمس للفجر بـ 19.5 درجة، وللعشاء بـ 17.5 درجة، مع احتساب الشروق والزوال بدقة خطوط الطول والعرض.
            </p>
          </div>

          {/* Card 3: Quick Navigation */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3 text-right flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base font-arabic text-foreground">
                القبلة والأذكار والإذاعة
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-arabic">
                استكمل عبادتك اليومية بتحديد اتجاه القبلة الدقيق لموقعك، ومتابعة أذكار الصباح والمساء، أو الاستماع إلى إذاعة القرآن الكريم مباشرة.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Link href="/qibla" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs font-arabic gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-primary" />
                  <span>اتجاه القبلة</span>
                </Button>
              </Link>
              <Link href="/adhkar" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs font-arabic gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span>الأذكار</span>
                </Button>
              </Link>
              <Link href="/radio" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs font-arabic gap-1.5">
                  <RadioIcon className="w-3.5 h-3.5 text-primary" />
                  <span>الإذاعة</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}