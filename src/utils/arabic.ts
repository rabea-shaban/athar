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
