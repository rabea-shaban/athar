"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Clock, ChevronLeft, User } from "lucide-react";
import { Program } from "@/types/content";
import { toArabicNumber } from "@/lib/utils";

interface ProgramCardProps {
  program: Program;
  priority?: boolean;
}

export default function ProgramCard({ program, priority = false }: ProgramCardProps) {
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const fallbackImage =
    "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-700/50 hover:-translate-y-1 transition-all duration-300 text-right">
      {/* ─── Top Thumbnail Area ─── */}
      <Link href={`/programs/${program.slug}`} className="block relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          src={imgError ? fallbackImage : program.coverImage || fallbackImage}
          alt={program.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgError(true)}
        />
        {/* Soft dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/35 pointer-events-none" />

        {/* Top Right Badge (RTL): Order + Playlist Type */}
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold border border-white/10 shadow-xs font-arabic">
            <span>#{program.orderNum || 1}</span>
            <span>{program.playlistType || "سلسلة مرئية"}</span>
          </span>
        </div>

        {/* Top Left Badge (RTL): Episodes Count */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-slate-900 text-[11px] sm:text-xs font-bold shadow-xs font-arabic">
            <span className="text-xs">≡</span>
            <span>{toArabicNumber(program.episodesCount)} حلقة</span>
          </span>
        </div>

        {/* Center Golden Play Button */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-500/85 backdrop-blur-xs text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-amber-500 transition-all duration-300">
            <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-white text-white translate-x-[-1px]" />
          </div>
        </div>

        {/* Bottom Duration Badge */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white/95 text-[11px] font-medium font-arabic border border-white/10">
            <Clock className="h-3 w-3 text-amber-300 shrink-0" />
            <span>{program.durationPerEpisode || "٤٥ دقيقة / حلقة"}</span>
          </span>
        </div>
      </Link>

      {/* ─── Card Body ─── */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between space-y-4">
        <div>
          {/* Host Info Row */}
          <div className="flex items-center gap-3 mb-3.5">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-border/80 shrink-0 bg-muted shadow-xs">
              {!avatarError && (program.hostAvatar || program.coverImage) ? (
                <Image
                  src={program.hostAvatar || program.coverImage}
                  alt={program.presenter}
                  fill
                  sizes="44px"
                  className="object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-900 text-amber-300 font-bold text-sm">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm sm:text-[15px] font-arabic text-foreground truncate">
                {program.presenter}
              </h4>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 font-arabic truncate mt-0.5">
                {program.category}
              </p>
            </div>
          </div>

          {/* Program Title */}
          <Link href={`/programs/${program.slug}`} className="block group/title">
            <h3 className="font-extrabold text-base sm:text-lg font-arabic text-foreground group-hover/title:text-[var(--athar-green)] transition-colors leading-snug line-clamp-1 mb-2">
              {program.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-muted-foreground font-arabic leading-relaxed line-clamp-2">
            {program.description}
          </p>
        </div>

        {/* Action Button: Dark Green Full-Width */}
        <div className="pt-2">
          <Link href={`/programs/${program.slug}`} className="block w-full">
            <button
              type="button"
              className="w-full py-3 px-4 rounded-xl font-arabic font-bold text-xs sm:text-sm text-white bg-[#0c2e22] hover:bg-[#072418] transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.99]"
            >
              <span>مشاهدة السلسلة</span>
              <ChevronLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
