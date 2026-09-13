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
            <p className="text-xs text-muted-foreground leading-relaxed">
              منصة إسلامية شاملة لحفظ ونشر العلم الشرعي والتراث الإسلامي الأصيل.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">القرآن الكريم</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/quran" className="hover:text-primary transition-colors">قراءة القرآن</Link></li>
              <li><Link href="/tafsir" className="hover:text-primary transition-colors">التفسير الميسر</Link></li>
              <li><Link href="/quran-search" className="hover:text-primary transition-colors">البحث في القرآن</Link></li>
              <li><Link href="/listen" className="hover:text-primary transition-colors">الاستماع</Link></li>
              <li><Link href="/radio" className="hover:text-primary transition-colors">الإذاعة</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">العبادات</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/adhkar" className="hover:text-primary transition-colors">الأذكار</Link></li>
              <li><Link href="/tasbeeh" className="hover:text-primary transition-colors">التسابيح</Link></li>
              <li><Link href="/hadith" className="hover:text-primary transition-colors">الحديث</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">المعرفة</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/lectures" className="hover:text-primary transition-colors">الشروحات</Link></li>
              <li><Link href="/library" className="hover:text-primary transition-colors">المكتبة</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} أَثَر — جميع الحقوق محفوظة</p>
        </div>
      </Container>
    </footer>
  );
}
