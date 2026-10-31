import { Book } from "@/data/books";

export type ReaderBook = Book;

export interface BookmarkItem {
  id: string;
  page: number;
  title: string;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  page?: number;
  text: string;
  createdAt: string;
}

export interface ReadingProgressData {
  currentPage: number;
  totalPages: number;
  percentage: number;
  lastReadAt: string;
}

export type ReadingTheme = "ivory" | "green" | "dark";
