"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Clock,
  User,
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  Bookmark,
  Star,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Container from "@/components/layout/Container";
import PageHero from "@/components/layout/PageHero";
import { Article, ContentCategory } from "@/types/content";
import { cn, toArabicNumber } from "@/lib/utils";

interface ArticlesClientListProps {
  initialArticles: Article[];
  featuredArticle?: Article;
  categories: ContentCategory[];
}

export default function ArticlesClientList({
  initialArticles,
  featuredArticle,
  categories,
}: ArticlesClientListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Load bookmarks
  useEffect(() => {
    try {
      const stored = localStorage.getItem("athar_saved_articles");
      if (stored) {
        setSavedArticles(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    let updated: string[];
    if (savedArticles.includes(id)) {
      updated = savedArticles.filter((item) => item !== id);
    } else {
      updated = [...savedArticles, id];
    }
    setSavedArticles(updated);
    try {
      localStorage.setItem("athar_saved_articles", JSON.stringify(updated));
    } catch {}
  };

  // Collect all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    initialArticles.forEach((a) => {
      a.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [initialArticles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return initialArticles.filter((art) => {
      const matchCat =
        selectedCategory === "all" || art.category === selectedCategory;
      const matchTag = !selectedTag || art.tags.includes(selectedTag);
      const matchSaved = !showSavedOnly || savedArticles.includes(art.id);
      const matchQuery =
        searchQuery.trim() === "" ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCat && matchTag && matchSaved && matchQuery;
    });
  }, [
    initialArticles,
    selectedCategory,
    selectedTag,
    showSavedOnly,
    savedArticles,
    searchQuery,
  ]);

  return (
    <div className="min-h-screen bg-background pb-20 text-right" dir="rtl">
      {/* ─── Unified Luxury Islamic PageHero ─── */}
      <PageHero
        breadcrumbs={[
          { label: "الرئيسية", href: "/" },
          { label: "المقالات والمدونة الإيمانية" },
        ]}
        title="المقالات والمدونة الإيمانية"
        subtitle="كتابات متزنة وأبحاث رصينة تجمع بين أصالة الفقه والتفسير ووعي قضايا العصر، متصلة بسلاسل وبرامج أثر الصوتية."
        badges={[
          { label: "بصائر إيمانية ومعرفية", icon: FileText, variant: "emerald" },
          { label: `${toArabicNumber(initialArticles.length)} مقالاً وبحثاً موثقاً`, icon: BookOpen, variant: "gold" },
          { label: "«قَيِّدُوا العِلمَ بِالكِتَابِ»", icon: Sparkles, variant: "default" },
        ]}
        theme="emerald"
      />

      <Container size="2xl" className="pt-4 space-y-8">
      {/* ─── Featured Article Banner (Show when no specific search/filter) ─── */}
      {featuredArticle &&
        selectedCategory === "all" &&
        !selectedTag &&
        !searchQuery &&
        !showSavedOnly && (
          <div className="relative rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-xs overflow-hidden">
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-[var(--athar-green)]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center relative z-10">
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--athar-green)] bg-[var(--athar-green)]/10 px-3 py-1 rounded-full font-arabic">
                    {featuredArticle.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full font-arabic">
                    <Sparkles className="h-3 w-3" />
                    مقال مميز
                  </span>
                </div>

                <Link href={`/articles/${featuredArticle.slug}`}>
                  <h2 className="text-xl md:text-2xl font-extrabold font-arabic text-foreground hover:text-[var(--athar-green)] transition-colors leading-tight">
                    {featuredArticle.title}
                  </h2>
                </Link>

                <p className="text-xs md:text-sm text-muted-foreground font-arabic leading-relaxed line-clamp-3">
                  {featuredArticle.summary}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-arabic pt-2">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-amber-600" />
                    {featuredArticle.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    قراءة في {toArabicNumber(featuredArticle.readingTimeMinutes)} دقائق
                  </span>
                </div>

                <div className="pt-2">
                  <Link href={`/articles/${featuredArticle.slug}`}>
                    <Button className="rounded-xl font-arabic font-semibold bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white text-xs gap-1.5 h-10 px-5">
                      <span>قراءة المقال كاملاً</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="md:col-span-5 flex justify-center">
                <Link
                  href={`/articles/${featuredArticle.slug}`}
                  className="relative w-full max-w-[360px] aspect-[16/10] md:aspect-[4/3] rounded-2xl overflow-hidden shadow-md group block border border-border/60"
                >
                  <Image
                    src={featuredArticle.coverImage}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 400px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </Link>
              </div>
            </div>
          </div>
        )}

      {/* ─── Search & Controls Bar ─── */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في عناوين المقالات، الكتاب، أو الموضوعات..."
              className="pr-10 h-10 rounded-xl bg-background border-border/70 text-sm font-arabic"
              dir="rtl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Bookmarks toggle button */}
          <button
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-arabic font-medium transition-colors border flex items-center justify-center gap-1.5",
              showSavedOnly
                ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
            )}
          >
            <Star
              className={cn("h-3.5 w-3.5", showSavedOnly && "fill-current")}
            />
            <span>المقالات المحفوظة ({toArabicNumber(savedArticles.length)})</span>
          </button>
        </div>

        {/* Categories Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected =
              (cat.slug === "all" && selectedCategory === "all") ||
              selectedCategory === cat.name;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.slug === "all" ? "all" : cat.name);
                }}
                className={cn(
                  "px-3.5 py-2 rounded-2xl text-xs font-arabic font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 shadow-xs",
                  isSelected
                    ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-md font-bold scale-[1.02]"
                    : "bg-card border-border/70 text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tags Row */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-arabic">
            <span className="text-muted-foreground text-[11px] shrink-0">
              الوسوم الشائعة:
            </span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={cn(
                  "px-2.5 py-1 rounded-lg border text-[11px] transition-colors shrink-0",
                  selectedTag === tag
                    ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                    : "bg-muted/60 hover:bg-muted text-muted-foreground border-border/50"
                )}
              >
                #{tag}
              </button>
            ))}
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="text-[11px] text-red-500 hover:underline shrink-0 inline-flex items-center gap-1 font-arabic"
              >
                <span>إلغاء تصفية الوسم</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── Results Counter ─── */}
      <div className="flex items-center justify-between text-xs text-muted-foreground font-arabic px-1">
        <span>
          عرض {toArabicNumber(filteredArticles.length)} من أصل{" "}
          {toArabicNumber(initialArticles.length)} مقالاً
        </span>
      </div>

      {/* ─── Articles Grid ─── */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-border/80 bg-card p-8 max-w-md mx-auto shadow-xs">
          <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-foreground font-arabic font-bold text-base mb-1">
            لا توجد مقالات مطابقة
          </h3>
          <p className="text-muted-foreground text-xs font-arabic mb-4">
            جرب البحث بكلمات أخرى أو اختر تصنيفاً آخر.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedTag(null);
              setShowSavedOnly(false);
              setSearchQuery("");
            }}
            className="rounded-xl font-arabic text-xs"
          >
            إعادة تعيين الفلاتر
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => {
            const isSaved = savedArticles.includes(article.id);

            return (
              <article
                key={article.id}
                className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card overflow-hidden transition-all duration-200 hover:border-[var(--athar-green)]/60 hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  {/* Cover Image & Bookmark */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-muted border-b border-border/60">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <div className="absolute top-3 right-3">
                      <span className="text-[11px] font-semibold text-white bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-md font-arabic">
                        {article.category}
                      </span>
                    </div>

                    <button
                      onClick={(e) => toggleBookmark(article.id, e)}
                      title={isSaved ? "إزالة من المحفوظات" : "حفظ المقال"}
                      className={cn(
                        "absolute top-3 left-3 p-2 rounded-full backdrop-blur-md transition-colors",
                        isSaved
                          ? "bg-amber-500 text-white"
                          : "bg-black/40 text-white/80 hover:text-white hover:bg-black/60"
                      )}
                    >
                      <Bookmark
                        className={cn("h-4 w-4", isSaved && "fill-current")}
                      />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 md:p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-arabic">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {toArabicNumber(article.readingTimeMinutes)} دقائق قراءة
                      </span>
                      <span>·</span>
                      <span>{article.publishedAt}</span>
                    </div>

                    <Link href={`/articles/${article.slug}`}>
                      <h3 className="font-bold text-base md:text-lg font-arabic text-foreground group-hover:text-[var(--athar-green)] transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-muted-foreground font-arabic leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {article.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md font-arabic"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Link */}
                <div className="p-5 md:p-6 pt-0">
                  <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground font-arabic">
                    <span className="truncate max-w-[150px]">
                      بقلم: {article.author}
                    </span>
                    <Link
                      href={`/articles/${article.slug}`}
                      className="text-[var(--athar-green)] font-semibold group-hover:translate-x-[-2px] transition-transform inline-flex items-center gap-1"
                    >
                      <span>قراءة المقال</span>
                      <span>←</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      </Container>
    </div>
  );
}
