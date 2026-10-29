import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Clock,
  User,
  Calendar,
  Tag,
  BookOpen,
  Share2,
  Bookmark,
  Check,
  Headphones,
  FileText,
  ChevronLeft,
  Volume2,
} from "lucide-react";
import Container from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getArticles,
  getArticleBySlug,
  getRelatedProgramsForArticle,
  getSuggestedArticles,
} from "@/lib/services/contentService";
import { toArabicNumber } from "@/lib/utils";
import ArticleDetailClient from "./ArticleDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "المقال غير موجود | أَثَر",
    };
  }

  return {
    title: `${article.title} | أَثَر`,
    description: article.summary,
    openGraph: {
      title: `${article.title} — ${article.author} | منصة أَثَر`,
      description: article.summary,
      images: [{ url: article.coverImage }],
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author],
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedPrograms = getRelatedProgramsForArticle(article, 2);
  const suggestedArticles = getSuggestedArticles(article, 3);

  // Schema.org structured data for Article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.summary,
    "image": article.coverImage,
    "datePublished": article.publishedAt,
    "author": {
      "@type": "Person",
      "name": article.author,
    },
    "publisher": {
      "@type": "Organization",
      "name": "أَثَر — ATHAR",
      "logo": {
        "@type": "ImageObject",
        "url": "https://athar-library.vercel.app/logo.png",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleDetailClient
        article={article}
        relatedPrograms={relatedPrograms}
        suggestedArticles={suggestedArticles}
      />
    </>
  );
}
