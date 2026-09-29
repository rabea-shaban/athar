import { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { NotificationService } from "../services/notifications/NotificationService";
import { useSettingsStore } from "../store/settingsStore";

export function useNotifications() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { rescheduleNotifications } = useSettingsStore();

  useEffect(() => {
    NotificationService.initialize();
    Notifications.getPermissionsAsync().then(({ status }) => {
      setHasPermission(status === "granted");
    });
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    const granted = await NotificationService.requestPermissions();
    setHasPermission(granted);
    if (granted) {
      await rescheduleNotifications();
    }
    return granted;
  };

  return {
    hasPermission,
    requestPermission,
    sendTestNotification: NotificationService.sendTestNotification,
    rescheduleNotifications,
  };
}
