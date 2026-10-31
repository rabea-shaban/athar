"use client";

import React from "react";
import { BookOpen } from "lucide-react";

interface PdfLoadingStateProps {
  title?: string;
  author?: string;
}

export default function PdfLoadingState({ title, author }: PdfLoadingStateProps) {
  return (
    <div
      className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-6 bg-[#F8F6EF] dark:bg-[#0A1510] text-[#202820] dark:text-[#F8F6EF] transition-colors"
      dir="rtl"
    >
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer pulsing ring */}
        <div className="w-20 h-20 rounded-full border-2 border-[#C9A227]/30 animate-ping absolute inset-0" />
        {/* Middle spinning ring */}
        <div className="w-20 h-20 rounded-full border-2 border-t-[#064E35] dark:border-t-[#C9A227] border-r-transparent border-b-[#064E35]/30 border-l-transparent animate-spin" />
        {/* Center icon badge */}
        <div className="w-14 h-14 rounded-2xl bg-[#064E35] text-[#C9A227] flex items-center justify-center shadow-lg shadow-[#064E35]/25 absolute">
          <BookOpen className="w-7 h-7" />
        </div>
      </div>

      <div className="text-center max-w-md space-y-2 font-arabic">
        <h3 className="text-lg font-bold text-[#064E35] dark:text-[#C9A227]">
          جاري فتح وثيقة الكتاب في محرك أثر...
        </h3>
        {title && (
          <p className="text-sm font-semibold text-[#202820] dark:text-neutral-200 line-clamp-1">
            {title}
          </p>
        )}
        {author && (
          <p className="text-xs text-[#77776D] dark:text-neutral-400">
            تأليف: {author}
          </p>
        )}
        <div className="pt-3 flex items-center justify-center gap-1.5 text-xs text-[#77776D] dark:text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#064E35] dark:bg-[#C9A227] animate-pulse" />
          <span>تهيئة العرض فائق الدقة وتجهيز الفهارس</span>
        </div>
      </div>
    </div>
  );
}
