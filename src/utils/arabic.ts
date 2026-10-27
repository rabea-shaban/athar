export function toArabicNumber(num: number | string): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num).replace(/[0-9]/g, (digit) => arabicDigits[parseInt(digit, 10)]);
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
  const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  return `${formattedMins}:${formattedSecs}`;
}

export function cleanZikrText(text: string): string {
  if (!text) return "";
  const quoted = text.match(/"([^"]+)"/);
  if (quoted) return quoted[1].trim();
  return text
    .replace(/\\n/g, "\n")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/[',]\s*'/g, " ")
    .replace(/^['"\s]+|['"\s]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export const PRAYER_NAMES_AR: Record<string, string> = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
  Imsak: "الإمساك",
  Midnight: "منتصف الليل",
};

export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[أإآا]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

export function isDivineWord(word: string): boolean {
  const stripped = normalizeArabic(word);
  return (
    stripped === "الله" ||
    stripped === "بالله" ||
    stripped === "والله" ||
    stripped === "لله" ||
    stripped === "فلله" ||
    stripped === "ولله" ||
    stripped === "تالله" ||
    stripped === "افبالله" ||
    stripped === "ربهم" ||
    stripped === "ربك" ||
    stripped === "ربكم" ||
    stripped === "ربنا" ||
    stripped === "ربه"
  );
}

export function stripBismillah(
  text: string,
  surahNumber: number,
  ayahNumber: number
): string {
  if (surahNumber === 1 || surahNumber === 9 || ayahNumber !== 1) return text;
  return text
    .replace(/^بِسْمِ\s*ٱللَّهِ\s*ٱلرَّحْمَٰنِ\s*ٱلرَّحِيمِ\s*/, "")
    .replace(/^بِسْمِ\s*اللَّهِ\s*الرَّحْمَٰنِ\s*الرَّحِيمِ\s*/, "")
    .replace(/^بِسْمِ\s*ٱللَّهِ\s*ٱلرَّحْمَٰنِ\s*ٱلرَّحِيمِ\s*/, "")
    .replace(/^بِسْمِ\s*اللَّهِ\s*الرَّحْمَٰنِ\s*الرَّحِيمِ\s*/, "")
    .trim();
}

export function cleanSurahName(name: string): string {
  if (!name) return "";
  return name.replace(/^سُ?و?رَ?ةُ?\s*/, "").trim();
}

export const JUZ_NAMES: Record<number, string> = {
  1: "الجُزْءُ الأَوَّل",
  2: "الجُزْءُ الثَّانِي",
  3: "الجُزْءُ الثَّالِث",
  4: "الجُزْءُ الرَّابِع",
  5: "الجُزْءُ الخَامِس",
  6: "الجُزْءُ السَّادِس",
  7: "الجُزْءُ السَّابِع",
  8: "الجُزْءُ الثَّامِن",
  9: "الجُزْءُ التَّاسِع",
  10: "الجُزْءُ العَاشِر",
  11: "الجُزْءُ الحَادِي عَشَر",
  12: "الجُزْءُ الثَّانِي عَشَر",
  13: "الجُزْءُ الثَّالِث عَشَر",
  14: "الجُزْءُ الرَّابِع عَشَر",
  15: "الجُزْءُ الخَامِس عَشَر",
  16: "الجُزْءُ السَّادِس عَشَر",
  17: "الجُزْءُ السَّابِع عَشَر",
  18: "الجُزْءُ الثَّامِن عَشَر",
  19: "الجُزْءُ التَّاسِع عَشَر",
  20: "الجُزْءُ العِشْرُون",
  21: "الجُزْءُ الحَادِي وَالعِشْرُون",
  22: "الجُزْءُ الثَّانِي وَالعِشْرُون",
  23: "الجُزْءُ الثَّالِث وَالعِشْرُون",
  24: "الجُزْءُ الرَّابِع وَالعِشْرُون",
  25: "الجُزْءُ الخَامِس وَالعِشْرُون",
  26: "الجُزْءُ السَّادِس وَالعِشْرُون",
  27: "الجُزْءُ السَّابِع وَالعِشْرُون",
  28: "الجُزْءُ الثَّامِن وَالعِشْرُون",
  29: "الجُزْءُ التَّاسِع وَالعِشْرُون",
  30: "الجُزْءُ الثَّلَاثُون",
};

export const SURAH_PAGES: Record<number, { page: number; juz: number }> = {
  1: { page: 1, juz: 1 }, 2: { page: 2, juz: 1 }, 3: { page: 50, juz: 3 }, 4: { page: 77, juz: 4 },
  5: { page: 106, juz: 6 }, 6: { page: 128, juz: 7 }, 7: { page: 151, juz: 8 }, 8: { page: 177, juz: 9 },
  9: { page: 187, juz: 10 }, 10: { page: 208, juz: 11 }, 11: { page: 221, juz: 11 }, 12: { page: 235, juz: 12 },
  13: { page: 249, juz: 13 }, 14: { page: 255, juz: 13 }, 15: { page: 262, juz: 14 }, 16: { page: 267, juz: 14 },
  17: { page: 282, juz: 15 }, 18: { page: 293, juz: 15 }, 19: { page: 305, juz: 16 }, 20: { page: 312, juz: 16 },
  21: { page: 322, juz: 17 }, 22: { page: 332, juz: 17 }, 23: { page: 342, juz: 18 }, 24: { page: 350, juz: 18 },
  25: { page: 359, juz: 18 }, 26: { page: 367, juz: 19 }, 27: { page: 377, juz: 19 }, 28: { page: 385, juz: 20 },
  29: { page: 396, juz: 20 }, 30: { page: 404, juz: 21 }, 31: { page: 411, juz: 21 }, 32: { page: 415, juz: 21 },
  33: { page: 418, juz: 21 }, 34: { page: 428, juz: 22 }, 35: { page: 434, juz: 22 }, 36: { page: 440, juz: 22 },
  37: { page: 446, juz: 23 }, 38: { page: 453, juz: 23 }, 39: { page: 458, juz: 23 }, 40: { page: 467, juz: 24 },
  41: { page: 477, juz: 24 }, 42: { page: 483, juz: 25 }, 43: { page: 489, juz: 25 }, 44: { page: 496, juz: 25 },
  45: { page: 499, juz: 25 }, 46: { page: 502, juz: 26 }, 47: { page: 507, juz: 26 }, 48: { page: 511, juz: 26 },
  49: { page: 515, juz: 26 }, 50: { page: 518, juz: 26 }, 51: { page: 520, juz: 26 }, 52: { page: 523, juz: 27 },
  53: { page: 526, juz: 27 }, 54: { page: 528, juz: 27 }, 55: { page: 531, juz: 27 }, 56: { page: 534, juz: 27 },
  57: { page: 537, juz: 27 }, 58: { page: 542, juz: 28 }, 59: { page: 545, juz: 28 }, 60: { page: 549, juz: 28 },
  61: { page: 551, juz: 28 }, 62: { page: 553, juz: 28 }, 63: { page: 554, juz: 28 }, 64: { page: 556, juz: 28 },
  65: { page: 558, juz: 28 }, 66: { page: 560, juz: 28 }, 67: { page: 562, juz: 29 }, 68: { page: 564, juz: 29 },
  69: { page: 566, juz: 29 }, 70: { page: 568, juz: 29 }, 71: { page: 570, juz: 29 }, 72: { page: 572, juz: 29 },
  73: { page: 574, juz: 29 }, 74: { page: 575, juz: 29 }, 75: { page: 577, juz: 29 }, 76: { page: 578, juz: 29 },
  77: { page: 580, juz: 29 }, 78: { page: 582, juz: 30 }, 79: { page: 583, juz: 30 }, 80: { page: 585, juz: 30 },
  81: { page: 586, juz: 30 }, 82: { page: 587, juz: 30 }, 83: { page: 587, juz: 30 }, 84: { page: 589, juz: 30 },
  85: { page: 590, juz: 30 }, 86: { page: 591, juz: 30 }, 87: { page: 591, juz: 30 }, 88: { page: 592, juz: 30 },
  89: { page: 593, juz: 30 }, 90: { page: 594, juz: 30 }, 91: { page: 595, juz: 30 }, 92: { page: 595, juz: 30 },
  93: { page: 596, juz: 30 }, 94: { page: 596, juz: 30 }, 95: { page: 597, juz: 30 }, 96: { page: 597, juz: 30 },
  97: { page: 598, juz: 30 }, 98: { page: 598, juz: 30 }, 99: { page: 599, juz: 30 }, 100: { page: 599, juz: 30 },
  101: { page: 600, juz: 30 }, 102: { page: 600, juz: 30 }, 103: { page: 601, juz: 30 }, 104: { page: 601, juz: 30 },
  105: { page: 601, juz: 30 }, 106: { page: 602, juz: 30 }, 107: { page: 602, juz: 30 }, 108: { page: 602, juz: 30 },
  109: { page: 603, juz: 30 }, 110: { page: 603, juz: 30 }, 111: { page: 603, juz: 30 }, 112: { page: 604, juz: 30 },
  113: { page: 604, juz: 30 }, 114: { page: 604, juz: 30 },
};

export const SURAH_AYAH_COUNTS: number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
  11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
];

export const SURAH_NAMES_AR: string[] = [
  "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
  "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
  "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
  "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
  "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
  "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
  "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
  "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
  "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
  "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
  "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
  "المسد", "الإخلاص", "الفلق", "الناس"
];

export function getSurahAndAyahFromGlobal(globalAyah: number): { surahNumber: number; ayahNumberInSurah: number } {
  let remaining = globalAyah;
  for (let s = 0; s < SURAH_AYAH_COUNTS.length; s++) {
    const count = SURAH_AYAH_COUNTS[s];
    if (remaining <= count) {
      return { surahNumber: s + 1, ayahNumberInSurah: remaining };
    }
    remaining -= count;
  }
  return { surahNumber: 114, ayahNumberInSurah: 6 };
}

