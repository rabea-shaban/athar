import Link from "next/link";
import { Home, Search, BookOpen, ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";

const QUICK_LINKS = [
  { href: "/quran", icon: BookOpen, label: "القرآن الكريم" },
  { href: "/quran-search", icon: Search, label: "البحث في القرآن" },
  { href: "/adhkar", icon: null, label: "الأذكار" },
];

export default function NotFound() {
  return (
    <Container size="sm" className="min-h-[70vh] flex flex-col items-center justify-center py-8 text-center">
      {/* Arabic 404 */}
      <div className="relative mb-8 select-none">
        <p className="text-[120px] md:text-[160px] font-bold text-[var(--athar-green)]/8 leading-none font-arabic">
          ٤٠٤
        </p>
        <p className="absolute inset-0 flex items-center justify-center text-[60px] md:text-[80px] font-bold text-[var(--athar-green)]/20 leading-none">
          404
        </p>
      </div>

      {/* Message */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">الصفحة غير موجودة</h1>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
          الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-10">
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--athar-green)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Home className="h-4 w-4" />
          الرئيسية
        </Link>
        <Link
          href="/quran-search"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:border-[var(--athar-green)]/50 hover:bg-[var(--athar-green)]/5 transition-all"
        >
          <Search className="h-4 w-4" />
          البحث في القرآن
        </Link>
      </div>

      {/* Quick links */}
      <div className="w-full max-w-sm">
        <p className="text-xs text-muted-foreground mb-3">أو انتقل إلى</p>
        <div className="flex flex-col gap-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/60 hover:border-[var(--athar-green)]/40 hover:bg-[var(--athar-green)]/5 transition-all group"
            >
              <span className="text-sm">{link.label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[var(--athar-green)] transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}
