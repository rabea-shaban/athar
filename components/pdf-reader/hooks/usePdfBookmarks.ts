"use client";

import { useState, useEffect, useCallback } from "react";
import { BookmarkItem } from "../types";

export function usePdfBookmarks(slug: string) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    if (!slug) return;
    try {
      const stored = localStorage.getItem(`athar_bookmarks_${slug}`);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, [slug]);

  const addBookmark = useCallback(
    (page: number, title?: string) => {
      setBookmarks((prev) => {
        // Prevent duplicate bookmarks for the same page
        if (prev.some((b) => b.page === page)) return prev;

        const newBookmark: BookmarkItem = {
          id: Date.now().toString(),
          page,
          title: title || `علامة صفحة ${page}`,
          createdAt: new Date().toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        };
        const updated = [...prev, newBookmark].sort((a, b) => a.page - b.page);
        try {
          localStorage.setItem(`athar_bookmarks_${slug}`, JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });
    },
    [slug]
  );

  const removeBookmark = useCallback(
    (id: string) => {
      setBookmarks((prev) => {
        const updated = prev.filter((b) => b.id !== id);
        try {
          localStorage.setItem(`athar_bookmarks_${slug}`, JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });
    },
    [slug]
  );

  const isPageBookmarked = useCallback(
    (page: number) => {
      return bookmarks.some((b) => b.page === page);
    },
    [bookmarks]
  );

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isPageBookmarked,
  };
}
