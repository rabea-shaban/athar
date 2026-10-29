"use client";

import { useState, useEffect } from "react";
import Container from "@/components/layout/Container";
import PageHero from "@/components/layout/PageHero";
import { Clock, MapPin, Compass, Navigation, Calendar, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const CITY_PRESETS = [
  { id: "cairo", nameAr: "القاهرة", countryAr: "مصر", lat: 30.0444, lng: 31.2357 },
  { id: "makkah", nameAr: "مكة المكرمة", countryAr: "السعودية", lat: 21.3891, lng: 39.8579 },
  { id: "madinah", nameAr: "المدينة المنورة", countryAr: "السعودية", lat: 24.5247, lng: 39.5692 },
  { id: "alexandria", nameAr: "الإسكندرية", countryAr: "مصر", lat: 31.2001, lng: 29.9187 },
  { id: "dubai", nameAr: "دبي", countryAr: "الإمارات", lat: 25.2048, lng: 55.2708 },
  { id: "riyadh", nameAr: "الرياض", countryAr: "السعودية", lat: 24.7136, lng: 46.6753 },
  { id: "kuwait", nameAr: "الكويت", countryAr: "الكويت", lat: 29.3759, lng: 47.9774 },
  { id: "istanbul", nameAr: "إسطنبول", countryAr: "تركيا", lat: 41.0082, lng: 28.9784 },
];

export default function PrayerTimesPage() {
  const [selectedCity, setSelectedCity] = useState(CITY_PRESETS[0]);
  const [prayers, setPrayers] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);

  useEffect(() => {
    fetchPrayerTimes(selectedCity.lat, selectedCity.lng);
  }, [selectedCity]);

  const fetchPrayerTimes = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=5`
      );
      const json = await res.json();
      if (json?.data?.timings) {
        setPrayers(json.data.timings);
        calculateNextPrayer(json.data.timings);
      }
    } catch (e) {
      console.warn("Prayer times fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextPrayer = (timings: PrayerTimesData) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const prayerOrder = [
      { name: "الفجر", key: "Fajr" },
      { name: "الشروق", key: "Sunrise" },
      { name: "الظهر", key: "Dhuhr" },
      { name: "العصر", key: "Asr" },
      { name: "المغرب", key: "Maghrib" },
      { name: "العشاء", key: "Isha" },
    ];

    for (const p of prayerOrder) {
      const timeStr = timings[p.key as keyof PrayerTimesData];
      if (!timeStr) continue;
      const [h, m] = timeStr.split(":").map(Number);
      const pMinutes = h * 60 + m;

      if (pMinutes > currentMinutes) {
        setNextPrayer({ name: p.name, time: timeStr });
        return;
      }
    }

    setNextPrayer({ name: "الفجر", time: timings.Fajr });
  };

  const handleUseGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedCity({
          id: "gps",
          nameAr: "الموقع الحالي",
          countryAr: "GPS",
          lat: latitude,
          lng: longitude,
        });
      });
    }
  };

  const prayerCards = [
    { name: "الفجر", key: "Fajr" },
    { name: "الشروق", key: "Sunrise" },
    { name: "الظهر", key: "Dhuhr" },
    { name: "العصر", key: "Asr" },
    { name: "المغرب", key: "Maghrib" },
    { name: "العشاء", key: "Isha" },
  ];

  return (
    <div className="min-h-screen pb-20 space-y-8 text-right" dir="rtl">
      {/* ─── Unified Luxury Islamic PageHero ─── */}
      <PageHero
        breadcrumbs={[
          { label: "الرئيسية", href: "/" },
          { label: "مواقيت الصلاة" },
        ]}
        title="مواقيت الصلاة الدقيقة"
        subtitle="حساب دقيق لمواقيت الصلوات الخمس والشروق في جميع مدن العالم وفق الحسابات الفلكية المعتمدة مع التنبيه بالصلاة القادمة."
        badges={[
          { label: "حساب فلكي دقيق ومعتمد", icon: Clock, variant: "emerald" },
          { label: `${selectedCity.nameAr} — ${selectedCity.countryAr}`, icon: MapPin, variant: "gold" },
          { label: "تحديد الموقع التلقائي GPS", icon: Navigation, variant: "default" },
        ]}
        theme="emerald"
      />

      <Container size="xl" className="space-y-8">


      {/* City & Location Selector */}
      <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs max-w-3xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleUseGps}
            className="font-arabic text-xs gap-2 w-full sm:w-auto"
          >
            <Navigation className="w-4 h-4 text-primary" />
            <span>تحديد موقعي التلقائي (GPS)</span>
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
            <select
              value={selectedCity.id}
              onChange={(e) => {
                const found = CITY_PRESETS.find((c) => c.id === e.target.value);
                if (found) setSelectedCity(found);
              }}
              className="w-full sm:w-48 px-3 py-2 rounded-xl bg-background border border-border/70 text-sm font-arabic focus:outline-none"
            >
              {CITY_PRESETS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameAr} — {c.countryAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Next Prayer Banner */}
        {nextPrayer && (
          <div className="p-4 rounded-2xl bg-[var(--athar-green)]/10 border border-[var(--athar-green)]/30 flex items-center justify-between">
            <div className="text-right">
              <span className="text-xs text-muted-foreground font-arabic block">الصلاة القادمة</span>
              <span className="text-lg font-bold font-arabic text-[var(--athar-green)]">
                صلاة {nextPrayer.name} ({nextPrayer.time})
              </span>
            </div>
            <Clock className="w-6 h-6 text-[var(--athar-green)]" />
          </div>
        )}
      </div>

      {/* Prayers Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
        {prayerCards.map((p) => {
          const time = prayers ? prayers[p.key as keyof PrayerTimesData] : "--:--";
          const isNext = nextPrayer?.name === p.name;

          return (
            <div
              key={p.key}
              className={`p-5 rounded-2xl border text-center space-y-2 transition-all ${
                isNext
                  ? "bg-[var(--athar-green)]/15 border-[var(--athar-green)] shadow-sm scale-105"
                  : "bg-card border-border/70"
              }`}
            >
              <span className="text-xs text-muted-foreground font-arabic block">
                {p.name}
              </span>
              <span className={`text-xl font-bold font-sans ${isNext ? "text-[var(--athar-green)]" : "text-foreground"}`}>
                {time}
              </span>
            </div>
          );
        })}
      </div>
    </Container>
    </div>
  );
}
