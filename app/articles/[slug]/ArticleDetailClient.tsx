"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Clock,
  User,
  Calendar,
  Tag,
  Share2,
  Bookmark,
  Check,
  Headphones,
  FileText,
  Volume2,
  Layers,
} from "lucide-react";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Article, Program } from "@/types/content";
import { cn, toArabicNumber } from "@/lib/utils";

interface ArticleDetailClientProps {
  article: Article;
  relatedPrograms: Program[];
  suggestedArticles: Article[];
}

export default function ArticleDetailClient({
  article,
  relatedPrograms,
  suggestedArticles,
}: ArticleDetailClientProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("athar_saved_articles");
      if (stored) {
        const savedList: string[] = JSON.parse(stored);
        setIsSaved(savedList.includes(article.id));
      }
    } catch {}
  }, [article.id]);

  const toggleSave = () => {
    try {
      const stored = localStorage.getItem("athar_saved_articles");
      const savedList: string[] = stored ? JSON.parse(stored) : [];
      let updated: string[];
      if (savedList.includes(article.id)) {
        updated = savedList.filter((id) => id !== article.id);
      } else {
        updated = [...savedList, article.id];
      }
      localStorage.setItem("athar_saved_articles", JSON.stringify(updated));
      setIsSaved(!isSaved);
    } catch {}
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${article.title} - أَثَر`,
      text: article.summary,
      url: window.location.href,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  const fontSizeClasses = {
    normal: "text-base sm:text-lg leading-relaxed sm:leading-loose",
    large: "text-lg sm:text-xl leading-loose",
    xlarge: "text-xl sm:text-2xl leading-loose",
  }[fontSize];

  return (
    <Container size="xl" className="py-8 space-y-8">
      {/* ─── Breadcrumb Navigation ─── */}
      <div className="flex items-center justify-between">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-card border border-border/80 hover:border-[var(--athar-green)]/50 text-muted-foreground hover:text-foreground transition-all shadow-xs"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة إلى المقالات</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/articles" className="hover:text-foreground">
            المقالات
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[150px]">
            {article.title}
          </span>
        </div>
      </div>

      {/* ─── Article Header ─── */}
      <header className="rounded-3xl border border-border/80 bg-card p-6 md:p-10 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[var(--athar-green)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-semibold text-[var(--athar-green)] bg-[var(--athar-green)]/10 px-3 py-1 rounded-full border border-[var(--athar-green)]/20 font-arabic">
              {article.category}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-arabic text-foreground leading-tight">
            {article.title}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground font-arabic leading-relaxed">
            {article.summary}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground font-arabic pt-2 border-t border-border/60">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <User className="h-4 w-4 text-amber-600" />
              <span>{article.author}</span>
              {article.authorRole && (
                <span className="text-muted-foreground font-normal">
                  ({article.authorRole})
                </span>
              )}
            </div>

            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{article.publishedAt}</span>
            </span>

            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{toArabicNumber(article.readingTimeMinutes)} دقائق قراءة</span>
            </span>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-center gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSave}
              className={cn(
                "rounded-xl font-arabic text-xs gap-1.5 border-border/80",
                isSaved
                  ? "text-amber-600 border-amber-500/40 bg-amber-500/10"
                  : "hover:border-[var(--athar-green)] hover:text-[var(--athar-green)]"
              )}
            >
              <Bookmark className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
              <span>{isSaved ? "محفوظ في المفضلة" : "حفظ المقال"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="rounded-xl font-arabic text-xs gap-1.5 border-border/80 hover:border-[var(--athar-green)]"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">تم نسخ الرابط</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>مشاركة</span>
                </>
              )}
            </Button>

            {/* Font size toggle */}
            <div className="flex items-center border border-border/80 rounded-xl p-0.5 bg-muted/40">
              <button
                onClick={() => setFontSize("normal")}
                className={cn(
                  "px-2 py-1 text-xs rounded-lg font-arabic transition-colors",
                  fontSize === "normal"
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground"
                )}
                title="حجم خط عادي"
              >
                عادي
              </button>
              <button
                onClick={() => setFontSize("large")}
                className={cn(
                  "px-2 py-1 text-xs rounded-lg font-arabic transition-colors",
                  fontSize === "large"
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground"
                )}
                title="حجم خط كبير"
              >
                كبير
              </button>
              <button
                onClick={() => setFontSize("xlarge")}
                className={cn(
                  "px-2 py-1 text-xs rounded-lg font-arabic transition-colors",
                  fontSize === "xlarge"
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground"
                )}
                title="حجم خط أكبر"
              >
                أكبر
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Article Content & Hero Cover ─── */}
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Cover Image */}
        <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-md border border-border/60">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 800px"
            priority
          />
        </div>

        {/* Article Body Sections */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-10 shadow-xs space-y-8">
          {article.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              {section.heading && (
                <h2 className="text-xl sm:text-2xl font-bold font-arabic text-foreground border-r-4 border-[var(--athar-green)] pr-3 leading-snug">
                  {section.heading}
                </h2>
              )}

              {section.paragraphs.map((p, pIdx) => (
                <p
                  key={pIdx}
                  className={cn(
                    "text-foreground/90 font-arabic text-justify",
                    fontSizeClasses
                  )}
                >
                  {p}
                </p>
              ))}

              {section.quote && (
                <div className="my-6 p-5 sm:p-6 rounded-2xl bg-[var(--athar-green)]/10 border-r-4 border-[var(--athar-green)] text-foreground/95">
                  <p className="font-arabic italic text-base sm:text-lg leading-relaxed mb-2 font-medium">
                    «{section.quote.text}»
                  </p>
                  {section.quote.source && (
                    <span className="text-xs text-[var(--athar-green)] font-semibold block text-left font-arabic">
                      — {section.quote.source}
                    </span>
                  )}
                </div>
              )}
            </section>
          ))}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-6 border-t border-border/60">
              <span className="text-xs text-muted-foreground font-arabic block mb-2">
                الوسوم والموضوعات:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/articles`}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted hover:bg-muted/80 px-3 py-1 rounded-lg border border-border/40 font-arabic transition-colors"
                  >
                    <Tag className="h-3 w-3 text-muted-foreground/60" />
                    <span>#{tag}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Related Audio Programs (Alfath-inspired bidirectional linking!) ─── */}
      {relatedPrograms.length > 0 && (
        <section className="max-w-3xl mx-auto space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-[var(--athar-green)]" />
              <h2 className="text-lg md:text-xl font-bold font-arabic text-foreground">
                سلاسل وبرامج صوتية مرتبطة بهذا المقال
              </h2>
            </div>
            <Link
              href="/lectures"
              className="text-xs text-[var(--athar-green)] hover:underline font-arabic"
            >
              عرض كافة الشروحات ←
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {relatedPrograms.map((program) => (
              <Link
                key={program.id}
                href={`/lectures/${program.slug}`}
                className="group flex flex-col justify-between p-4 md:p-5 rounded-2xl border border-border/80 bg-card hover:border-[var(--athar-green)]/60 transition-all hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-[var(--athar-green)] bg-[var(--athar-green)]/10 px-2.5 py-0.5 rounded-full font-arabic">
                      {program.category}
                    </span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-arabic">
                      <Layers className="h-3 w-3 text-amber-600" />
                      {toArabicNumber(program.episodesCount)} حلقات
                    </span>
                  </div>

                  <h3 className="font-bold text-base font-arabic text-foreground group-hover:text-[var(--athar-green)] transition-colors line-clamp-1 mb-1">
                    {program.title}
                  </h3>

                  <p className="text-xs text-muted-foreground font-arabic line-clamp-2 leading-relaxed">
                    {program.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50 text-xs text-muted-foreground font-arabic">
                  <span>{program.presenter}</span>
                  <span className="text-[var(--athar-green)] font-semibold inline-flex items-center gap-1">
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>استمع للحلقات ←</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── Suggested Articles ─── */}
      {suggestedArticles.length > 0 && (
        <section className="max-w-3xl mx-auto space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg md:text-xl font-bold font-arabic text-foreground">
                مقالات مقترحة للقراءة
              </h2>
            </div>
            <Link
              href="/articles"
              className="text-xs text-[var(--athar-green)] hover:underline font-arabic"
            >
              المزيد من المقالات ←
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {suggestedArticles.map((art) => (
              <Link
                key={art.id}
                href={`/articles/${art.slug}`}
                className="group flex flex-col justify-between p-4 rounded-2xl border border-border/80 bg-card hover:border-[var(--athar-green)]/60 transition-all hover:shadow-xs"
              >
                <div>
                  <span className="text-[10px] font-semibold text-[var(--athar-green)] bg-[var(--athar-green)]/10 px-2 py-0.5 rounded-full font-arabic inline-block mb-2">
                    {art.category}
                  </span>
                  <h3 className="font-bold text-sm font-arabic text-foreground group-hover:text-[var(--athar-green)] transition-colors line-clamp-2 leading-snug mb-1.5">
                    {art.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-arabic line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-border/50 text-[11px] text-muted-foreground font-arabic">
                  <span>{toArabicNumber(art.readingTimeMinutes)} د قراءة</span>
                  <span className="text-[var(--athar-green)] font-semibold">
                    اقرأ ←
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
