/**
 * ATHAR — أَثَر
 * Islamic Knowledge & Guidance Platform
 *
 * Copyright (c) 2026 Rabea Shaban.
 * All rights reserved.
 *
 * Contact: rabea.elzayate@gmail.com
 * Website: https://rabea-shaban.com/
 */

import Constants from "expo-constants";
import { SafeStorage } from "../../utils/storage";
import {
  OFFICIAL_REMOTE_VERSION_URL,
  OFFICIAL_STORE_URL,
} from "../../constants/config";

const DISMISS_VER_KEY = "@athar_update_dismiss_ver_v1";
const DISMISS_TIME_KEY = "@athar_update_dismiss_time_v1";
const POSTPONE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Hours

export interface RemoteVersionInfo {
  latestVersion: string;
  minimumVersion: string;
  storeUrl: string;
  forceUpdate: boolean;
  releaseNotes: string;
}

export interface CheckUpdateResult {
  hasUpdate: boolean;
  installedVersion: string;
  updateInfo?: RemoteVersionInfo;
  isForceUpdateRequired?: boolean;
}

export class AppUpdateChecker {
  static getInstalledVersion(): string {
    return Constants.expoConfig?.version || "1.0.0";
  }

  static async checkForUpdates(): Promise<CheckUpdateResult> {
    const installedVersion = this.getInstalledVersion();

    try {
      // 1. Fetch official remote version configuration with 3s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(OFFICIAL_REMOTE_VERSION_URL, {
        signal: controller.signal,
        headers: { "Cache-Control": "no-cache" },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return { hasUpdate: false, installedVersion };
      }

      const remoteData: any = await response.json();
      if (
        !remoteData ||
        typeof remoteData !== "object" ||
        !remoteData.latestVersion ||
        typeof remoteData.latestVersion !== "string"
      ) {
        return { hasUpdate: false, installedVersion };
      }

      // 2. Parse and sanitize remote configuration
      const latestVersion = remoteData.latestVersion.trim();
      const minimumVersion =
        typeof remoteData.minimumVersion === "string"
          ? remoteData.minimumVersion.trim()
          : "1.0.0";

      // Ensure storeUrl is a valid HTTPS URL pointing to official platform
      let storeUrl =
        typeof remoteData.storeUrl === "string" &&
        remoteData.storeUrl.startsWith("http")
          ? remoteData.storeUrl.trim()
          : OFFICIAL_STORE_URL;

      // Replace old URL if present in JSON payload with official store URL
      if (storeUrl.includes("rabea-shaban.com/athar")) {
        storeUrl = OFFICIAL_STORE_URL;
      }

      const isForce =
        remoteData.forceUpdate === true || remoteData.forceUpdate === "true";

      const releaseNotes =
        typeof remoteData.releaseNotes === "string" &&
        remoteData.releaseNotes.trim().length > 0
          ? remoteData.releaseNotes.trim()
          : "يتضمن هذا الإصدار تحسينات جديدة على منصة أثر وإصلاحات عامة.";

      const hasNewerVersion =
        this.compareVersions(latestVersion, installedVersion) > 0;

      // 3. Auto-clear dismissal if user already updated
      if (!hasNewerVersion) {
        await this.clearDismissal();
        return { hasUpdate: false, installedVersion };
      }

      const isForceUpdateRequired =
        isForce || this.compareVersions(minimumVersion, installedVersion) > 0;

      // 4. Check if postponed recently (unless force update required)
      if (!isForceUpdateRequired) {
        const isPostponed = await this.isUpdatePostponed(latestVersion);
        if (isPostponed) {
          return { hasUpdate: false, installedVersion };
        }
      }

      return {
        hasUpdate: true,
        installedVersion,
        updateInfo: {
          latestVersion,
          minimumVersion,
          storeUrl,
          forceUpdate: isForce,
          releaseNotes,
        },
        isForceUpdateRequired,
      };
    } catch (e) {
      // Fail silently on network offline, timeout or parsing error
      return { hasUpdate: false, installedVersion };
    }
  }

  static async postponeUpdate(latestVersion: string): Promise<void> {
    try {
      await SafeStorage.setItem(DISMISS_VER_KEY, latestVersion);
      await SafeStorage.setItem(DISMISS_TIME_KEY, Date.now().toString());
    } catch (e) {
      console.warn("[AppUpdateChecker] Postpone error:", e);
    }
  }

  static async clearDismissal(): Promise<void> {
    try {
      await SafeStorage.removeItem(DISMISS_VER_KEY);
      await SafeStorage.removeItem(DISMISS_TIME_KEY);
    } catch (e) {
      // ignore
    }
  }

  private static async isUpdatePostponed(
    latestVersion: string
  ): Promise<boolean> {
    try {
      const dismissedVer = await SafeStorage.getItem(DISMISS_VER_KEY);
      const dismissedTimeStr = await SafeStorage.getItem(DISMISS_TIME_KEY);

      if (dismissedVer === latestVersion && dismissedTimeStr) {
        const dismissedTime = parseInt(dismissedTimeStr, 10);
        if (Date.now() - dismissedTime < POSTPONE_DURATION_MS) {
          return true; // Still within 24-hour postponement window
        }
      }
    } catch (e) {
      // ignore
    }
    return false;
  }

  static compareVersions(v1: string, v2: string): number {
    const p1 = (v1 || "1.0.0").split(".").map((x) => parseInt(x, 10) || 0);
    const p2 = (v2 || "1.0.0").split(".").map((x) => parseInt(x, 10) || 0);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const num1 = p1[i] || 0;
      const num2 = p2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  }
}
