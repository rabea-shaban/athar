export interface AdhanTrack {
  id: string;
  name: string;
  muadhin: string;
  location: string;
  country: string;
  audioUrl: string;
  durationFormatted: string;
  isFajr?: boolean;
  description: string;
  badge?: string;
  color?: string;
}

export const ADHANS_LIST: AdhanTrack[] = [
  {
    id: "makkah",
    name: "أذان الحرم المكي الشريف",
    muadhin: "الشيخ علي أحمد ملا",
    location: "المسجد الحرام، مكة المكرمة",
    country: "المملكة العربية السعودية",
    audioUrl: "https://cdn.aladhan.com/audio/adhans/a5.mp3",
    durationFormatted: "٤:٣٠",
    description: "الأذان الخاشع بصوت شيخ مؤذني الحرم المكي الشريف علي أحمد ملا بنبرته الحجازية الأصيلة الشهيرة.",
    badge: "الأكثر شهرة",
    color: "#d97706",
  },
  {
    id: "madinah",
    name: "أذان المسجد النبوي الشريف",
    muadhin: "مؤذنو المسجد النبوي",
    location: "المسجد النبوي، المدينة المنورة",
    country: "المملكة العربية السعودية",
    audioUrl: "https://cdn.aladhan.com/audio/adhans/a6.mp3",
    durationFormatted: "٣:١٥",
    description: "أذان مدينة المصطفى ﷺ بروحانيته وسكينته العالية من رحاب المسجد النبوي الشريف.",
    badge: "المدينة المنورة",
    color: "#059669",
  },
  {
    id: "alafasy",
    name: "أذان الشيخ مشاري راشد العفاسي",
    muadhin: "الشيخ مشاري راشد العفاسي",
    location: "دولة الكويت",
    country: "الكويت",
    audioUrl: "https://cdn.aladhan.com/audio/adhans/a9.mp3",
    durationFormatted: "٣:٥٥",
    description: "تسجيل كامل عالي النقاء بصوت القارئ مشاري راشد العفاسي مع المؤثرات الصوتية والصدى الخاشع.",
    badge: "عالي النقاء",
    color: "#10b981",
  },
  {
    id: "alafasy_dubai",
    name: "أذان دبي - مشاري العفاسي",
    muadhin: "الشيخ مشاري راشد العفاسي",
    location: "تلفزيون وإذاعة دبي",
    country: "الإمارات العربية المتحدة",
    audioUrl: "https://cdn.aladhan.com/audio/adhans/a4.mp3",
    durationFormatted: "٤:٤٠",
    description: "الأذان المشهور المذاع على قنوات وإذاعات دبي بنبرة مميزة وهادئة.",
    badge: "إذاعة دبي",
    color: "#3b82f6",
  },
  {
    id: "alnafees",
    name: "أذان الشيخ أحمد النفيس",
    muadhin: "الشيخ أحمد النفيس",
    location: "الكويت",
    country: "الكويت",
    audioUrl: "https://cdn.aladhan.com/audio/adhans/a1.mp3",
    durationFormatted: "٣:٤٠",
    description: "أذان ندي عذب بصوت الشيخ أحمد النفيس بأداء بديع يريح القلوب.",
    badge: "صوت عذب",
    color: "#8b5cf6",
  },
  {
    id: "zahrani",
    name: "أذان الشيخ منصور الزهراني",
    muadhin: "الشيخ منصور الزهراني",
    location: "المملكة العربية السعودية",
    country: "المملكة العربية السعودية",
    audioUrl: "https://cdn.aladhan.com/audio/adhans/a11-mansour-al-zahrani.mp3",
    durationFormatted: "٣:٣٠",
    description: "أداء حجازي تراثي رائع للشيخ منصور الزهراني يتميز بالشجن والوقار.",
    badge: "مقام حجازي",
    color: "#ec4899",
  },
  {
    id: "aqsa",
    name: "أذان المسجد الأقصى المبارك",
    muadhin: "مؤذنو المسجد الأقصى",
    location: "المسجد الأقصى، القدس الشريف",
    country: "فلسطين",
    audioUrl: "https://cdn.aladhan.com/audio/adhans/a7.mp3",
    durationFormatted: "٣:٤٥",
    description: "صوت الأذان يصدح من مآذن المسجد الأقصى المبارك أولى القبلتين وثالث الحرمين الشريفين.",
    badge: "القدس الشريف",
    color: "#14b8a6",
  },
  {
    id: "egypt",
    name: "أذان الإذاعة المصرية",
    muadhin: "الشيخ عبد الباسط عبد الصمد",
    location: "القاهرة",
    country: "جمهورية مصر العربية",
    audioUrl: "https://cdn.aladhan.com/audio/adhans/a8.mp3",
    durationFormatted: "٣:٢٥",
    description: "أذان الإذاعة المصرية الأصيل بصوت كبار قراء ومؤذني مصر الخالدين.",
    badge: "إذاعة القرآن بمصر",
    color: "#f59e0b",
  },
  {
    id: "turkey",
    name: "الأذان التركي (إسطنبول)",
    muadhin: "الحافظ مصطفى أوزجان",
    location: "إسطنبول، جامع السلطان أحمد",
    country: "تركيا",
    audioUrl: "https://cdn.aladhan.com/audio/adhans/a2.mp3",
    durationFormatted: "٣:٥٠",
    description: "أذان بمقامات عثمانية أصيلة بصوت الحافظ مصطفى أوزجان من جوامع إسطنبول.",
    badge: "المقام العثماني",
    color: "#6366f1",
  },
  {
    id: "fajr",
    name: "أذان الفجر (الصلاة خير من النوم)",
    muadhin: "الشيخ مشاري راشد العفاسي",
    location: "أذان صلاة الفجر المخصوص",
    country: "العالم الإسلامي",
    audioUrl: "https://cdn.aladhan.com/audio/adhans/a10.mp3",
    durationFormatted: "٤:١٥",
    isFajr: true,
    description: "أذان الفجر المبارك متضمناً التثويب الشرعي (الصلاة خير من النوم، الصلاة خير من النوم).",
    badge: "صلاة الفجر",
    color: "#065f46",
  },
];

export const getAdhanById = (id?: string): AdhanTrack => {
  const found = ADHANS_LIST.find((a) => a.id === id);
  return found || ADHANS_LIST[0];
};
