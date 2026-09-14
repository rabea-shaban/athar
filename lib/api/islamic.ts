const QURAN_API = "https://api.alquran.cloud/v1";
const PRAYER_API = "https://api.aladhan.com/v1";
const TAFSIR_API = "https://quranenc.com/api/v1";
const HADITH_API = "https://hadis-api-id.vercel.app";
const AZKAR_API =
  "https://raw.githubusercontent.com/nawafalqari/azkar-api/56df51279ab6eb86dc2f6202c7de26c8948331c1/azkar.json";
const RADIO_API = "https://data-rosy.vercel.app/radio.json";
const QURAN_AUDIO_API = "https://api.quran.com/api/v4";

// In-memory cache for ultra-fast 0ms hits during current session
const memoryCache = new Map<string, { data: any; expiry: number }>();

interface CacheOptions {
  ttlMs?: number;
  persist?: boolean;
}

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours
const LONG_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days (for Quran text, Surahs, Tafsir)

function getFromCache<T>(key: string): T | null {
  const now = Date.now();

  // 1. Memory Cache
  if (memoryCache.has(key)) {
    const item = memoryCache.get(key)!;
    if (item.expiry > now) {
      return item.data as T;
    }
    memoryCache.delete(key);
  }

  // 2. LocalStorage Cache (Browser)
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(`athar_cache_${key}`);
      if (raw) {
        const item = JSON.parse(raw);
        if (item.expiry > now) {
          memoryCache.set(key, item);
          return item.data as T;
        }
        localStorage.removeItem(`athar_cache_${key}`);
      }
    } catch {}
  }

  return null;
}

function setToCache<T>(key: string, data: T, options?: CacheOptions): void {
  const ttl = options?.ttlMs ?? DEFAULT_TTL;
  const persist = options?.persist ?? true;
  const expiry = Date.now() + ttl;
  const item = { data, expiry };

  // 1. Memory Cache
  memoryCache.set(key, item);

  // 2. LocalStorage Cache
  if (persist && typeof window !== "undefined") {
    try {
      localStorage.setItem(`athar_cache_${key}`, JSON.stringify(item));
    } catch {
      // Evict non-essential items if quota is exceeded
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("athar_cache_") && !k.includes("quran_page_")) {
            localStorage.removeItem(k);
          }
        }
        localStorage.setItem(`athar_cache_${key}`, JSON.stringify(item));
      } catch {}
    }
  }
}

async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  const cached = getFromCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  try {
    const fresh = await fetcher();
    if (fresh !== undefined && fresh !== null) {
      setToCache(key, fresh, options);
    }
    return fresh;
  } catch (error) {
    // Fallback: return stale cache on network failure if available
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`athar_cache_${key}`);
        if (raw) {
          const item = JSON.parse(raw);
          if (item.data) return item.data as T;
        }
      } catch {}
    }
    throw error;
  }
}

export async function getQuranPage(pageNumber: number): Promise<QuranPage> {
  return fetchWithCache(
    `quran_page_${pageNumber}`,
    async () => {
      const res = await fetch(`${QURAN_API}/page/${pageNumber}/quran-uthmani`);
      const data = await res.json();
      return data.data as QuranPage;
    },
    { ttlMs: LONG_TTL }
  );
}

export async function getSurahList(): Promise<Surah[]> {
  return fetchWithCache(
    "surah_list",
    async () => {
      const res = await fetch(`${QURAN_API}/surah`);
      const data = await res.json();
      return data.data as Surah[];
    },
    { ttlMs: LONG_TTL }
  );
}

export interface QuranReciter {
  id: string;
  name: string;
  style: "مرتل" | "مجود" | "معلم";
  identifier: string;
}

