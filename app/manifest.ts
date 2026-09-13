import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "أَثَر — منصة المعرفة الإسلامية",
    short_name: "أَثَر",
    description: "منصة إسلامية تجمع القرآن الكريم والتفسير والأذكار والحديث والمكتبة الإسلامية في مكان واحد.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#1a5d44",
    dir: "rtl",
    lang: "ar",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192 512x512",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
