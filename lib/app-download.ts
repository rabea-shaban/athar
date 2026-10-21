/**
 * ATHAR — أَثَر
 * Islamic Knowledge & Guidance Platform
 * Official App Download Configuration
 *
 * Copyright (c) 2026 Rabea Shaban.
 */

import versionData from "@/public/version.json";

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
  latestVersion: versionData.latestVersion,
  minimumVersion: versionData.minimumVersion,
  releaseDate: "أكتوبر 2026",
  minAndroidVersion: "Android 7.0 (API 24) أو أحدث",
  forceUpdate: versionData.forceUpdate,
  releaseNotes: versionData.releaseNotes,
  downloads: {
    directApk: {
      available: versionData.downloads?.directApk?.available ?? false,
      url: versionData.downloads?.directApk?.url ?? "",
      badgeText: "تحميل مباشر APK",
      size: versionData.downloads?.directApk?.size ?? "~28 ميجابايت",
    },
    googlePlay: {
      available: versionData.downloads?.googlePlay?.available ?? false,
      url: versionData.downloads?.googlePlay?.url ?? "",
      badgeText: "Google Play",
    },
    apkPure: {
      available: versionData.downloads?.apkPure?.available ?? false,
      url: versionData.downloads?.apkPure?.url ?? "",
      badgeText: "APKPure",
    },
  },
};
