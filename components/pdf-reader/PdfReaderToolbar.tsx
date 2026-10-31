"use client";

import React, { useState } from "react";
import {
  Bookmark,
  FileText,
  Library,
  Sun,
  Moon,
  Leaf,
  Printer,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { ReadingTheme } from "./types";
import { toArabicNumber } from "@/lib/utils";

interface PdfReaderToolbarProps {
  currentPage: number;
  totalPages: number;
  themeMode: ReadingTheme;
  isDistractionFree: boolean;
  notesCount: number;
  bookmarksCount: number;
  onPageStep: (delta: number) => void;
  onPageJump: (page: number) => void;
  onThemeChange: (theme: ReadingTheme) => void;
  onToggleDistractionFree: () => void;
  onOpenBookmarks: () => void;
  onOpenNotes: () => void;
  onOpenDossier: () => void;
  onPrint?: () => void;
}

export default function PdfReaderToolbar({
  currentPage,
  totalPages,
  themeMode,
  isDistractionFree,
  notesCount,
  bookmarksCount,
  onPageStep,
  onPageJump,
  onThemeChange,
  onToggleDistractionFree,
  onOpenBookmarks,
  onOpenNotes,
  onOpenDossier,
  onPrint,
}: PdfReaderToolbarProps) {
  const [jumpInput, setJumpInput] = useState("");
  const [showJumpBox, setShowJumpBox] = useState(false);

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageJump(pageNum);
      setShowJumpBox(false);
      setJumpInput("");
    }
  };

  return (
    <div
      className="bg-[#F8F6EF] dark:bg-[#0E1E17] border-b border-[#E8E3D8] dark:border-[#1E3A2C] px-3 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs font-arabic select-none transition-colors overflow-x-auto shrink-0"
      dir="rtl"
    >
      {/* Right Section: Quick Navigation & Page Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Previous page */}
        <button
          type="button"
          onClick={() => onPageStep(-1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-xl border border-[#E8E3D8] dark:border-[#1E3A2C] hover:bg-white dark:hover:bg-[#142920] text-[#202820] dark:text-[#F8F6EF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="الصفحة السابقة"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Page Indicator & Jump Box Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowJumpBox(!showJumpBox)}
            className="px-3 py-1 rounded-xl bg-white dark:bg-[#12251D] border border-[#E8E3D8] dark:border-[#1E3A2C] text-[#202820] dark:text-[#F8F6EF] font-semibold hover:border-[#064E35] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="انقر للانتقال المباشر لصفحة معينة"
          >
            <span>صفحة</span>
            <strong className="text-[#064E35] dark:text-[#10B981] font-bold">
              {toArabicNumber(currentPage)}
            </strong>
            <span className="text-[#77776D] dark:text-neutral-400">/ {toArabicNumber(totalPages)}</span>
          </button>

          {showJumpBox && (
            <form
              onSubmit={handleJumpSubmit}
              className="absolute top-full mt-1.5 right-0 z-50 bg-white dark:bg-[#12251D] border border-[#E8E3D8] dark:border-[#1E3A2C] p-2 rounded-2xl shadow-xl flex items-center gap-2 min-w-[170px]"
            >
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                placeholder="رقم الصفحة..."
                autoFocus
                className="w-24 px-2.5 py-1 text-xs rounded-xl border border-[#E8E3D8] dark:border-neutral-700 bg-background text-foreground text-center focus:outline-none focus:ring-1 focus:ring-[#064E35]"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-[#064E35] hover:bg-[#0B6245] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                انتقال
              </button>
            </form>
          )}
        </div>

        {/* Next page */}
        <button
          type="button"
          onClick={() => onPageStep(1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-xl border border-[#E8E3D8] dark:border-[#1E3A2C] hover:bg-white dark:hover:bg-[#142920] text-[#202820] dark:text-[#F8F6EF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="الصفحة التالية"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Center Section: Reading Theme Switcher (Spec: Ivory, Green, Dark) */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#E8E3D8]/50 dark:bg-[#12251D] border border-[#E8E3D8] dark:border-[#1E3A2C]">
        <button
          type="button"
          onClick={() => onThemeChange("ivory")}
          className={`px-2.5 py-1 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            themeMode === "ivory"
              ? "bg-[#FFFFFF] text-[#064E35] font-bold shadow-xs border border-[#E8E3D8]"
              : "text-[#77776D] hover:text-[#202820]"
          }`}
          title="الوضع الورقي العاجي (مريح للقراءة المطولة)"
        >
          <Sun className="w-3.5 h-3.5 text-[#C9A227]" />
          <span className="hidden sm:inline">ورقي عاجي</span>
        </button>

        <button
          type="button"
          onClick={() => onThemeChange("green")}
          className={`px-2.5 py-1 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            themeMode === "green"
              ? "bg-[#064E35] text-white font-bold shadow-xs"
              : "text-[#77776D] hover:text-[#202820]"
          }`}
          title="الوضع الزمردي التراثي"
        >
          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">زمردي هادئ</span>
        </button>

        <button
          type="button"
          onClick={() => onThemeChange("dark")}
          className={`px-2.5 py-1 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            themeMode === "dark"
              ? "bg-[#1E3A2C] text-[#F8F6EF] font-bold shadow-xs border border-[#2D5A44]"
              : "text-[#77776D] hover:text-[#F8F6EF]"
          }`}
          title="الوضع الليلي"
        >
          <Moon className="w-3.5 h-3.5 text-indigo-300" />
          <span className="hidden sm:inline">ليلي</span>
        </button>
      </div>

      {/* Left Section: Reading Tools (Bookmarks, Notes, Dossier, Distraction-Free, Print) */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Bookmarks Drawer Trigger */}
        <button
          type="button"
          onClick={onOpenBookmarks}
          className="px-3 py-1.5 rounded-xl border border-[#E8E3D8] dark:border-[#1E3A2C] hover:bg-white dark:hover:bg-[#142920] text-[#202820] dark:text-[#F8F6EF] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          title="العلامات المرجعية المحفوظة"
        >
          <Bookmark className="w-3.5 h-3.5 text-[#C9A227]" />
          <span className="hidden md:inline">العلامات المرجعية</span>
          {bookmarksCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#C9A227]/20 text-[#C9A227] font-mono text-[10px] font-bold">
              {toArabicNumber(bookmarksCount)}
            </span>
          )}
        </button>

        {/* Notes Drawer Trigger */}
        <button
          type="button"
          onClick={onOpenNotes}
          className="px-3 py-1.5 rounded-xl border border-[#E8E3D8] dark:border-[#1E3A2C] hover:bg-white dark:hover:bg-[#142920] text-[#202820] dark:text-[#F8F6EF] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          title="كناشة الفوائد والتحقيقات"
        >
          <FileText className="w-3.5 h-3.5 text-[#064E35] dark:text-[#10B981]" />
          <span className="hidden md:inline">كناشة الفوائد</span>
          {notesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[#064E35] dark:text-emerald-300 font-mono text-[10px] font-bold">
              {toArabicNumber(notesCount)}
            </span>
          )}
        </button>

        {/* Academic Dossier Drawer Trigger */}
        <button
          type="button"
          onClick={onOpenDossier}
          className="px-3 py-1.5 rounded-xl border border-[#E8E3D8] dark:border-[#1E3A2C] hover:bg-white dark:hover:bg-[#142920] text-[#202820] dark:text-[#F8F6EF] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          title="البطاقة والتوثيق الأكاديمي"
        >
          <Library className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden lg:inline">التوثيق الأكاديمي</span>
        </button>

        {/* Distraction-Free Toggle */}
        <button
          type="button"
          onClick={onToggleDistractionFree}
          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
            isDistractionFree
              ? "bg-[#064E35] text-white border-[#064E35]"
              : "border-[#E8E3D8] dark:border-[#1E3A2C] hover:bg-white dark:hover:bg-[#142920] text-[#202820] dark:text-[#F8F6EF]"
          }`}
          title={isDistractionFree ? "إظهار كافة الأدوات" : "وضع التركيز (إخفاء المشتتات)"}
        >
          {isDistractionFree ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Print Option */}
        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            className="p-1.5 rounded-xl border border-[#E8E3D8] dark:border-[#1E3A2C] hover:bg-white dark:hover:bg-[#142920] text-[#202820] dark:text-[#F8F6EF] transition-colors cursor-pointer hidden sm:inline-flex"
            title="طباعة الصفحة أو المستند"
          >
            <Printer className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
