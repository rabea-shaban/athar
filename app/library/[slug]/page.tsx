import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, 
  ExternalLink, 
  ArrowRight, 
  Scroll, 
  Share2, 
  Library, 
  BookMarked,
  Flame,
  BookText,
  User,
  GraduationCap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BOOKS, Book } from "@/data/books";
import Container from "@/components/layout/Container";

export function generateStaticParams() {
  return BOOKS.map((b) => ({ slug: b.slug }));
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = BOOKS.find((b) => b.slug === slug);
  if (!book) notFound();

  const relatedBooks = BOOKS.filter((b) => b.category === book.category && b.slug !== book.slug).slice(0, 3);
  const themeGradient = book.themeColor || "from-emerald-900 to-teal-950";

  return (
    <Container size="xl" className="py-8 space-y-8">
      {/* ─── Breadcrumb & Back Navigation ─── */}
      <div className="flex items-center justify-between">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-card border border-border/80 hover:border-[var(--athar-green)]/50 text-muted-foreground hover:text-foreground transition-all shadow-sm"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة إلى المكتبة</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">الرئيسية</Link>
          <span>/</span>
          <Link href="/library" className="hover:text-foreground">المكتبة</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[150px]">{book.title}</span>
        </div>
      </div>

      {/* ─── Main Book Showcase Hero ─── */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-1/3 w-80 h-80 bg-[var(--athar-green)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10">
          {/* 3D Luxury Book Cover Mockup */}
          <div className="md:col-span-4 flex justify-center">
            <div className="relative w-56 sm:w-64 aspect-[3/4.2] rounded-2xl shadow-2xl overflow-hidden group">
              <div className={`w-full h-full bg-gradient-to-br ${themeGradient} p-6 flex flex-col justify-between text-white border-2 border-white/20 relative`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none" />
                
                {/* Book Spine Simulation */}
                <div className="absolute right-0 top-0 bottom-0 w-3.5 bg-black/30 border-l border-white/20" />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
                    {book.category}
                  </span>
                  {book.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5" />
                      {book.badge}
                    </span>
                  )}
                </div>

                {/* Title */}
                <div className="relative z-10 my-auto text-center px-2">
                  <div className="inline-block p-2 rounded-xl bg-white/10 mb-3 border border-white/15">
                    <BookText className="w-7 h-7 text-amber-300 mx-auto" />
                  </div>
                  <h2 className="font-arabic font-extrabold text-xl leading-relaxed text-white drop-shadow-md">
                    {book.title}
                  </h2>
                </div>

                {/* Bottom Author */}
                <div className="relative z-10 pt-3 border-t border-white/20 text-center space-y-0.5">
                  <p className="text-xs font-semibold text-white/95">{book.author}</p>
                  {book.authorEra && (
                    <p className="text-[10px] text-white/60">{book.authorEra}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Book Info & Description */}
          <div className="md:col-span-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge className="bg-[var(--athar-green)]/15 border-[var(--athar-green)]/30 text-[var(--athar-green)] text-xs">
                  {book.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Scroll className="w-3 h-3 ml-1 text-[var(--athar-green)]" />
                  {book.pages.toLocaleString("ar-EG")} صفحة
                </Badge>
                {book.authorEra && (
                  <Badge variant="secondary" className="text-xs">
                    {book.authorEra}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold font-arabic text-foreground leading-snug">
                {book.title}
              </h1>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4 text-[var(--athar-green)]" />
                <span>المؤلف: </span>
                <strong className="text-foreground">{book.author}</strong>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 leading-relaxed text-sm text-muted-foreground">
                <h3 className="font-bold text-foreground text-xs mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[var(--athar-green)]" />
                  نبذة وتعريف بالكتاب:
                </h3>
                <p className="leading-relaxed">
                  {book.description}
                </p>
              </div>

              {/* Topics / Sections */}
              {book.topics && book.topics.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Scroll className="w-3.5 h-3.5 text-[var(--athar-green)]" />
                    أبرز موضوعات ومباحث الكتاب:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {book.topics.map((topic) => (
                      <span
                        key={topic}
                        className="text-xs px-3 py-1 rounded-xl bg-[var(--athar-green)]/10 text-[var(--athar-green)] font-medium border border-[var(--athar-green)]/20"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-border/60">
              {book.readUrl && (
                <a
                  href={book.readUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[var(--athar-green)] text-white font-bold text-sm hover:opacity-90 shadow-md shadow-[var(--athar-green)]/20 transition-all text-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>قراءة وتصفح الكتاب إلكترونياً</span>
                </a>
              )}

              <Link
                href="/library"
                className="px-6 py-3.5 rounded-2xl border border-border/80 hover:bg-muted font-medium text-xs text-foreground transition-colors flex items-center justify-center"
              >
                تصفح كتب أخرى
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Related Books in the Same Category ─── */}
      {relatedBooks.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-arabic flex items-center gap-2 text-foreground">
              <Library className="w-4 h-4 text-[var(--athar-green)]" />
              <span>كتب أخرى في قسم ({book.category})</span>
            </h3>
            <Link href="/library" className="text-xs text-[var(--athar-green)] hover:underline">
              عرض كل الكتب
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedBooks.map((rel) => (
              <Link
                key={rel.slug}
                href={`/library/${rel.slug}`}
                className="p-4 rounded-2xl border border-border/80 bg-card hover:border-[var(--athar-green)]/50 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">{rel.category}</Badge>
                    <span>{rel.pages} صفحة</span>
                  </div>
                  <h4 className="font-bold font-arabic text-sm group-hover:text-[var(--athar-green)] transition-colors line-clamp-1">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {rel.description}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                  المؤلف: {rel.author}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}

