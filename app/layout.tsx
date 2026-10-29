import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GlobalAudioPlayer from "@/components/audio/GlobalAudioPlayer";

export const metadata: Metadata = {
  metadataBase: new URL("https://athar-library.vercel.app"),
  title: "أَثَر | ATHAR — منصة المعرفة الإسلامية",
  description: "منصة إسلامية شاملة تجمع القرآن الكريم والتفسير والأذكار والحديث الشريف والمكتبة الإسلامية في مكان واحد. نحفظ العلم، وننشر أثره.",
  keywords: ["قرآن", "إسلام", "أذكار", "حديث", "تفسير", "مكتبة إسلامية", "أثر", "Athar"],
  authors: [{ name: "Rabea Shaban", url: "https://www.rabea-shaban.com" }],
  creator: "Rabea Shaban",
  publisher: "أَثَر",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "أَثَر | منصة المعرفة الإسلامية",
    description: "منصة إسلامية شاملة لحفظ ونشر العلم الشرعي والتراث الإسلامي الأصيل — نحفظ العلم، وننشر أثره.",
    url: "https://athar-library.vercel.app",
    siteName: "أَثَر — ATHAR",
    locale: "ar_EG",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "منصة أَثَر الإسلامية",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "أَثَر | منصة المعرفة الإسلامية",
    description: "منصة إسلامية شاملة لحفظ ونشر العلم الشرعي والتراث الإسلامي الأصيل — نحفظ العلم، وننشر أثره.",
    images: ["/og-image.png"],
    creator: "@rabeashaban",
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
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
        <Footer />
        <GlobalAudioPlayer />
      </body>
    </html>
  );
}
