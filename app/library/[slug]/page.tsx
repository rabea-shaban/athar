import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { 
  BookOpen, 
  ArrowRight, 
  Scroll, 
  Library, 
  Flame, 
  BookText, 
  User, 
  ShieldCheck,
  Calendar,
  Building2,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  ChevronLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BOOKS, Book } from "@/data/books";
import Container from "@/components/layout/Container";
import BookDetailClient from "@/components/books/BookDetailClient";
import { toArabicNumber } from "@/lib/utils";

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BOOKS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = BOOKS.find((b) => b.slug === slug);
  if (!book) return { title: "الكتاب غير موجود | أَثَر" };

  const description = `تصفح وقراءة ${book.title} للمؤلف ${book.author}. ${book.description.slice(0, 160)}... متاح للقراءة والتحميل القانوني عبر منصة أَثَر.`;

  return {
    title: `كتاب ${book.title} — ${book.author} | المكتبة الإسلامية | أَثَر`,
    description,
    keywords: [
      book.title,
      book.author,
      book.category,
      "تحميل كتاب " + book.title,
      "قراءة كتاب " + book.title + " pdf",
      "المكتبة الإسلامية",
      "أثر",
      ...(book.topics || [])
    ],
    openGraph: {
      title: `${book.title} — ${book.author} | أَثَر`,
      description,
      type: "article",
      url: `https://athar-library.vercel.app/library/${book.slug}`,
    },
    alternates: {
      canonical: `https://athar-library.vercel.app/library/${book.slug}`,
    },
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params;
  const book = BOOKS.find((b) => b.slug === slug);
  if (!book) notFound();

  const relatedBooks = BOOKS.filter((b) => b.category === book.category && b.slug !== book.slug).slice(0, 3);
  const themeGradient = book.themeColor || "from-emerald-900 to-teal-950";

  // Schema.org structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "alternateName": book.originalTitle,
    "author": {
      "@type": "Person",
      "name": book.author,
    },
    "numberOfPages": book.pages,
    "inLanguage": "ar",
    "publisher": {
      "@type": "Organization",
      "name": book.publisher || "منصة أَثَر للتراث والمعرفة الإسلامية",
    },
    "genre": book.category,
    "description": book.description,
    "url": `https://athar-library.vercel.app/library/${book.slug}`,
    "isAccessibleForFree": book.rightsStatus !== "COPYRIGHT_RESTRICTED",
  };

  return (
    <Container size="xl" className="py-8 space-y-8 text-right" dir="rtl">
      {/* ─── Structured Data for Google & Search Engines ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── Breadcrumb Navigation ─── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-card border border-border/80 hover:border-[var(--athar-green)]/50 text-muted-foreground hover:text-foreground transition-all shadow-xs"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة إلى المكتبة الشاملة</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-arabic">
          <Link href="/" className="hover:text-foreground">الرئيسية</Link>
          <span>/</span>
          <Link href="/library" className="hover:text-foreground">المكتبة</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{book.title}</span>
        </div>
      </div>

      {/* ─── Main Book Showcase Hero Card ─── */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[var(--athar-green)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10">
          {/* 3D Luxury Book Cover Mockup */}
          <div className="md:col-span-4 flex justify-center">
            <div className="relative w-60 sm:w-72 aspect-[3/4.2] rounded-2xl shadow-2xl overflow-hidden group select-none">
              <div className={`w-full h-full bg-gradient-to-br ${themeGradient} p-6 flex flex-col justify-between text-white border-2 border-white/20 relative`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none" />
                
                {/* Book Spine Simulation */}
                <div className="absolute right-0 top-0 bottom-0 w-3.5 bg-black/35 border-l border-white/20" />

                {/* Top Badges */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 font-arabic">
                    {book.subcategory || book.category}
                  </span>
                  {book.badge && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5" />
                      <span>{book.badge}</span>
                    </span>
                  )}
                </div>

                {/* Center Title & Icon */}
                <div className="relative z-10 my-auto text-center px-2">
                  <div className="inline-block p-2.5 rounded-xl bg-white/10 mb-3 border border-white/15">
                    <BookText className="w-8 h-8 text-amber-300 mx-auto" />
                  </div>
                  <h2 className="font-arabic font-extrabold text-xl leading-relaxed text-white drop-shadow-md">
                    {book.title}
                  </h2>
                </div>

                {/* Bottom Author & Era */}
                <div className="relative z-10 pt-3 border-t border-white/20 text-center space-y-0.5">
                  <p className="text-xs font-semibold text-white/95">{book.author}</p>
                  {book.authorEra && (
                    <p className="text-[10px] text-white/70">{book.authorEra}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Book Info, Metadata & Detailed Synopsis */}
          <div className="md:col-span-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge className="bg-[var(--athar-green)]/15 border-[var(--athar-green)]/30 text-[var(--athar-green)] text-xs font-arabic">
                  {book.category}
                </Badge>
                <Badge variant="outline" className="text-xs font-mono">
                  <Scroll className="w-3 h-3 ml-1 text-[var(--athar-green)]" />
                  {toArabicNumber(book.pages)} صفحة
                </Badge>
                {book.authorEra && (
                  <Badge variant="secondary" className="text-xs font-arabic">
                    {book.authorEra}
                  </Badge>
                )}
                {book.rightsStatus && (
                  <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-arabic flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{book.rightsStatus === "PUBLIC_DOMAIN" ? "ملك عام (Public Domain)" : "متاح للنشر الحر"}</span>
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-arabic text-foreground leading-snug">
                {book.title}
              </h1>

              {/* Author Row */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-arabic">
                <User className="w-4 h-4 text-[var(--athar-green)]" />
                <span>تأليف المصنف: </span>
                <strong className="text-foreground">{book.author}</strong>
                {book.authorEra && <span className="opacity-75">({book.authorEra})</span>}
              </div>

              {/* Book Synopsis */}
              <div className="p-5 rounded-2xl bg-muted/40 border border-border/70 leading-relaxed text-sm text-muted-foreground font-arabic space-y-2">
                <h3 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[var(--athar-green)]" />
                  <span>نبذة وتعريف بالمصنف ومقاصده العلمية:</span>
                </h3>
                <p className="leading-relaxed">
                  {book.description}
                </p>
              </div>

              {/* Rigorous Academic Metadata Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-arabic pt-2">
                {book.publisher && (
                  <div className="p-3 rounded-xl bg-card border border-border/60 flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-muted-foreground block text-[10px]">الناشر / جهة التحقيق:</span>
                      <strong className="text-foreground">{book.publisher}</strong>
                    </div>
                  </div>
                )}

                {book.publicationYear && (
                  <div className="p-3 rounded-xl bg-card border border-border/60 flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <span className="text-muted-foreground block text-[10px]">سنة النشر / الطبعة:</span>
                      <strong className="text-foreground">{toArabicNumber(book.publicationYear)} م</strong>
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-card border border-border/60 flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-muted-foreground block text-[10px]">صيغة الملف وحجمه:</span>
                    <strong className="text-foreground font-mono">
                      PDF {book.fileSize ? `(${book.fileSize})` : ""}
                    </strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border/60 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />
                  <div>
                    <span className="text-muted-foreground block text-[10px]">المصدر المعتمد للتوثيق:</span>
                    <strong className="text-foreground">{book.originalSource || "الأرشيف العالمي"}</strong>
                  </div>
                </div>
              </div>

              {/* Topics / Sections */}
              {book.topics && book.topics.length > 0 && (
                <div className="space-y-2 pt-1 font-arabic">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Scroll className="w-3.5 h-3.5 text-amber-500" />
                    <span>أبرز موضوعات ومباحث الكتاب:</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {book.topics.map((topic) => (
                      <span
                        key={topic}
                        className="text-xs px-3 py-1 rounded-xl bg-[var(--athar-green)]/10 text-[var(--athar-green)] font-medium border border-[var(--athar-green)]/20"
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Legal License Notice */}
              {book.license && (
                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-muted-foreground font-arabic flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block">إشعار الملكية والحقوق:</strong>
                    <span>{book.license}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Actions & Reader Client Component */}
            <BookDetailClient book={book} />
          </div>
        </div>
      </div>

      {/* ─── Related Books in the Same Category ─── */}
      {relatedBooks.length > 0 && (
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between font-arabic">
            <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Library className="w-4 h-4 text-[var(--athar-green)]" />
              <span>مصنفات أخرى في باب ({book.category})</span>
            </h3>
            <Link href="/library" className="text-xs text-[var(--athar-green)] hover:underline flex items-center gap-1">
              <span>تصفح جميع كتب الباب</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedBooks.map((rel) => (
              <Link
                key={rel.slug}
                href={`/library/${rel.slug}`}
                className="p-5 rounded-2xl border border-border/80 bg-card hover:border-[var(--athar-green)]/50 hover:shadow-md transition-all group flex flex-col justify-between font-arabic space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">{rel.category}</Badge>
                    <span className="font-mono">{toArabicNumber(rel.pages)} صفحة</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-[var(--athar-green)] transition-colors line-clamp-1">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {rel.description}
                  </p>
                </div>
                <div className="pt-2.5 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>المؤلف: {rel.author}</span>
                  <span className="text-[var(--athar-green)] font-semibold group-hover:underline">عرض</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
