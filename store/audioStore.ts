import { create } from "zustand";

export type AudioType = "radio" | "quran" | "surah" | "lecture";

export interface AudioMeta {
  surahNumber?: number;
  ayahNumber?: number;
}

interface AudioState {
  isPlaying: boolean;
  audioType: AudioType | null;
  title: string;
  subtitle: string;
  src: string;
  volume: number;
  surahNumber: number | null;
  ayahNumber: number | null;
  onEndedCallback: (() => void) | null;
  setAudio: (
    src: string,
    title: string,
    subtitle: string,
    type: AudioType,
    meta?: AudioMeta
  ) => void;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  stop: () => void;
  setOnEnded: (fn: (() => void) | null) => void;
  triggerEnded: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  isPlaying: false,
  audioType: null,
  title: "",
  subtitle: "",
  src: "",
  volume: 0.8,
  surahNumber: null,
  ayahNumber: null,
  onEndedCallback: null,
  setAudio: (src, title, subtitle, audioType, meta) =>
    set({
      src,
      title,
      subtitle,
      audioType,
      isPlaying: true,
      surahNumber: meta?.surahNumber ?? null,
      ayahNumber: meta?.ayahNumber ?? null,
    }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setVolume: (volume) => set({ volume }),
  stop: () =>
    set({
      isPlaying: false,
      src: "",
      title: "",
      subtitle: "",
      audioType: null,
      surahNumber: null,
      ayahNumber: null,
    }),
  setOnEnded: (onEndedCallback) => set({ onEndedCallback }),
  triggerEnded: () => {
    const cb = get().onEndedCallback;
    if (cb) cb();
  },
}));
