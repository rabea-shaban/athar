export interface Book {
  slug: string;
  title: string;
  author: string;
  authorEra?: string;
  category: string;
  description: string;
  pages: number;
  readUrl?: string;
  downloadUrl?: string;
  themeColor?: string;
  badge?: string;
  featured?: boolean;
  topics?: string[];
}

export const CATEGORIES = [
  "القرآن وعلومه",
  "التفسير",
  "الحديث",
  "العقيدة",
  "الفقه",
  "السيرة",
  "التاريخ الإسلامي",
  "الأخلاق والرقائق",
  "اللغة العربية",
] as const;

export const BOOKS: Book[] = [
  {
    slug: "riyadh-al-salihin",
    title: "رياض الصالحين من كلام سيد المرسلين",
    author: "الإمام يحيى بن شرف النووي",
    authorEra: "توفي 676 هـ",
    category: "الحديث",
    description: "كتاب جامع للأحاديث الصحيحة في الآداب، الأخلاق، العبادات، والمعاملات، ويعد من أكثر كتب الحديث قبولاً وانتشاراً بين المسلمين.",
    pages: 650,
    readUrl: "https://archive.org/details/riyadh-al-salihin",
    themeColor: "from-emerald-800 to-teal-950",
    badge: "الأكثر قراءة",
    featured: true,
    topics: ["العبادات", "مكارم الأخلاق", "الرقائق", "السنن النبوية"]
  },
  {
    slug: "tafsir-ibn-kathir",
    title: "تفسير القرآن العظيم (ابن كثير)",
    author: "الحافظ عماد الدين ابن كثير",
    authorEra: "توفي 774 هـ",
    category: "التفسير",
    description: "عمدة التفاسير بالمأثور، يفسر القرآن بالقرآن ثم بالسنة النبوية وأقوال الصحابة والتابعين، ويتميز بتمحيص الأسانيد والروايات.",
    pages: 2000,
    readUrl: "https://quran.ksu.edu.sa/tafseer/katheer/",
    themeColor: "from-amber-800 to-stone-950",
    badge: "عمدة التفاسير",
    featured: true,
    topics: ["تفسير الآيات", "أسباب النزول", "الحديث بالمأثور", "الأحكام"]
  },
  {
    slug: "al-aqeedah-al-wasitiyyah",
    title: "العقيدة الواسطية",
    author: "شيخ الإسلام ابن تيمية",
    authorEra: "توفي 728 هـ",
    category: "العقيدة",
    description: "متن جليل ومختصر في بيان أصول معتقد أهل السنة والجماعة في أسماء الله وصفاته والإيمان باليوم الآخر والقضاء والقدر.",
    pages: 120,
    readUrl: "https://shamela.ws/book/7508",
    themeColor: "from-blue-900 to-slate-950",
    badge: "متن معتمد",
    featured: true,
    topics: ["توحيد الأسماء والصفات", "الإيمان", "أصول السنة", "الصحابة"]
  },
  {
    slug: "mukhtasar-al-seerah",
    title: "السيرة النبوية (تهذيب سيرة ابن هشام)",
    author: "عبد الملك بن هشام المعافري",
    authorEra: "توفي 218 هـ",
    category: "السيرة",
    description: "المرجع الأقدم والأشهر في تدوين سيرة المصطفى ﷺ، من نسبه ومولده إلى بعثته ومغازيه وشمائله ووفاته.",
    pages: 450,
    readUrl: "https://shamela.ws/book/23833",
    themeColor: "from-teal-900 to-green-950",
    badge: "أصل السير",
    featured: true,
    topics: ["المولد والنشأة", "الهجرة", "الغزوات", "الشمائل المحمدية"]
  },
  {
    slug: "al-adab-al-mufrad",
    title: "الأدب المفرد",
    author: "الإمام محمد بن إسماعيل البخاري",
    authorEra: "توفي 256 هـ",
    category: "الأخلاق والرقائق",
    description: "كتاب مستقل للإمام البخاري اختص فيه بأحاديث الآداب والبر وصلة الرحم وحسن الخلق وإكرام الجار وحقوق المسلمين.",
    pages: 320,
    readUrl: "https://shamela.ws/book/1053",
    themeColor: "from-purple-900 to-slate-950",
    badge: "كنوز الآداب",
    topics: ["بر الوالدين", "صلة الرحم", "حقوق الجوار", "الكلمة الطيبة"]
  },
  {
    slug: "zad-al-maad",
    title: "زاد المعاد في هدي خير العباد",
    author: "الإمام ابن قيم الجوزية",
    authorEra: "توفي 751 هـ",
    category: "السيرة",
    description: "سفر عظيم يجمع بين السيرة النبوية والفقه وهدي النبي ﷺ في عباداته ومعاملاته وطبه وأحكامه في السلم والحرب.",
    pages: 1450,
    readUrl: "https://shamela.ws/book/968",
    themeColor: "from-amber-900 to-orange-950",
    badge: "الموسوعة الهادية",
    featured: true,
    topics: ["الهدي النبوي", "فقه السيرة", "الطب النبوي", "الأحكام"]
  },
  {
    slug: "al-fiqh-al-muyassar",
    title: "الفقه الميسر في ضوء الكتاب والسنة",
    author: "نخبة من كبار العلماء",
    authorEra: "معاصر",
    category: "الفقه",
    description: "عرض مبسط وموثق بالأدلة لأحكام الطهارة، الصلاة، الزكاة، الصيام، الحج، والبيوع والمعاملات بأسلوب سهل يناسب كل مسلم.",
    pages: 480,
    readUrl: "https://shamela.ws/book/1672",
    themeColor: "from-cyan-900 to-slate-950",
    badge: "فقه مبسط",
    topics: ["الطهارة والصلاة", "الزكاة والصوم", "الحج", "المعاملات المالية"]
  },
  {
    slug: "al-wabil-al-sayyib",
    title: "الوابل الصيب من الكلم الطيب",
    author: "الإمام ابن قيم الجوزية",
    authorEra: "توفي 751 هـ",
    category: "الأخلاق والرقائق",
    description: "من أعظم ما كُتب في فضل الذكر وثمراته وفوائده الروحية وأثره في انشراح الصدر وطمأنينة القلب والنجاة في الدارين.",
    pages: 260,
    readUrl: "https://shamela.ws/book/21609",
    themeColor: "from-emerald-900 to-stone-950",
    badge: "رقائق وأذكار",
    topics: ["فضل الذكر", "طمأنينة القلب", "أذكار اليوم والليلة", "التوبة"]
  },
  {
    slug: "al-tibyan-fi-adab-hamalat-al-quran",
    title: "التبيان في آداب حملة القرآن",
    author: "الإمام يحيى بن شرف النووي",
    authorEra: "توفي 676 هـ",
    category: "القرآن وعلومه",
    description: "كتاب فريد يبين فضل تلاوة القرآن وحملته، وآداب المعلم والمتعلم، وأحكام قراءة القرآن وتوقيره وإكرام أهله.",
    pages: 190,
    readUrl: "https://shamela.ws/book/8381",
    themeColor: "from-emerald-950 to-green-900",
    badge: "آداب التلاوة",
    topics: ["فضل القرآن", "آداب القارئ والمقرئ", "التدبر والخشوع", "أحكام المصحف"]
  },
  {
    slug: "bulugh-al-maram",
    title: "بلوغ المرام من أدلة الأحكام",
    author: "الحافظ ابن حجر العسقلاني",
    authorEra: "توفي 852 هـ",
    category: "الحديث",
    description: "متن حديثي جامع ومتقن يشتمل على أصول الأدلة الحديثية للأحكام الفقهية مع بيان درجة صحة الأحاديث ونقدها.",
    pages: 380,
    readUrl: "https://shamela.ws/book/21727",
    themeColor: "from-stone-900 to-amber-950",
    badge: "أحاديث الأحكام",
    topics: ["أدلة الفقه", "تخريج الحديث", "الصلاة والطهارة", "الجنائز والبيوع"]
  },
  {
    slug: "matn-al-ajrumiyyah",
    title: "متن الآجرومية في علم النحو",
    author: "ابن آجرّوم الصنهاجي",
    authorEra: "توفي 723 هـ",
    category: "اللغة العربية",
    description: "أشهر متن تعليمي في قواعد لغة القرآن والنحو العربي للمبتدئين وطلاب العلم، يمتاز بالسلاسة والإيجاز والوضوح.",
    pages: 60,
    readUrl: "https://shamela.ws/book/9826",
    themeColor: "from-indigo-950 to-slate-900",
    badge: "مفتاح لغة القرآن",
    topics: ["الإعراب والبناء", "المرفوعات", "المنصوبات", "المجرورات"]
  },
  {
    slug: "tarikh-al-islam-al-thahabi",
    title: "تاريخ الإسلام ووفيات المشاهير والأعلام",
    author: "الحافظ شمس الدين الذهبي",
    authorEra: "توفي 748 هـ",
    category: "التاريخ الإسلامي",
    description: "الموسوعة التاريخية الكبرى في تدوين أحداث الأمة الإسلامية وتراجم فقهائها وقادتها وعلمائها عبر العصور.",
    pages: 3500,
    readUrl: "https://shamela.ws/book/12397",
    themeColor: "from-amber-950 to-stone-900",
    badge: "موسوعة تاريخية",
    topics: ["أحداث التاريخ", "تراجم العلماء", "الدولة الإسلامية", "سير الأعلام"]
  }
];

