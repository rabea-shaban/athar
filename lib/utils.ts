export { cn } from "cn";

export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "") // tashkeel & Quranic marks
    .replace(/[أإآا]/g, "ا")           // alef variants
    .replace(/[ىي]/g, "ي")               // ya variants
    .replace(/ة/g, "ه")                    // ta marbuta
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

export const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicNumber(num: number | string): string {
  return String(num)
    .split("")
    .map((d) => ARABIC_DIGITS[Number(d)] ?? d)
    .join("");
}

export function stripBismillah(text: string, surahNumber: number, ayahNumber: number): string {
  if (surahNumber === 1 || surahNumber === 9 || ayahNumber !== 1) return text;
  return text
    .replace(/^بِسْمِ\s*ٱللَّهِ\s*ٱلرَّحْمَٰنِ\s*ٱلرَّحِيمِ\s*/, "")
    .replace(/^بِسْمِ\s*اللَّهِ\s*الرَّحْمَٰنِ\s*الرَّحِيمِ\s*/, "")
    .replace(/^بِسْمِ\s*ٱللَّهِ\s*ٱلرَّحْمَٰنِ\s*ٱلرَّحِيمِ\s*/, "")
    .replace(/^بِسْمِ\s*اللَّهِ\s*الرَّحْمَٰنِ\s*الرَّحِيمِ\s*/, "")
    .trim();
}


