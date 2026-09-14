"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  Radio as RadioIcon,
  Search,
  Volume2,
  X,
  Signal,
  Flame,
  Globe,
  Headphones,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRadioStations, type RadioStation } from "@/lib/api/islamic";
import { useAudioStore } from "@/store/audioStore";
import { cn, toArabicNumber } from "@/lib/utils";
import Container from "@/components/layout/Container";

// Stable replacements for token-based or HTTP URLs
const STABLE_URLS: Record<number, string> = {
  7: "https://backup.qurango.net/radio/abdulbasit_abdulsamad", // عبدالباسط عبدالصمد
  19: "https://stream.radiojar.com/8s5u5tpdtwzuv", // إذاعة القرآن الكريم من القاهرة
  20: "/api/radio-proxy?url=" + encodeURIComponent("http://live.mp3quran.net:9972/"), // إذاعة السنة النبوية
};

// Ensure any direct http:// stream or token URL is resolved safely to prevent browser mixed content issues
function resolveAudioUrl(stationId: number, url: string): string {
  if (STABLE_URLS[stationId]) return STABLE_URLS[stationId];
  if (!url) return "";
  if (url.includes("8s5u5tpdtwzuv")) {
    return "https://stream.radiojar.com/8s5u5tpdtwzuv";
  }
  if (url.includes("x0vs2vzy6k0uv")) {
    return "/api/radio-proxy?url=" + encodeURIComponent("http://live.mp3quran.net:9972/");
  }
  if (url.startsWith("http://")) {
    return "/api/radio-proxy?url=" + encodeURIComponent(url);
  }
  return url;
}

const EXTRA_STATIONS: RadioStation[] = [
  {
    id: 101,
    name: "إذاعة القرآن الكريم - السعودية (مكة المكرمة)",
    url: "https://stream.radiojar.com/0tpy1h0kxtzuv",
    img: "https://i.pinimg.com/564x/55/16/ab/5516abd3744c3d0b0a7b28bedd5474c0.jpg",
  },
  {
    id: 102,
    name: "إذاعة سورة البقرة (بأصوات كبار القراء)",
    url: "https://backup.qurango.net/radio/albaqarah",
  },
  {
    id: 103,
    name: "إذاعة الفتاوى العامة",
    url: "https://backup.qurango.net/radio/fatwa",
  },
  {
    id: 104,
    name: "إذاعة صحيح البخاري",
    url: "https://backup.qurango.net/radio/saheh-bokharee",
  },
  {
    id: 105,
    name: "إذاعة صحيح مسلم",
    url: "https://backup.qurango.net/radio/saheh-muslim",
  },
  {
    id: 106,
    name: "إذاعة في ظلال السيرة النبوية",
    url: "https://backup.qurango.net/radio/fi_zilal_alsiyra",
  },
  {
    id: 107,
    name: "إذاعة قصص الأنبياء",
    url: "https://backup.qurango.net/radio/alanbiya",
  },
  {
    id: 108,
    name: "إذاعة الشمائل المحمدية",
    url: "https://backup.qurango.net/radio/shmaeel",
  },
  {
    id: 109,
    name: "إذاعة أذكار الصباح والمساء",
    url: "https://backup.qurango.net/radio/athkar_sabah",
  },
  {
    id: 110,
    name: "إذاعة الشيخ أحمد العجمي",
    url: "https://backup.qurango.net/radio/ahmad_alajmy",
  },
  {
    id: 111,
    name: "إذاعة الشيخ سعد الغامدي",
    url: "https://backup.qurango.net/radio/saad_alghamdi",
  },
  {
    id: 112,
    name: "إذاعة الشيخ عبد الرحمن السديس",
    url: "https://backup.qurango.net/radio/abdulrahman_alsudaes",
  },
  {
    id: 113,
    name: "إذاعة الشيخ سعود الشريم",
    url: "https://backup.qurango.net/radio/saud_alshuraim",
  },
  {
    id: 114,
    name: "إذاعة الشيخ علي جابر",
    url: "https://backup.qurango.net/radio/ali_jaber",
  },
];

function AudioEqualizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end justify-center gap-[3px] h-4 w-4">
      <span
        className={cn(
          "w-1 bg-white rounded-full transition-all duration-300",
          isPlaying ? "h-4 animate-[bounce_0.8s_ease-in-out_infinite]" : "h-1.5"
        )}
      />
      <span
        className={cn(
          "w-1 bg-white rounded-full transition-all duration-300",
          isPlaying ? "h-3 animate-[bounce_0.6s_ease-in-out_infinite_0.2s]" : "h-3"
        )}
      />
      <span
        className={cn(
          "w-1 bg-white rounded-full transition-all duration-300",
          isPlaying ? "h-4 animate-[bounce_0.9s_ease-in-out_infinite_0.4s]" : "h-1.5"
        )}
      />
    </div>
  );
}

export default function RadioPage() {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "RECITERS" | "GENERAL">("ALL");

  const { setAudio, src, isPlaying, togglePlay } = useAudioStore();

  useEffect(() => {
    getRadioStations()
      .then((data) => {
        // Resolve stream URLs and remove duplicates
        const existingIds = new Set(data.map((s) => s.id));
        const normalized = data.map((s) => ({
          ...s,
          url: resolveAudioUrl(s.id, s.url),
        }));

        // Add extra stations if not present
        const extras = EXTRA_STATIONS.filter((e) => !existingIds.has(e.id));
        setStations([...normalized, ...extras]);
      })
      .catch(() => {
        setStations(EXTRA_STATIONS);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleStation(station: RadioStation) {
    if (src === station.url) {
      togglePlay();
    } else {
      setAudio(station.url, station.name.trim(), "إذاعة بث مباشر 24/7", "radio");
    }
  }

  // Categorize stations
  const categorizedStations = useMemo(() => {
    return stations.map((s) => {
      const isGeneral =
        s.name.includes("القاهرة") ||
        s.name.includes("السنة") ||
        s.name.includes("الفتاوى") ||
        s.name.includes("تفسير") ||
        s.name.includes("السعودية") ||
        s.name.includes("مكة") ||
        s.name.includes("البخاري") ||
        s.name.includes("مسلم") ||
        s.name.includes("السيرة") ||
        s.name.includes("الأنبياء") ||
        s.name.includes("الشمائل") ||
        s.name.includes("أذكار") ||
        s.name.includes("تلاوات") ||
        s.name.includes("الرقية") ||
        s.name.includes("البقرة") ||
        s.name.includes("العيد");
      return {
        ...s,
        category: isGeneral ? ("GENERAL" as const) : ("RECITERS" as const),
      };
    });
  }, [stations]);

  // Filter stations
  const filteredStations = useMemo(() => {
    return categorizedStations.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const matchCategory = categoryFilter === "ALL" || s.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [categorizedStations, searchQuery, categoryFilter]);

  // Current playing station info
  const currentStation = stations.find((s) => s.url === src);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-muted/10 to-background pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-muted/20 py-10 md:py-12">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-500/10 blur-3xl rounded-full" />

        <Container size="2xl" className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs md:text-sm font-medium mb-4 border border-red-500/20 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <Signal className="h-4 w-4" />
            <span>بث مباشر على مدار الساعة (24/7)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3">
            إذاعات القرآن الكريم
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed">
            استمع مباشرة إلى كبرى إذاعات القرآن الكريم، إذاعة القاهرة، السنة النبوية، ومحطات نخبة من كبار القراء بدقة وجودة عالية.
          </p>

          {/* Active Broadcast Highlight if playing */}
          {currentStation && (
            <div className="max-w-lg mx-auto mb-6 p-3.5 rounded-2xl bg-card border border-[var(--athar-green)]/40 shadow-md flex items-center justify-between gap-3 text-right">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[var(--athar-green)] text-white flex items-center justify-center shrink-0">
                  <RadioIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-[var(--athar-green)] font-bold block">
                    {isPlaying ? "● تستمع الآن إلى:" : "متوقف مؤقتاً:"}
                  </span>
                  <p className="font-bold text-sm text-foreground truncate">
                    {currentStation.name}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => handleStation(currentStation)}
                className="rounded-xl h-9 px-3.5 bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white gap-1.5 shrink-0"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span className="text-xs">{isPlaying ? "إيقاف" : "استئناف"}</span>
              </Button>
            </div>
          )}
        </Container>
      </section>

      {/* Main Content: Search & Filters & Stations Grid */}
      <Container size="2xl" className="py-8">
        {/* Controls Bar: Search & Category Filter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-card border border-border/70 shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن إذاعة (مثل: القاهرة، عبد الباسط، السنة...)"
              className="pr-10 h-10 rounded-xl bg-background"
              dir="rtl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setCategoryFilter("ALL")}
              className={cn(
                "text-xs px-3 py-2 rounded-xl border transition-colors font-medium",
                categoryFilter === "ALL"
                  ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-xs"
                  : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
              )}
            >
              جميع الإذاعات ({toArabicNumber(stations.length)})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("GENERAL")}
              className={cn(
                "text-xs px-3 py-2 rounded-xl border transition-colors font-medium",
                categoryFilter === "GENERAL"
                  ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-xs"
                  : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
              )}
            >
              الإذاعات العامة والمحلية
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("RECITERS")}
              className={cn(
                "text-xs px-3 py-2 rounded-xl border transition-colors font-medium",
                categoryFilter === "RECITERS"
                  ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-xs"
                  : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
              )}
            >
              إذاعات كبار القراء
            </button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse bg-muted rounded-2xl" />
            ))}
          </div>
        ) : (
          /* Stations Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredStations.map((station) => {
              const isCurrentlyPlaying = src === station.url && isPlaying;
              const isActive = src === station.url;
              const hasImgError = imgErrors.has(station.id);
              const imgUrl = station.img && !hasImgError ? station.img : null;

              return (
                <div
                  key={station.id}
                  onClick={() => handleStation(station)}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "group relative flex flex-col justify-between p-3.5 rounded-2xl border text-right transition-all duration-200 cursor-pointer overflow-hidden select-none",
                    isActive
                      ? "border-[var(--athar-green)] bg-gradient-to-b from-[var(--athar-green)]/15 to-card shadow-lg ring-2 ring-[var(--athar-green)]/30 scale-[1.02]"
                      : "border-border/70 bg-card hover:border-[var(--athar-green)]/50 hover:shadow-md hover:-translate-y-0.5"
                  )}
                >
                  {/* Top Image Container */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-muted/60 flex items-center justify-center border border-border/40 shadow-xs">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={station.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() =>
                          setImgErrors((prev) => new Set([...prev, station.id]))
                        }
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-[var(--athar-green)]/10 to-[var(--athar-green)]/20 text-[var(--athar-green)]">
                        <RadioIcon className="h-10 w-10 opacity-70" />
                        <span className="text-[11px] font-bold font-arabic">بث مباشر</span>
                      </div>
                    )}

                    {/* Gradient bottom shadow over image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Live Badge on Top Right */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-red-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>مباشر</span>
                    </div>

                    {/* Audio visualizer if playing */}
                    {isActive && isCurrentlyPlaying && (
                      <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs px-2 py-1 rounded-lg">
                        <AudioEqualizer isPlaying={isCurrentlyPlaying} />
                      </div>
                    )}

                    {/* Hover Play Button Overlay */}
                    <div
                      className={cn(
                        "absolute inset-0 flex items-center justify-center transition-all duration-200",
                        isActive
                          ? "bg-black/30 opacity-100"
                          : "bg-black/25 opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <div className="w-12 h-12 rounded-full bg-[var(--athar-green)] text-white flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
                        {isCurrentlyPlaying ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6 mr-[-2px]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Station Information */}
                  <div className="w-full">
                    <h3
                      className={cn(
                        "text-xs sm:text-sm font-bold leading-snug line-clamp-2 mb-1.5 font-arabic",
                        isActive ? "text-[var(--athar-green)]" : "text-foreground"
                      )}
                    >
                      {station.name.trim()}
                    </h3>

                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Headphones className="h-3 w-3 text-[var(--athar-green)]" />
                        <span>بث إذاعي</span>
                      </span>
                      {isActive && (
                        <span className="font-bold text-[var(--athar-green)]">
                          {isCurrentlyPlaying ? "قيد التشغيل" : "متوقف"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty Search State */}
        {!loading && filteredStations.length === 0 && (
          <div className="text-center py-16 bg-card border border-border/70 rounded-2xl max-w-md mx-auto p-8 shadow-xs">
            <RadioIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-bold text-foreground mb-1">لم يتم العثور على إذاعة</h3>
            <p className="text-xs text-muted-foreground mb-4">
              لا توجد إذاعة تطابق بحثك عن &quot;{searchQuery}&quot;.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("ALL");
              }}
              className="text-xs"
            >
              عرض جميع الإذاعات
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
}

