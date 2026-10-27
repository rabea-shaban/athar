import { create } from "zustand";
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from "expo-audio";
import { getAyahAudioUrl } from "../api/islamic";
import {
  toArabicNumber,
  getSurahAndAyahFromGlobal,
  SURAH_NAMES_AR,
} from "../utils/arabic";

export interface AudioTrack {
  id: string;
  title: string;
  subtitle?: string;
  audioUrl: string;
  image?: string;
  isLive?: boolean;
  reciterId?: string;
  globalAyahNumber?: number;
  surahNumber?: number;
  ayahNumberInSurah?: number;
}

let sleepTimerInterval: ReturnType<typeof setInterval> | null = null;

interface AudioStoreState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  player: AudioPlayer | null;
  sleepTimerMinutes: number | null;
  sleepTimerRemainingSecs: number | null;

  initAudioMode: () => Promise<void>;
  playTrack: (track: AudioTrack) => Promise<void>;
  togglePlay: () => Promise<void>;
  pauseTrack: () => Promise<void>;
  resumeTrack: () => Promise<void>;
  stopTrack: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  skipSeconds: (seconds: number) => Promise<void>;
  setPlaybackSpeed: (speed: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setSleepTimer: (minutes: number | null) => void;
  clearSleepTimer: () => void;
}

