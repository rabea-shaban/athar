import Link from "next/link";
import Image from "next/image";
import Container from "@/components/layout/Container";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background mt-auto">
      <Container size="2xl" className="py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <div className="mb-4">
              <div className="relative w-20 h-20">
                <Image
                  src="/logo.png"
                  alt="أَثَر — منصة المعرفة الإسلامية"
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-arabic">
              منصة إسلامية شاملة لحفظ ونشر العلم الشرعي والتراث الإسلامي الأصيل.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm font-arabic">القرآن والعبادات</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-arabic">
              <li><Link href="/quran" className="hover:text-primary transition-colors">قراءة القرآن</Link></li>
              <li><Link href="/tafsir" className="hover:text-primary transition-colors">التفسير الميسر</Link></li>
              <li><Link href="/prayer-times" className="hover:text-primary transition-colors">مواقيت الصلاة</Link></li>
              <li><Link href="/qibla" className="hover:text-primary transition-colors">اتجاه القبلة</Link></li>
              <li><Link href="/adhkar" className="hover:text-primary transition-colors">الأذكار والسبحة</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm font-arabic">المعرفة والعلم</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-arabic">
              <li><Link href="/hadith" className="hover:text-primary transition-colors">الأحاديث الشريفة</Link></li>
              <li><Link href="/lectures" className="hover:text-primary transition-colors">الشروحات والدروس</Link></li>
              <li><Link href="/library" className="hover:text-primary transition-colors">المكتبة الإسلامية</Link></li>
              <li><Link href="/radio" className="hover:text-primary transition-colors">الإذاعة المباشرة</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm font-arabic">عن المنصة</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-arabic">
              <li><Link href="/about" className="hover:text-primary transition-colors">عن أثر وحقوق الملكية</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">تواصل معنا</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">سياسة الخصوصية</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">شروط الاستخدام</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p className="font-arabic">© {new Date().getFullYear()} أَثَر — جميع الحقوق محفوظة</p>
          <a
            href="https://www.rabea-shaban.com/"
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className="group inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-foreground text-muted-foreground"
          >
            <span>Designed &amp; Built by</span>
            <span className="font-semibold text-foreground/90 group-hover:text-primary transition-colors duration-200">
              Rabea Shaban
            </span>
          </a>
        </div>
      </Container>
    </footer>
  );
}
