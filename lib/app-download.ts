/**
 * ATHAR — أَثَر
 * Islamic Knowledge & Guidance Platform
 * Official App Download Configuration
 *
 * Copyright (c) 2026 Rabea Shaban.
 */

export interface DownloadSource {
  available: boolean;
  url: string;
  badgeText?: string;
  size?: string;
}

export interface AppDownloadConfig {
  appName: string;
  packageName: string;
  officialDownloadPageUrl: string;
  latestVersion: string;
  minimumVersion: string;
  releaseDate: string;
  minAndroidVersion: string;
  forceUpdate: boolean;
  releaseNotes: string;
  downloads: {
    directApk: DownloadSource;
    googlePlay: DownloadSource;
    apkPure: DownloadSource;
  };
}

export const APP_DOWNLOAD_CONFIG: AppDownloadConfig = {
  appName: "أَثَر — منصة المعرفة الإسلامية",
  packageName: "com.athar.islamic",
  officialDownloadPageUrl: "https://athar-library.vercel.app/download",
  latestVersion: "1.1.0",
  minimumVersion: "1.0.0",
  releaseDate: "أكتوبر 2026",
  minAndroidVersion: "Android 7.0 (API 24) أو أحدث",
  forceUpdate: false,
  releaseNotes:
    "يتضمن هذا الإصدار تحسينات جديدة على محرك الأذان الأصلي، وإصلاحات لمواقيت الصلاة، مع تحسين السرعة وإضافة مزايا جديدة بـ المكتبة الإسلامية.",
  downloads: {
    directApk: {
      available: false,
      url: "",
      badgeText: "تحميل مباشر APK",
      size: "~28 ميجابايت",
    },
    googlePlay: {
      available: false,
      url: "",
      badgeText: "Google Play",
    },
    apkPure: {
      available: false,
      url: "",
      badgeText: "APKPure",
    },
  },
};
