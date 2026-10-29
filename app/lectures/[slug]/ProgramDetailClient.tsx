"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  Pause,
  Clock,
  Layers,
  User,
  Share2,
  BookOpen,
  FileText,
  Check,
  Tag,
  Bookmark,
  Video,
  X,
  Search,
  Link2,
  ListVideo,
  ChevronRight,
  ChevronLeft,
  SkipBack,
  SkipForward,
} from "lucide-react";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Program, Episode, Article } from "@/types/content";
import { useAudioStore } from "@/store/audioStore";
import { cn, toArabicNumber } from "@/lib/utils";

interface ProgramDetailClientProps {
  program: Program;
  relatedArticles: Article[];
}

export default function ProgramDetailClient({
  program,
  relatedArticles,
}: ProgramDetailClientProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [mediaMode, setMediaMode] = useState<"video" | "audio">("video");
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [episodeSearch, setEpisodeSearch] = useState("");
  const playlistContainerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // When visiting a lecture series, stop any lingering radio broadcast from other pages
  useEffect(() => {
    useAudioStore.getState().stop();
  }, []);

  const currentEpisode = useMemo(() => {
    return program.episodes[currentEpisodeIndex] || program.episodes[0];
  }, [program.episodes, currentEpisodeIndex]);

  const hasPrev = currentEpisodeIndex > 0;
  const hasNext = currentEpisodeIndex < program.episodes.length - 1;
  const prevEpisode = hasPrev ? program.episodes[currentEpisodeIndex - 1] : null;
  const nextEpisode = hasNext ? program.episodes[currentEpisodeIndex + 1] : null;

  // Check saved state
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("athar_saved_programs") || "[]"
      );
      setIsSaved(saved.includes(program.id));
    } catch {}
  }, [program.id]);

  const toggleSave = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("athar_saved_programs") || "[]"
      );
      let updated: string[];
      if (isSaved) {
        updated = saved.filter((id: string) => id !== program.id);
      } else {
        updated = [...saved, program.id];
      }
      localStorage.setItem("athar_saved_programs", JSON.stringify(updated));
      setIsSaved(!isSaved);
    } catch {}
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${program.title} - ${currentEpisode?.title || ""}`,
      text: program.description,
      url: window.location.href,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  const toggleVideoPlayback = () => {
    if (!iframeRef.current?.contentWindow) return;
    if (isVideoPlaying) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo", args: "" }),
        "*"
      );
      setIsVideoPlaying(false);
    } else {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "playVideo", args: "" }),
        "*"
      );
      setIsVideoPlaying(true);
    }
  };

  const selectEpisode = (episode: Episode, index: number) => {
    if (index < 0 || index >= program.episodes.length) return;
    useAudioStore.getState().stop();
    setCurrentEpisodeIndex(index);
    setIsVideoPlaying(true);
  };

  const handleNextEpisode = () => {
    if (currentEpisodeIndex < program.episodes.length - 1) {
      const nextIdx = currentEpisodeIndex + 1;
      selectEpisode(program.episodes[nextIdx], nextIdx);
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpisodeIndex > 0) {
      const prevIdx = currentEpisodeIndex - 1;
      selectEpisode(program.episodes[prevIdx], prevIdx);
    }
  };

  const isInitialMount = useRef(true);

  // Sync episode from URL query on mount and update URL/auto-scroll on change
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      const params = new URLSearchParams(window.location.search);
      const epParam = params.get("ep");
      if (epParam) {
        const epNum = parseInt(epParam, 10);
        if (!isNaN(epNum) && epNum >= 1 && epNum <= program.episodes.length) {
          const targetIdx = epNum - 1;
          if (targetIdx !== currentEpisodeIndex) {
            setCurrentEpisodeIndex(targetIdx);
            return;
          }
        }
      }
    }

    const url = new URL(window.location.href);
    url.searchParams.set("ep", String(currentEpisodeIndex + 1));
    window.history.replaceState({}, "", url.toString());

    const el = document.getElementById(`playlist-ep-${currentEpisodeIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentEpisodeIndex, program.episodes.length]);

  // Keyboard navigation (Arrow keys) to flip between episodes smoothly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === "ArrowLeft") {
        handleNextEpisode();
      } else if (e.key === "ArrowRight") {
        handlePrevEpisode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentEpisodeIndex, program.episodes]);

  // Auto-play next episode when YouTube video finishes, and track play/pause state
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === "string") {
          const data = JSON.parse(event.data);
          // YouTube postMessage: onStateChange with info
          // 1 = playing, 2 = paused, 0 = ended
          if (data.event === "onStateChange") {
            if (data.info === 1) {
              setIsVideoPlaying(true);
            } else if (data.info === 2) {
              setIsVideoPlaying(false);
            } else if (data.info === 0) {
              setIsVideoPlaying(false);
              if (autoPlayNext) {
                handleNextEpisode();
              }
            }
          }
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [autoPlayNext, currentEpisodeIndex, program.episodes]);

  // Notify YouTube iframe to emit state change events
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: "listening" }),
          "*"
        );
      } catch {}
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentEpisodeIndex, mediaMode]);

  const isAudioPlayingThis = mediaMode === "audio" && isVideoPlaying;

  // Filter episodes by search
  const filteredEpisodes = useMemo(() => {
    if (!episodeSearch.trim()) return program.episodes;
    const q = episodeSearch.trim().toLowerCase();
    return program.episodes.filter(
      (ep) =>
        ep.title.toLowerCase().includes(q) ||
        (ep.description && ep.description.toLowerCase().includes(q)) ||
        String(ep.order).includes(q)
    );
  }, [program.episodes, episodeSearch]);

  const progressPercent = Math.min(
    100,
    Math.round(
      (((currentEpisode?.order || currentEpisodeIndex + 1)) /
        (program.episodesCount || 1)) *
        100
    )
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ─── Top Al-Fath Style Islamic Hero Banner ─── */}
      <section className="relative overflow-hidden bg-[#062419] bg-[radial-gradient(#0e4732_1px,transparent_1px)] [background-size:24px_24px] text-white border-b border-emerald-900/50 py-10 md:py-14">
        {/* Decorative glows */}
        <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

        <Container size="2xl" className="relative z-10 text-center">
          {/* Breadcrumb Navigation */}
          <nav className="inline-flex items-center gap-2 text-xs text-emerald-200/80 mb-4 font-arabic">
            <Link href="/" className="hover:text-white transition-colors">
              الرئيسية
            </Link>
            <span className="opacity-60">/</span>
            <Link href="/lectures" className="hover:text-white transition-colors">
              البرامج والدروس الدينية
            </Link>
            <span className="opacity-60">/</span>
            <span className="text-amber-300 font-medium truncate max-w-[200px]">
              {program.title}
            </span>
          </nav>

          {/* Program Big Title */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black font-arabic tracking-tight text-white mb-4 leading-tight">
            {program.title}
          </h1>

          {/* Metadata Badges Row */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-arabic">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/95">
              <User className="h-3.5 w-3.5 text-amber-300" />
              <span>{program.presenter}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-200">
              <span>{program.category}</span>
              <span className="opacity-60">•</span>
              <span>{program.playlistType || "سلسلة مرئية"}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600/30 text-emerald-200 backdrop-blur-md border border-emerald-500/30 font-semibold">
              <Layers className="h-3.5 w-3.5 text-amber-300" />
              <span>
                {toArabicNumber(program.episodesCount)} حلقة مرئية HD
              </span>
            </span>
          </div>
        </Container>
      </section>

      {/* ─── Main Two-Column Media Showcase ─── */}
      <Container size="2xl" className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ════════ RIGHT COLUMN: Large Video / Audio Player ════════ */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-3 order-1">
            {/* Player Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-800 bg-black aspect-video w-full">
              {/* YouTube IFrame - Always kept mounted so video audio streams natively and authentically */}
              {(currentEpisode?.youtubeId || program.youtubePlaylistId) ? (
                <iframe
                  ref={iframeRef}
                  key={`${currentEpisode?.id}-${currentEpisodeIndex}-${currentEpisode?.youtubeId}`}
                  src={
                    currentEpisode?.youtubeId && !currentEpisode.youtubeId.startsWith("PL")
                      ? `https://www.youtube-nocookie.com/embed/${currentEpisode.youtubeId}?autoplay=1&enablejsapi=1&rel=0`
                      : `https://www.youtube-nocookie.com/embed/videoseries?list=${
                          currentEpisode?.youtubeId?.startsWith("PL")
                            ? currentEpisode.youtubeId
                            : program.youtubePlaylistId
                        }&index=${currentEpisodeIndex}&autoplay=1&enablejsapi=1&rel=0`
                  }
                  title={currentEpisode?.title || program.title}
                  className={cn(
                    "w-full h-full transition-opacity duration-300",
                    mediaMode === "video"
                      ? "relative z-10 block opacity-100"
                      : "absolute inset-0 z-0 opacity-0 pointer-events-none"
                  )}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : null}

              {/* Audio Mode Card Overlay */}
              {mediaMode === "audio" && (
                <div className="absolute inset-0 z-20 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#072418] via-[#041710] to-[#020b07] text-white p-6 relative overflow-hidden select-none">
                  {/* Decorative background grid & radial glow */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
                  <div className="pointer-events-none absolute -top-10 -right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-10 -left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />

                  {/* Vinyl Disc / Thumbnail with Spinning Animation when playing */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={cn(
                        "relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-2xl border-4 border-emerald-500/40 mb-3 transition-transform",
                        isVideoPlaying ? "animate-[spin_20s_linear_infinite]" : ""
                      )}
                    >
                      <Image
                        src={
                          currentEpisode?.thumb ||
                          (currentEpisode?.youtubeId
                            ? `https://img.youtube.com/vi/${currentEpisode.youtubeId}/hqdefault.jpg`
                            : program.coverImage)
                        }
                        alt={currentEpisode?.title || program.title}
                        fill
                        className="object-cover"
                      />
                      {/* Center vinyl spindle hole */}
                      <div className="absolute inset-0 m-auto w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#041710] border-2 border-emerald-400/80 shadow-inner flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                    </div>

                    {/* Central Play/Pause Floating Action Button */}
                    <button
                      type="button"
                      onClick={toggleVideoPlayback}
                      className={cn(
                        "flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-arabic text-xs font-bold shadow-xl transition-all duration-150 active:scale-95 cursor-pointer",
                        isVideoPlaying
                          ? "bg-amber-400 hover:bg-amber-300 text-amber-950"
                          : "bg-emerald-500 hover:bg-emerald-400 text-white"
                      )}
                    >
                      {isVideoPlaying ? (
                        <>
                          <Pause className="h-4 w-4" />
                          <span>إيقاف الصوت مؤقتاً</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-[-2px]" />
                          <span>استئناف الاستماع</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title & Metadata */}
                  <div className="relative z-10 text-center max-w-lg space-y-1.5 px-4 mt-3">
                    <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-[11px] font-bold text-amber-300 font-arabic">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>
                        الحلقة {toArabicNumber(currentEpisode?.order || currentEpisodeIndex + 1)} من{" "}
                        {toArabicNumber(program.episodesCount)}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base md:text-lg font-arabic text-white line-clamp-1">
                      {currentEpisode?.title}
                    </h3>

                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-200/70 font-arabic">
                      <span>{program.presenter}</span>
                      <span>•</span>
                      <span className="font-mono">{currentEpisode?.duration}</span>
                      <span>•</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        صوت الفيديو الأصلي HD
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Episode Flip Navigation Bar (شريط التقليب السريع بين الحلقات) ─── */}
            <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-2xl bg-card border border-border/80 shadow-xs">
              {/* Right Button (RTL): Previous Episode */}
              <button
                type="button"
                onClick={handlePrevEpisode}
                disabled={!hasPrev}
                title={prevEpisode ? `الحلقة السابقة: ${prevEpisode.title}` : "أنت في أول حلقة"}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-arabic font-semibold transition-all duration-150 border select-none shrink-0",
                  hasPrev
                    ? "bg-muted/70 hover:bg-emerald-50 hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:border-emerald-500/50 dark:hover:text-emerald-300 text-foreground border-border/80 active:scale-95 cursor-pointer"
                    : "opacity-40 cursor-not-allowed bg-muted/30 text-muted-foreground border-transparent"
                )}
              >
                <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                <div className="text-right hidden sm:block max-w-[140px] md:max-w-[200px]">
                  <div className="text-[10px] text-muted-foreground leading-none mb-0.5 font-medium">الحلقة السابقة</div>
                  <div className="text-xs truncate font-bold">{prevEpisode?.title || "لا توجد"}</div>
                </div>
                <span className="sm:hidden font-bold">السابقة</span>
              </button>

              {/* Center: Current Episode Indicator & Progress */}
              <div className="flex flex-col items-center justify-center text-center px-2 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-arabic font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>الحلقة {toArabicNumber(currentEpisode?.order || currentEpisodeIndex + 1)} من {toArabicNumber(program.episodesCount)}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-arabic mt-1 hidden md:inline-flex items-center gap-1">
                  <span>استخدم</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[9px] font-mono">←</kbd>
                  <span>و</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[9px] font-mono">→</kbd>
                  <span>للتقليب</span>
                </span>
              </div>

              {/* Left Button (RTL): Next Episode */}
              <button
                type="button"
                onClick={handleNextEpisode}
                disabled={!hasNext}
                title={nextEpisode ? `الحلقة التالية: ${nextEpisode.title}` : "وصلت لآخر حلقة"}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-arabic font-semibold transition-all duration-150 border select-none shrink-0",
                  hasNext
                    ? "bg-[var(--athar-green)] hover:bg-[var(--athar-green-dark)] text-white border-transparent shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
                    : "opacity-40 cursor-not-allowed bg-muted/30 text-muted-foreground border-transparent"
                )}
              >
                <div className="text-left hidden sm:block max-w-[140px] md:max-w-[200px]">
                  <div className="text-[10px] text-emerald-100/80 leading-none mb-0.5 font-medium">الحلقة التالية</div>
                  <div className="text-xs truncate font-bold">{nextEpisode?.title || "نهاية السلسلة"}</div>
                </div>
                <span className="sm:hidden font-bold">التالية</span>
                <ChevronLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
              </button>
            </div>

            {/* Bottom Toolbar Below Player (Al-Fath Signature Style) */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-[#0b1922] text-slate-200 border border-slate-800 shadow-md">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {/* Video Mode Button */}
                <button
                  type="button"
                  onClick={() => {
                    useAudioStore.getState().stop();
                    setMediaMode("video");
                    if (!isVideoPlaying && iframeRef.current?.contentWindow) {
                      iframeRef.current.contentWindow.postMessage(
                        JSON.stringify({ event: "command", func: "playVideo", args: "" }),
                        "*"
                      );
                      setIsVideoPlaying(true);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-arabic font-semibold transition-all cursor-pointer",
                    mediaMode === "video"
                      ? "bg-[var(--athar-green)] text-white shadow-xs"
                      : "bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                  )}
                >
                  <Video className="h-4 w-4" />
                  <span>فيديو مرئي HD</span>
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-arabic font-medium bg-slate-800/60 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>مشاركة</span>
                </button>

                {/* Copy Link Button */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-arabic font-medium bg-slate-800/60 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4" />
                      <span>نسخ الرابط</span>
                    </>
                  )}
                </button>

                {/* Save Program Button */}
                <button
                  type="button"
                  onClick={toggleSave}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-arabic font-medium bg-slate-800/60 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
                >
                  <Bookmark className={cn("h-4 w-4", isSaved && "fill-amber-400 text-amber-400")} />
                  <span>{isSaved ? "محفوظ" : "حفظ"}</span>
                </button>
              </div>

              {/* Convert to MP3 Player / Audio Mode Control Button */}
              <button
                type="button"
                onClick={() => {
                  useAudioStore.getState().stop();
                  if (mediaMode === "video") {
                    setMediaMode("audio");
                    if (!isVideoPlaying && iframeRef.current?.contentWindow) {
                      iframeRef.current.contentWindow.postMessage(
                        JSON.stringify({ event: "command", func: "playVideo", args: "" }),
                        "*"
                      );
                      setIsVideoPlaying(true);
                    }
                  } else {
                    toggleVideoPlayback();
                  }
                }}
                className={cn(
                  "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-arabic font-bold transition-all shadow-xs cursor-pointer",
                  mediaMode === "audio"
                    ? "bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-md"
                    : "bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 text-emerald-300 border border-emerald-600/50 hover:border-emerald-400"
                )}
              >
                {/* Mini Equalizer indicator */}
                <div className="flex items-end gap-[2px] h-3.5 w-3.5">
                  <span
                    className={cn(
                      "w-1 bg-current rounded-full transition-all",
                      mediaMode === "audio" && isVideoPlaying ? "h-3.5 animate-pulse" : "h-2"
                    )}
                  />
                  <span
                    className={cn(
                      "w-1 bg-current rounded-full transition-all",
                      mediaMode === "audio" && isVideoPlaying ? "h-2 animate-pulse delay-100" : "h-3"
                    )}
                  />
                  <span
                    className={cn(
                      "w-1 bg-current rounded-full transition-all",
                      mediaMode === "audio" && isVideoPlaying ? "h-3 animate-pulse delay-200" : "h-1.5"
                    )}
                  />
                </div>
                <span>
                  {mediaMode === "audio"
                    ? isVideoPlaying
                      ? "إيقاف الصوت مؤقتاً"
                      : "استئناف الاستماع MP3"
                    : "تحويل إلى مشغل MP3"}
                </span>
              </button>
            </div>
          </div>

          {/* ════════ LEFT COLUMN: Playlist & Episodes Browser ════════ */}
          <div className="lg:col-span-5 xl:col-span-4 order-2">
            <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm space-y-4">
              {/* Header: Title + Badge + Auto-Play Switch */}
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600">
                    <ListVideo className="h-4 w-4" />
                  </span>
                  <h2 className="font-bold text-base font-arabic text-foreground">
                    قائمة الحلقات
                  </h2>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-arabic">
                    {toArabicNumber(program.episodesCount)} حلقة
                  </span>

                  {/* Mini Flip Arrow Buttons */}
                  <div className="flex items-center gap-0.5 mr-1">
                    <button
                      type="button"
                      onClick={handlePrevEpisode}
                      disabled={!hasPrev}
                      title={prevEpisode ? `السابقة: ${prevEpisode.title}` : "أنت في أول حلقة"}
                      className={cn(
                        "p-1 rounded-md border text-xs transition-colors",
                        hasPrev
                          ? "hover:bg-muted border-border/80 text-foreground cursor-pointer"
                          : "opacity-30 cursor-not-allowed border-transparent text-muted-foreground"
                      )}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextEpisode}
                      disabled={!hasNext}
                      title={nextEpisode ? `التالية: ${nextEpisode.title}` : "وصلت لآخر حلقة"}
                      className={cn(
                        "p-1 rounded-md border text-xs transition-colors",
                        hasNext
                          ? "hover:bg-muted border-border/80 text-foreground cursor-pointer"
                          : "opacity-30 cursor-not-allowed border-transparent text-muted-foreground"
                      )}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Auto-Play Next Toggle Switch */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-arabic">
                    تشغيل تلقائي
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoPlayNext}
                    onClick={() => setAutoPlayNext(!autoPlayNext)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                      autoPlayNext
                        ? "bg-[var(--athar-green)]"
                        : "bg-muted-foreground/30"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out",
                        autoPlayNext ? "-translate-x-4" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  value={episodeSearch}
                  onChange={(e) => setEpisodeSearch(e.target.value)}
                  placeholder="ابحث برقم الحلقة أو عنوانها..."
                  className="pr-9 h-10 text-xs rounded-xl bg-background border-border/80 font-arabic"
                  dir="rtl"
                />
                {episodeSearch && (
                  <button
                    onClick={() => setEpisodeSearch("")}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Active Playing Info Banner (Al-Fath Style Box) */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-arabic">
                  <span className="text-foreground font-medium flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                    <span>
                      تشاهد الآن الحلقة رقم{" "}
                      <strong className="text-amber-600 font-bold">
                        {toArabicNumber(currentEpisode?.order || currentEpisodeIndex + 1)}
                      </strong>{" "}
                      من {toArabicNumber(program.episodesCount)}
                    </span>
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                    {progressPercent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-border/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Scrollable Episodes List */}
              <div
                ref={playlistContainerRef}
                className="overflow-y-auto max-h-[460px] sm:max-h-[500px] space-y-2 pr-1 scrollbar-thin"
              >
                {filteredEpisodes.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground font-arabic">
                    لا توجد حلقات مطابقة للبحث
                  </div>
                ) : (
                  filteredEpisodes.map((episode) => {
                    const originalIndex = program.episodes.findIndex(
                      (e) => e.id === episode.id
                    );
                    const isSelected =
                      originalIndex === currentEpisodeIndex;

                    return (
                      <div
                        key={episode.id}
                        id={`playlist-ep-${originalIndex}`}
                        onClick={() => selectEpisode(episode, originalIndex)}
                        className={cn(
                          "group relative flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl border cursor-pointer transition-all duration-150 select-none",
                          isSelected
                            ? "bg-[#0b291d] border-emerald-600 text-white shadow-md ring-1 ring-emerald-500/40"
                            : "bg-card hover:bg-muted/70 border-border/70 text-foreground"
                        )}
                      >
                        {/* Right Details in RTL (Title & Meta) */}
                        <div className="min-w-0 flex-1 text-right">
                          <h4
                            className={cn(
                              "text-xs sm:text-sm font-bold font-arabic leading-snug line-clamp-1 mb-1",
                              isSelected
                                ? "text-emerald-300"
                                : "text-foreground group-hover:text-[var(--athar-green)]"
                            )}
                          >
                            {episode.title}
                          </h4>

                          <div
                            className={cn(
                              "flex items-center gap-2 text-[11px] font-arabic",
                              isSelected ? "text-emerald-200/70" : "text-muted-foreground"
                            )}
                          >
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="h-3 w-3" />
                              {episode.duration}
                            </span>
                            <span>•</span>
                            <span>فيديو مرئي HD</span>
                          </div>
                        </div>

                        {/* Left / Thumbnail with #Number Badge and Play Button */}
                        <div className="relative w-16 sm:w-20 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-white/10 shadow-xs">
                          <Image
                            src={
                              episode.thumb ||
                              (episode.youtubeId
                                ? `https://img.youtube.com/vi/${episode.youtubeId}/hqdefault.jpg`
                                : program.coverImage)
                            }
                            alt={episode.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                            sizes="80px"
                          />

                          {/* Order Badge (e.g. #001) */}
                          <div className="absolute top-1 right-1 bg-black/70 backdrop-blur-xs text-white text-[9px] font-mono px-1 rounded-sm">
                            #{String(episode.order).padStart(3, "0")}
                          </div>

                          {/* Circular Play / Equalizer Overlay */}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            {isSelected ? (
                              <div className="flex items-end gap-[2px] h-3 w-3">
                                <span className={cn("w-0.5 bg-emerald-400 rounded-full", isVideoPlaying ? "h-3 animate-pulse" : "h-1.5")} />
                                <span className={cn("w-0.5 bg-emerald-400 rounded-full", isVideoPlaying ? "h-1.5 animate-pulse delay-100" : "h-2.5")} />
                                <span className={cn("w-0.5 bg-emerald-400 rounded-full", isVideoPlaying ? "h-2.5 animate-pulse delay-200" : "h-1")} />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-[var(--athar-green)] transition-colors">
                                <Play className="h-2.5 w-2.5 mr-[-1px]" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Program Description & Details ─── */}
        <div className="mt-8 rounded-3xl border border-border/80 bg-card p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[var(--athar-green)]" />
            <h3 className="font-bold text-lg font-arabic text-foreground">
              عن السلسلة وموضوعاتها
            </h3>
          </div>

          <p className="text-sm text-muted-foreground font-arabic leading-relaxed">
            {program.description}
          </p>

          {/* Tags */}
          {program.tags && program.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {program.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border/40 font-arabic"
                >
                  <Tag className="h-3 w-3 text-muted-foreground/60" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ─── Related Articles Section ─── */}
        {relatedArticles.length > 0 && (
          <section className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" />
                <h3 className="text-xl font-bold font-arabic text-foreground">
                  مقالات معرفية مرتبطة بهذه السلسلة
                </h3>
              </div>
              <Link
                href="/articles"
                className="text-xs text-[var(--athar-green)] hover:underline font-arabic"
              >
                عرض كافة المقالات ←
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-card hover:border-[var(--athar-green)]/60 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[11px] font-semibold text-[var(--athar-green)] bg-[var(--athar-green)]/10 px-2.5 py-0.5 rounded-full font-arabic">
                        {article.category}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-arabic">
                        <Clock className="h-3 w-3" />
                        {toArabicNumber(article.readingTimeMinutes)} دقائق
                      </span>
                    </div>

                    <h4 className="font-bold text-base font-arabic text-foreground group-hover:text-[var(--athar-green)] transition-colors leading-snug line-clamp-2 mb-2">
                      {article.title}
                    </h4>

                    <p className="text-xs text-muted-foreground font-arabic leading-relaxed line-clamp-2 mb-3">
                      {article.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground font-arabic">
                    <span>بقلم: {article.author}</span>
                    <span className="text-[var(--athar-green)] font-semibold group-hover:translate-x-[-2px] transition-transform">
                      قراءة المقال ←
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
