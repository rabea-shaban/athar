"use client";

import React from "react";
import { AlertCircle, RotateCcw, Download } from "lucide-react";

interface PdfErrorStateProps {
  title?: string;
  pdfUrl?: string;
  errorMessage?: string;
  onRetry?: () => void;
}

export default function PdfErrorState({
  title,
  pdfUrl,
  errorMessage,
  onRetry,
}: PdfErrorStateProps) {
  return (
    <div
      className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-6 bg-[#F8F6EF] dark:bg-[#0A1510] text-[#202820] dark:text-[#F8F6EF]"
      dir="rtl"
    >
      <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="text-center max-w-md space-y-3 font-arabic">
        <h3 className="text-lg font-bold text-[#064E35] dark:text-[#C9A227]">
          تعذر فتح وثيقة الكتاب في القارئ
        </h3>
        <p className="text-xs sm:text-sm text-[#77776D] dark:text-neutral-400 leading-relaxed">
          {errorMessage ||
            "حدث خطأ أثناء تحميل ملف الـ PDF. يمكنك إعادة المحاولة أو تنزيل النسخة مباشرة إلى جهازك."}
        </p>

        {title && (
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-neutral-900/60 border border-[#E8E3D8] dark:border-neutral-800 text-xs font-medium text-foreground">
            {title}
          </div>
        )}

        <div className="pt-4 flex items-center justify-center gap-3 flex-wrap">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2.5 rounded-2xl bg-[#064E35] hover:bg-[#0B6245] text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة المحاولة</span>
            </button>
          )}

          {pdfUrl && (
            <a
              href={pdfUrl}
              download
              className="px-4 py-2.5 rounded-2xl bg-[#C9A227] hover:bg-[#B38F20] text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل نسخة PDF مباشرة</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
