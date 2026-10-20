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

const REMOTE_VERSION_URL = "https://athar-library.vercel.app/version.json";
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
      // 1. Fetch remote version configuration with 3s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(REMOTE_VERSION_URL, {
        signal: controller.signal,
        headers: { "Cache-Control": "no-cache" },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return { hasUpdate: false, installedVersion };
      }

      const remoteData: RemoteVersionInfo = await response.json();
      if (!remoteData || !remoteData.latestVersion) {
        return { hasUpdate: false, installedVersion };
      }

      // 2. Parse forceUpdate boolean safely
      const isForce =
        remoteData.forceUpdate === true ||
        (remoteData as any).forceUpdate === "true";

      const hasNewerVersion =
        this.compareVersions(remoteData.latestVersion, installedVersion) > 0;

      // 3. Auto-clear dismissal if user already updated
      if (!hasNewerVersion) {
        await this.clearDismissal();
        return { hasUpdate: false, installedVersion };
      }

      const isForceUpdateRequired =
        isForce &&
        this.compareVersions(
          remoteData.minimumVersion || "1.0.0",
          installedVersion
        ) > 0;

      // 4. Check if postponed recently (unless force update required)
      if (!isForceUpdateRequired) {
        const isPostponed = await this.isUpdatePostponed(
          remoteData.latestVersion
        );
        if (isPostponed) {
          return { hasUpdate: false, installedVersion };
        }
      }

      return {
        hasUpdate: true,
        installedVersion,
        updateInfo: {
          ...remoteData,
          forceUpdate: isForce,
        },
        isForceUpdateRequired,
      };
    } catch (e) {
      // Fail silently on network offline or error
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

  private static compareVersions(v1: string, v2: string): number {
    const p1 = (v1 || "1.0.0").split(".").map(Number);
    const p2 = (v2 || "1.0.0").split(".").map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const num1 = p1[i] || 0;
      const num2 = p2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  }
}
