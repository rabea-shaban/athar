"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, ChevronLeft, Play, Sparkles } from "lucide-react";
import { QuranReciter } from "@/types/content";

interface ReciterCardProps {
  reciter: QuranReciter;
  onSelect?: (reciter: QuranReciter) => void;
}

export default function ReciterCard({ reciter, onSelect }: ReciterCardProps) {
  const [imgError, setImgError] = useState(false);

  const formattedOrder = `# ${reciter.orderNum < 10 ? `0${reciter.orderNum}` : reciter.orderNum}`;

  // Direct link to /listen with this reciter's API ID
  const destinationUrl = `/listen?reciter=${reciter.apiId || reciter.listenId || reciter.id}`;

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-emerald-700/50 hover:-translate-y-1 transition-all duration-300 text-center">
      {/* ─── Top Badges Row (Matching Screenshot 4) ─── */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {/* Right (RTL): Order badge "# 01" */}
        <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl font-mono">
          {formattedOrder}
        </span>

        {/* Left (RTL): Recitations Count Badge with Red Dot */}
        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-muted-foreground bg-muted/80 px-2.5 py-1 rounded-xl border border-border/60 font-arabic">
          <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
          <span>{reciter.recitationsBadge || "114 تلاوة مرئية"}</span>
        </span>
      </div>

      {/* ─── Center Portrait with Gold Ring & Verified Badge (Screenshot 4) ─── */}
      <div className="relative mx-auto my-2">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-br from-amber-400/90 via-amber-200/40 to-amber-600/90 shadow-md group-hover:scale-105 transition-transform duration-300">
          <div className="w-full h-full rounded-full overflow-hidden relative bg-gradient-to-br from-[#0c2e22] via-[#072418] to-[#041710] border-2 border-card flex flex-col items-center justify-center">
            {!imgError && reciter.avatar ? (
              <Image
                src={reciter.avatar}
                alt={reciter.name}
                fill
                sizes="128px"
                className="object-cover object-top"
                onError={() => setImgError(true)}
              />
            ) : (
              /* Fallback Calligraphy Medallion */
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 select-none">
                <span className="text-3xl sm:text-4xl font-black font-arabic text-amber-300 drop-shadow-md">
                  {reciter.letter || reciter.name.charAt(0)}
                </span>
                <span className="text-[10px] text-emerald-300/80 font-arabic mt-0.5 font-medium">
                  {reciter.riwayah || "حفص عن عاصم"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Verified Green Check Badge at Bottom Right */}
        <div
          className="absolute bottom-1 right-2 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-card shadow-sm z-10"
          title="قارئ معتمد"
        >
          <Check className="h-3.5 w-3.5 stroke-[3]" />
        </div>
      </div>

      {/* ─── Sheikh Name & Style ─── */}
      <div className="mt-4 mb-2 space-y-2">
        <h3 className="font-extrabold text-base sm:text-lg font-arabic text-foreground group-hover:text-[var(--athar-green)] transition-colors leading-snug line-clamp-1">
          {reciter.name}
        </h3>

        {/* Style Badge (Screenshot 4) */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 px-3 py-0.5 rounded-full font-arabic inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
            <span>{reciter.styleBadge}</span>
          </span>
        </div>
      </div>

      {/* ─── Bio Description ─── */}
      <p className="text-xs text-muted-foreground font-arabic leading-relaxed line-clamp-3 mb-6 px-1 min-h-[48px]">
        {reciter.bio}
      </p>

      {/* ─── Full-Width Dark Green Action Button (Screenshot 4) ─── */}
      <div className="pt-2">
        <Link
          href={destinationUrl}
          onClick={() => onSelect && onSelect(reciter)}
          className="w-full py-3 px-4 rounded-xl font-arabic font-bold text-xs sm:text-sm text-white bg-[#0c2e22] hover:bg-[#072418] transition-colors duration-200 flex items-center justify-between shadow-sm cursor-pointer active:scale-[0.99]"
        >
          {/* Right: Red YouTube Play Icon */}
          <div className="w-5 h-4 rounded-[4px] bg-red-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Play className="h-2 w-2 fill-white translate-x-[-0.5px]" />
          </div>

          {/* Center Label */}
          <span className="mx-auto">مشاهدة تلاوات الشيخ</span>

          {/* Left: Arrow */}
          <ChevronLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
