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
  sizeBytes?: number;
  fileName?: string;
}

export interface AppDownloadConfig {
  appName: string;
  packageName: string;
  officialDownloadPageUrl: string;
  downloadActionUrl: string;
  latestVersion: string;
  versionCode: number;
  platform: string;
  architecture: string;
  fileName: string;
  fileSizeBytes: number;
  fileSize: string;
  minimumVersion: string;
  releaseDate: string;
  releaseDateLabel: string;
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
  packageName: versionData.packageName,
  officialDownloadPageUrl: "https://athar-library.vercel.app/download",
  downloadActionUrl: "/api/download",
  latestVersion: versionData.latestVersion,
  versionCode: versionData.versionCode,
  platform: versionData.platform,
  architecture: versionData.architecture,
  fileName: versionData.downloads.directApk.fileName,
  fileSizeBytes: versionData.downloads.directApk.sizeBytes,
  fileSize: versionData.downloads.directApk.size,
  minimumVersion: versionData.minimumVersion,
  releaseDate: versionData.releaseDateLabel,
  releaseDateLabel: versionData.releaseDateLabel,
  minAndroidVersion: "Android 7.0 (API 24) أو أحدث",
  forceUpdate: versionData.forceUpdate,
  releaseNotes: versionData.releaseNotes,
  downloads: {
    directApk: {
      available: versionData.downloads?.directApk?.available ?? false,
      url: versionData.downloads?.directApk?.url ?? "",
      fileName: versionData.downloads?.directApk?.fileName,
      size: versionData.downloads?.directApk?.size,
      sizeBytes: versionData.downloads?.directApk?.sizeBytes,
      badgeText: "تحميل مباشر APK",
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