import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "المكتبة الإسلامية الجامعة | 66 مصنفاً معتمداً في التفسير والحديث والفقه | أَثَر",
  description:
    "مكتبة إسلامية رقمية شاملة تضم أمهات كتب التراث الإسلامي والمعاصر في التفسير، الحديث، السيرة، الفقه، والتزكية مع إمكانية القراءة المباشرة والتحميل القانوني.",
  keywords: [
    "المكتبة الإسلامية",
    "كتب إسلامية pdf",
    "تحميل كتب إسلامية مجاناً",
    "صحيح البخاري",
    "صحيح مسلم",
    "تفسير ابن كثير",
    "الرحيق المختوم",
    "رياض الصالحين",
    "أمهات الكتب الإسلامية",
    "قراءة كتب إسلامية أونلاين",
    "أثر",
  ],
  openGraph: {
    title: "المكتبة الإسلامية الجامعة | أَثَر — منصة المعرفة الإسلامية",
    description:
      "تصفح واقرأ أمهات كتب التراث والعلوم الشرعية رقمياً مع تحميل مباشر للنسخ المصرح بها قانونياً.",
    type: "website",
    url: "https://athar-library.vercel.app/library",
  },
  alternates: {
    canonical: "https://athar-library.vercel.app/library",
  },
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
