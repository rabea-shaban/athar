import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/layout/Container";
import {
  Download,
  Smartphone,
  Zap,
  ShieldCheck,
  Globe,
  Clock,
  BookOpen,
  Heart,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_DOWNLOAD_CONFIG } from "@/lib/app-download";

export const metadata: Metadata = {
  title: "تحميل تطبيق أَثَر للأندرويد (APK / Stores) — ATHAR",
  description:
    "حمّل تطبيق أَثَر للأندرويد لمتابعة مواقيت الصلاة والأذان المحلي والقراءة والاستماع للقرآن الكريم والأذكار بدون إنترنت.",
  keywords: [
    "تحميل تطبيق أثر",
    "تطبيق أثر أندرويد",
    "تنزيل أثر APK",
    "تطبيق مواقيت الصلاة والأذان",
    "Athar Android App",
    "Athar APK",
  ],
  alternates: {
    canonical: "https://athar-library.vercel.app/download",
  },
  openGraph: {
    title: "تحميل تطبيق أَثَر للأندرويد — ATHAR",
    description:
      "منصة المعرفة الإسلامية على هاتفك: قرآن، أذان محلي بدون إنترنت، أذكار، ومكتبة إسلامية شمولية.",
    url: "https://athar-library.vercel.app/download",
    siteName: "أَثَر — ATHAR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "تحميل تطبيق أَثَر",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "تحميل تطبيق أَثَر للأندرويد — ATHAR",
    description: "منصة المعرفة الإسلامية على هاتفك بدون إنترنت.",
    images: ["/og-image.png"],
  },
};

