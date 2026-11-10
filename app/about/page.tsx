import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { APP_DOWNLOAD_CONFIG } from "@/lib/app-download";
import {
  ShieldCheck,
  Heart,
  Globe,
  Mail,
  GitBranch,
  BookOpen,
  Compass,
  Clock,
  Library,
  CheckCircle2,
  Download,
  Smartphone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "عن منصة ATHAR " + APP_DOWNLOAD_CONFIG.latestVersion + " | أَثَر",
  description:
    "تعرّف على منصة أَثَر الإسلامية ومزايا تطبيق ATHAR " + APP_DOWNLOAD_CONFIG.latestVersion + " للأندرويد، من القرآن والتلاوات إلى مواقيت الصلاة والأذكار والمحتوى دون اتصال.",
  alternates: {
    canonical: "https://athar-library.vercel.app/about",
  },
  openGraph: {
    title: "عن منصة ATHAR " + APP_DOWNLOAD_CONFIG.latestVersion + " | أَثَر",
    description:
      "منصة إسلامية رقمية بتجربة هادئة، وتطبيق Android ATHAR " + APP_DOWNLOAD_CONFIG.latestVersion + " للقرآن والصلاة والمحتوى الإسلامي.",
    url: "https://athar-library.vercel.app/about",
    siteName: "أَثَر — ATHAR",
    locale: "ar_EG",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "منصة أَثَر" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "عن منصة ATHAR " + APP_DOWNLOAD_CONFIG.latestVersion + " | أَثَر",
    description: "اكتشف منصة أَثَر وتطبيق ATHAR " + APP_DOWNLOAD_CONFIG.latestVersion + " للأندرويد.",
    images: ["/og-image.png"],
  },
};

