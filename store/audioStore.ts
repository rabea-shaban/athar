import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  activeTabId: string | null;
  onEndedCallback: (() => void) | null;
  setAudio: (
    src: string,
    title: string,
    subtitle: string,
    type: AudioType,
    meta?: AudioMeta,
    tabId?: string
  ) => void;
  togglePlay: (tabId?: string) => void;
  setIsPlaying: (isPlaying: boolean, tabId?: string) => void;
  claimAudio: (tabId: string) => void;
  setVolume: (v: number) => void;
  stop: () => void;
  setOnEnded: (fn: (() => void) | null) => void;
  triggerEnded: () => void;
}

// BroadcastChannel for real-time cross-tab synchronization
let channel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    channel = new BroadcastChannel("athar_audio_sync");
  } catch (e) {
    console.warn("BroadcastChannel not available:", e);
  }
}

function broadcastAction(action: { type: string; payload?: any }) {
  if (channel) {
    try {
      channel.postMessage(action);
    } catch {}
  }
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      audioType: null,
      title: "",
      subtitle: "",
      src: "",
      volume: 0.8,
      surahNumber: null,
      ayahNumber: null,
      activeTabId: null,
      onEndedCallback: null,

      setAudio: (src, title, subtitle, audioType, meta, tabId) => {
        const nextState = {
          src,
          title,
          subtitle,
          audioType,
          isPlaying: true,
          activeTabId: tabId || null,
          surahNumber: meta?.surahNumber ?? null,
          ayahNumber: meta?.ayahNumber ?? null,
        };
        set(nextState);
        broadcastAction({ type: "SET_AUDIO", payload: nextState });
      },

      claimAudio: (tabId: string) => {
        set({ activeTabId: tabId, isPlaying: true });
        broadcastAction({ type: "CLAIM_AUDIO", payload: { activeTabId: tabId } });
      },

      togglePlay: (tabId?: string) => {
        const nextIsPlaying = !get().isPlaying;
        const currentTabId = tabId || get().activeTabId;
        set({ isPlaying: nextIsPlaying, activeTabId: nextIsPlaying ? currentTabId : get().activeTabId });
        broadcastAction({
          type: "TOGGLE_PLAY",
          payload: { isPlaying: nextIsPlaying, activeTabId: currentTabId },
        });
      },

      setIsPlaying: (isPlaying, tabId) => {
        set({ isPlaying, activeTabId: isPlaying ? (tabId || get().activeTabId) : get().activeTabId });
        broadcastAction({
          type: "SET_IS_PLAYING",
          payload: { isPlaying, activeTabId: tabId || get().activeTabId },
        });
      },

      setVolume: (volume) => {
        set({ volume });
        broadcastAction({ type: "SET_VOLUME", payload: { volume } });
      },

      stop: () => {
        const stoppedState = {
          isPlaying: false,
          src: "",
          title: "",
          subtitle: "",
          audioType: null,
          surahNumber: null,
          ayahNumber: null,
          activeTabId: null,
        };
        set(stoppedState);
        broadcastAction({ type: "STOP" });
      },

      setOnEnded: (onEndedCallback) => set({ onEndedCallback }),
      triggerEnded: () => {
        const cb = get().onEndedCallback;
        if (cb) cb();
      },
    }),
    {
      name: "athar_audio_state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isPlaying: state.isPlaying,
        audioType: state.audioType,
        title: state.title,
        subtitle: state.subtitle,
        src: state.src,
        volume: state.volume,
        surahNumber: state.surahNumber,
        ayahNumber: state.ayahNumber,
      }),
    }
  )
);

// Listen to actions from other tabs in real-time
if (typeof window !== "undefined" && channel) {
  channel.onmessage = (event) => {
    const { type, payload } = event.data || {};
    if (type === "SET_AUDIO") {
      useAudioStore.setState({
        src: payload.src,
        title: payload.title,
        subtitle: payload.subtitle,
        audioType: payload.audioType,
        isPlaying: payload.isPlaying,
        activeTabId: payload.activeTabId,
        surahNumber: payload.surahNumber,
        ayahNumber: payload.ayahNumber,
      });
    } else if (type === "CLAIM_AUDIO") {
      useAudioStore.setState({
        activeTabId: payload.activeTabId,
        isPlaying: true,
      });
    } else if (type === "TOGGLE_PLAY") {
      useAudioStore.setState({
        isPlaying: payload.isPlaying,
        activeTabId: payload.activeTabId,
      });
    } else if (type === "SET_IS_PLAYING") {
      useAudioStore.setState({
        isPlaying: payload.isPlaying,
        activeTabId: payload.activeTabId,
      });
    } else if (type === "SET_VOLUME") {
      useAudioStore.setState({ volume: payload.volume });
    } else if (type === "STOP") {
      useAudioStore.setState({
        isPlaying: false,
        src: "",
        title: "",
        subtitle: "",
        audioType: null,
        surahNumber: null,
        ayahNumber: null,
        activeTabId: null,
      });
    }
  };
}

