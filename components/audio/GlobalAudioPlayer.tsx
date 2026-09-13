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
} from "lucide-react";
import { useAudioStore } from "@/store/audioStore";
import { cn, toArabicNumber } from "@/lib/utils";
import Container from "@/components/layout/Container";

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
    togglePlay,
    setVolume,
    stop,
  } = useAudioStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackSpeedIndex, setPlaybackSpeedIndex] = useState(0);

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

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isLooping]);

  // Handle source & play state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (src) {
      if (audio.src !== src) {
        audio.src = src;
        audio.load();
        setCurrentTime(0);
        setDuration(0);
      }
      if (isPlaying) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    }
  }, [src, isPlaying]);

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

  if (!src) return null;

  const isLive = audioType === "radio" || !isFinite(duration) || duration === 0;
  const progressPercent = !isLive && duration > 0 ? (currentTime / duration) * 100 : 0;

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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/90 shadow-2xl transition-all duration-300">
      {/* Top Edge Progress Bar for subtle indicator */}
      {!isLive && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-muted/40">
          <div
            className="h-full bg-[var(--athar-green)] transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      <Container size="2xl" className="py-2.5 sm:py-3">
        <div className="grid grid-cols-12 items-center gap-3">
          {/* Right Section: Artwork & Track Details */}
          <div className="col-span-8 sm:col-span-4 md:col-span-3.5 flex items-center gap-3 min-w-0">
            {/* Animated Quran Icon / Artwork */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[var(--athar-green)] to-[var(--athar-green-dark)] text-white flex items-center justify-center shrink-0 shadow-md">
              {audioType === "radio" ? (
                <Radio className="h-5 w-5" />
              ) : (
                <Music className="h-5 w-5" />
              )}
              {isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--athar-green)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>

            {/* Title & Subtitle */}
            <div className="min-w-0 text-right">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-foreground truncate font-arabic">
                  {title}
                </h4>
                {isLive && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-bold border border-red-500/20 shrink-0">
                    مباشر
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            </div>
          </div>

          {/* Center Section: Main Audio Controls & Seek Bar */}
          <div className="col-span-4 sm:col-span-8 md:col-span-5 flex flex-col items-center justify-center gap-1.5">
            {/* Buttons Row */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {/* Speed Toggle (Desktop) */}
              {!isLive && (
                <button
                  onClick={cyclePlaybackSpeed}
                  title="سرعة التشغيل"
                  className="hidden md:inline-flex text-[11px] font-bold px-2 py-0.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-transparent hover:border-border"
                >
                  {PLAYBACK_SPEEDS[playbackSpeedIndex]}x
                </button>
              )}

              {/* Rewind 10s */}
              {!isLive && (
                <button
                  onClick={() => handleSkip(-10)}
                  title="تقديم 10 ثوانٍ"
                  className="hidden sm:inline-flex p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              )}

              {/* Play / Pause Main Button */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white flex items-center justify-center shrink-0 shadow-md hover:scale-105 active:scale-95 transition-all duration-150"
                title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 mr-[-2px]" />
                )}
              </button>

              {/* Forward 10s */}
              {!isLive && (
                <button
                  onClick={() => handleSkip(10)}
                  title="تأخير 10 ثوانٍ"
                  className="hidden sm:inline-flex p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}

              {/* Loop Toggle */}
              {!isLive && (
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  title={isLooping ? "إلغاء التكرار" : "تكرار التلاوة"}
                  className={cn(
                    "hidden md:inline-flex p-1.5 rounded-full transition-colors",
                    isLooping
                      ? "text-[var(--athar-green)] bg-[var(--athar-green)]/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Repeat className="h-4 w-4" />
                </button>
              )}

              {/* Mobile Close Button */}
              <button
                onClick={stop}
                className="sm:hidden p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="إغلاق المشغل"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Timeline Slider & Time Markers (Desktop/Tablet) */}
            {!isLive && (
              <div className="hidden sm:flex items-center gap-2.5 w-full max-w-md">
                <span className="text-[11px] text-muted-foreground font-mono w-10 text-left select-none">
                  {formatTime(currentTime)}
                </span>

                <div className="relative flex-1 flex items-center group py-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={1}
                    value={currentTime}
                    onChange={handleSeek}
                    className={cn(
                      "w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted transition-all",
                      "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5",
                      "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--athar-green)]",
                      "[&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform group-hover:[&::-webkit-slider-thumb]:scale-125"
                    )}
                  />
                </div>

                <span className="text-[11px] text-muted-foreground font-mono w-10 text-right select-none">
                  {formatTime(duration)}
                </span>
              </div>
            )}
          </div>

          {/* Left Section: Volume, Surah Quick Link & Close */}
          <div className="hidden md:flex col-span-3.5 items-center justify-end gap-3">
            {/* Direct Surah Link */}
            {surahNumber && (
              <Link
                href={`/quran/${surahNumber}`}
                title="قراءة السورة في المصحف"
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/60"
              >
                <BookOpen className="h-3.5 w-3.5 text-[var(--athar-green)]" />
                <span>المصحف</span>
              </Link>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMuted(!muted)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title={muted ? "إلغاء الكتم" : "كتم الصوت"}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-destructive" />
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
                  "w-20 h-1.5 rounded-full appearance-none cursor-pointer bg-muted",
                  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3",
                  "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--athar-green)]",
                  "[&::-webkit-slider-thumb]:shadow-xs"
                )}
              />
            </div>

            {/* Close / Stop Button */}
            <button
              onClick={stop}
              className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="إغلاق المشغل"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}