export default function DownloadPage() {
  const cfg = APP_DOWNLOAD_CONFIG;

  const hasAnyAvailableDownload =
    cfg.downloads.directApk.available ||
    cfg.downloads.googlePlay.available ||
    cfg.downloads.apkPure.available;

  const appFeatures = [
    {
      icon: Clock,
      title: "محرك أذان محلي أصلي (Kotlin)",
      desc: "حساب فلكي دقيق لمواقيت الصلاة وإطلاق الأذان خلفية وبدون إنترنت عند موعد الصلاة.",
    },
    {
      icon: BookOpen,
      title: "المصحف الشريف والتفسير",
      desc: "قراءة وتلاوة آيات القرآن الكريم بصوت كبار القراء والتفسير الميسر المكتمل.",
    },
    {
      icon: Heart,
      title: "الأذكار والسبحة الإلكترونية",
      desc: "حصن المسلم اليومي مع عداد تسبيح محلي ذكي لحفظ الأذكار والاستغفار.",
    },
    {
      icon: Smartphone,
      title: "تجربة إسلامية بدون إعلانات",
      desc: "تصميم أنيق هادئ باللغة العربية والوضع الداكن، خالي تماماً من الإعلانات المزعجة.",
    },
  ];

  return (
    <Container size="xl" className="py-10 space-y-12">
      {/* Brand Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="relative w-24 h-24 mx-auto mb-2">
          <Image
            src="/logo.png"
            alt="أَثَر — تطبيق الهواتف الذكية"
            width={96}
            height={96}
            className="w-full h-full object-contain filter drop-shadow-md"
            priority
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--athar-green)]/15 text-[var(--athar-green)] text-xs font-bold font-arabic">
          <Smartphone className="w-3.5 h-3.5" />
          <span>تطبيق الهواتف الذكية للأندرويد</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-arabic text-foreground">
          حمّل تطبيق <span className="text-[var(--athar-green)]">أَثَر</span> للأندرويد
        </h1>

        <p className="text-muted-foreground font-arabic text-sm sm:text-base leading-relaxed">
          منصة المعرفة الإسلامية على هاتفك المحمول: قرآن، أذان محلي بدون إنترنت، أذكار، ومكتبة شاملة بتجربة هادئة ونقية.
        </p>
      </div>

      {/* Version Specs Card */}
      <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs max-w-3xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
            <span className="text-[11px] text-muted-foreground font-arabic block">أحدث إصدار</span>
            <span className="text-base font-bold font-sans text-[var(--athar-green)]">v{cfg.latestVersion}</span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
            <span className="text-[11px] text-muted-foreground font-arabic block">تاريخ التحديث</span>
            <span className="text-xs font-bold font-arabic text-foreground">{cfg.releaseDate}</span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
            <span className="text-[11px] text-muted-foreground font-arabic block">متطلبات النظام</span>
            <span className="text-xs font-bold font-arabic text-foreground">{cfg.minAndroidVersion}</span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
            <span className="text-[11px] text-muted-foreground font-arabic block">حزمة التطبيق</span>
            <span className="text-[11px] font-mono text-muted-foreground truncate dir-ltr block">
              {cfg.packageName}
            </span>
          </div>
        </div>
      </div>

      {/* Download Sources Section */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold font-arabic">مصادر التحميل والتنزيل</h2>
          <p className="text-xs text-muted-foreground font-arabic">اختر المصدر المناسب لجهازك</p>
        </div>

        {!hasAnyAvailableDownload && (
          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-base font-arabic text-amber-800 dark:text-amber-200">
                التطبيق قيد المراجعة والنشر القريب
              </h3>
              <p className="text-xs text-amber-700/90 dark:text-amber-300/90 font-arabic leading-relaxed max-w-lg mx-auto">
                يجري حالياً مراجعة وإعداد تطبيق أثر بـ متاجر التطبيقات المباشرة. يمكنك الاستفادة الكاملة المباشرة من كافة ميزات القرآن والأذكار والمستندات عبر منصتنا الحية على الويب الآن.
              </p>
            </div>
            <Link href="/">
              <Button className="font-arabic text-xs font-bold gap-2 py-5 px-6">
                <Globe className="w-4 h-4" />
                <span>تصفّح منصة أَثَر الويب الآن</span>
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Direct APK */}
          <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <Download className="w-4.5 h-4.5" />
                </div>
                {cfg.downloads.directApk.available ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-arabic">
                    متاح
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-arabic">
                    قريباً
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm font-arabic">ملف APK مباشر</h3>
              <p className="text-xs text-muted-foreground font-arabic">
                تثبيت مباشر للأندرويد ({cfg.downloads.directApk.size || "~28 ميجابايت"})
              </p>
            </div>

            {cfg.downloads.directApk.available ? (
              <a href="/api/download" target="_blank" rel="noopener noreferrer">
                <Button className="w-full font-arabic text-xs font-bold gap-2 py-5 bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white shadow-xs">
                  <Download className="w-4 h-4" />
                  <span>تنزيل APK مباشر</span>
                </Button>
              </a>
            ) : (
              <Button disabled variant="outline" className="w-full font-arabic text-xs">
                غير متاح حالياً
              </Button>
            )}
          </div>

          {/* Google Play */}
          <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <Smartphone className="w-4.5 h-4.5" />
                </div>
                {cfg.downloads.googlePlay.available ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-arabic">
                    متاح
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-arabic">
                    قيد النشر
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm font-arabic">Google Play Store</h3>
              <p className="text-xs text-muted-foreground font-arabic">المتجر الرسمي للأندرويد</p>
            </div>

            {cfg.downloads.googlePlay.available && cfg.downloads.googlePlay.url ? (
              <a href={cfg.downloads.googlePlay.url} target="_blank" rel="noopener noreferrer">
                <Button className="w-full font-arabic text-xs font-bold gap-2">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح المتجر</span>
                </Button>
              </a>
            ) : (
              <Button disabled variant="outline" className="w-full font-arabic text-xs">
                قريباً على Google Play
              </Button>
            )}
          </div>

          {/* APKPure */}
          <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <Globe className="w-4.5 h-4.5" />
                </div>
                {cfg.downloads.apkPure.available ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-arabic">
                    متاح
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-arabic">
                    قيد النشر
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm font-arabic">متجر APKPure</h3>
              <p className="text-xs text-muted-foreground font-arabic">تثبيت وتحديثات عبر APKPure</p>
            </div>

            {cfg.downloads.apkPure.available && cfg.downloads.apkPure.url ? (
              <a href={cfg.downloads.apkPure.url} target="_blank" rel="noopener noreferrer">
                <Button className="w-full font-arabic text-xs font-bold gap-2">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>زيارة APKPure</span>
                </Button>
              </a>
            ) : (
              <Button disabled variant="outline" className="w-full font-arabic text-xs">
                قريباً على APKPure
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Release Notes Card */}
      <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs max-w-3xl mx-auto space-y-3">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h3 className="font-bold text-base font-arabic">ما الجديد في الإصدار v{cfg.latestVersion}؟</h3>
          <Zap className="w-4 h-4 text-[var(--athar-green)]" />
        </div>
        <p className="text-sm text-muted-foreground font-arabic leading-relaxed">
          {cfg.releaseNotes}
        </p>
      </div>

      {/* Features Highlights */}
      <div className="max-w-3xl mx-auto space-y-4">
        <h3 className="font-bold text-lg font-arabic text-center">أبرز ميزات تطبيق أثر</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {appFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--athar-green)]/15 text-[var(--athar-green)] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm font-arabic">{feat.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground font-arabic leading-relaxed pr-11">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Back to Home Link */}
      <div className="text-center pt-4">
        <Link href="/">
          <Button variant="ghost" className="font-arabic text-xs text-muted-foreground gap-2">
            <ChevronLeft className="w-4 h-4" />
            <span>العودة إلى الصفحة الرئيسية لمنصة أَثَر</span>
          </Button>
        </Link>
      </div>
    </Container>
  );
}