export const QURAN_RECITERS: QuranReciter[] = [
  { id: "alafasy", name: "مشاري راشد العفاسي", style: "مرتل", identifier: "ar.alafasy" },
  { id: "minshawi", name: "محمد صديق المنشاوي", style: "مرتل", identifier: "ar.minshawi" },
  { id: "abdulsamad", name: "عبد الباسط عبد الصمد", style: "مرتل", identifier: "ar.abdulsamad" },
  { id: "husary", name: "محمود خليل الحصري", style: "مرتل", identifier: "ar.husary" },
  { id: "husary_mujawwad", name: "محمود خليل الحصري", style: "مجود", identifier: "ar.husarymujawwad" },
  { id: "sudais", name: "عبد الرحمن السديس", style: "مرتل", identifier: "ar.abdurrahmaansudais" },
  { id: "shuraim", name: "سعود الشريم", style: "مرتل", identifier: "ar.saoodshuraym" },
  { id: "maher", name: "ماهر المعيقلي", style: "مرتل", identifier: "ar.mahermuaiqly" },
  { id: "shatri", name: "أبو بكر الشاطري", style: "مرتل", identifier: "ar.shaatree" },
  { id: "ajamy", name: "أحمد بن علي العجمي", style: "مرتل", identifier: "ar.ahmedajamy" },
  { id: "rifai", name: "هاني الرفاعي", style: "مرتل", identifier: "ar.hanirifai" },
  { id: "hudhaify", name: "علي بن عبد الرحمن الحذيفي", style: "مرتل", identifier: "ar.hudhaify" },
  { id: "ayyoub", name: "محمد أيوب", style: "مرتل", identifier: "ar.muhammadayyoub" },
  { id: "jibreel", name: "محمد جبريل", style: "مرتل", identifier: "ar.muhammadjibreel" },
  { id: "akhdar", name: "إبراهيم الأخضر", style: "مرتل", identifier: "ar.ibrahimakhbar" },
  { id: "basfar", name: "عبد الله بصفر", style: "مرتل", identifier: "ar.abdullahbasfar" },
  { id: "swoaid", name: "أيمن سويد", style: "معلم", identifier: "ar.aymanswoaid" },
];

export function getAyahAudioUrl(
  ayahGlobalNumber: number,
  reciterIdentifier = "ar.alafasy"
): string {
  let bitrate = "128";
  if (
    reciterIdentifier === "ar.abdulsamad" ||
    reciterIdentifier === "ar.aymanswoaid" ||
    reciterIdentifier === "ar.saoodshuraym"
  ) {
    bitrate = "64";
  } else if (reciterIdentifier === "ar.ibrahimakhbar") {
    bitrate = "32";
  } else if (
    reciterIdentifier === "ar.abdurrahmaansudais" ||
    reciterIdentifier === "ar.hanirifai" ||
    reciterIdentifier === "ar.abdullahbasfar"
  ) {
    bitrate = "192";
  }
  return `https://cdn.islamic.network/quran/audio/${bitrate}/${reciterIdentifier}/${ayahGlobalNumber}.mp3`;
}

export async function getSurah(
  number: number,
  reciter = "ar.alafasy"
): Promise<SurahDetail> {
  return fetchWithCache(
    `surah_detail_${number}_${reciter}`,
    async () => {
      const res = await fetch(`${QURAN_API}/surah/${number}/${reciter}`);
      const data = await res.json();
      return data.data as SurahDetail;
    },
    { ttlMs: LONG_TTL }
  );
}

export async function getTafsir(surahNumber: number): Promise<TafsirAyah[]> {
  return fetchWithCache(
    `tafsir_${surahNumber}`,
    async () => {
      const res = await fetch(
        `${TAFSIR_API}/translation/sura/arabic_moyassar/${surahNumber}`
      );
      const data = await res.json();
      return data.result as TafsirAyah[];
    },
    { ttlMs: LONG_TTL }
  );
}

export async function getPrayerTimes(
  city = "cairo",
  country = "egypt"
): Promise<PrayerTimings> {
  const todayKey = new Date().toISOString().slice(0, 10);
  return fetchWithCache(
    `prayer_times_${city.toLowerCase()}_${country.toLowerCase()}_${todayKey}`,
    async () => {
      const res = await fetch(
        `${PRAYER_API}/timingsByCity?city=${city}&country=${country}&method=8`
      );
      const data = await res.json();
      return data.data.timings as PrayerTimings;
    },
    { ttlMs: 24 * 60 * 60 * 1000 }
  );
}

export async function getHadiths(
  bookOrPage: string | number = "abu-dawud",
  page = 1,
  limit = 20
): Promise<HadithResponse> {
  let book = "abu-dawud";
  let pageNum = page;
  let limitNum = limit;

  if (typeof bookOrPage === "number") {
    pageNum = bookOrPage;
    limitNum = page;
  } else if (typeof bookOrPage === "string") {
    book = bookOrPage;
  }

  return fetchWithCache(
    `hadiths_${book}_${pageNum}_${limitNum}`,
    async () => {
      const res = await fetch(
        `${HADITH_API}/hadith/${book}?page=${pageNum}&limit=${limitNum}`
      );
      const data = await res.json();
      return data as HadithResponse;
    },
    { ttlMs: 7 * 24 * 60 * 60 * 1000 }
  );
}

