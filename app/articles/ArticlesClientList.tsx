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
  TrendingUp,
  Snowflake,
  ShieldCheck,
  Heart,
  Briefcase,
  Users,
  Compass,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
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

const TRENDING_TOPICS = [
  { label: "قيام ليل الشتاء", query: "الشتاء", icon: Snowflake },
  { label: "اليقين والثبات", query: "اليقين", icon: ShieldCheck },
  { label: "السكينة النفسية", query: "سكينة", icon: Heart },
  { label: "الكسب الحلال", query: "كسب", icon: Briefcase },
  { label: "سيكولوجية الدعاء", query: "دعاء", icon: Sparkles },
  { label: "تدبر القرآن", query: "تدبر", icon: BookOpen },
  { label: "بر الوالدين", query: "والدين", icon: Users },
];

export default function ArticlesClientList({
  initialArticles,
  featuredArticle,
  categories,
}: ArticlesClientListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "trending" | "reading-asc" | "reading-desc">("newest");
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

  // Trending articles
  const trendingArticles = useMemo(() => {
    return initialArticles.filter((a) => a.trending);
  }, [initialArticles]);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    initialArticles.forEach((a) => {
      a.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [initialArticles]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialArticles.length };
    initialArticles.forEach((a) => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return counts;
  }, [initialArticles]);

  // Filtered and sorted articles
  const filteredArticles = useMemo(() => {
    let result = initialArticles.filter((art) => {
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

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "trending") {
        if (a.trending && !b.trending) return -1;
        if (!a.trending && b.trending) return 1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (sortBy === "reading-asc") {
        return a.readingTimeMinutes - b.readingTimeMinutes;
      }
      if (sortBy === "reading-desc") {
        return b.readingTimeMinutes - a.readingTimeMinutes;
      }
      // default: newest
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    return result;
  }, [
    initialArticles,
    selectedCategory,
    selectedTag,
    showSavedOnly,
    savedArticles,
    searchQuery,
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedTag !== null ||
    showSavedOnly;

  return (
    <div className="min-h-screen bg-background pb-20 text-right" dir="rtl">
      {/* ─── Unified Luxury Islamic PageHero ─── */}
      <PageHero
        breadcrumbs={[
          { label: "الرئيسية", href: "/" },
          { label: "المقالات والمدونة الإيمانية" },
        ]}
        title="المقالات والمدونة الإيمانية"
        subtitle="كتابات متزنة وأبحاث رصينة تجمع بين أصالة الفقه والتفسير ووعي قضايا العصر، معززة بتوثيق علمي ورؤى إيمانية راسخة."
        badges={[
          { label: "بصائر إيمانية ومعرفية", icon: FileText, variant: "emerald" },
          { label: `${toArabicNumber(initialArticles.length)} مقالاً وبحثاً موثقاً`, icon: BookOpen, variant: "gold" },
          { label: "محدث ومواكب للواقع", icon: TrendingUp, variant: "default" },
        ]}
        theme="emerald"
      />

      <Container size="2xl" className="pt-4 space-y-8">
        {/* ─── Trending Topics Quick Bar ─── */}
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-arabic font-bold text-foreground shrink-0">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <span>المواضيع الرائجة الآن:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {TRENDING_TOPICS.map((topic) => {
              const Icon = topic.icon;
              const isActive = searchQuery === topic.query;
              return (
                <button
                  key={topic.label}
                  onClick={() => {
                    if (isActive) {
                      setSearchQuery("");
                    } else {
                      setSearchQuery(topic.query);
                      setSelectedCategory("all");
                      setSelectedTag(null);
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-arabic font-medium transition-all whitespace-nowrap flex items-center gap-1.5 border shrink-0",
                    isActive
                      ? "bg-rose-500 text-white border-rose-500 shadow-xs font-bold"
                      : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{topic.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Hero Spotlight: Main Featured Article (When no search active) ─── */}
        {!hasActiveFilters && featuredArticle && (
          <div className="relative rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-xs overflow-hidden">
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-[var(--athar-green)]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center relative z-10">
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-[var(--athar-green)] bg-[var(--athar-green)]/10 px-3 py-1 rounded-full font-arabic">
                    {featuredArticle.category}
                  </span>
                  {featuredArticle.trending && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-500/10 px-2.5 py-0.5 rounded-full font-arabic border border-rose-500/20">
                      <TrendingUp className="h-3 w-3" />
                      <span>رائج هذا الأسبوع</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full font-arabic border border-amber-500/20">
                    <Sparkles className="h-3 w-3" />
                    <span>مقال مميز</span>
                  </span>
                </div>

                <Link href={`/articles/${featuredArticle.slug}`}>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold font-arabic text-foreground hover:text-[var(--athar-green)] transition-colors leading-tight">
                    {featuredArticle.title}
                  </h2>
                </Link>

                <p className="text-xs md:text-sm text-muted-foreground font-arabic leading-relaxed line-clamp-3">
                  {featuredArticle.summary}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-arabic pt-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span>{featuredArticle.author}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>قراءة في {toArabicNumber(featuredArticle.readingTimeMinutes)} دقائق</span>
                  </span>
                  <span>·</span>
                  <span>{featuredArticle.publishedAt}</span>
                </div>

                <div className="pt-2">
                  <Link href={`/articles/${featuredArticle.slug}`}>
                    <Button className="rounded-xl font-arabic font-semibold bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white text-xs gap-1.5 h-10 px-5 shadow-xs">
                      <span>قراءة المقال كاملاً</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="md:col-span-5 flex justify-center">
                <Link
                  href={`/articles/${featuredArticle.slug}`}
                  className="relative w-full max-w-[420px] aspect-[16/10] md:aspect-[4/3] rounded-2xl overflow-hidden shadow-md group block border border-border/60"
                >
                  <Image
                    src={featuredArticle.coverImage}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 420px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ─── Search & Controls Bar ─── */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في عناوين المقالات، المحتوى، الكتاب، أو الوسوم..."
                className="pr-10 pl-10 h-10 rounded-xl bg-background border-border/70 text-sm font-arabic focus:ring-2 focus:ring-primary/20"
                dir="rtl"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  title="مسح البحث"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Selector & Bookmarks Button */}
            <div className="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-background border border-border/70 px-3 py-1.5 rounded-xl text-xs font-arabic">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground shrink-0">ترتيب:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-foreground font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="newest">الأحدث نشراً</option>
                  <option value="trending">الأكثر رواجاً</option>
                  <option value="reading-asc">زمن القراءة (الأقصر)</option>
                  <option value="reading-desc">زمن القراءة (الأطول)</option>
                </select>
              </div>

              {/* Bookmarks toggle button */}
              <button
                type="button"
                onClick={() => setShowSavedOnly(!showSavedOnly)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-arabic font-medium transition-colors border flex items-center justify-center gap-1.5 shadow-xs",
                  showSavedOnly
                    ? "bg-amber-500 text-white border-amber-500 shadow-xs font-bold"
                    : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
                )}
              >
                <Bookmark
                  className={cn("h-3.5 w-3.5", showSavedOnly && "fill-current text-white")}
                />
                <span>المحفوظات ({toArabicNumber(savedArticles.length)})</span>
              </button>
            </div>
          </div>

          {/* Categories Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const catKey = cat.slug === "all" ? "all" : cat.name;
              const isSelected =
                (cat.slug === "all" && selectedCategory === "all") ||
                selectedCategory === cat.name;
              const count = categoryCounts[catKey] || 0;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.slug === "all" ? "all" : cat.name);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-2xl text-xs font-arabic font-medium whitespace-nowrap transition-all border flex items-center gap-2 shadow-xs shrink-0",
                    isSelected
                      ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-md font-bold scale-[1.02]"
                      : "bg-card border-border/70 text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <span>{cat.name}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {toArabicNumber(count)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tags Row */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-arabic">
              <span className="text-muted-foreground text-[11px] shrink-0 font-medium">
                الوسوم:
              </span>
              {allTags.slice(0, 14).map((tag) => (
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
                  className="text-[11px] text-red-500 hover:underline shrink-0 inline-flex items-center gap-1 font-arabic mr-1"
                >
                  <span>إلغاء الوسم</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Active Filters Summary & Reset */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between text-xs text-muted-foreground font-arabic bg-muted/40 p-2.5 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 flex-wrap">
                <span>الفلاتر النشطة:</span>
                {searchQuery && (
                  <span className="bg-background border border-border px-2 py-0.5 rounded-md text-[11px] font-medium text-foreground">
                    بحث: «{searchQuery}»
                  </span>
                )}
                {selectedCategory !== "all" && (
                  <span className="bg-background border border-border px-2 py-0.5 rounded-md text-[11px] font-medium text-foreground">
                    القسم: {selectedCategory}
                  </span>
                )}
                {selectedTag && (
                  <span className="bg-background border border-border px-2 py-0.5 rounded-md text-[11px] font-medium text-foreground">
                    وسم: #{selectedTag}
                  </span>
                )}
                {showSavedOnly && (
                  <span className="bg-background border border-border px-2 py-0.5 rounded-md text-[11px] font-medium text-foreground">
                    المحفوظات فقط
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedTag(null);
                  setShowSavedOnly(false);
                }}
                className="text-red-500 hover:underline text-[11px] font-semibold shrink-0"
              >
                مسح جميع الفلاتر
              </button>
            </div>
          )}
        </div>

        {/* ─── Results Counter ─── */}
        <div className="flex items-center justify-between text-xs text-muted-foreground font-arabic px-1">
          <span>
            عرض {toArabicNumber(filteredArticles.length)} من أصل {toArabicNumber(initialArticles.length)} مقالاً
          </span>
        </div>

        {/* ─── Articles Grid ─── */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-dashed border-border/80 bg-card p-8 max-w-md mx-auto shadow-xs space-y-3">
            <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto" />
            <h3 className="text-foreground font-arabic font-bold text-base">
              لا توجد مقالات مطابقة لبحثك
            </h3>
            <p className="text-muted-foreground text-xs font-arabic">
              جرب البحث بكلمات أخرى أو اختر موضوعاً من قائمة المواضيع الرائجة أعلاه.
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
                  className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card overflow-hidden transition-all duration-300 hover:border-[var(--athar-green)]/60 hover:shadow-lg hover:-translate-y-1"
                >
                  <div>
                    {/* Cover Image & Badges */}
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-muted border-b border-border/60">
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-white bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-md font-arabic shadow-xs">
                          {article.category}
                        </span>
                        {article.trending && (
                          <span className="text-[10px] font-bold text-white bg-rose-600/90 px-2 py-0.5 rounded-full backdrop-blur-md font-arabic shadow-xs flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>رائج</span>
                          </span>
                        )}
                      </div>

                      {/* Bookmark button */}
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(article.id, e)}
                        title={isSaved ? "إزالة من المحفوظات" : "حفظ المقال"}
                        className={cn(
                          "absolute top-3 left-3 p-2 rounded-full backdrop-blur-md transition-all shadow-xs cursor-pointer",
                          isSaved
                            ? "bg-amber-500 text-white"
                            : "bg-black/40 text-white/80 hover:text-white hover:bg-black/60"
                        )}
                      >
                        <Bookmark
                          className={cn("h-4 w-4", isSaved && "fill-current text-white")}
                        />
                      </button>
                    </div>

                    {/* Body Content */}
                    <div className="p-5 md:p-6 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-arabic">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="h-3 w-3 text-primary" />
                          <span>{toArabicNumber(article.readingTimeMinutes)} دقائق قراءة</span>
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
                              className="text-[10px] bg-muted/80 text-muted-foreground px-2 py-0.5 rounded-md font-arabic"
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
                      <span className="truncate max-w-[150px] font-medium">
                        بقلم: {article.author}
                      </span>
                      <Link
                        href={`/articles/${article.slug}`}
                        className="text-[var(--athar-green)] font-semibold group-hover:translate-x-[-3px] transition-transform inline-flex items-center gap-1 font-arabic"
                      >
                        <span>قراءة المقال</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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