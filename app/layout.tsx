import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GlobalAudioPlayer from "@/components/audio/GlobalAudioPlayer";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "أَثَر | ATHAR — منصة المعرفة الإسلامية",
  description: "منصة إسلامية تجمع القرآن الكريم والتفسير والأذكار والحديث والمكتبة الإسلامية في مكان واحد. نحفظ العلم، وننشر أثره.",
  keywords: ["قرآن", "إسلام", "أذكار", "حديث", "تفسير", "مكتبة إسلامية"],
  openGraph: {
    title: "أَثَر | منصة المعرفة الإسلامية",
    description: "نحفظ العلم، وننشر أثره.",
    locale: "ar_EG",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Amiri+Quran&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geist.variable} min-h-screen flex flex-col`} suppressHydrationWarning>
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
        <Footer />
        <GlobalAudioPlayer />
      </body>
    </html>
  );
}
