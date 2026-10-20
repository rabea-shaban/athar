import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import { Scale, BookOpen, ShieldCheck, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "شروط الاستخدام | أَثَر — ATHAR",
  description: "شروط وأحكام استخدام محتوى وتطبيق منصة أَثَر الإسلامية.",
};

export default function TermsPage() {
  const terms = [
    {
      title: "1. الاستخدام النبيل وغير التجاري",
      desc: "تتيح منصة أَثَر جميع المحتويات الإسلامية (القرآن، التفسير، الأذكار، الكتب) للاستخدام الشخصي والتعليمي والدعوي غير التجاري مجاناً للجميع.",
    },
    {
      title: "2. الأمانة العلمية والتراث الإسلامي",
      desc: "جميع النصوص القرآنية والأحاديث الشريفة وكتب التراث تم مراجعتها بدقة متناهية. لا يجوز تحريف أو تغيير الألفاظ القرآنية أو التثبت من الكتب خارج نصها الأصلي.",
    },
    {
      title: "3. حقوق الملكية الفكرية",
      desc: "تعود حقوق الكود المصدري الأصلي والتصميمات الخاصة بـ أَثَر لمطورها (Rabea Shaban)، بينما تظل التسجيلات الصوتية والكتب للجهات والعلماء القائمين عليها.",
    },
    {
      title: "4. حدود المسؤولية",
      desc: "تبذل إدارة المنصة أقصى جهد لضمان دقة مواقيت الصلاة والنصوص. نوصي دائماً بمراعاة التوقيت المحلي لمدينتك والتقويم الرسمي المعتمد ببلدك.",
    },
  ];

  return (
    <Container size="xl" className="py-10 space-y-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-[var(--athar-green)]/15 text-[var(--athar-green)] flex items-center justify-center mx-auto">
          <Scale className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold font-arabic text-foreground">
          شروط الاستخدام بـ <span className="text-[var(--athar-green)]">أَثَر</span>
        </h1>
        <p className="text-muted-foreground font-arabic text-sm leading-relaxed">
          القواعد العامة وضوابط الانتفاع بمحتويات منصة أَثَر الإسلامية.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {terms.map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-card border border-border/70 shadow-xs space-y-2"
          >
            <h3 className="font-bold text-base font-arabic text-foreground">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground font-arabic leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </Container>
  );
}
