"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  X,
  RotateCcw,
  RotateCw,
  Repeat,
  BookOpen,
  Radio,
  Music,
  Heart,
  Share2,
  Download,
  Link2,
  ListMusic,
  Gauge,
  SkipBack,
  SkipForward,
  Check,
} from "lucide-react";
import { useAudioStore } from "@/store/audioStore";
import { cn, toArabicNumber } from "@/lib/utils";

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  }
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
}

const PLAYBACK_SPEEDS = [1, 1.25, 1.5, 1.75, 2];

export default function GlobalAudioPlayer() {
  const {
    isPlaying,
    title,
    subtitle,
    src,
    volume,
    audioType,
    surahNumber,
    activeTabId,
    togglePlay,
    claimAudio,
    setVolume,
    stop,
  } = useAudioStore();

  const [hasMounted, setHasMounted] = useState(false);
  const myTabIdRef = useRef<string>("");
  if (!myTabIdRef.current) {
    myTabIdRef.current =
      "tab_" + Math.random().toString(36).slice(2, 9) + "_" + Date.now();
  }
  const myTabId = myTabIdRef.current;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSrcRef = useRef<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackSpeedIndex, setPlaybackSpeedIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    // When a new tab mounts with active audio, claim audio focus to pause the older tab
    const state = useAudioStore.getState();
    if (state.src && state.isPlaying) {
      state.claimAudio(myTabId);
    }
  }, [myTabId]);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };
    const handleEnded = () => {
      if (!isLooping) {
        useAudioStore.getState().triggerEnded();
      }
    };
    const handleError = (e: Event) => {
      console.warn("Audio playback error:", e);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [isLooping]);

  // Handle source & play state changes with exclusive activeTab check
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Only play audio if this tab is the active audio owner
    const isThisTabActive = activeTabId === myTabId || activeTabId === null;

    if (src) {
      if (lastSrcRef.current !== src) {
        lastSrcRef.current = src;
        audio.src = src;
        audio.load();
        setCurrentTime(0);
        setDuration(0);
      }
      if (isPlaying && isThisTabActive) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            // Autoplay blocked by browser policy in new tab until user interaction
            const onFirstInteraction = () => {
              if (useAudioStore.getState().isPlaying && audioRef.current) {
                useAudioStore.getState().claimAudio(myTabId);
                audioRef.current.play().catch(() => {});
              }
              window.removeEventListener("pointerdown", onFirstInteraction);
              window.removeEventListener("keydown", onFirstInteraction);
            };
            window.addEventListener("pointerdown", onFirstInteraction, { once: true });
            window.addEventListener("keydown", onFirstInteraction, { once: true });
          });
        }
      } else {
        audio.pause();
      }
    } else {
      lastSrcRef.current = null;
      audio.pause();
      audio.src = "";
    }
  }, [src, isPlaying, activeTabId, myTabId]);

  // Handle volume & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  // Handle loop
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  // Handle playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = PLAYBACK_SPEEDS[playbackSpeedIndex];
    }
  }, [playbackSpeedIndex]);

  // Load liked state from localStorage
  useEffect(() => {
    if (src) {
      try {
        const savedLikes = JSON.parse(localStorage.getItem("athar_audio_likes") || "[]");
        setIsLiked(savedLikes.includes(src));
      } catch {
        setIsLiked(false);
      }
    }
  }, [src]);

  const toggleLike = () => {
    if (!src) return;
    try {
      const savedLikes = JSON.parse(localStorage.getItem("athar_audio_likes") || "[]");
      let updated: string[];
      if (isLiked) {
        updated = savedLikes.filter((item: string) => item !== src);
      } else {
        updated = [...savedLikes, src];
      }
      localStorage.setItem("athar_audio_likes", JSON.stringify(updated));
      setIsLiked(!isLiked);
    } catch {}
  };

  const handleShare = async () => {
    const shareData = {
      title: `${title} - أثر`,
      text: `استمع إلى ${title} على منصة أثر`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!src || audioType === "radio") return;
    const a = document.createElement("a");
    a.href = src;
    a.download = `${title || "quran"}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!hasMounted || !src) return null;

  const isLive = audioType === "radio" || !isFinite(duration) || duration === 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleSkip = (seconds: number) => {
    if (!audioRef.current || isLive) return;
    const newTime = Math.min(Math.max(0, audioRef.current.currentTime + seconds), duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const cyclePlaybackSpeed = () => {
    setPlaybackSpeedIndex((prev) => (prev + 1) % PLAYBACK_SPEEDS.length);
  };

  return (
    <div
      dir="rtl"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#121c27] text-slate-100 border-t border-slate-700/70 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] select-none transition-all duration-300"
    >
      <div className="max-w-[1700px] mx-auto px-3 sm:px-5 py-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 min-h-[58px]">
          {/* 1. RIGHT SIDE: Playlist Icon | Station Title & Subtitle | Like & Share */}
          <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto min-w-0 md:min-w-[260px] md:max-w-[340px] order-1">
            {/* Playlist Drawer Button */}
            <Link
              href="/radio"
              title="قائمة الإذاعات"
              className="p-2 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800/80 transition-colors shrink-0"
            >
              <ListMusic className="h-5 w-5" />
            </Link>

            <div className="h-7 w-px bg-slate-700/80 shrink-0 hidden sm:block" />

            {/* Title & Subtitle */}
            <div className="min-w-0 flex-1 text-right">
              <h4 className="text-sm font-bold text-sky-400 truncate hover:text-sky-300 transition-colors font-arabic">
                {title || "إذاعة أثر"}
              </h4>
              <p className="text-[11px] text-slate-400 truncate font-medium">
                {subtitle || (isLive ? "راديو مباشر 24/7" : "تلاوة صوتية")}
              </p>
            </div>

            {/* Like & Share Action Icons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={toggleLike}
                title={isLiked ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isLiked
                    ? "text-red-400 hover:text-red-300"
                    : "text-slate-400 hover:text-red-400 hover:bg-slate-800/60"
                )}
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              </button>

              <button
                type="button"
                onClick={handleShare}
                title="مشاركة"
                className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800/60 transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 2. CENTER SECTION: Playback Controls & Full-Width Timeline Slider */}
          <div className="flex flex-col items-center justify-center gap-1 w-full flex-1 max-w-2xl order-2">
            {/* Top Row: Playback Controls */}
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              {/* Previous / Skip Back (In RTL layout: Previous) */}
              <button
                type="button"
                onClick={() => handleSkip(-30)}
                disabled={isLive}
                title="السابق"
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              >
                <SkipForward className="h-4 w-4" />
              </button>

              {/* Rewind 10s */}
              <button
                type="button"
                onClick={() => handleSkip(-10)}
                disabled={isLive}
                title="تأخير 10 ثوانٍ"
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              {/* Main Circular Play / Pause Button */}
              <button
                type="button"
                onClick={() => {
                  if (!isPlaying) {
                    claimAudio(myTabId);
                  } else {
                    togglePlay(myTabId);
                  }
                }}
                className="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(14,165,233,0.4)] active:scale-95 transition-all duration-150"
                title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 mr-[-2px]" />
                )}
              </button>

              {/* Forward 10s */}
              <button
                type="button"
                onClick={() => handleSkip(10)}
                disabled={isLive}
                title="تقديم 10 ثوانٍ"
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              >
                <RotateCw className="h-4 w-4" />
              </button>

              {/* Next / Skip Forward */}
              <button
                type="button"
                onClick={() => handleSkip(30)}
                disabled={isLive}
                title="التالي"
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              >
                <SkipBack className="h-4 w-4" />
              </button>
            </div>

            {/* Bottom Row: Timeline Slider with Current & Total Time */}
            <div className="flex items-center gap-2.5 w-full">
              {/* Current Time */}
              <span className="text-[11px] font-mono text-slate-400 w-10 text-left select-none shrink-0">
                {isLive ? "00:00" : formatTime(currentTime)}
              </span>

              {/* Progress Bar Track */}
              <div className="relative flex-1 flex items-center group py-0.5">
                <input
                  type="range"
                  min={0}
                  max={isLive || !duration ? 100 : duration}
                  step={1}
                  disabled={isLive}
                  value={isLive ? 100 : currentTime}
                  onChange={handleSeek}
                  className={cn(
                    "w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-700 transition-all",
                    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3",
                    "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-400",
                    "[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform group-hover:[&::-webkit-slider-thumb]:scale-125",
                    "accent-sky-500",
                    isLive && "cursor-default opacity-80"
                  )}
                />
              </div>

              {/* Total Duration or Live Status */}
              <span className="text-[11px] font-mono text-slate-400 min-w-10 text-right select-none shrink-0">
                {isLive ? (
                  <span className="inline-flex items-center gap-1 text-red-400 font-sans font-bold text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    مباشر
                  </span>
                ) : (
                  formatTime(duration)
                )}
              </span>
            </div>
          </div>

          {/* 3. LEFT SIDE: Volume Control | Utilities (Download, Link, Speed, Close) */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto min-w-0 md:min-w-[240px] order-3">
            {/* Volume Control */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMuted(!muted)}
                className="text-slate-400 hover:text-white transition-colors p-1"
                title={muted ? "إلغاء الكتم" : "كتم الصوت"}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setMuted(false);
                  setVolume(Number(e.target.value));
                }}
                className={cn(
                  "w-16 sm:w-20 h-1.5 rounded-full appearance-none cursor-pointer bg-slate-700 accent-sky-500",
                  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5",
                  "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-400"
                )}
              />
            </div>

            <div className="h-5 w-px bg-slate-700/80 shrink-0" />

            {/* Utilities: Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              title={copiedLink ? "تم النسخ!" : "نسخ رابط المشاركة"}
              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800/60 transition-colors relative"
            >
              {copiedLink ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
            </button>

            {/* Download Icon */}
            {!isLive && (
              <button
                type="button"
                onClick={handleDownload}
                title="تحميل المقطع الصوتي"
                className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800/60 transition-colors"
              >
                <Download className="h-4 w-4" />
              </button>
            )}

            {/* Loop Toggle */}
            {!isLive && (
              <button
                type="button"
                onClick={() => setIsLooping(!isLooping)}
                title={isLooping ? "إلغاء التكرار" : "تكرار التلاوة"}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isLooping
                    ? "text-sky-400 bg-sky-500/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                )}
              >
                <Repeat className="h-4 w-4" />
              </button>
            )}

            {/* Playback Speed Toggle */}
            {!isLive && (
              <button
                type="button"
                onClick={cyclePlaybackSpeed}
                title="سرعة التشغيل"
                className="text-[11px] font-bold px-1.5 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/80"
              >
                {PLAYBACK_SPEEDS[playbackSpeedIndex]}x
              </button>
            )}

            {/* Quran Reader Shortcut if listening to Surah */}
            {surahNumber && (
              <Link
                href={`/quran/${surahNumber}`}
                title="قراءة السورة في المصحف"
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
              </Link>
            )}

            {/* Close / Stop Player */}
            <button
              type="button"
              onClick={stop}
              title="إغلاق المشغل"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition-colors mr-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
