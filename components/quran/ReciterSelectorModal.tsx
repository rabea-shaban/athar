"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Check,
  Headphones,
  User,
  Sparkles,
  X,
} from "lucide-react";
import { QURAN_RECITERS, type QuranReciter } from "@/lib/api/islamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ReciterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReciter: QuranReciter;
  onSelectReciter: (reciter: QuranReciter) => void;
}

const STYLE_BADGES: Record<string, { bg: string; text: string }> = {
  مرتل: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    text: "مرتل",
  },
  مجود: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
    text: "مجود",
  },
  معلم: {
    bg: "bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30",
    text: "معلم",
  },
};

export default function ReciterSelectorModal({
  isOpen,
  onClose,
  selectedReciter,
  onSelectReciter,
}: ReciterSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [styleFilter, setStyleFilter] = useState<"ALL" | "مرتل" | "مجود" | "معلم">("ALL");

  const filteredReciters = useMemo(() => {
    return QURAN_RECITERS.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const matchStyle = styleFilter === "ALL" || r.style === styleFilter;
      return matchSearch && matchStyle;
    });
  }, [searchQuery, styleFilter]);

  if (!isOpen) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--athar-green)]/15 text-[var(--athar-green)] flex items-center justify-center">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground font-arabic">
                اختر القارئ
              </h3>
              <p className="text-xs text-muted-foreground">
                حدد الشيخ المفضل للاستماع للتلاوة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search & Style Filter */}
        <div className="p-4 border-b border-border/40 space-y-3 bg-card">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم القارئ (مثل: المنشاوي، الحصري، عبد الباسط...)"
              className="pr-9 h-10 rounded-xl bg-background text-xs sm:text-sm"
              dir="rtl"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setStyleFilter("ALL")}
              className={cn(
                "text-xs px-2.5 py-1 rounded-lg border transition-all font-medium",
                styleFilter === "ALL"
                  ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)]"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/60"
              )}
            >
              جميع القراء ({QURAN_RECITERS.length})
            </button>
            {(["مرتل", "مجود", "معلم"] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setStyleFilter(style)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-lg border transition-all font-medium",
                  styleFilter === style
                    ? "bg-[var(--athar-green)] text-white border-[var(--athar-green)]"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/60"
                )}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Reciters List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-border/20">
          {filteredReciters.map((reciter) => {
            const isSelected = selectedReciter.identifier === reciter.identifier;
            const badge = STYLE_BADGES[reciter.style];

            return (
              <div
                key={reciter.identifier}
                onClick={() => {
                  onSelectReciter(reciter);
                  onClose();
                }}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border",
                  isSelected
                    ? "bg-[var(--athar-green)]/10 border-[var(--athar-green)]/50 shadow-xs"
                    : "border-transparent hover:bg-muted/60 hover:border-border/60"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? "bg-[var(--athar-green)] text-white"
                        : "bg-muted text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    <User className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 text-right">
                    <h4
                      className={cn(
                        "text-sm font-bold truncate font-arabic",
                        isSelected
                          ? "text-[var(--athar-green)]"
                          : "text-foreground"
                      )}
                    >
                      {reciter.name}
                    </h4>
                    <span
                      className={cn(
                        "inline-block text-[10px] px-2 py-0.2 rounded-full border mt-0.5",
                        badge?.bg || "bg-muted text-muted-foreground"
                      )}
                    >
                      {reciter.style}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-[var(--athar-green)] text-white flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-muted-foreground group-hover:text-foreground h-8"
                  >
                    اختيار
                  </Button>
                )}
              </div>
            );
          })}

          {filteredReciters.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-sm">لم يتم العثور على قارئ مطابق للبحث</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
