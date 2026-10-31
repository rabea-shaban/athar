"use client";

import React, { useState } from "react";
import { X, Library, ShieldCheck, Copy, Check, Download, BookOpen } from "lucide-react";
import { ReaderBook } from "./types";
import { toArabicNumber } from "@/lib/utils";

interface PdfDossierDrawerProps {
  isOpen: boolean;
  book: ReaderBook;
  pdfUrl?: string;
  onClose: () => void;
}

export default function PdfDossierDrawer({
  isOpen,
  book,
  pdfUrl,
  onClose,
}: PdfDossierDrawerProps) {
  const [copiedCitation, setCopiedCitation] = useState(false);

  if (!isOpen) return null;

  const academicCitation =
    `${book.author} (${book.authorEra ? book.authorEra.replace("توفي ", "ت ") : "د.ت"}). ${book.title}. ${book.publisher || "طبعة محققة معتمدة"}.`;

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(academicCitation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 10001 }}
      className="fixed inset-0 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md h-full bg-[#FFFFFF] dark:bg-[#0E1E17] border-r border-[#E8E3D8] dark:border-[#1E3A2C] shadow-2xl flex flex-col font-arabic select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#F8F6EF] dark:bg-[#0A1510] border-b border-[#E8E3D8] dark:border-[#1E3A2C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Library className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#064E35] dark:text-[#C9A227]">
                البطاقة والتوثيق الأكاديمي
              </h3>
              <p className="text-[11px] text-[#77776D] dark:text-neutral-400">
                بيانات النسخة المعتمدة والتوثيق المصدري
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Main Book Card */}
          <div className="p-4 rounded-2xl bg-[#F8F6EF] dark:bg-[#142920] border border-[#E8E3D8] dark:border-[#1E3A2C] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[#064E35] dark:text-emerald-300 font-bold border border-emerald-500/30">
                  {book.category}
                </span>
                <h4 className="text-base font-bold text-foreground mt-1.5">
                  {book.title}
                </h4>
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#064E35] text-[#C9A227] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#E8E3D8]/80 dark:border-[#1E3A2C]/80">
              <div>
                <span className="text-[#77776D] dark:text-neutral-400 text-[11px] block">المؤلف:</span>
                <strong className="text-foreground">{book.author}</strong>
              </div>
              {book.authorEra && (
                <div>
                  <span className="text-[#77776D] dark:text-neutral-400 text-[11px] block">عصر المؤلف:</span>
                  <span className="text-foreground font-medium">{book.authorEra}</span>
                </div>
              )}
              {book.publisher && (
                <div>
                  <span className="text-[#77776D] dark:text-neutral-400 text-[11px] block">دار النشر / المحقق:</span>
                  <span className="text-foreground">{book.publisher}</span>
                </div>
              )}
              {book.pages && (
                <div>
                  <span className="text-[#77776D] dark:text-neutral-400 text-[11px] block">عدد الصفحات:</span>
                  <span className="text-foreground font-mono font-bold">
                    {toArabicNumber(book.pages)} صفحة
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Academic Citation Box */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#12251D] border border-[#E8E3D8] dark:border-[#1E3A2C] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#064E35] dark:text-[#C9A227] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#064E35] dark:text-[#10B981]" />
                <span>صيغة التوثيق المعتمدة (APA/MLA):</span>
              </span>
              <button
                type="button"
                onClick={handleCopyCitation}
                className="px-2.5 py-1 rounded-xl bg-[#064E35]/10 dark:bg-white/10 hover:bg-[#064E35]/20 text-[#064E35] dark:text-[#10B981] font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCitation ? "تم النسخ" : "نسخ التوثيق"}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#F8F6EF] dark:bg-[#0A1510] border border-[#E8E3D8] dark:border-[#1E3A2C] text-xs leading-relaxed text-foreground font-mono select-all">
              {academicCitation}
            </div>
          </div>

          {/* Book Description / Methodology */}
          {book.description && (
            <div className="p-4 rounded-2xl bg-[#F8F6EF] dark:bg-[#142920] border border-[#E8E3D8] dark:border-[#1E3A2C] space-y-1.5">
              <h5 className="font-bold text-xs text-foreground">عن الكتاب ومنهج المصنف:</h5>
              <p className="text-xs text-[#77776D] dark:text-neutral-300 leading-relaxed">
                {book.description}
              </p>
            </div>
          )}

          {/* Download Action */}
          {pdfUrl && (
            <div className="pt-2">
              <a
                href={pdfUrl}
                download={`${book.slug}.pdf`}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#064E35] hover:bg-[#0B6245] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#C9A227]" />
                <span>تحميل النسخة المحلية الكاملة ({book.fileSize || "PDF"})</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
