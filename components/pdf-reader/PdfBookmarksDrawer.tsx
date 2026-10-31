"use client";

import React, { useState } from "react";
import { X, Bookmark, Plus, Trash2, ArrowLeft } from "lucide-react";
import { BookmarkItem } from "./types";
import { toArabicNumber } from "@/lib/utils";

interface PdfBookmarksDrawerProps {
  isOpen: boolean;
  currentPage: number;
  bookmarks: BookmarkItem[];
  onClose: () => void;
  onAddBookmark: (page: number, title?: string) => void;
  onRemoveBookmark: (id: string) => void;
  onJumpToPage: (page: number) => void;
}

export default function PdfBookmarksDrawer({
  isOpen,
  currentPage,
  bookmarks,
  onClose,
  onAddBookmark,
  onRemoveBookmark,
  onJumpToPage,
}: PdfBookmarksDrawerProps) {
  const [customTitle, setCustomTitle] = useState("");

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBookmark(currentPage, customTitle.trim() || undefined);
    setCustomTitle("");
  };

  const isCurrentBookmarked = bookmarks.some((b) => b.page === currentPage);

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
        {/* Drawer Header */}
        <div className="p-4 bg-[#F8F6EF] dark:bg-[#0A1510] border-b border-[#E8E3D8] dark:border-[#1E3A2C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#C9A227]/20 text-[#C9A227] flex items-center justify-center">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#064E35] dark:text-[#C9A227]">
                العلامات المرجعية المحفوظة
              </h3>
              <p className="text-[11px] text-[#77776D] dark:text-neutral-400">
                حفظ وإدارة المواضع الهامة في هذا الكتاب
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

        {/* Add Current Page Bookmark Form */}
        <div className="p-4 bg-white dark:bg-[#12251D] border-b border-[#E8E3D8] dark:border-[#1E3A2C]">
          <form onSubmit={handleAdd} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#77776D] dark:text-neutral-300">موضعك الحالي:</span>
              <strong className="text-[#064E35] dark:text-[#10B981] font-bold">
                صفحة {toArabicNumber(currentPage)}
              </strong>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="عنوان أو وصف للموضع (اختياري)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#E8E3D8] dark:border-neutral-700 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#064E35]"
              />
              <button
                type="submit"
                disabled={isCurrentBookmarked}
                className="px-3 py-1.5 rounded-xl bg-[#064E35] hover:bg-[#0B6245] text-white font-bold text-xs transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isCurrentBookmarked ? "محفوظة" : "حفظ"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12 text-[#77776D] dark:text-neutral-400 space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-[#C9A227]/40" />
              <p className="text-xs">لم تقم بإضافة علامات مرجعية في هذا الكتاب بعد.</p>
              <p className="text-[11px] text-muted-foreground">
                احفظ أي صفحة للرجوع إليها بضغطة زر.
              </p>
            </div>
          ) : (
            bookmarks.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-2xl bg-[#F8F6EF] dark:bg-[#142920] border border-[#E8E3D8] dark:border-[#1E3A2C] flex items-center justify-between gap-3 hover:border-[#C9A227] transition-all group"
              >
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    onJumpToPage(b.page);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-2 py-0.5 rounded-lg bg-[#C9A227]/20 text-[#C9A227] text-[11px] font-bold font-mono">
                      صفحة {toArabicNumber(b.page)}
                    </span>
                    <span className="text-[10px] text-[#77776D] dark:text-neutral-400">
                      {b.createdAt}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-foreground truncate">
                    {b.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onJumpToPage(b.page);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#1B362A] text-[#064E35] dark:text-[#10B981] transition-colors cursor-pointer"
                    title="انتقال إلى هذه الصفحة"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveBookmark(b.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                    title="حذف العلامة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
