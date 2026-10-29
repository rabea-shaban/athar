import { Metadata } from "next";
import { getArticles } from "@/lib/services/contentService";
import { CONTENT_CATEGORIES } from "@/data/categories";
import ArticlesClientList from "./ArticlesClientList";

export const metadata: Metadata = {
  title: "المقالات والمعرفة الإسلامية | أَثَر",
  description:
    "مقالات معرفية وإيمانية وتأصيلية معمقة في التفسير والسيرة وتزكية النفس والفكر المعاصر، ترسيخاً للعلم وبصيرة للقلب.",
  openGraph: {
    title: "المقالات والمعرفة الإسلامية — منصة أَثَر",
    description:
      "مقالات معرفية وإيمانية وتأصيلية معمقة في التفسير والسيرة وتزكية النفس والفكر المعاصر.",
  },
};

export default function ArticlesPage() {
  const articles = getArticles();
  const featuredArticle = articles.find((a) => a.featured) || articles[0];

  return (
    <ArticlesClientList
      initialArticles={articles}
      featuredArticle={featuredArticle}
      categories={CONTENT_CATEGORIES}
    />
  );
}
