import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/layout/Container";
import {
  ShieldCheck,
  Heart,
  Globe,
  Mail,
  GitBranch,
  BookOpen,
  Compass,
  Library,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "عن المنصة وحقوق الملكية | أَثَر — ATHAR",
  description:
    "تعرّف على رسالة منصة أَثَر الإسلامية، الأهداف، وبنية التراث العلمي، مع توثيق حقوق الملكية والتطوير.",
};

export default function AboutPage() {
  const platformFeatures = [
    {
      title: "المصحف الشريف والتفسير",
      desc: "تلاوات عذبة بصوت كبار القراء مع التفسير الميسر لكل آية.",
      icon: BookOpen,
    },
    {
      title: "مواقيت الصلاة والقبلة",
      desc: "حساب دقيق لمواقيت الصلاة حسب الهيئات الإسلامية وتحديد القبلة.",
      icon: Compass,
    },
    {
      title: "الأذكار والسبحة الذكية",
      desc: "حصن المسلم اليومي مع سبحة إلكترونية متطورة للاستغفار والتسبيح.",
      icon: Heart,
    },
    {
      title: "المكتبة والدروس العلمية",
      desc: "أمهات كتب التراث والسلاسل الصوتية العلمية لكبار العلماء.",
      icon: Library,
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
