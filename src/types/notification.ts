export type NotificationType =
  | "prayer_adhan"
  | "prayer_before"
  | "salawat"
  | "adhkar_morning"
  | "adhkar_evening"
  | "general";

export interface SalawatConfig {
  enabled: boolean;
  intervalHours: number; // 1, 2, 3, etc.
  startHour: number; // e.g. 8 (08:00 AM)
  endHour: number; // e.g. 22 (10:00 PM)
}

export interface PrayerNotificationConfig {
  enabled: boolean;
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  prePrayerMinutes: number; // 0 (off), 5, 10, 15, 30
  sound: "default" | "adhan" | "adhan_makkah" | "none";
  vibration: boolean;
}

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: {
    prayerName?: string;
    url?: string;
    type: NotificationType;
  };
}