export const useAudioStore = create<AudioStoreState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  isLoading: false,
  position: 0,
  duration: 0,
  volume: 1.0,
  playbackSpeed: 1.0,
  player: null,
  sleepTimerMinutes: null,
  sleepTimerRemainingSecs: null,

  initAudioMode: async () => {
    try {
      if (setAudioModeAsync) {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: "doNotMix",
        });
      }
    } catch (err) {
      console.warn("Audio mode init warning:", err);
    }
  },

  playTrack: async (track: AudioTrack) => {
    try {
      await get().initAudioMode();

      const existingPlayer = get().player;
      if (existingPlayer) {
        try {
          if (typeof (existingPlayer as any).setActiveForLockScreen === "function") {
            (existingPlayer as any).setActiveForLockScreen(false);
          }
        } catch (e) {
          // ignore
        }
        try {
          existingPlayer.pause();
          existingPlayer.remove();
        } catch (e) {
          // ignore
        }
      }

      set({
        currentTrack: track,
        isLoading: true,
        isPlaying: false,
        position: 0,
        duration: 0,
      });

      const player = createAudioPlayer({ uri: track.audioUrl });
      try {
        player.volume = get().volume;
      } catch (e) {
        // ignore
      }
      try {
        if (typeof (player as any).setPlaybackRate === "function") {
          (player as any).setPlaybackRate(get().playbackSpeed);
        }
      } catch (e) {
        // ignore
      }

      player.addListener("playbackStatusUpdate", (status: any) => {
        set({
          isPlaying: status.playing,
          isLoading: status.isBuffering || !status.isLoaded,
          position: status.currentTime || 0,
          duration: status.duration || 0,
        });

        if (status.didJustFinish && !track.isLive) {
          if (
            track.globalAyahNumber &&
            track.globalAyahNumber > 0 &&
            track.globalAyahNumber < 6236
          ) {
            const nextGlobal = track.globalAyahNumber + 1;
            const reciter = track.reciterId || "ar.alafasy";
            const nextAudioUrl = getAyahAudioUrl(nextGlobal, reciter);

            const { surahNumber, ayahNumberInSurah } =
              getSurahAndAyahFromGlobal(nextGlobal);
            const surahName = SURAH_NAMES_AR[surahNumber - 1] || "";

            const nextTrack: AudioTrack = {
              id: `surah_${surahNumber}_ayah_${ayahNumberInSurah}`,
              title: `سورة ${surahName} - آية ${toArabicNumber(ayahNumberInSurah)}`,
              subtitle: track.subtitle || "منصة أَثَر — تلاوات متواصلة",
              audioUrl: nextAudioUrl,
              reciterId: reciter,
              globalAyahNumber: nextGlobal,
              surahNumber,
              ayahNumberInSurah,
            };

            get().playTrack(nextTrack);
          } else {
            set({ isPlaying: false, position: 0 });
          }
        }
      });

      player.play();

      // Bind to Native AudioControlsService for background playback & lock screen notification
      try {
        if (typeof (player as any).setActiveForLockScreen === "function") {
          (player as any).setActiveForLockScreen(
            true,
            {
              title: track.title,
              artist: track.subtitle || "منصة أَثَر — تلاوات قرآنية",
              albumTitle: "أَثَر",
              artworkUrl: track.image || undefined,
            },
            {
              showSeekForward: !track.isLive,
              showSeekBackward: !track.isLive,
              isLiveStream: track.isLive ?? false,
            }
          );
        }
      } catch (e) {
        console.warn("Failed to activate lock screen controls:", e);
      }

      set({ player, isLoading: false, isPlaying: true });
    } catch (error) {
      console.error("Failed to play track:", error);
      set({ isLoading: false, isPlaying: false });
    }
  },

  togglePlay: async () => {
    try {
      const { player, isPlaying } = get();
      if (!player) return;
      if (isPlaying) {
        player.pause();
        set({ isPlaying: false });
      } else {
        player.play();
        set({ isPlaying: true });
      }
    } catch (e) {
      console.warn("Toggle play error:", e);
    }
  },

  pauseTrack: async () => {
    try {
      const { player } = get();
      if (player) {
        player.pause();
        set({ isPlaying: false });
      }
    } catch (e) {
      console.warn("Pause error:", e);
    }
  },

  resumeTrack: async () => {
    try {
      const { player } = get();
      if (player) {
        player.play();
        set({ isPlaying: true });
      }
    } catch (e) {
      console.warn("Resume error:", e);
    }
  },

  stopTrack: async () => {
    try {
      const { player } = get();
      if (player) {
        try {
          if (typeof (player as any).setActiveForLockScreen === "function") {
            (player as any).setActiveForLockScreen(false);
          }
        } catch (e) {
          // ignore
        }
        player.pause();
        player.remove();
      }
    } catch (e) {
      // ignore
    }
    get().clearSleepTimer();
    set({ currentTrack: null, isPlaying: false, player: null, position: 0 });
  },

  seekTo: async (seconds: number) => {
    try {
      const { player } = get();
      if (player) {
        player.seekTo(seconds);
      }
    } catch (e) {
      console.warn("Seek error:", e);
    }
  },

  skipSeconds: async (seconds: number) => {
    try {
      const { player, position, duration } = get();
      if (player) {
        const newPos = Math.max(0, Math.min(duration || Infinity, position + seconds));
        player.seekTo(newPos);
      }
    } catch (e) {
      console.warn("Skip error:", e);
    }
  },

  setPlaybackSpeed: async (speed: number) => {
    try {
      const { player } = get();
      if (player) {
        if (typeof (player as any).setPlaybackRate === "function") {
          (player as any).setPlaybackRate(speed);
        }
      }
      set({ playbackSpeed: speed });
    } catch (e) {
      console.warn("Speed change error:", e);
    }
  },

  setVolume: async (volume: number) => {
    try {
      const { player } = get();
      if (player) {
        try {
          player.volume = volume;
        } catch (e) {
          // ignore
        }
      }
      set({ volume });
    } catch (e) {
      console.warn("Volume change error:", e);
    }
  },

  setSleepTimer: (minutes: number | null) => {
    if (sleepTimerInterval) {
      clearInterval(sleepTimerInterval);
      sleepTimerInterval = null;
    }

    if (!minutes || minutes <= 0) {
      set({ sleepTimerMinutes: null, sleepTimerRemainingSecs: null });
      return;
    }

    const totalSeconds = minutes * 60;
    let remaining = totalSeconds;

    set({ sleepTimerMinutes: minutes, sleepTimerRemainingSecs: remaining });

    sleepTimerInterval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (sleepTimerInterval) {
          clearInterval(sleepTimerInterval);
          sleepTimerInterval = null;
        }
        get().stopTrack();
        set({ sleepTimerMinutes: null, sleepTimerRemainingSecs: null });
      } else {
        set({ sleepTimerRemainingSecs: remaining });
      }
    }, 1000);
  },

  clearSleepTimer: () => {
    if (sleepTimerInterval) {
      clearInterval(sleepTimerInterval);
      sleepTimerInterval = null;
    }
    set({ sleepTimerMinutes: null, sleepTimerRemainingSecs: null });
  },
}));
