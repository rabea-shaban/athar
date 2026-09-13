const QURAN_API = "https://api.alquran.cloud/v1";
const PRAYER_API = "https://api.aladhan.com/v1";
const TAFSIR_API = "https://quranenc.com/api/v1";
const HADITH_API = "https://hadis-api-id.vercel.app";
const AZKAR_API =
  "https://raw.githubusercontent.com/nawafalqari/azkar-api/56df51279ab6eb86dc2f6202c7de26c8948331c1/azkar.json";
const RADIO_API = "https://data-rosy.vercel.app/radio.json";
const QURAN_AUDIO_API = "https://api.quran.com/api/v4";

export async function getQuranPage(pageNumber: number) {
  const res = await fetch(`${QURAN_API}/page/${pageNumber}/quran-uthmani`);
  const data = await res.json();
  return data.data as QuranPage;
}

export async function getSurahList() {
  const res = await fetch(`${QURAN_API}/surah`);
  const data = await res.json();
  return data.data as Surah[];
}

export async function getSurah(number: number) {
  const res = await fetch(`${QURAN_API}/surah/${number}/ar.alafasy`);
  const data = await res.json();
  return data.data as SurahDetail;
}

export async function getTafsir(surahNumber: number) {
  const res = await fetch(
    `${TAFSIR_API}/translation/sura/arabic_moyassar/${surahNumber}`
  );
  const data = await res.json();
  return data.result as TafsirAyah[];
}

export async function getPrayerTimes(city = "cairo", country = "egypt") {
  const res = await fetch(
    `${PRAYER_API}/timingsByCity?city=${city}&country=${country}&method=8`
  );
  const data = await res.json();
  return data.data.timings as PrayerTimings;
}

export async function getHadiths(bookOrPage: string | number = "abu-dawud", page = 1, limit = 20) {
  let book = "abu-dawud";
  let pageNum = page;
  let limitNum = limit;

  if (typeof bookOrPage === "number") {
    pageNum = bookOrPage;
    limitNum = page;
  } else if (typeof bookOrPage === "string") {
    book = bookOrPage;
  }

  const res = await fetch(
    `${HADITH_API}/hadith/${book}?page=${pageNum}&limit=${limitNum}`
  );
  const data = await res.json();
  return data as HadithResponse;
}

function cleanZikrText(text: string): string {
  // Extract Arabic text from malformed content like: \n', '"النص". [المصدر].\n', '...
  const quoted = text.match(/"([^"]+)"/);
  if (quoted) return quoted[1].trim();
  // Fallback: strip escape sequences and artifacts
  return text
    .replace(/\\n/g, " ")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/[',]\s*'/g, " ")
    .replace(/^['"\s]+|['"\s]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function getAzkar(): Promise<AzkarCategory[]> {
  const res = await fetch(AZKAR_API);
  const data = await res.json() as Record<string, Zikr[][]>;
  return Object.entries(data).map(([category, arrays]) => ({
    category,
    count: arrays.flat().length,
    array: arrays.flat().map((z) => ({
      ...z,
      content: cleanZikrText(z.content),
      reference: cleanZikrText(z.reference),
    })),
  }));
}

export async function getRadioStations(): Promise<RadioStation[]> {
  const res = await fetch(RADIO_API);
  const data = await res.json();
  return (data.radios ?? data) as RadioStation[];
}

export async function getQuranAudio(reciterId: number) {
  const res = await fetch(`${QURAN_AUDIO_API}/chapter_recitations/${reciterId}`);
  const data = await res.json();
  return data.audio_files as QuranAudioFile[];
}

export async function searchQuran(query: string) {
  const res = await fetch(`${QURAN_API}/search/${encodeURIComponent(query)}/all/quran-simple`);
  const data = await res.json();
  if (data?.data?.matches && Array.isArray(data.data.matches)) {
    const seen = new Set<string>();
    data.data.matches = data.data.matches.filter((m: { surah?: { number?: number }; numberInSurah?: number; number?: number }) => {
      const key = `${m.surah?.number ?? 0}:${m.numberInSurah ?? m.number}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    data.data.count = data.data.matches.length;
  }
  return data.data as QuranSearchResult;
}

// Types
export interface QuranPageAyah {
  number: number;
  text: string;
  numberInSurah: number;
  surah: Surah;
  page: number;
  juz: number;
}

export interface QuranPage {
  number: number;
  ayahs: QuranPageAyah[];
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  audio?: string;
  page?: number;
  juz?: number;
  hizbQuarter?: number;
  sajda?: boolean;
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[];
}

export interface TafsirAyah {
  aya: number;
  sura: number;
  arabic_text: string;
  translation: string;
  footnotes: string;
}

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface HadithResponse {
  name: string;
  slug: string;
  total: number;
  pagination: {
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
  items: Hadith[];
}

export interface Hadith {
  number: number;
  arab: string;
  id: string;
}

export interface AzkarCategory {
  category: string;
  count: number;
  array: Zikr[];
}

export interface Zikr {
  content: string;
  count: string;
  description: string;
  reference: string;
  category: string;
}

export interface RadioStation {
  id: number;
  name: string;
  url: string;
  img?: string;
}

export interface QuranAudioFile {
  chapter_id: number;
  file_size: number;
  format: string;
  audio_url: string;
}

export interface QuranSearchResult {
  count: number;
  matches: {
    number: number;
    text: string;
    surah: Surah;
    numberInSurah: number;
  }[];
}