export default function AboutPage() {
  const platformFeatures = [
    {
      title: "القرآن الكريم والتلاوات",
      desc: "تصفّح المصحف واستمع إلى التلاوات القرآنية المتاحة داخل التطبيق.",
      icon: BookOpen,
    },
    {
      title: "مواقيت الصلاة والأذان",
      desc: "تابع مواقيت الصلاة وإعدادات الأذان والإشعارات المرتبطة به.",
      icon: Clock,
    },
    {
      title: "اتجاه القبلة",
      desc: "استخدم شاشة القبلة واتجاه الجهاز لتحديد وجهة الصلاة.",
      icon: Compass,
    },
    {
      title: "الأذكار والتسابيح",
      desc: "افتح أقسام الأذكار اليومية والتسبيح المتوفرة في ATHAR.",
      icon: Heart,
    },
    {
      title: "المكتبة والمحتوى الإسلامي",
      desc: "تصفّح الكتب والبرامج والمحاضرات والمقالات المتاحة في المنصة.",
      icon: Library,
    },
    {
      title: "تنزيلات ومحتوى دون اتصال",
      desc: "أدر التنزيلات واقرأ أو استمع إلى المحتوى المحفوظ محليًا حين يكون متاحًا.",
      icon: CheckCircle2,
    },
  ];

  return (
    <Container size="xl" className="py-10 space-y-12">
      {/* Brand Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="relative w-24 h-24 mx-auto mb-2">
          <Image
            src="/logo.png"
            alt="أَثَر — منصة المعرفة الإسلامية"
            width={96}
            height={96}
            className="w-full h-full object-contain filter drop-shadow-md"
            priority
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-arabic text-foreground">
          عن منصة <span className="text-[var(--athar-green)]">أَثَر</span>
        </h1>
        <p className="text-muted-foreground font-arabic text-sm sm:text-base leading-relaxed">
          منصة إسلامية رقمية شاملة تجمع بين القرآن الكريم والتفسير والأذكار والحديث الشريف والمكتبة العلمية في تجربة هادئة ونقية. نحفظ العلم، وننشر أثره.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {platformFeatures.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-card border border-border/70 shadow-xs space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--athar-green)]/15 text-[var(--athar-green)] flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base font-arabic">{feat.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-arabic">
                {feat.desc}
              </p>
            </div>
          );
        })}
      </div>

      <section id="mobile-app" className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs text-[var(--athar-green)] font-bold font-arabic">Latest Version</p>
            <h2 className="text-xl sm:text-2xl font-bold font-arabic mt-1">
              ATHAR Mobile App – Version {APP_DOWNLOAD_CONFIG.latestVersion}
            </h2>
            <p className="text-sm text-muted-foreground font-arabic mt-2">
              تطبيق أندرويد الرسمي من أَثَر، بتجربة عربية هادئة وهوية أخضر داكن وذهبي.
            </p>
          </div>
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-[var(--athar-green)]/15 text-[var(--athar-green)] flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center" dir="ltr">
          {[
            ["Version", APP_DOWNLOAD_CONFIG.latestVersion],
            ["Version Code", String(APP_DOWNLOAD_CONFIG.versionCode)],
            ["Platform", APP_DOWNLOAD_CONFIG.platform],
            ["Package", APP_DOWNLOAD_CONFIG.packageName],
            ["Architecture", APP_DOWNLOAD_CONFIG.architecture],
            ["File", APP_DOWNLOAD_CONFIG.fileName],
          ].map(([label, value]) => (
            <div key={label} className="p-3 rounded-xl bg-muted/30 border border-border/50 min-w-0">
              <span className="text-[10px] text-muted-foreground block">{label}</span>
              <span className="text-xs font-bold text-foreground block mt-1 break-all">{value}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground font-arabic text-center">
          حجم الملف {APP_DOWNLOAD_CONFIG.fileSize} · تحديث {APP_DOWNLOAD_CONFIG.releaseDateLabel}
        </p>

        <div className="flex justify-center">
          <a href={APP_DOWNLOAD_CONFIG.downloadActionUrl}>
            <Button className="font-arabic font-bold gap-2 px-6">
              <Download className="w-4 h-4" />
              <span>Download Latest Version</span>
            </Button>
          </a>
        </div>
      </section>
      {/* Developer & Ownership Card */}
      <div className="p-8 rounded-3xl bg-card border border-border/80 shadow-xs space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-arabic">الملكية والتطوير</h2>
              <p className="text-xs text-muted-foreground font-arabic">
                إشعار حقوق الملكية الفكرية والنسبة المباشرة
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 font-arabic text-sm text-foreground/90 leading-relaxed">
          <p className="font-semibold text-base text-foreground">
            المطور والمالك: <span className="text-[var(--athar-green)]">Rabea Shaban Ibrahem</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Full Stack Software Engineer
          </p>
          <p className="text-xs text-muted-foreground pt-2 border-t border-border/40">
            © 2026 ATHAR — جميع الحقوق محفوظة للأجزاء الأصلية والمحتوى البرمجي والتصاميم الهيكلية المملوكة لصاحب المشروع.
          </p>
        </div>

        {/* Developer Contact Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <a
            href="https://www.rabea-shaban.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50 hover:bg-muted text-xs font-arabic transition-colors border border-border/50"
          >
            <Globe className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">rabea-shaban.com</span>
          </a>

          <a
            href="mailto:rabea.elzayate@gmail.com"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50 hover:bg-muted text-xs font-arabic transition-colors border border-border/50"
          >
            <Mail className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">rabea.elzayate@gmail.com</span>
          </a>

          <a
            href="https://github.com/rabea-shaban/athar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50 hover:bg-muted text-xs font-arabic transition-colors border border-border/50"
          >
            <GitBranch className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">مستودع المشروع على GitHub</span>
          </a>
        </div>
      </div>

      {/* Legal & Attribution Statement */}
      <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 text-xs text-muted-foreground font-arabic leading-relaxed space-y-2 max-w-3xl mx-auto">
        <p className="font-semibold text-foreground">تنبيه قانوني ومصادر التراث:</p>
        <p>
          جميع النصوص القرآنية والتفاسير الأقوال والتراجم والتسجيلات الصوتية تعود ملكيتها الفكرية والدينية لحرمتها وتراثها الإسلامي العظيم. تُخضَع المكتبات البرمجية مفتوحة المصدر لتراخيص أصحابها الأصليين.
        </p>
      </div>
    </Container>
  );
}
