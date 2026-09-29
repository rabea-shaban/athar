import { create } from "zustand";
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from "expo-audio";

export interface AudioTrack {
  id: string;
  title: string;
  subtitle?: string;
  audioUrl: string;
  image?: string;
  isLive?: boolean;
  reciterId?: string;
}

interface AudioStoreState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  player: AudioPlayer | null;

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
      player.volume = get().volume;
      player.playbackRate = get().playbackSpeed;

      player.addListener("playbackStatusUpdate", (status: any) => {
        set({
          isPlaying: status.playing,
          isLoading: status.isBuffering || !status.isLoaded,
          position: status.currentTime || 0,
          duration: status.duration || 0,
        });

        if (status.didJustFinish && !track.isLive) {
          set({ isPlaying: false, position: 0 });
        }
      });

      player.play();
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
        player.pause();
        player.remove();
      }
    } catch (e) {
      // ignore
    }
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
        player.playbackRate = speed;
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
        player.volume = volume;
      }
      set({ volume });
    } catch (e) {
      console.warn("Volume change error:", e);
    }
  },
}));
