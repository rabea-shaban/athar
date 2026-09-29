import { useState, useEffect } from "react";
import { NotificationsWrapper } from "../services/notifications/NotificationsWrapper";
import { NotificationService } from "../services/notifications/NotificationService";
import { useSettingsStore } from "../store/settingsStore";

export function useNotifications() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { rescheduleNotifications } = useSettingsStore();

  useEffect(() => {
    NotificationService.initialize();
    NotificationsWrapper.getPermissionsAsync().then(({ status }: any) => {
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
