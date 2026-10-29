const QURAN_API = "https://api.alquran.cloud/v1";
const PRAYER_API = "https://api.aladhan.com/v1";
const TAFSIR_API = "https://quranenc.com/api/v1";
const HADITH_API = "https://hadis-api-id.vercel.app";
const AZKAR_API =
  "https://raw.githubusercontent.com/nawafalqari/azkar-api/56df51279ab6eb86dc2f6202c7de26c8948331c1/azkar.json";
const RADIO_API = "https://data-rosy.vercel.app/radio.json";
const QURAN_AUDIO_API = "https://api.quran.com/api/v4";

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

export async function getQuranPage(pageNumber: number): Promise<QuranPage> {
  const res = await fetch(`${QURAN_API}/page/${pageNumber}/quran-uthmani`);
  const data = await res.json();
  return data.data as QuranPage;
}

export async function getSurahList(): Promise<Surah[]> {
  const res = await fetch(`${QURAN_API}/surah`);
  const data = await res.json();
  return data.data as Surah[];
}

export async function getSurah(
  number: number,
  reciter = "ar.alafasy"
): Promise<SurahDetail> {
  const res = await fetch(`${QURAN_API}/surah/${number}/${reciter}`);
  const data = await res.json();
  return data.data as SurahDetail;
}

export async function getTafsir(surahNumber: number): Promise<TafsirAyah[]> {
  const res = await fetch(
    `${TAFSIR_API}/translation/sura/arabic_moyassar/${surahNumber}`
  );
  const data = await res.json();
  return data.result as TafsirAyah[];
}

export function isEgyptianWinterTime(d: Date = new Date()): boolean {
  const month = d.getMonth(); // 0 = Jan ... 9 = Oct, 10 = Nov
  // Nov, Dec, Jan, Feb, Mar are always Winter Time in Egypt (UTC+2)
  if (month < 3 || month > 9) return true;
  // April: DST starts on the last Friday of April at 00:00
  if (month === 3) {
    const lastDay = new Date(d.getFullYear(), 4, 0).getDate();
    let lastFriday = lastDay;
    while (new Date(d.getFullYear(), 3, lastFriday).getDay() !== 5) lastFriday--;
    return d.getDate() < lastFriday;
  }
  // October: DST ends on the last Thursday of October at 24:00 (shifts back to 23:00)
  if (month === 9) {
    const lastDay = new Date(d.getFullYear(), 10, 0).getDate();
    let lastThursday = lastDay;
    while (new Date(d.getFullYear(), 9, lastThursday).getDay() !== 4) lastThursday--;
    if (d.getDate() > lastThursday) return true;
    if (d.getDate() === lastThursday && d.getHours() >= 23) return true;
    return false;
  }
  // May, June, July, Aug, Sep are always Summer Time (UTC+3)
  return false;
}

export function shiftTimeString(timeStr: string, minutesDiff: number): string {
  if (!timeStr || !timeStr.includes(":")) return timeStr;
  const parts = timeStr.split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return timeStr;
  let totalMin = h * 60 + m + minutesDiff;
  if (totalMin < 0) totalMin += 24 * 60;
  totalMin = totalMin % (24 * 60);
  const newH = Math.floor(totalMin / 60).toString().padStart(2, "0");
  const newM = (totalMin % 60).toString().padStart(2, "0");
  return `${newH}:${newM}`;
}

export function ensureEgyptianWinterTimings(
  timings: PrayerTimings,
  mode: "auto" | "winter" | "summer" = "auto"
): PrayerTimings {
  if (!timings || !timings.Dhuhr) return timings;
  const [dh, dm] = timings.Dhuhr.split(":").map(Number);
  const dhuhrMin = dh * 60 + dm;

  const shouldBeWinter = mode === "winter" || (mode === "auto" && isEgyptianWinterTime());
  const shouldBeSummer = mode === "summer" || (mode === "auto" && !isEgyptianWinterTime());

  // In Cairo/Egypt Winter Time (UTC+2), Dhuhr is around 11:35 - 12:05.
  // If Dhuhr is >= 12:20, the API delivered Summer Time (UTC+3), so shift back -60 min.
  if (shouldBeWinter && dhuhrMin >= 12 * 60 + 20) {
    const adjusted: Record<string, string> = {};
    for (const [k, v] of Object.entries(timings)) {
      adjusted[k] = typeof v === "string" && v.includes(":") ? shiftTimeString(v, -60) : v;
    }
    return adjusted as PrayerTimings;
  }

  // If summer time is requested but timings are in winter time (Dhuhr < 12:15), shift +60 min.
  if (shouldBeSummer && dhuhrMin < 12 * 60 + 15) {
    const adjusted: Record<string, string> = {};
    for (const [k, v] of Object.entries(timings)) {
      adjusted[k] = typeof v === "string" && v.includes(":") ? shiftTimeString(v, 60) : v;
    }
    return adjusted as PrayerTimings;
  }

  return timings;
}

export function formatArabic12Hour(time24: string): string {
  if (!time24 || !time24.includes(":")) return "";
  const [hours, minutes] = time24.split(":");
  let h = parseInt(hours, 10);
  const m = minutes.padStart(2, "0");
  const isPM = h >= 12;
  h = h % 12 || 12;
  return `${h}:${m} ${isPM ? "م" : "ص"}`;
}

