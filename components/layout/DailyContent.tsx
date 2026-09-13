"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, BookMarked, Heart, ArrowLeft } from "lucide-react";
import Container from "@/components/layout/Container";
import { getSurah, getHadiths, getAzkar, type Hadith, type Zikr } from "@/lib/api/islamic";

export default function DailyContent() {
  const [ayah, setAyah] = useState<{ text: string; surah: string; number: number } | null>(null);
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [zikr, setZikr] = useState<Zikr | null>(null);

  useEffect(() => {
    // Ayah of the day — based on day of year
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const surahNum = (dayOfYear % 114) + 1;
    getSurah(surahNum).then((s) => {
      const ayahIndex = dayOfYear % s.ayahs.length;
      setAyah({ text: s.ayahs[ayahIndex].text, surah: s.name, number: s.ayahs[ayahIndex].numberInSurah });
    }).catch(() => {});

    // Hadith of the day
    getHadiths(1, 50).then((res) => {
      const idx = dayOfYear % (res.items?.length || 1);
      setHadith(res.items?.[idx] ?? null);
    }).catch(() => {});

    // Zikr of the day
    getAzkar().then((cats) => {
      const morning = cats.find((c) => c.category === "أذكار الصباح");
      if (morning) {
        const idx = dayOfYear % morning.array.length;
        setZikr(morning.array[idx]);
      }
    }).catch(() => {});
  }, []);

  return (
    <Container as="section" size="2xl" className="py-6 pb-12">
      <h2 className="text-lg font-semibold mb-5 text-muted-foreground">من اليوم</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {/* Ayah of the day */}
        <Card className="border-[var(--athar-green)]/20 hover:border-[var(--athar-green)]/40 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[var(--athar-green)]" />
                آية اليوم
              </CardTitle>
              <Link href="/quran" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                القرآن <ArrowLeft className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {ayah ? (
              <>
                <p className="quran-text text-right leading-loose mb-3 text-base">
                  {ayah.text}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {ayah.surah} — آية {ayah.number}
                </Badge>
              </>
            ) : (
              <div className="h-20 animate-pulse bg-muted rounded-md" />
            )}
          </CardContent>
        </Card>

        {/* Hadith of the day */}
        <Card className="border-teal-200/50 dark:border-teal-800/30 hover:border-teal-400/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookMarked className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                حديث اليوم
              </CardTitle>
              <Link href="/hadith" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                الأحاديث <ArrowLeft className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {hadith ? (
              <>
                <p className="text-sm leading-relaxed text-right line-clamp-4 font-arabic">
                  {hadith.arab}
                </p>
                <Badge variant="secondary" className="text-xs mt-3">
                  أبو داود — رقم {hadith.number}
                </Badge>
              </>
            ) : (
              <div className="h-20 animate-pulse bg-muted rounded-md" />
            )}
          </CardContent>
        </Card>

        {/* Zikr of the day */}
        <Card className="border-rose-200/50 dark:border-rose-800/30 hover:border-rose-400/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                ذكر اليوم
              </CardTitle>
              <Link href="/adhkar" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                الأذكار <ArrowLeft className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {zikr ? (
              <>
                <p className="text-sm leading-relaxed text-right font-arabic mb-3">
                  {zikr.content}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {zikr.count} مرة
                  </Badge>
                  {zikr.reference && (
                    <span className="text-xs text-muted-foreground">{zikr.reference}</span>
                  )}
                </div>
              </>
            ) : (
              <div className="h-20 animate-pulse bg-muted rounded-md" />
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
