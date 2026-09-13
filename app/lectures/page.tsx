"use client";

import { useState, useMemo, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  Mic,
  Video,
  Play,
  Pause,
  Search,
  Bookmark,
  Share2,
  Check,
  ShieldCheck,
  Library,
  Scroll,
  Scale,
  Landmark,
  Heart,
  Sprout,
  User,
  Clock,
  Layers,
  Volume2,
  FileText,
  Star,
  X,
  LucideIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Container from "@/components/layout/Container";
import { useAudioStore } from "@/store/audioStore";
import { cn, toArabicNumber } from "@/lib/utils";

export interface Lecture {
  id: string;
  title: string;
  scholar: string;
  category: string;
  type: "صوتي" | "فيديو" | "مقال";
  duration: string;
  episodesCount: number;
  description: string;
  topics: string[];
  benefits: string[];
  audioUrl?: string;
  videoUrl?: string;
}

const CATEGORIES: { name: string; icon: LucideIcon }[] = [
  { name: "الكل", icon: Library },
  { name: "التفسير وعلوم القرآن", icon: BookOpen },
  { name: "الحديث الشريف", icon: Scroll },
  { name: "العقيدة والتوحيد", icon: ShieldCheck },
  { name: "الفقه وأصوله", icon: Scale },
  { name: "السيرة النبوية", icon: Landmark },
  { name: "الرقائق والتربية", icon: Heart },
  { name: "قصص الأنبياء", icon: Sprout },
];

const MEDIA_TYPES = ["الكل", "صوتي", "فيديو", "مقال"] as const;

const LECTURES_DATA: Lecture[] = [
  {
    id: "lec-1",
    title: "المختصر في تفسير القرآن الكريم وبيان معانيه",
    scholar: "نخبة من علماء التفسير",
    category: "التفسير وعلوم القرآن",
    type: "صوتي",
    duration: "٣٥ دقيقة",
    episodesCount: 114,
    description: "شرح بياني دقيق ومفصل لآيات الذكر الحكيم، وبيان أسباب النزول، ودلالات الألفاظ القرآنية الإيمانية في حياة المسلم.",
    topics: [
      "بيان مقاصد السور وفضائل الآيات",
      "معاني المفردات الغريبة وأسرار البلاغة القرآنية",
      "استنباط الهدايات والدروس التربوية والعملية",
      "أسباب النزول وسياق الآيات الكريمة",
    ],
    benefits: [
      "تدبر القرآن الكريم هو الغاية العظمى من إنزاله",
      "فهم المعاني يورث الخشوع والعمل بالآيات",
      "القرآن حبل الله المتين ونوره المبين لكل سالك",
    ],
    audioUrl: "https://backup.qurango.net/radio/mukhtasartafsir",
  },
  {
    id: "lec-2",
    title: "شرح كتاب التوحيد وصحيح الإمام مسلم",
    scholar: "الشيخ صالح بن فوزان الفوزان",
    category: "العقيدة والتوحيد",
    type: "صوتي",
    duration: "٤٥ دقيقة",
    episodesCount: 24,
    description: "سلسلة علمية منهجية في تقرير توحيد الألوهية والربوبية والأسماء والصفات، والتحذير من الشرك بشتى صوره الظاهرة والخفية.",
    topics: [
      "فضل التوحيد وما يكفر من الذنوب",
      "من حقق التوحيد دخل الجنة بغير حساب",
      "الخوف من الشرك والرياء وتفقد القلب",
      "الدعاء إلى شهادة أن لا إله إلا الله",
    ],
    benefits: [
      "التوحيد هو أول واجب على المكلف وأعظم أساس للدين",
      "سلامة المعتقد هي شرط قبول جميع الأعمال الصالحة",
      "التحذير من الشرك الأصغر كالرياء والحلف بغير الله",
    ],
    audioUrl: "https://backup.qurango.net/radio/saheh-muslim",
  },
  {
    id: "lec-3",
    title: "شرح رياض الصالحين من كلام سيد المرسلين",
    scholar: "الشيخ محمد بن صالح العثيمين",
    category: "الحديث الشريف",
    type: "صوتي",
    duration: "٥٠ دقيقة",
    episodesCount: 60,
    description: "شرح تأصيلي نفيس لأحاديث رياض الصالحين للإمام النووي، وبيان فقه الأحاديث النبوية والآداب والأخلاق الإسلامية.",
    topics: [
      "شرح أحاديث الإخلاص وإحضار النية",
      "أثر النية الصالحة في تحويل العادات إلى عبادات",
      "الصبر واليقين في مواجهة الشدائد والابتلاءات",
      "أبواب البر والصلة ومكارم الأخلاق النبوية",
    ],
    benefits: [
      "السنة النبوية هي التطبيق العملي للقرآن الكريم",
      "إخلاص العمل لله شرط النجاة والفوز بالجنة",
      "المداومة على العمل الصالح وإن قل",
    ],
    audioUrl: "https://backup.qurango.net/radio/riyad",
  },
  {
    id: "lec-4",
    title: "في ظلال السيرة النبوية العطرة (دروس وعبر)",
    scholar: "سلسلة السيرة النبوية الكبرى",
    category: "السيرة النبوية",
    type: "صوتي",
    duration: "٤٠ دقيقة",
    episodesCount: 400,
    description: "إبحار إيماني وتاريخي موثق في أحداث السيرة النبوية الشريفة من المولد الشريف والبعثة المباركة حتى الوفاة، واستخراج الدروس الحية للأمة.",
    topics: [
      "الحكمة من بعثة النبي في جزيرة العرب",
      "مرحلة الدعوة وبناء جيل الصحابة الكرام",
      "الهجرة النبوية الشريفة وتأسيس دولة العدل",
      "غزوات النبي ﷺ وأخلاقه العظيمة في السلم والحرب",
    ],
    benefits: [
      "دراسة السيرة تزيد محبة النبي ﷺ وتثبت القلوب",
      "الصبر والمصابرة سنتان ربانيتان في نصرة دين الله",
      "الاقتداء بأخلاق المصطفى ﷺ في جميع شؤون الحياة",
    ],
    audioUrl: "https://backup.qurango.net/radio/fi_zilal_alsiyra",
  },
  {
    id: "lec-5",
    title: "الاختيارات الفقهية وأحكام العبادات والمعاملات",
    scholar: "الشيخ عبد العزيز بن باز",
    category: "الفقه وأصوله",
    type: "صوتي",
    duration: "٣٥ دقيقة",
    episodesCount: 48,
    description: "شرح فقهي ميسر مدعم بالأدلة الشرعية من الكتاب والسنة الصحيحة في أحكام الطهارة والصلاة والزكاة والصيام والحج والمعاملات.",
    topics: [
      "شروط وأركان وواجبات وسنن الصلاة",
      "صفة الوضوء الكامل والغسل الشرعي",
      "أحكام الزكاة والصدقات ومصارفها الشرعية",
      "فقه الصيام وأحكام المفطرات المعاصرة",
    ],
    benefits: [
      "التفقه في الدين من علامات إرادة الله الخير بالعبد",
      "تحقيق الاتباع للنبي ﷺ في كيفية أداء العبادات",
      "معرفة الحلال والحرام تحصن المسلم في دينه ومعاشه",
    ],
    audioUrl: "https://backup.qurango.net/radio/alaikhtiarat_alfiqhayh_bin_baz",
  },
  {
    id: "lec-6",
    title: "الشمائل المحمدية — في أخلاق وأوصاف النبي ﷺ",
    scholar: "شروحات أعلام الأمة",
    category: "الرقائق والتربية",
    type: "صوتي",
    duration: "٤٢ دقيقة",
    episodesCount: 36,
    description: "وقفات إيمانية ووجدانية مع كتاب الشمائل المحمدية للإمام الترمذي، في وصف خَلق وخُلق النبي ﷺ وعبادته وزهده وتواضعه.",
    topics: [
      "وصف هيئة وخلقة النبي ﷺ الشريفة",
      "عبادة النبي وتهجده وبكاؤه في جوف الليل",
      "تواضع النبي مع الصغير والكبير والضعفاء",
      "كرمه وجوده ﷺ وشفقته العظيمة على أمته",
    ],
    benefits: [
      "معرفة شمائل المصطفى تغرس محبته الصادقة في النفوس",
      "حسن الخلق أثقل ما يوضع في ميزان العبد يوم القيامة",
      "التأسي بالهدي النبوي في الرحمة والحلم والصفح",
    ],
    audioUrl: "https://backup.qurango.net/radio/shmaeel",
  },
  {
    id: "lec-7",
    title: "سلسلة قصص الأنبياء والمرسلين والدروس والعظات",
    scholar: "نخبة من الدعاة والعلماء",
    category: "قصص الأنبياء",
    type: "صوتي",
    duration: "٥٥ دقيقة",
    episodesCount: 30,
    description: "عرض قرآني رائع لمسيرة أنبياء الله ورسله عليهم الصلاة والسلام، ومواقفهم العظيمة في الصبر على الدعوة والثبات على التوحيد.",
    topics: [
      "قصة أبي الأنبياء إبراهيم عليه السلام والتوحيد",
      "قصة كليم الله موسى عليه السلام ومواجهة الطغيان",
      "قصة الصديق يوسف عليه السلام والتمكين بعد الابتلاء",
      "قصة خاتم الأنبياء محمد ﷺ وكمال الرسالة",
    ],
    benefits: [
      "لقد كان في قصصهم عبرة لأولي الألباب",
      "سنة الابتلاء يعقبها النصر والتمكين للمؤمنين",
      "الأنبياء هم القدوة والأسوة في التضحية واليقين",
    ],
    audioUrl: "https://backup.qurango.net/radio/alanbiya",
  },
  {
    id: "lec-8",
    title: "شرح أحاديث صحيح الإمام البخاري",
    scholar: "شروحات كبار المحدثين",
    category: "الحديث الشريف",
    type: "صوتي",
    duration: "٤٥ دقيقة",
    episodesCount: 75,
    description: "شرح منهجية الجامع الصحيح للإمام البخاري، ودراسة أحاديث بدء الوحي والإيمان والعلم وأحكام الشريعة المطهرة.",
    topics: [
      "شرح أحاديث بدء الوحي إلى رسول الله ﷺ",
      "كتاب الإيمان وشعبه وحقيقته الشرعية",
      "فضل العلم وأدب طالب العلم والعلماء",
      "تراجم أبواب البخاري وفقهه الدقيق",
    ],
    benefits: [
      "صحيح البخاري أصح كتاب بعد كتاب الله تعالى",
      "عناية علماء الأمة بنقل السنة النبوية الشريفة بالسند المتصل",
      "العلم قبل القول والعمل هو منهج السلف الصالح",
    ],
    audioUrl: "https://backup.qurango.net/radio/saheh-bokharee",
  },
  {
    id: "lec-9",
    title: "صور من حياة الصحابة والتابعين والقدوة الصالحة",
    scholar: "سلسلة سير أعلام الهدى",
    category: "السيرة النبوية",
    type: "صوتي",
    duration: "٣٥ دقيقة",
    episodesCount: 50,
    description: "سير عطرة ومواقف مشرقة لصحابة رسول الله ﷺ والتابعين لهم بإحسان، ونماذج خالدة في التضحية والبذل والورع والتقوى.",
    topics: [
      "مناقب الخلفاء الراشدين الأربعة رضي الله عنهم",
      "أبطال الفتوحات الإسلامية وفرسان العقيدة",
      "نماذج من ورع وزهد كبار التابعين",
      "كيف نحيي روح الجيل الأول في واقعنا المعاصر",
    ],
    benefits: [
      "الصحابة هم خير القرون وأعدل الأمة وأبرها قلوباً",
      "محبة أصحاب النبي ﷺ دين وإيمان وإحسان",
      "قراءة سير الصالحين تشحذ الهمم وتصلح القلوب",
    ],
    audioUrl: "https://backup.qurango.net/radio/sahabah",
  },
];

const TYPE_CONFIG = {
  مقال: {
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    icon: BookOpen,
  },
  صوتي: {
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    icon: Mic,
  },
  فيديو: {
    color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    icon: Video,
  },
};

export default function LecturesPage() {
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [selectedType, setSelectedType] = useState<string>("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [savedLectures, setSavedLectures] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { setAudio, isPlaying, src: currentSrc, togglePlay } = useAudioStore();

  // Load saved bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("athar-saved-lectures");
      if (saved) setSavedLectures(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleSaveLecture = (id: string) => {
    setSavedLectures((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("athar-saved-lectures", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handlePlayLecture = (lecture: Lecture) => {
    if (!lecture.audioUrl) return;
    if (currentSrc === lecture.audioUrl && isPlaying) {
      togglePlay();
      return;
    }
    setAudio(lecture.audioUrl, lecture.title, lecture.scholar, "lecture");
  };

  const handleCopyLink = (lecture: Lecture) => {
    const text = `${lecture.title}\nالشارح: ${lecture.scholar}\nالتصنيف: ${lecture.category}\n\nعبر منصة أَثَر للمعرفة الإسلامية`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(lecture.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const filteredLectures = useMemo(() => {
    return LECTURES_DATA.filter((lec) => {
      const matchCategory =
        selectedCategory === "الكل" || lec.category === selectedCategory;
      const matchType = selectedType === "الكل" || lec.type === selectedType;
      const matchSaved = !showSavedOnly || savedLectures.includes(lec.id);
      const matchQuery =
        searchQuery.trim() === "" ||
        lec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lec.scholar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lec.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCategory && matchType && matchSaved && matchQuery;
    });
  }, [selectedCategory, selectedType, showSavedOnly, savedLectures, searchQuery]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-muted/10 to-background pb-20">
      {/* 1. Hero Header */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-muted/20 py-10 md:py-12">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--athar-green)]/10 blur-3xl rounded-full" />

        <Container size="2xl" className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--athar-green)]/10 text-[var(--athar-green)] text-xs md:text-sm font-medium mb-4 border border-[var(--athar-green)]/20 shadow-xs font-arabic">
            <GraduationCap className="h-4 w-4" />
            <span>مِنْحَةُ العِلمِ وَنُورُ البَصِيرَةِ</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3 font-arabic">
            الشروحات والدروس الإسلامية
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed font-arabic">
            منظومة متكاملة من الدروس المنهجية والمحاضرات العلمية المسموعة والمقروءة لكبار العلماء الأجلاء لترسيخ العلم الشرعي وتزكية القلوب.
          </p>

          <div className="inline-block p-3 px-5 rounded-2xl bg-card border border-border/70 text-xs sm:text-sm text-foreground/90 font-arabic italic shadow-xs">
            «مَن سَلَكَ طَرِيقاً يَلتَمِسُ فِيهِ عِلماً سَهَّلَ اللهُ لَهُ بِهِ طَرِيقاً إِلَى الجَنَّةِ» — <span className="text-muted-foreground">رواه مسلم</span>
          </div>
        </Container>
      </section>

      {/* 2. Search, Filters & Content Area */}
      <Container size="2xl" className="py-8">
        {/* Controls Bar */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن درس، شيخ، موضوع، أو مسألة..."
                className="pr-10 h-10 rounded-xl bg-background border-border/70 text-sm font-arabic"
                dir="rtl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Media Type Tabs & Bookmarks Button */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Media Types */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/70">
                {MEDIA_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-arabic font-medium transition-all",
                      selectedType === type
                        ? "bg-card text-foreground font-bold shadow-xs border border-border/50"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Saved Bookmarks filter */}
              <button
                onClick={() => setShowSavedOnly(!showSavedOnly)}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-arabic font-medium transition-colors border flex items-center gap-1.5",
                  showSavedOnly
                    ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                    : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
                )}
              >
                <Star className={cn("h-3.5 w-3.5", showSavedOnly && "fill-current")} />
                <span>المحفوظات ({toArabicNumber(savedLectures.length)})</span>
              </button>
            </div>
          </div>

          {/* Categories Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={cn(
                    "px-3.5 py-2 rounded-2xl text-xs font-arabic font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 shadow-xs",
                    selectedCategory === cat.name
                      ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)] shadow-md font-bold scale-[1.02]"
                      : "bg-card border-border/70 text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground font-arabic px-1">
          <span>عرض {toArabicNumber(filteredLectures.length)} من أصل {toArabicNumber(LECTURES_DATA.length)} درساً ومحاضرة</span>
        </div>

        {/* Lectures Grid */}
        {filteredLectures.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-dashed border-border/80 bg-card p-8 max-w-md mx-auto shadow-xs">
            <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-foreground font-arabic font-bold text-base mb-1">لا توجد شروحات مطابقة</h3>
            <p className="text-muted-foreground text-xs font-arabic mb-4">
              جرب البحث بكلمات أخرى أو تغيير تصنيف الدروس.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedCategory("الكل");
                setSelectedType("الكل");
                setShowSavedOnly(false);
                setSearchQuery("");
              }}
              className="rounded-xl font-arabic text-xs"
            >
              إعادة تعيين الفلاتر
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLectures.map((lecture) => {
              const isPlayingThis = currentSrc === lecture.audioUrl && isPlaying;
              const isSaved = savedLectures.includes(lecture.id);
              const TypeIcon = TYPE_CONFIG[lecture.type].icon;

              return (
                <div
                  key={lecture.id}
                  className={cn(
                    "group flex flex-col justify-between rounded-3xl border bg-card p-5 md:p-6 transition-all duration-200 hover:shadow-md text-right relative overflow-hidden",
                    isPlayingThis
                      ? "border-[var(--athar-green)] ring-2 ring-[var(--athar-green)]/30 bg-gradient-to-b from-[var(--athar-green)]/10 to-card shadow-md"
                      : "border-border/80 hover:border-[var(--athar-green)]/50 hover:-translate-y-0.5"
                  )}
                >
                  <div>
                    {/* Top Row Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-semibold text-[var(--athar-green)] bg-[var(--athar-green)]/10 px-2.5 py-0.5 rounded-full border border-[var(--athar-green)]/20 font-arabic truncate">
                        {lecture.category}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border font-arabic shrink-0",
                          TYPE_CONFIG[lecture.type].color
                        )}
                      >
                        <TypeIcon className="h-3 w-3" />
                        <span>{lecture.type}</span>
                      </span>
                    </div>

                    {/* Title & Scholar */}
                    <h3
                      onClick={() => setActiveLecture(lecture)}
                      className="font-bold text-base font-arabic text-foreground group-hover:text-[var(--athar-green)] transition-colors mb-1.5 cursor-pointer line-clamp-2 leading-snug"
                    >
                      {lecture.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-arabic mb-3">
                      <User className="h-3.5 w-3.5 text-amber-600/80 shrink-0" />
                      <span className="truncate">{lecture.scholar}</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground font-arabic leading-relaxed line-clamp-3 mb-4">
                      {lecture.description}
                    </p>
                  </div>

                  {/* Meta info & Action bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50 pt-3 mb-3 font-arabic">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lecture.duration}
                      </span>
                      {lecture.episodesCount && (
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {toArabicNumber(lecture.episodesCount)} حلقة
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1.5 pt-1">
                      {/* Audio Play or View Details */}
                      {lecture.audioUrl ? (
                        <Button
                          size="sm"
                          onClick={() => handlePlayLecture(lecture)}
                          className={cn(
                            "gap-1.5 text-xs h-9 rounded-xl font-arabic font-semibold transition-all flex-1",
                            isPlayingThis
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                              : "bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white"
                          )}
                        >
                          {isPlayingThis ? (
                            <>
                              <Pause className="h-3.5 w-3.5" />
                              <span>إيقاف مؤقت</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-3.5 w-3.5" />
                              <span>استماع للشرح</span>
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveLecture(lecture)}
                          className="gap-1.5 text-xs h-9 rounded-xl font-arabic flex-1 border-border/80 hover:border-[var(--athar-green)] hover:text-[var(--athar-green)]"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>عرض الفوائد</span>
                        </Button>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-0.5">
                        {lecture.audioUrl && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setActiveLecture(lecture)}
                            className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-xl"
                            title="عرض الفوائد والمحاور"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleCopyLink(lecture)}
                          className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-xl"
                          title={copiedId === lecture.id ? "تم النسخ!" : "نسخ المعلومات"}
                        >
                          {copiedId === lecture.id ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Share2 className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleSaveLecture(lecture.id)}
                          className={cn(
                            "h-9 w-9 rounded-xl transition-colors",
                            isSaved
                              ? "text-amber-500 fill-amber-500 bg-amber-500/10"
                              : "text-muted-foreground hover:text-amber-500"
                          )}
                          title={isSaved ? "إلغاء الحفظ" : "حفظ في المفضلة"}
                        >
                          <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>

      {/* 3. Comprehensive Lecture Details Modal */}
      {activeLecture && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setActiveLecture(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-2xl text-foreground font-arabic animate-in zoom-in-95 duration-150 relative text-right"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-border/60 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-[var(--athar-green)] bg-[var(--athar-green)]/10 px-2.5 py-0.5 rounded-full border border-[var(--athar-green)]/20">
                    {activeLecture.category}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold border",
                      TYPE_CONFIG[activeLecture.type].color
                    )}
                  >
                    {activeLecture.type}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground leading-snug">
                  {activeLecture.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    الشارح: {activeLecture.scholar}
                  </span>
                  <span>•</span>
                  <span>المدة: {activeLecture.duration}</span>
                  {activeLecture.episodesCount && (
                    <>
                      <span>•</span>
                      <span>{toArabicNumber(activeLecture.episodesCount)} حلقات</span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setActiveLecture(null)}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                نبذة عن الدرس والمحاضرة:
              </h4>
              <p className="text-sm text-foreground/90 leading-relaxed bg-muted/40 p-4 rounded-2xl border border-border/50">
                {activeLecture.description}
              </p>
            </div>

            {/* Core Topics */}
            {activeLecture.topics && activeLecture.topics.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-[var(--athar-green)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="h-4 w-4" />
                  <span>أبرز محاور الشرح:</span>
                </h4>
                <div className="grid sm:grid-cols-2 gap-2">
                  {activeLecture.topics.map((topic, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-3 rounded-2xl bg-card border border-border/60 text-xs text-foreground/90"
                    >
                      <span className="w-5 h-5 rounded-full bg-[var(--athar-green)]/15 text-[var(--athar-green)] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {toArabicNumber(i + 1)}
                      </span>
                      <span className="leading-snug">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Benefits */}
            {activeLecture.benefits && activeLecture.benefits.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  <span>الفوائد المستنبطة من الدرس:</span>
                </h4>
                <ul className="space-y-2">
                  {activeLecture.benefits.map((benefit, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-foreground/90 bg-amber-500/5 border border-amber-500/20 p-3 rounded-2xl"
                    >
                      <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/60 flex-wrap">
              <div className="flex items-center gap-2">
                {activeLecture.audioUrl && (
                  <Button
                    size="sm"
                    onClick={() => {
                      handlePlayLecture(activeLecture);
                      setActiveLecture(null);
                    }}
                    className="gap-2 bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white text-xs h-9 px-4 rounded-xl"
                  >
                    <Play className="h-4 w-4" />
                    <span>تشغيل المحاضرة الصوتية</span>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleSaveLecture(activeLecture.id)}
                  className="gap-1.5 text-xs h-9 rounded-xl border-border/80"
                >
                  <Bookmark
                    className={cn(
                      "h-3.5 w-3.5",
                      savedLectures.includes(activeLecture.id) &&
                        "text-amber-500 fill-amber-500"
                    )}
                  />
                  <span>
                    {savedLectures.includes(activeLecture.id)
                      ? "محفوظ في المفضلة"
                      : "حفظ في المفضلة"}
                  </span>
                </Button>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopyLink(activeLecture)}
                className="gap-1.5 text-xs h-9 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>مشاركة الشرح</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

