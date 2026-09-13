import { create } from "zustand";

export type ReadingMode = "ayah" | "page";

export interface BookmarkItem {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  createdAt: number;
}

export interface ReadingMarker {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  pageNumber: number;
  text: string;
  timestamp: number;
}

interface ReadingProgress {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  pageNumber: number;
  mode: ReadingMode;
  fontSize: number; // 1–5 scale
  bookmarks: BookmarkItem[];
  readingMarker: ReadingMarker | null;
}

interface ReadingStore extends ReadingProgress {
  setProgress: (p: Partial<ReadingProgress>) => void;
  setMode: (mode: ReadingMode) => void;
  setFontSize: (size: number) => void;
  toggleBookmark: (item: Omit<BookmarkItem, "createdAt">) => void;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  setReadingMarker: (marker: Omit<ReadingMarker, "timestamp">) => void;
  clearReadingMarker: () => void;
  isReadingMarker: (surahNumber: number, ayahNumber: number) => boolean;
  clearProgress: () => void;
}

const STORAGE_KEY = "athar-reading-progress";

function loadFromStorage(): Partial<ReadingProgress> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveToStorage(state: ReadingProgress) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const defaults: ReadingProgress = {
  surahNumber: 0,
  surahName: "",
  ayahNumber: 1,
  pageNumber: 1,
  mode: "ayah",
  fontSize: 3,
  bookmarks: [],
  readingMarker: null,
};

export const useReadingStore = create<ReadingStore>((set, get) => ({
  ...defaults,
  ...loadFromStorage(),

  setProgress: (p) => {
    set((s) => {
      const next = { ...s, ...p };
      saveToStorage(next);
      return next;
    });
  },

  setMode: (mode) => {
    set((s) => {
      const next = { ...s, mode };
      saveToStorage(next);
      return next;
    });
  },

  setFontSize: (fontSize) => {
    set((s) => {
      const next = { ...s, fontSize };
      saveToStorage(next);
      return next;
    });
  },

  toggleBookmark: (item) => {
    set((s) => {
      const exists = s.bookmarks?.some(
        (b) => b.surahNumber === item.surahNumber && b.ayahNumber === item.ayahNumber
      );
      const bookmarks = exists
        ? (s.bookmarks || []).filter(
            (b) => !(b.surahNumber === item.surahNumber && b.ayahNumber === item.ayahNumber)
          )
        : [...(s.bookmarks || []), { ...item, createdAt: Date.now() }];
      const next = { ...s, bookmarks };
      saveToStorage(next);
      return next;
    });
  },

  isBookmarked: (surahNumber, ayahNumber) => {
    return (get().bookmarks || []).some(
      (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );
  },

  setReadingMarker: (marker) => {
    set((s) => {
      const readingMarker = { ...marker, timestamp: Date.now() };
      const next = {
        ...s,
        readingMarker,
        surahNumber: marker.surahNumber,
        surahName: marker.surahName,
        ayahNumber: marker.ayahNumber,
        pageNumber: marker.pageNumber,
      };
      saveToStorage(next);
      return next;
    });
  },

  clearReadingMarker: () => {
    set((s) => {
      const next = { ...s, readingMarker: null };
      saveToStorage(next);
      return next;
    });
  },

  isReadingMarker: (surahNumber, ayahNumber) => {
    const current = get().readingMarker;
    return (
      current?.surahNumber === surahNumber && current?.ayahNumber === ayahNumber
    );
  },

  clearProgress: () => {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    set(defaults);
  },
}));
