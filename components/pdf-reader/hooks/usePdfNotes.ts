"use client";

import { useState, useEffect, useCallback } from "react";
import { NoteItem } from "../types";

export function usePdfNotes(slug: string) {
  const [notes, setNotes] = useState<NoteItem[]>([]);

  useEffect(() => {
    if (!slug) return;
    try {
      const stored = localStorage.getItem(`athar_notes_${slug}`);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, [slug]);

  const addNote = useCallback(
    (text: string, page?: number) => {
      if (!text.trim()) return;
      const newNote: NoteItem = {
        id: Date.now().toString(),
        page,
        text: text.trim(),
        createdAt: new Date().toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      };
      setNotes((prev) => {
        const updated = [newNote, ...prev];
        try {
          localStorage.setItem(`athar_notes_${slug}`, JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });
    },
    [slug]
  );

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        try {
          localStorage.setItem(`athar_notes_${slug}`, JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });
    },
    [slug]
  );

  return {
    notes,
    addNote,
    deleteNote,
  };
}
