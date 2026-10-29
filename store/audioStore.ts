import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AudioType = "radio" | "quran" | "surah" | "lecture" | "episode";

export interface PlaylistItem {
  src: string;
  title: string;
  subtitle: string;
  audioType: AudioType;
  meta?: AudioMeta;
}

export interface AudioMeta {
  surahNumber?: number;
  ayahNumber?: number;
  programSlug?: string;
  programTitle?: string;
  episodeId?: string;
  episodeOrder?: number;
  playlist?: PlaylistItem[];
  currentIndex?: number;
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
  meta: AudioMeta | null;
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
  playNextTrack: () => void;
  playPrevTrack: () => void;
  setOnEnded: (fn: (() => void) | null) => void;
  triggerEnded: () => void;
}

export function getAtharTabId(): string {
  if (typeof window === "undefined") return "tab_server";
  try {
    let tid = sessionStorage.getItem("athar_tab_id");
    if (!tid) {
      tid = "tab_" + Math.random().toString(36).slice(2, 9) + "_" + Date.now();
      sessionStorage.setItem("athar_tab_id", tid);
    }
    return tid;
  } catch {
    return "tab_default";
  }
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

function broadcastAction(action: { type: string; payload?: unknown }) {
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
      meta: null,
      activeTabId: null,
      onEndedCallback: null,

      setAudio: (src, title, subtitle, audioType, meta, tabId) => {
        const tid = tabId || getAtharTabId();
        const nextState = {
          src,
          title,
          subtitle,
          audioType,
          isPlaying: true,
          activeTabId: tid,
          surahNumber: meta?.surahNumber ?? null,
          ayahNumber: meta?.ayahNumber ?? null,
          meta: meta ?? null,
        };
        set(nextState);
        broadcastAction({ type: "SET_AUDIO", payload: nextState });
      },

      claimAudio: (tabId?: string) => {
        const tid = tabId || getAtharTabId();
        set({ activeTabId: tid, isPlaying: true });
        broadcastAction({ type: "CLAIM_AUDIO", payload: { activeTabId: tid } });
      },

      togglePlay: (tabId?: string) => {
        const nextIsPlaying = !get().isPlaying;
        const currentTabId = tabId || (nextIsPlaying ? getAtharTabId() : get().activeTabId);
        set({ isPlaying: nextIsPlaying, activeTabId: nextIsPlaying ? currentTabId : get().activeTabId });
        broadcastAction({
          type: "TOGGLE_PLAY",
          payload: { isPlaying: nextIsPlaying, activeTabId: currentTabId },
        });
      },

      setIsPlaying: (isPlaying, tabId) => {
        const tid = tabId || (isPlaying ? getAtharTabId() : get().activeTabId);
        set({ isPlaying, activeTabId: isPlaying ? tid : get().activeTabId });
        broadcastAction({
          type: "SET_IS_PLAYING",
          payload: { isPlaying, activeTabId: tid },
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
          meta: null,
          activeTabId: null,
        };
        set(stoppedState);
        broadcastAction({ type: "STOP" });
      },

      playNextTrack: () => {
        const currentMeta = get().meta;
        if (!currentMeta?.playlist || currentMeta.currentIndex === undefined) return;
        const nextIndex = currentMeta.currentIndex + 1;
        if (nextIndex < currentMeta.playlist.length) {
          const nextItem = currentMeta.playlist[nextIndex];
          get().setAudio(
            nextItem.src,
            nextItem.title,
            nextItem.subtitle,
            nextItem.audioType,
            {
              ...nextItem.meta,
              playlist: currentMeta.playlist,
              currentIndex: nextIndex,
            }
          );
        }
      },

      playPrevTrack: () => {
        const currentMeta = get().meta;
        if (!currentMeta?.playlist || currentMeta.currentIndex === undefined) return;
        const prevIndex = currentMeta.currentIndex - 1;
        if (prevIndex >= 0) {
          const prevItem = currentMeta.playlist[prevIndex];
          get().setAudio(
            prevItem.src,
            prevItem.title,
            prevItem.subtitle,
            prevItem.audioType,
            {
              ...prevItem.meta,
              playlist: currentMeta.playlist,
              currentIndex: prevIndex,
            }
          );
        }
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
        meta: state.meta,
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
        meta: payload.meta,
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
        meta: null,
        activeTabId: null,
      });
    }
  };
}

