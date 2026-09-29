import { create } from "zustand";
import { Audio, AVPlaybackStatus } from "expo-av";

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
  soundObject: Audio.Sound | null;

  initAudioMode: () => Promise<void>;
  playTrack: (track: AudioTrack) => Promise<void>;
  togglePlay: () => Promise<void>;
  pauseTrack: () => Promise<void>;
  resumeTrack: () => Promise<void>;
  stopTrack: () => Promise<void>;
  seekTo: (positionMillis: number) => Promise<void>;
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
  soundObject: null,

  initAudioMode: async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (err) {
      console.warn("Audio mode initialization warning:", err);
    }
  },

  playTrack: async (track: AudioTrack) => {
    try {
      await get().initAudioMode();

      const { soundObject } = get();
      if (soundObject) {
        try {
          await soundObject.unloadAsync();
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

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.audioUrl },
        {
          shouldPlay: true,
          rate: get().playbackSpeed,
          volume: get().volume,
        },
        (status: AVPlaybackStatus) => {
          if (!status.isLoaded) {
            if (status.error) {
              console.warn(`Audio playback error: ${status.error}`);
              set({ isPlaying: false, isLoading: false });
            }
            return;
          }

          set({
            isPlaying: status.isPlaying,
            isLoading: status.isBuffering,
            position: status.positionMillis / 1000,
            duration: (status.durationMillis || 0) / 1000,
          });

          if (status.didJustFinish && !track.isLive) {
            set({ isPlaying: false, position: 0 });
          }
        }
      );

      set({ soundObject: sound, isLoading: false, isPlaying: true });
    } catch (error) {
      console.error("Failed to play track:", error);
      set({ isLoading: false, isPlaying: false });
    }
  },

  togglePlay: async () => {
    try {
      const { soundObject, isPlaying } = get();
      if (!soundObject) return;
      if (isPlaying) {
        await soundObject.pauseAsync();
      } else {
        await soundObject.playAsync();
      }
    } catch (e) {
      console.warn("Toggle play error:", e);
    }
  },

  pauseTrack: async () => {
    try {
      const { soundObject } = get();
      if (soundObject) {
        await soundObject.pauseAsync();
      }
    } catch (e) {
      console.warn("Pause error:", e);
    }
  },

  resumeTrack: async () => {
    try {
      const { soundObject } = get();
      if (soundObject) {
        await soundObject.playAsync();
      }
    } catch (e) {
      console.warn("Resume error:", e);
    }
  },

  stopTrack: async () => {
    try {
      const { soundObject } = get();
      if (soundObject) {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
      }
    } catch (e) {
      // ignore
    }
    set({ currentTrack: null, isPlaying: false, soundObject: null, position: 0 });
  },

  seekTo: async (seconds: number) => {
    try {
      const { soundObject } = get();
      if (soundObject) {
        await soundObject.setPositionAsync(seconds * 1000);
      }
    } catch (e) {
      console.warn("Seek error:", e);
    }
  },

  skipSeconds: async (seconds: number) => {
    try {
      const { soundObject, position, duration } = get();
      if (soundObject) {
        const newPos = Math.max(0, Math.min(duration || Infinity, position + seconds));
        await soundObject.setPositionAsync(newPos * 1000);
      }
    } catch (e) {
      console.warn("Skip error:", e);
    }
  },

  setPlaybackSpeed: async (speed: number) => {
    try {
      const { soundObject } = get();
      if (soundObject) {
        await soundObject.setRateAsync(speed, true);
      }
      set({ playbackSpeed: speed });
    } catch (e) {
      console.warn("Speed change error:", e);
    }
  },

  setVolume: async (volume: number) => {
    try {
      const { soundObject } = get();
      if (soundObject) {
        await soundObject.setVolumeAsync(volume);
      }
      set({ volume });
    } catch (e) {
      console.warn("Volume change error:", e);
    }
  },
}));
