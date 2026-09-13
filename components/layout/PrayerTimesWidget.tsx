"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getPrayerTimes, type PrayerTimings } from "@/lib/api/islamic";
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

export default function PrayerTimesWidget() {
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ key: keyof PrayerTimings; label: string; timeStr: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrayerTimes("cairo", "egypt")
      .then((data) => {
        setTimings(data);
        determineNextPrayer(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function determineNextPrayer(times: PrayerTimings) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const key of PRAYER_KEYS) {
      if (!times[key]) continue;
      const [h, m] = times[key].split(":").map(Number);
      const prayerMinutes = h * 60 + m;
      if (prayerMinutes > currentMinutes) {
        setNextPrayer({
          key,
          label: PRAYER_NAMES[key],
          timeStr: format12Hour(times[key]),
        });
        return;
      }
    }

    // After Isha -> Next is tomorrow's Fajr
    setNextPrayer({
      key: "Fajr",
      label: PRAYER_NAMES["Fajr"],
      timeStr: format12Hour(times["Fajr"]),
    });
  }

  function format12Hour(time24: string) {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    let h = parseInt(hours, 10);
    const m = minutes;
    const isPM = h >= 12;
    h = h % 12 || 12;
    return `${h}:${m} ${isPM ? "م" : "ص"}`;
  }

  return (
    <Container as="section" size="2xl" className="py-4">
      <Card className="border-[var(--athar-green)]/20 bg-gradient-to-l from-[var(--athar-green)]/5 via-card to-background">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--athar-green)]/15 text-[var(--athar-green)] flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base font-arabic">مواقيت الصلاة اليوم</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  القاهرة، مصر
                </p>
              </div>
            </div>

            {nextPrayer && (
              <Badge variant="secondary" className="w-fit text-xs bg-[var(--athar-green)]/10 text-[var(--athar-green)] border-0 py-1 px-3">
                الصلاة القادمة: <span className="font-bold mx-1">{nextPrayer.label}</span> ({nextPrayer.timeStr})
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-muted rounded-xl" />
              ))}
            </div>
          ) : timings ? (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRAYER_KEYS.map((key) => {
                const isNext = nextPrayer?.key === key;
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all",
                      isNext
                        ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-sm scale-[1.02]"
                        : "border-border/60 bg-background/50 hover:border-[var(--athar-green)]/40"
                    )}
                  >
                    <span className={cn("text-xs font-medium mb-1", isNext ? "text-white/90" : "text-muted-foreground")}>
                      {PRAYER_NAMES[key]}
                    </span>
                    <span className={cn("text-sm sm:text-base font-bold font-arabic", isNext ? "text-white" : "text-foreground")}>
                      {format12Hour(timings[key])}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Container>
  );
}
