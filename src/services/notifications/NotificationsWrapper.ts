import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

export const isRunningInExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  Constants.appOwnership === "expo";

let ExpoNotifications: any = null;

// Only import native expo-notifications if NOT running in Android Expo Go
// (because Expo SDK 53+ throws a fatal error in Android Expo Go on import)
if (!(Platform.OS === "android" && isRunningInExpoGo)) {
  try {
    ExpoNotifications = require("expo-notifications");
  } catch (e) {
    console.warn("Could not require expo-notifications:", e);
  }
}

export const SchedulableTriggerInputTypes =
  ExpoNotifications?.SchedulableTriggerInputTypes || {
    DATE: "date",
    TIME_INTERVAL: "timeInterval",
    DAILY: "daily",
    WEEKLY: "weekly",
    MONTHLY: "monthly",
    YEARLY: "yearly",
    CALENDAR: "calendar",
  };

export const AndroidImportance =
  ExpoNotifications?.AndroidImportance || {
    UNKNOWN: 0,
    UNSPECIFIED: 1,
    NONE: 2,
    MIN: 3,
    LOW: 4,
    DEFAULT: 5,
    HIGH: 6,
    MAX: 7,
  };

export const NotificationsWrapper = {
  setNotificationHandler: (handler: any) => {
    if (ExpoNotifications?.setNotificationHandler) {
      try {
        ExpoNotifications.setNotificationHandler(handler);
      } catch (e) {
        console.warn("setNotificationHandler error:", e);
      }
    }
  },

  setNotificationChannelAsync: async (channelId: string, channel: any) => {
    if (ExpoNotifications?.setNotificationChannelAsync) {
      try {
        return await ExpoNotifications.setNotificationChannelAsync(
          channelId,
          channel
        );
      } catch (e) {
        console.warn("setNotificationChannelAsync error:", e);
      }
    }
    return null;
  },

  getPermissionsAsync: async () => {
    if (ExpoNotifications?.getPermissionsAsync) {
      try {
        return await ExpoNotifications.getPermissionsAsync();
      } catch (e) {
        console.warn("getPermissionsAsync error:", e);
      }
    }
    return { status: "granted", granted: true };
  },

  requestPermissionsAsync: async () => {
    if (ExpoNotifications?.requestPermissionsAsync) {
      try {
        return await ExpoNotifications.requestPermissionsAsync();
      } catch (e) {
        console.warn("requestPermissionsAsync error:", e);
      }
    }
    return { status: "granted", granted: true };
  },

  cancelAllScheduledNotificationsAsync: async () => {
    if (ExpoNotifications?.cancelAllScheduledNotificationsAsync) {
      try {
        return await ExpoNotifications.cancelAllScheduledNotificationsAsync();
      } catch (e) {
        console.warn("cancelAllScheduledNotificationsAsync error:", e);
      }
    }
  },

  scheduleNotificationAsync: async (request: any) => {
    if (ExpoNotifications?.scheduleNotificationAsync) {
      try {
        return await ExpoNotifications.scheduleNotificationAsync(request);
      } catch (e) {
        console.warn("scheduleNotificationAsync error:", e);
      }
    }
    console.log("[Notification Scheduled]", request.content?.title);
    return "mock-notification-id";
  },

  addNotificationResponseReceivedListener: (listener: any) => {
    if (ExpoNotifications?.addNotificationResponseReceivedListener) {
      try {
        return ExpoNotifications.addNotificationResponseReceivedListener(
          listener
        );
      } catch (e) {
        console.warn("addNotificationResponseReceivedListener error:", e);
      }
    }
    return { remove: () => {} };
  },
};
