"use client";

import { useState, useEffect, useCallback } from "react";
import { ReadingProgressData } from "../types";

export function useReadingProgress(slug: string, initialTotalPages: number = 100) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Load saved progress from localStorage
  useEffect(() => {
    if (!slug) return;
    try {
      const stored = localStorage.getItem("athar_book_progress");
      if (stored) {
        const parsed: Record<string, ReadingProgressData> = JSON.parse(stored);
        if (parsed[slug]) {
          setCurrentPage(parsed[slug].currentPage || 1);
          if (parsed[slug].totalPages) {
            setTotalPages(parsed[slug].totalPages);
          }
        }
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setHasLoaded(true);
    }
  }, [slug]);

  // Save progress handler
  const saveProgress = useCallback(
    (pageToSave: number, newTotalPages?: number) => {
      const targetTotal = newTotalPages || totalPages;
      const validPage = Math.max(1, Math.min(targetTotal, pageToSave));
      setCurrentPage(validPage);
      if (newTotalPages && newTotalPages > 0) {
        setTotalPages(newTotalPages);
      }

      try {
        const stored = localStorage.getItem("athar_book_progress");
        const parsed: Record<string, ReadingProgressData> = stored ? JSON.parse(stored) : {};
        parsed[slug] = {
          currentPage: validPage,
          totalPages: targetTotal,
          percentage: Math.min(100, Math.max(1, Math.round((validPage / targetTotal) * 100))),
          lastReadAt: new Date().toISOString(),
        };
        localStorage.setItem("athar_book_progress", JSON.stringify(parsed));
      } catch {
        // Ignore
      }
    },
    [slug, totalPages]
  );

  const percentage = Math.min(100, Math.max(1, Math.round((currentPage / (totalPages || 1)) * 100)));

  return {
    currentPage,
    totalPages,
    percentage,
    hasLoaded,
    saveProgress,
    setCurrentPage,
    setTotalPages,
  };
}
