import type { MetadataRoute } from "next";
import { BOOKS } from "@/data/books";
import { PROGRAMS } from "@/data/programs";
import { ARTICLES } from "@/data/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://athar-library.vercel.app";

  // Base pages
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/quran",
    "/quran-search",
    "/listen",
    "/radio",
    "/adhkar",
    "/tasbeeh",
    "/hadith",
    "/tafsir",
    "/programs",
    "/lectures",
    "/articles",
    "/library",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Surahs (1 to 114)
  const surahRoutes: MetadataRoute.Sitemap = Array.from({ length: 114 }, (_, i) => ({
    url: `${baseUrl}/quran/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // Books
  const bookRoutes: MetadataRoute.Sitemap = BOOKS.map((book) => ({
    url: `${baseUrl}/library/${book.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Programs & Series
  const programRoutes: MetadataRoute.Sitemap = PROGRAMS.map((p) => ({
    url: `${baseUrl}/lectures/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Articles
  const articleRoutes: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${baseUrl}/articles/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...surahRoutes, ...bookRoutes, ...programRoutes, ...articleRoutes];
}
