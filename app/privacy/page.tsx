import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import { ShieldCheck, Lock, Eye, MapPin, Database } from "lucide-react";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | أَثَر — ATHAR",
  description: "سياسة الخصوصية وحماية بيانات المستخدمين بـ منصة أَثَر الإسلامية.",
};

export default function PrivacyPage() {
  const sections = [
    {
      icon: Eye,
      title: "1. حماية خصوصيتك أولويتنا",
      content:
        "تلتزم منصة أَثَر الإسلامية بحماية خصوصية جميع الزوار والمستخدمين. لا نقوم بجمع أو بيع أو مشاركة أي بيانات شخصية مع أي جهات خارجية لأغراض تجارية أو إعلانية.",
    },
    {
      icon: MapPin,
      title: "2. استغلال الموقع الجغرافي (Location Data)",
      content:
        "يُستخدم إذن الموقع الجغرافي (GPS) حصرياً وبشكل محلي على جهازك لحساب مواقيت الصلاة الدقيقة وتحديد اتجاه القبلة نحو الكعبة المشرفة، ولا يتم حفظ مسار موقعك أو إرساله إلى أي خوادم خارجية.",
    },
    {
      icon: Database,
      title: "3. التخزين المحلي (Local Storage)",
      content:
        "تُستخدم تقنية التخزين المحلي بمتصفحك فقط لحفظ تفضيلاتك الشخصية؛ مثل موضع آخر قراءة بـ القرآن الكريم، تفضيل الوضع الليلي/النهاري، والإعدادات المحلية لمواقيت الصلاة.",
    },
    {
      icon: Lock,
      title: "4. الأمان وسلامة البيانات",
      content:
        "نعتمد أحدث معايير التشفير (HTTPS/TLS) لضمان سلامة اتصالك بالمنصة، ونضمن تصفحاً آمناً وخالياً من النوافذ المنبثقة الإعلانية أو أدوات التعقب المزعجة.",
    },
  ];

  return (
    <Container size="xl" className="py-10 space-y-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-[var(--athar-green)]/15 text-[var(--athar-green)] flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold font-arabic text-foreground">
          سياسة الخصوصية بـ <span className="text-[var(--athar-green)]">أَثَر</span>
        </h1>
        <p className="text-muted-foreground font-arabic text-sm leading-relaxed">
          تطبيق وسياسات حماية البيانات وتجربة التصفح الآمن في منصة أَثَر.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-card border border-border/70 shadow-xs space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base font-arabic">{sec.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground font-arabic leading-relaxed pr-11">
                {sec.content}
              </p>
            </div>
          );
        })}

        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground font-arabic text-center">
          تاريخ آخر تحديث لسياسة الخصوصية: يناير 2026 • © أَثَر — جميع الحقوق محفوظة
        </div>
      </div>
    </Container>
  );
}
