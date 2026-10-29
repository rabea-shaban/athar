import { PROGRAMS } from "@/data/programs";
import { ARTICLES } from "@/data/articles";
import { CONTENT_CATEGORIES } from "@/data/categories";
import {
  Program,
  Episode,
  Article,
  ContentCategory,
  UnifiedSearchItem,
} from "@/types/content";
import { normalizeArabic } from "@/lib/utils";

/**
 * جلب جميع البرامج مع إمكانية التصفية بالقسم أو البحث
 */
export function getPrograms(options?: {
  category?: string;
  featuredOnly?: boolean;
  search?: string;
}): Program[] {
  let list = PROGRAMS.filter((p) => p.published);

  if (options?.featuredOnly) {
    list = list.filter((p) => p.featured);
  }

  if (options?.category && options.category !== "all" && options.category !== "جميع التصنيفات") {
    list = list.filter((p) => p.category === options.category);
  }

  if (options?.search && options.search.trim()) {
    const q = normalizeArabic(options.search.trim().toLowerCase());
    list = list.filter((p) => {
      const matchTitle = normalizeArabic(p.title.toLowerCase()).includes(q);
      const matchDesc = normalizeArabic(p.description.toLowerCase()).includes(q);
      const matchPresenter = normalizeArabic(p.presenter.toLowerCase()).includes(q);
      const matchTags = p.tags?.some((t) => normalizeArabic(t.toLowerCase()).includes(q));
      return matchTitle || matchDesc || matchPresenter || matchTags;
    });
  }

  return list;
}

/**
 * جلب البرامج المميزة
 */
export function getFeaturedPrograms(): Program[] {
  return getPrograms();
}

/**
 * جلب برنامج محدد بواسطة الـ slug
 */
export function getProgramBySlug(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug && p.published);
}

/**
 * جلب حلقات برنامج محدد مرتبة ترتيباً تصاعدياً
 */
export function getProgramEpisodes(programSlug: string): Episode[] {
  const program = getProgramBySlug(programSlug);
  if (!program) return [];
  return [...program.episodes]
    .filter((ep) => ep.published)
    .sort((a, b) => a.order - b.order);
}

/**
 * جلب جميع المقالات مع التصفية بالقسم، الوسم، أو البحث
 */
export function getArticles(options?: {
  category?: string;
  tag?: string;
  featuredOnly?: boolean;
  search?: string;
}): Article[] {
  let list = ARTICLES.filter((a) => a.published);

  if (options?.featuredOnly) {
    list = list.filter((a) => a.featured);
  }

  if (options?.category && options.category !== "all" && options.category !== "جميع التصنيفات") {
    list = list.filter((a) => a.category === options.category);
  }

  if (options?.tag) {
    list = list.filter((a) => a.tags.includes(options.tag!));
  }

  if (options?.search && options.search.trim()) {
    const q = normalizeArabic(options.search.trim().toLowerCase());
    list = list.filter((a) => {
      const matchTitle = normalizeArabic(a.title.toLowerCase()).includes(q);
      const matchSummary = normalizeArabic(a.summary.toLowerCase()).includes(q);
      const matchAuthor = normalizeArabic(a.author.toLowerCase()).includes(q);
      const matchTags = a.tags.some((t) => normalizeArabic(t.toLowerCase()).includes(q));
      return matchTitle || matchSummary || matchAuthor || matchTags;
    });
  }

  return list;
}

/**
 * جلب مقال محدد بواسطة الـ slug
 */
export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug && a.published);
}

/**
 * جلب المقالات المرتبطة ببرنامج معين
 */
export function getRelatedArticlesForProgram(
  program: Program,
  limit = 3
): Article[] {
  if (program.relatedArticleIds && program.relatedArticleIds.length > 0) {
    const directMatches = ARTICLES.filter(
      (a) => a.published && program.relatedArticleIds!.includes(a.id)
    );
    if (directMatches.length > 0) return directMatches.slice(0, limit);
  }

  // Fallback to same category
  return ARTICLES.filter(
    (a) => a.published && a.category === program.category
  ).slice(0, limit);
}

/**
 * جلب البرامج المرتبطة بمقال معين
 */
export function getRelatedProgramsForArticle(
  article: Article,
  limit = 2
): Program[] {
  if (article.relatedProgramIds && article.relatedProgramIds.length > 0) {
    const directMatches = PROGRAMS.filter(
      (p) => p.published && article.relatedProgramIds!.includes(p.id)
    );
    if (directMatches.length > 0) return directMatches.slice(0, limit);
  }

  // Fallback to same category
  return PROGRAMS.filter(
    (p) => p.published && p.category === article.category
  ).slice(0, limit);
}

/**
 * جلب المقالات المقترحة لمقال معين
 */
export function getSuggestedArticles(
  article: Article,
  limit = 3
): Article[] {
  if (article.suggestedArticleIds && article.suggestedArticleIds.length > 0) {
    const directMatches = ARTICLES.filter(
      (a) =>
        a.published &&
        a.id !== article.id &&
        article.suggestedArticleIds!.includes(a.id)
    );
    if (directMatches.length > 0) return directMatches.slice(0, limit);
  }

  // Fallback to same category excluding the current article
  return ARTICLES.filter(
    (a) => a.published && a.id !== article.id && a.category === article.category
  ).slice(0, limit);
}

/**
 * جلب كافة التصنيفات المعتمدة
 */
export function getContentCategories(): ContentCategory[] {
  return CONTENT_CATEGORIES;
}

/**
 * بحث شامل في البرامج والحلقات والمقالات
 */
export function unifiedSearchContent(query: string): UnifiedSearchItem[] {
  if (!query || !query.trim()) return [];
  const q = normalizeArabic(query.trim().toLowerCase());
  const results: UnifiedSearchItem[] = [];

  // Search in programs
  for (const prog of PROGRAMS) {
    if (!prog.published) continue;
    if (
      normalizeArabic(prog.title.toLowerCase()).includes(q) ||
      normalizeArabic(prog.description.toLowerCase()).includes(q) ||
      normalizeArabic(prog.presenter.toLowerCase()).includes(q)
    ) {
      results.push({
        id: prog.id,
        title: prog.title,
        subtitle: `${prog.presenter} · ${prog.episodesCount} حلقات`,
        category: prog.category,
        type: "program",
        url: `/lectures/${prog.slug}`,
        badge: "سلسلة برامج",
      });
    }

    // Search in episodes
    for (const ep of prog.episodes) {
      if (!ep.published) continue;
      if (
        normalizeArabic(ep.title.toLowerCase()).includes(q) ||
        (ep.description && normalizeArabic(ep.description.toLowerCase()).includes(q))
      ) {
        results.push({
          id: ep.id,
          title: ep.title,
          subtitle: `حلقة من: ${prog.title} · ${ep.duration}`,
          category: prog.category,
          type: "episode",
          url: `/lectures/${prog.slug}#episode-${ep.id}`,
          badge: "حلقة صوتية",
        });
      }
    }
  }

  // Search in articles
  for (const art of ARTICLES) {
    if (!art.published) continue;
    if (
      normalizeArabic(art.title.toLowerCase()).includes(q) ||
      normalizeArabic(art.summary.toLowerCase()).includes(q) ||
      normalizeArabic(art.author.toLowerCase()).includes(q)
    ) {
      results.push({
        id: art.id,
        title: art.title,
        subtitle: `بقلم: ${art.author} · قراءة في ${art.readingTimeMinutes} دقائق`,
        category: art.category,
        type: "article",
        url: `/articles/${art.slug}`,
        badge: "مقال إيماني",
      });
    }
  }

  return results;
}
