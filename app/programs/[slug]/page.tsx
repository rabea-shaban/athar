import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getPrograms,
  getProgramBySlug,
  getRelatedArticlesForProgram,
} from "@/lib/services/contentService";
import ProgramDetailClient from "@/app/lectures/[slug]/ProgramDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const programs = getPrograms();
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgramBySlug(slug);

  if (!program) {
    return {
      title: "البرنامج غير موجود | أَثَر",
    };
  }

  return {
    title: `${program.title} | أَثَر`,
    description: program.description,
    openGraph: {
      title: `${program.title} — ${program.presenter} | منصة أثر`,
      description: program.description,
      images: [{ url: program.coverImage }],
    },
  };
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params;
  const program = getProgramBySlug(slug);

  if (!program) {
    notFound();
  }

  const relatedArticles = getRelatedArticlesForProgram(program, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    "name": program.title,
    "description": program.description,
    "image": program.coverImage,
    "author": {
      "@type": "Person",
      "name": program.presenter,
    },
    "numEpisodes": program.episodesCount,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProgramDetailClient program={program} relatedArticles={relatedArticles} />
    </>
  );
}