export async function getPrayerTimes(
  city = "cairo",
  country = "egypt",
  coords?: { latitude: number; longitude: number },
  dateStr?: string,
  mode: "auto" | "winter" | "summer" = "auto"
): Promise<PrayerTimings> {
  const cLower = country.toLowerCase();
  const cityLower = city.toLowerCase();
  const isEgypt =
    cLower.includes("egypt") ||
    cLower.includes("مصر") ||
    cityLower.includes("cairo") ||
    cityLower.includes("alexandria") ||
    cityLower.includes("giza") ||
    (coords && coords.latitude >= 21.5 && coords.latitude <= 32.5 && coords.longitude >= 24.5 && coords.longitude <= 37.0);

  const isGulf =
    cLower.includes("saudi") ||
    cLower.includes("uae") ||
    cityLower.includes("makkah") ||
    cityLower.includes("madinah") ||
    cityLower.includes("riyadh") ||
    cityLower.includes("dubai");

  // Method 5: Egyptian General Authority of Survey (الهيئة المصرية العامة للمساحة)
  // Method 4: Umm Al-Qura University, Makkah
  // Method 3: Muslim World League
  const method = isEgypt ? 5 : isGulf ? 4 : 3;

  const datePath = dateStr ? `/${dateStr}` : "";
  let url = `${PRAYER_API}/timingsByCity${datePath}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
  if (coords) {
    url = `${PRAYER_API}/timings${datePath}?latitude=${coords.latitude}&longitude=${coords.longitude}&method=${method}`;
  }

  const res = await fetch(url);
  const data = await res.json();
  const timings = data?.data?.timings as PrayerTimings;

  if (isEgypt && timings) {
    return ensureEgyptianWinterTimings(timings, mode);
  }

  return timings;
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

  const res = await fetch(
    `${HADITH_API}/hadith/${book}?page=${pageNum}&limit=${limitNum}`
  );
  const data = await res.json();
  return data as HadithResponse;
}

export async function getAzkar(): Promise<AzkarCategory[]> {
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
}

export async function getRadioStations(): Promise<RadioStation[]> {
  try {
    const res = await fetch(RADIO_API);
    if (!res.ok) throw new Error("Failed to fetch radio api");
    const data = await res.json();
    const list = (data.radios ?? data) as RadioStation[];

    // Map Cairo Quran Radio to official n13.radiojar.com direct live stream
    return list.map((st) => {
      if (st.name.includes("القاهرة") || st.id === 19) {
        return {
          ...st,
          url: "https://n13.radiojar.com/8s5u5tpdtwzuv",
        };
      }
      return st;
    });
  } catch (err) {
    console.warn("Using fallback radio stations:", err);
    return [
      {
        id: 19,
        name: "إذاعة القرآن الكريم من القاهرة",
        url: "https://n13.radiojar.com/8s5u5tpdtwzuv",
        img: "https://apkdownmod.com/thumbnail?src=images/appsicon/2020/08/app-image-5f42ba68a61b1.jpg",
      },
      {
        id: 20,
        name: "إذاعة القرآن الكريم - السعودية",
        url: "https://stream.radiojar.com/0tpy1h0kxtzuv",
        img: "https://i.pinimg.com/564x/55/16/ab/5516abd3744c3d0b0a7b28bedd5474c0.jpg",
      },
      {
        id: 11,
        name: "إذاعة محمد صديق المنشاوي",
        url: "https://backup.qurango.net/radio/mohammed_siddiq_alminshawi",
      },
      {
        id: 12,
        name: "إذاعة محمود خليل الحصري",
        url: "https://backup.qurango.net/radio/mahmoud_khalil_alhussary",
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
        name: "إذاعة سورة البقرة",
        url: "https://backup.qurango.net/radio/albaqarah",
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
}

export async function getQuranAudio(
  reciterId: number
): Promise<QuranAudioFile[]> {
  const res = await fetch(
    `${QURAN_AUDIO_API}/chapter_recitations/${reciterId}`
  );
  const data = await res.json();
  return data.audio_files as QuranAudioFile[];
}

export async function searchQuran(query: string): Promise<QuranSearchResult> {
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
  [key: string]: string;
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
    startPage: number;
    endPage: number;
    startIndex: number;
    endIndex: number;
    pages: number[];
  };
  items: HadithItem[];
}

export interface HadithItem {
  number: number;
  arab: string;
  id: string;
}

export type Hadith = HadithItem;

export interface Zikr {
  count: string;
  description: string;
  content: string;
  reference: string;
}

export interface AzkarCategory {
  category: string;
  count: number;
  array: Zikr[];
}

export interface RadioStation {
  id: number;
  name: string;
  url: string;
  img?: string;
}

export interface QuranAudioFile {
  id: number;
  chapter_id: number;
  file_size: number;
  format: string;
  audio_url: string;
}

export interface QuranSearchMatch {
  number: number;
  text: string;
  surah: Surah;
  numberInSurah: number;
  juz: number;
}

export interface QuranSearchResult {
  count: number;
  matches: QuranSearchMatch[];
}
