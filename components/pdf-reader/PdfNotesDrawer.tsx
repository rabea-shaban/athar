"use client";

import React, { useState } from "react";
import { X, FileText, Plus, Trash2, Copy, Check } from "lucide-react";
import { NoteItem } from "./types";
import { toArabicNumber } from "@/lib/utils";

interface PdfNotesDrawerProps {
  isOpen: boolean;
  bookTitle: string;
  currentPage: number;
  notes: NoteItem[];
  onClose: () => void;
  onAddNote: (text: string, page?: number) => void;
  onDeleteNote: (id: string) => void;
  onJumpToPage?: (page: number) => void;
}

export default function PdfNotesDrawer({
  isOpen,
  bookTitle,
  currentPage,
  notes,
  onClose,
  onAddNote,
  onDeleteNote,
  onJumpToPage,
}: PdfNotesDrawerProps) {
  const [noteText, setNoteText] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    onAddNote(noteText, currentPage);
    setNoteText("");
  };

  const handleCopyAll = () => {
    if (notes.length === 0) return;
    const formatted = notes
      .map((n) => `[صفحة ${toArabicNumber(n.page || 1)}]: ${n.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(
      `كناشة فوائد واستنباطات من كتاب: ${bookTitle}\n\n${formatted}`
    );
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySingle = (note: NoteItem) => {
    navigator.clipboard.writeText(
      `[${bookTitle} - صفحة ${note.page || 1}]: ${note.text}`
    );
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
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
        {/* Drawer Header */}
        <div className="p-4 bg-[#F8F6EF] dark:bg-[#0A1510] border-b border-[#E8E3D8] dark:border-[#1E3A2C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-[#064E35] dark:text-[#10B981] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#064E35] dark:text-[#C9A227]">
                كناشة الفوائد والتحقيقات
              </h3>
              <p className="text-[11px] text-[#77776D] dark:text-neutral-400">
                تدوين الخواطر والشواهد العلمية أثناء المطالعة
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

        {/* Add Note Form */}
        <div className="p-4 bg-white dark:bg-[#12251D] border-b border-[#E8E3D8] dark:border-[#1E3A2C]">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#77776D] dark:text-neutral-300">
                الموضع المقترن بالفائدة:
              </span>
              <strong className="text-[#064E35] dark:text-[#10B981] font-bold">
                صفحة {toArabicNumber(currentPage)}
              </strong>
            </div>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="اكتب الفائدة، الشاهد العلمي، أو الاستنباط هنا..."
              className="w-full p-2.5 text-xs rounded-xl border border-[#E8E3D8] dark:border-neutral-700 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#064E35] resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between pt-1">
              <button
                type="submit"
                disabled={!noteText.trim()}
                className="px-4 py-1.5 rounded-xl bg-[#064E35] hover:bg-[#0B6245] text-white font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تقييد الفائدة</span>
              </button>

              {notes.length > 0 && (
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="px-3 py-1.5 rounded-xl border border-[#E8E3D8] dark:border-[#1E3A2C] text-[#77776D] dark:text-neutral-300 hover:text-foreground text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  title="نسخ جميع الفوائد إلى الحافظة"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? "تم النسخ" : "نسخ الكناشة"}</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-12 text-[#77776D] dark:text-neutral-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-[#064E35]/40" />
              <p className="text-xs">لم تقيّد أي فوائد في هذا الكتاب بعد.</p>
              <p className="text-[11px] text-muted-foreground">
                «العلم صيدٌ والكتابة قيدُه .. قَيِّد صيودك بالحبال الواثقة»
              </p>
            </div>
          ) : (
            notes.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-2xl bg-[#F8F6EF] dark:bg-[#142920] border border-[#E8E3D8] dark:border-[#1E3A2C] space-y-2 group"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => n.page && onJumpToPage && onJumpToPage(n.page)}
                    className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-[#064E35] dark:text-emerald-300 font-bold font-mono hover:underline cursor-pointer"
                  >
                    صفحة {toArabicNumber(n.page || 1)}
                  </button>
                  <span className="text-[#77776D] dark:text-neutral-400 text-[10px]">
                    {n.createdAt}
                  </span>
                </div>

                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {n.text}
                </p>

                <div className="flex items-center justify-end gap-1 pt-1 border-t border-[#E8E3D8]/60 dark:border-[#1E3A2C]/60">
                  <button
                    type="button"
                    onClick={() => handleCopySingle(n)}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#1B362A] text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                    title="نسخ هذه الفائدة"
                  >
                    {copiedId === n.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === n.id ? "تم النسخ" : "نسخ"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteNote(n.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                    title="حذف الفائدة"
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
