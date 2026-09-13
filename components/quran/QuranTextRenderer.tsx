"use client";

import React from "react";
import { isDivineWord } from "@/lib/utils";

export function toArabicNumerals(num: number | string): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num).replace(/[0-9]/g, (d) => arabicDigits[Number(d)]);
}

interface Props {
  text: string;
  ayahNumber?: number;
}

export default function QuranTextRenderer({ text, ayahNumber }: Props) {
  const words = text.split(" ");

  return (
    <>
      {words.map((word, idx) => {
        const isDivine = isDivineWord(word);
        return (
          <React.Fragment key={idx}>
            {isDivine ? (
              <span className="text-red-600 dark:text-red-400 font-semibold">{word}</span>
            ) : (
              word
            )}
            {idx < words.length - 1 ? " " : ""}
          </React.Fragment>
        );
      })}
      {ayahNumber !== undefined && (
        <span className="text-emerald-700 dark:text-emerald-400 font-arabic font-normal mx-1 select-none whitespace-nowrap inline">
          {"\u200F"}﴿{toArabicNumerals(ayahNumber)}﴾
        </span>
      )}
    </>
  );
}
