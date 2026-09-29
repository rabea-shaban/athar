import { create } from "zustand";
import { SafeStorage } from "../utils/storage";

interface LastRead {
  surahNumber: number;
  ayahNumber: number;
  pageNumber?: number;
  surahName: string;
  updatedAt: string;
}

interface PreferencesState {
  isDarkMode: boolean;
  preferredReciter: string;
  lastRead: LastRead | null;
  tasbeehCounts: Record<string, number>;
  favoriteSurahs: number[];
  favoriteAdhkar: string[];
  favoriteBooks: string[];
  favoriteLectures: string[];
  favoriteRadios: number[];
  prayerCity: string;
  prayerCountry: string;
  fontSize: number;

  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  setPreferredReciter: (reciterId: string) => void;
  setLastRead: (lastRead: Omit<LastRead, "updatedAt">) => void;
  updateTasbeehCount: (id: string, count: number) => void;
  resetTasbeehCount: (id: string) => void;
  toggleFavoriteSurah: (surahNumber: number) => void;
  toggleFavoriteAdhkar: (id: string) => void;
  toggleFavoriteBook: (slug: string) => void;
  toggleFavoriteLecture: (id: string) => void;
  toggleFavoriteRadio: (radioId: number) => void;
  setFontSize: (size: number) => void;
  loadPreferences: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const STORAGE_KEY = "@athar_user_preferences_v1";

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  isDarkMode: true,
  preferredReciter: "ar.alafasy",
  lastRead: {
    surahNumber: 1,
    ayahNumber: 1,
    pageNumber: 1,
    surahName: "الفاتحة",
    updatedAt: new Date().toISOString(),
  },
  tasbeehCounts: {
    subhanAllah: 0,
    alhamdulillah: 0,
    allahuAkbar: 0,
    laIlahaIllallah: 0,
    astaghfirullah: 0,
  },
  favoriteSurahs: [1, 36, 67, 18],
  favoriteAdhkar: [],
  favoriteBooks: [],
  favoriteLectures: [],
  favoriteRadios: [19, 20],
  prayerCity: "cairo",
  prayerCountry: "egypt",
  fontSize: 22,

  toggleTheme: () => {
    const next = !get().isDarkMode;
    set({ isDarkMode: next });
    get().saveToStorage();
  },

  setTheme: (isDark: boolean) => {
    set({ isDarkMode: isDark });
    get().saveToStorage();
  },

  setPreferredReciter: (reciterId: string) => {
    set({ preferredReciter: reciterId });
    get().saveToStorage();
  },

  setLastRead: (lastRead) => {
    const updated: LastRead = {
      ...lastRead,
      updatedAt: new Date().toISOString(),
    };
    set({ lastRead: updated });
    get().saveToStorage();
  },

  updateTasbeehCount: (id: string, count: number) => {
    const counts = { ...get().tasbeehCounts, [id]: count };
    set({ tasbeehCounts: counts });
    get().saveToStorage();
  },

  resetTasbeehCount: (id: string) => {
    const counts = { ...get().tasbeehCounts, [id]: 0 };
    set({ tasbeehCounts: counts });
    get().saveToStorage();
  },

  toggleFavoriteSurah: (surahNumber: number) => {
    const current = get().favoriteSurahs;
    const exists = current.includes(surahNumber);
    const updated = exists
      ? current.filter((s) => s !== surahNumber)
      : [...current, surahNumber];
    set({ favoriteSurahs: updated });
    get().saveToStorage();
  },

  toggleFavoriteAdhkar: (id: string) => {
    const current = get().favoriteAdhkar;
    const exists = current.includes(id);
    const updated = exists ? current.filter((a) => a !== id) : [...current, id];
    set({ favoriteAdhkar: updated });
    get().saveToStorage();
  },

  toggleFavoriteBook: (slug: string) => {
    const current = get().favoriteBooks;
    const exists = current.includes(slug);
    const updated = exists ? current.filter((b) => b !== slug) : [...current, slug];
    set({ favoriteBooks: updated });
    get().saveToStorage();
  },

  toggleFavoriteLecture: (id: string) => {
    const current = get().favoriteLectures;
    const exists = current.includes(id);
    const updated = exists ? current.filter((l) => l !== id) : [...current, id];
    set({ favoriteLectures: updated });
    get().saveToStorage();
  },

  toggleFavoriteRadio: (radioId: number) => {
    const current = get().favoriteRadios;
    const exists = current.includes(radioId);
    const updated = exists
      ? current.filter((r) => r !== radioId)
      : [...current, radioId];
    set({ favoriteRadios: updated });
    get().saveToStorage();
  },

  setFontSize: (fontSize: number) => {
    set({ fontSize });
    get().saveToStorage();
  },

  loadPreferences: async () => {
    try {
      const data = await SafeStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({ ...parsed });
      }
    } catch (e) {
      console.warn("Failed to load preferences from storage", e);
    }
  },

  saveToStorage: async () => {
    try {
      const state = get();
      const payload = {
        isDarkMode: state.isDarkMode,
        preferredReciter: state.preferredReciter,
        lastRead: state.lastRead,
        tasbeehCounts: state.tasbeehCounts,
        favoriteSurahs: state.favoriteSurahs,
        favoriteAdhkar: state.favoriteAdhkar,
        favoriteBooks: state.favoriteBooks,
        favoriteLectures: state.favoriteLectures,
        favoriteRadios: state.favoriteRadios,
        prayerCity: state.prayerCity,
        prayerCountry: state.prayerCountry,
        fontSize: state.fontSize,
      };
      await SafeStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to save preferences to storage", e);
    }
  },
}));
