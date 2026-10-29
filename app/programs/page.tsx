import React from "react";
import type { Metadata } from "next";
import ProgramsCatalogClient from "./ProgramsCatalogClient";
import { getFeaturedPrograms } from "@/lib/services/contentService";
import { LECTURES_DATA } from "@/data/lectures";

export const metadata: Metadata = {
  title: "البرامج والشروحات الإسلامية | أَثَر — منصة المعرفة الإسلامية",
  description:
    "مكتبة جامعة تجمع بين البرامج والبودكاستات المرئية الهادفة، والشروحات التأصيلية لكتب ومصادر العلم الشرعي لنخبة من كبار العلماء والدعاة.",
  openGraph: {
    title: "البرامج والشروحات الإسلامية | أَثَر",
    description:
      "استمع وشاهد سلاسل إيمانية وتربوية، شروح الحديث الشريف والفقه والعقيدة، وخواطر التفسير بأعلى جودة.",
    type: "website",
  },
};

export default function ProgramsPage() {
  const allPrograms = getFeaturedPrograms();

  return (
    <ProgramsCatalogClient
      initialPrograms={allPrograms}
      initialLectures={LECTURES_DATA}
    />
  );
}
