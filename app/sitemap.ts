import type { MetadataRoute } from "next";
import { BOOKS } from "@/data/books";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://athar.app";

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
    "/lectures",
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

  return [...staticRoutes, ...surahRoutes, ...bookRoutes];
}
