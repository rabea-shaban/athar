import Link from "next/link";
import Image from "next/image";
import { Search, BookOpen, Headphones, Radio, Heart, RotateCcw, BookMarked, GraduationCap, Library } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DailyContent from "@/components/layout/DailyContent";
import ReadingProgressBanner from "@/components/layout/ReadingProgressBanner";
import PrayerTimesWidget from "@/components/layout/PrayerTimesWidget";
import Container from "@/components/layout/Container";

const quickLinks = [
  { href: "/quran", icon: BookOpen, label: "القرآن الكريم", color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" },
  { href: "/listen", icon: Headphones, label: "الاستماع", color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400" },
  { href: "/radio", icon: Radio, label: "الإذاعة", color: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400" },
  { href: "/adhkar", icon: Heart, label: "الأذكار", color: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400" },
  { href: "/tasbeeh", icon: RotateCcw, label: "التسابيح", color: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400" },
  { href: "/hadith", icon: BookMarked, label: "الحديث", color: "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400" },
  { href: "/lectures", icon: GraduationCap, label: "الشروحات", color: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400" },
  { href: "/library", icon: Library, label: "المكتبة", color: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Reading Progress */}
      <ReadingProgressBanner />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--athar-green)]/12 via-[var(--athar-green)]/4 to-transparent py-12 md:py-18">
        <Container size="2xl" className="text-center">
          {/* Prominent Logo */}
          <div className="relative w-44 h-44 md:w-56 md:h-56 mx-auto mb-6 flex items-center justify-center filter drop-shadow-md hover:scale-[1.02] transition-transform">
            <Image
              src="/logo.png"
              alt="أَثَر — منصة المعرفة الإسلامية"
              width={220}
              height={220}
              className="w-full h-full object-contain"
              priority
            />
          </div>

          <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-lg mx-auto font-arabic">
            القرآن الكريم · التفسير الميسر · الأذكار والتسابيح · الحديث النبوي · المكتبة الإسلامية
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Link href="/quran-search" className="block">
              <Input
                readOnly
                placeholder="ابحث في آيات القرآن الكريم وسوره..."
                className="pr-11 h-12 text-base cursor-pointer bg-card/90 shadow-sm hover:border-[var(--athar-green)]/60 transition-all rounded-2xl"
              />
            </Link>
          </div>
        </Container>
      </section>

      {/* Quick Links */}
      <Container as="section" size="2xl" className="py-10">
        <h2 className="text-lg font-semibold mb-5 text-muted-foreground">الأقسام</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickLinks.map(({ href, icon: Icon, label, color }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105 hover:shadow-md ${color}`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium text-center">{label}</span>
            </Link>
          ))}
        </div>
      </Container>

      {/* Prayer Times Widget */}
      <PrayerTimesWidget />

      {/* Daily Content */}
      <DailyContent />
    </div>
  );
}