function cleanZikrText(text: string): string {
  const quoted = text.match(/"([^"]+)"/);
  if (quoted) return quoted[1].trim();
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
  return fetchWithCache(
    "azkar_all",
    async () => {
      const res = await fetch(AZKAR_API);
      const data = (await res.json()) as Record<string, Zikr[][]>;
      return Object.entries(data).map(([category, arrays]) => ({
        category,
        count: arrays.flat().length,
        array: arrays.flat().map((z) => ({
          ...z,
          content: cleanZikrText(z.content),
          reference: cleanZikrText(z.reference),
        })),
      }));
    },
    { ttlMs: 14 * 24 * 60 * 60 * 1000 }
  );
}

export async function getRadioStations(): Promise<RadioStation[]> {
  return fetchWithCache(
    "radio_stations_list",
    async () => {
      try {
        const res = await fetch(RADIO_API);
        if (!res.ok) throw new Error("Failed to fetch radio api");
        const data = await res.json();
        return (data.radios ?? data) as RadioStation[];
      } catch (err) {
        console.warn("Using fallback radio stations:", err);
        return [
          {
            id: 19,
            name: "إذاعة القرآن الكريم من القاهرة",
            url: "https://stream.radiojar.com/8s5u5tpdtwzuv",
            img: "https://apkdownmod.com/thumbnail?src=images/appsicon/2020/08/app-image-5f42ba68a61b1.jpg",
          },
          {
            id: 20,
            name: "إذاعة السنة النبوية",
            url: "http://live.mp3quran.net:9972/",
            img: "https://i.pinimg.com/564x/55/16/ab/5516abd3744c3d0b0a7b28bedd5474c0.jpg",
          },
          {
            id: 11,
            name: "إذاعة محمد صديق المنشاوي",
            url: "https://backup.qurango.net/radio/mohammed_siddiq_alminshawi_mojawwad",
          },
          {
            id: 12,
            name: "إذاعة محمود خليل الحصري",
            url: "https://backup.qurango.net/radio/mahmoud_khalil_alhussary_mojawwad",
          },
          {
            id: 7,
            name: "إذاعة عبدالباسط عبدالصمد",
            url: "https://backup.qurango.net/radio/abdulbasit_abdulsamad",
          },
          {
            id: 14,
            name: "إذاعة مشاري العفاسي",
            url: "https://backup.qurango.net/radio/mishary_alafasi",
          },
          {
            id: 10,
            name: "إذاعة ماهر المعيقلي",
            url: "https://backup.qurango.net/radio/maher",
          },
          {
            id: 18,
            name: "إذاعة ياسر الدوسري",
            url: "https://backup.qurango.net/radio/yasser_aldosari",
          },
          {
            id: 15,
            name: "إذاعة ناصر القطامي",
            url: "https://backup.qurango.net/radio/nasser_alqatami",
          },
          {
            id: 21,
            name: "إذاعة تلاوات خاشعة",
            url: "https://backup.qurango.net/radio/salma",
          },
          {
            id: 22,
            name: "إذاعة الرقية الشرعية",
            url: "https://backup.qurango.net/radio/roqiah",
          },
          {
            id: 24,
            name: "المختصر في تفسير القرآن الكريم",
            url: "https://backup.qurango.net/radio/mukhtasartafsir",
          },
        ];
      }
    },
    { ttlMs: 24 * 60 * 60 * 1000 }
  );
}

export async function getQuranAudio(
  reciterId: number
): Promise<QuranAudioFile[]> {
  return fetchWithCache(
    `quran_audio_reciter_${reciterId}`,
    async () => {
      const res = await fetch(
        `${QURAN_AUDIO_API}/chapter_recitations/${reciterId}`
      );
      const data = await res.json();
      return data.audio_files as QuranAudioFile[];
    },
    { ttlMs: 14 * 24 * 60 * 60 * 1000 }
  );
}

export async function searchQuran(query: string): Promise<QuranSearchResult> {
  const cleanQuery = query.trim().toLowerCase();
  return fetchWithCache(
    `quran_search_${encodeURIComponent(cleanQuery)}`,
    async () => {
      const res = await fetch(
        `${QURAN_API}/search/${encodeURIComponent(query)}/all/quran-simple`
      );
      const data = await res.json();
      if (data?.data?.matches && Array.isArray(data.data.matches)) {
        const seen = new Set<string>();
        data.data.matches = data.data.matches.filter(
          (m: {
            surah?: { number?: number };
            numberInSurah?: number;
            number?: number;
          }) => {
            const key = `${m.surah?.number ?? 0}:${m.numberInSurah ?? m.number}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          }
        );
        data.data.count = data.data.matches.length;
      }
      return data.data as QuranSearchResult;
    },
    { ttlMs: 7 * 24 * 60 * 60 * 1000 }
  );
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
