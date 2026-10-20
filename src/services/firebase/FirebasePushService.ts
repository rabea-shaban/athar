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

import { Platform } from "react-native";
import Constants from "expo-constants";
import { NotificationsWrapper } from "../notifications/NotificationsWrapper";
import { SafeStorage } from "../../utils/storage";
import { DeviceTokenRecord, FcmNotificationPayloadData } from "../../types/fcm";

const TOKEN_STORAGE_KEY = "@athar_fcm_token_v1";

export class FirebasePushService {
  private static cachedToken: string | null = null;
  private static isListenerActive = false;

  static async registerForPushNotificationsAsync(): Promise<string | null> {
    try {
      const { status: existingStatus } =
        await NotificationsWrapper.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await NotificationsWrapper.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("[FirebasePush] Push notification permission denied.");
        return null;
      }

      // Retrieve Expo / FCM push token
      let token = "";
      if (NotificationsWrapper.getExpoPushTokenAsync) {
        try {
          const projectId =
            Constants.expoConfig?.extra?.eas?.projectId ||
            "fca183d7-785a-4fed-8910-4f4ec0b26049";
          const tokenData = await NotificationsWrapper.getExpoPushTokenAsync({
            projectId,
          });
          token = tokenData?.data || "";
        } catch (e) {
          console.warn("[FirebasePush] Expo push token fallback error:", e);
        }
      }

      if (!token && NotificationsWrapper.getDevicePushTokenAsync) {
        try {
          const deviceToken = await NotificationsWrapper.getDevicePushTokenAsync();
          token = typeof deviceToken === "string" ? deviceToken : deviceToken?.data || "";
        } catch (e) {
          console.warn("[FirebasePush] Device push token error:", e);
        }
      }

      if (token) {
        this.cachedToken = token;
        await SafeStorage.setItem(TOKEN_STORAGE_KEY, token);

        // Record device token payload for backend registration
        const record: DeviceTokenRecord = {
          tokenId: token.replace(/[^a-zA-Z0-9_-]/g, "_").slice(-64),
          token,
          platform: Platform.OS as "android" | "ios",
          appVersion: Constants.expoConfig?.version || "1.0.0",
          enabled: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        console.log("[FirebasePush] Registered Push Token:", token.slice(0, 20) + "...");
      }

      return token || null;
    } catch (e) {
      console.warn("[FirebasePush] Registration error:", e);
      return null;
    }
  }

  static async getStoredToken(): Promise<string | null> {
    if (this.cachedToken) return this.cachedToken;
    return await SafeStorage.getItem(TOKEN_STORAGE_KEY);
  }

  static handleNotificationPayload(data: any, navigationRef: any): void {
    if (!data || !navigationRef?.current) return;

    console.log("[FirebasePush] Handling Notification Payload:", data.type);

    if (data.type === "app_update") {
      navigationRef.current.navigate("UpdateApp", {
        version: data.version,
        minimumVersion: data.minimumVersion,
        storeUrl: data.storeUrl,
        forceUpdate: data.forceUpdate,
        releaseNotes: data.releaseNotes,
      });
    } else if (data.type === "salawat") {
      navigationRef.current.navigate("MainTabs", {
        screen: "AdhkarTab",
      });
    } else if (data.type === "prayer_adhan" || data.type === "prayer_before") {
      navigationRef.current.navigate("PrayerTimes");
    } else if (data.type === "announcement" || data.type === "islamic_content") {
      if (data.targetRoute) {
        navigationRef.current.navigate(data.targetRoute);
      }
    }
  }

  static async checkInitialNotificationResponse(navigationRef: any): Promise<void> {
    try {
      const response = await NotificationsWrapper.getLastNotificationResponseAsync();
      if (response?.notification?.request?.content?.data) {
        const data = response.notification.request.content.data;
        this.handleNotificationPayload(data, navigationRef);
      }
    } catch (e) {
      console.warn("[FirebasePush] Error checking initial notification response:", e);
    }
  }

  static setupNotificationResponseHandler(navigationRef: any): { remove: () => void } {
    if (this.isListenerActive) {
      return { remove: () => {} };
    }
    this.isListenerActive = true;

    // Check cold start initial notification tap
    this.checkInitialNotificationResponse(navigationRef);

    try {
      const subscription = NotificationsWrapper.addNotificationResponseReceivedListener(
        (response: any) => {
          const data = response?.notification?.request?.content?.data;
          this.handleNotificationPayload(data, navigationRef);
        }
      );

      return {
        remove: () => {
          this.isListenerActive = false;
          if (subscription && typeof subscription.remove === "function") {
            subscription.remove();
          }
        },
      };
    } catch (e) {
      this.isListenerActive = false;
      console.warn("[FirebasePush] Response handler setup error:", e);
      return { remove: () => {} };
    }
  }
}
