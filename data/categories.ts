import { ContentCategory } from "@/types/content";

export const CONTENT_CATEGORIES: ContentCategory[] = [
  {
    id: "all",
    slug: "all",
    name: "جميع التصنيفات",
    description: "استكشف كافة البرامج والمقالات والشروحات الإيمانية في منصة أثر.",
    iconName: "Library",
  },
  {
    id: "tafsir",
    slug: "tafsir",
    name: "التفسير وعلوم القرآن",
    description: "تأملات قرآنية وبيان لأسرار الذكر الحكيم وأسباب النزول ومقاصد السور.",
    iconName: "BookOpen",
  },
  {
    id: "hadith",
    slug: "hadith",
    name: "الحديث والشروح النبوية",
    description: "فقه الأحاديث النبوية الشريفة وأخلاق النبي ﷺ وتوجيهاته العطرة.",
    iconName: "Scroll",
  },
  {
    id: "seerah",
    slug: "seerah",
    name: "السيرة والتاريخ الإسلامي",
    description: "إبحار موثق في وقائع السيرة النبوية وتاريخ صدر الإسلام واستخراج الدروس الحية.",
    iconName: "Landmark",
  },
  {
    id: "tazkiyah",
    slug: "tazkiyah",
    name: "الرقائق وتزكية النفس",
    description: "مداواة القلوب والتربية الإيمانية وعلاج الغفلة وسبل التحرر من أهواء النفس.",
    iconName: "Heart",
  },
  {
    id: "worship",
    slug: "worship",
    name: "فقه العبادات ومقاصدها",
    description: "تذوق معاني الصلاة والذكر والصيام والارتقاء بالعمل من العادة إلى العبادة.",
    iconName: "Scale",
  },
  {
    id: "contemporary",
    slug: "contemporary",
    name: "الفكر والوعي المعاصر",
    description: "حوارات فكرية وتربوية تعالج تحديات الواقع وشبهات العصر بوعي إسلامي متزن.",
    iconName: "Compass",
  },
];
