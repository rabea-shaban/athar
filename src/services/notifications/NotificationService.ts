import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  SalawatConfig,
  PrayerNotificationConfig,
  NotificationType,
} from "../../types/notification";
import { PrayerTimesDay } from "../../types/prayer";
import { PRAYER_NAMES_AR, toArabicNumber } from "../../utils/arabic";

// Configure default notification handler for foreground presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async initialize(): Promise<void> {
    if (Platform.OS === "android") {
      // 1. Adhan & Exact Prayer Channel
      await Notifications.setNotificationChannelAsync("athar_adhan_channel", {
        name: "تنبيهات الأذان ومواقيت الصلاة",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250, 500],
        lightColor: "#10b981",
        sound: "default",
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });

      // 2. Pre-Prayer Channel
      await Notifications.setNotificationChannelAsync("athar_prep_channel", {
        name: "التذكير قبل دخول وقت الصلاة",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 200, 200],
        lightColor: "#d97706",
        sound: "default",
        enableLights: true,
        enableVibrate: true,
      });

      // 3. Salawat Channel
      await Notifications.setNotificationChannelAsync("athar_salawat_channel", {
        name: "الصلاة على النبي ﷺ",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 150, 150, 150],
        lightColor: "#10b981",
        sound: "default",
        enableLights: true,
        enableVibrate: true,
      });

      // 4. General Channel
      await Notifications.setNotificationChannelAsync("athar_general_channel", {
        name: "إشعارات عامة وتذكيرات",
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: "default",
      });
    }
  }

  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === "granted";
    } catch (e) {
      console.warn("Failed to request notification permission:", e);
      return false;
    }
  }

  static async cancelAllAtharNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.warn("Failed to cancel notifications:", e);
    }
  }

  static async scheduleSalawatNotifications(
    config: SalawatConfig
  ): Promise<void> {
    if (!config.enabled) return;

    const interval = Math.max(1, config.intervalHours || 1);
    const start = config.startHour ?? 8;
    const end = config.endHour ?? 22;

    for (let hour = start; hour <= end; hour += interval) {
      const identifier = `athar_salawat_${hour}_00`;

      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: "الصلاة على النبي ﷺ",
          body: "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ ﷺ",
          sound: "default",
          data: {
            type: "salawat" as NotificationType,
            url: "/adhkar/salawat",
          },
          ...(Platform.OS === "android"
            ? { channelId: "athar_salawat_channel" }
            : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute: 0,
        },
      });
    }
  }

  static async schedulePrayerNotifications(
    schedule: PrayerTimesDay[],
    config: PrayerNotificationConfig
  ): Promise<void> {
    if (!config.enabled) return;

    const now = new Date();

    for (const day of schedule) {
      const prayers: {
        key: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
        nameAr: string;
        time: Date;
      }[] = [
        { key: "fajr", nameAr: PRAYER_NAMES_AR.Fajr, time: day.fajr },
        { key: "dhuhr", nameAr: PRAYER_NAMES_AR.Dhuhr, time: day.dhuhr },
        { key: "asr", nameAr: PRAYER_NAMES_AR.Asr, time: day.asr },
        { key: "maghrib", nameAr: PRAYER_NAMES_AR.Maghrib, time: day.maghrib },
        { key: "isha", nameAr: PRAYER_NAMES_AR.Isha, time: day.isha },
      ];

      for (const p of prayers) {
        if (!config[p.key]) continue;

        // 1. Schedule Exact Prayer Time Adhan Notification
        if (p.time > now) {
          const dateStr = p.time.toISOString().split("T")[0];
          const identifier = `athar_prayer_${p.key}_${dateStr}`;

          await Notifications.scheduleNotificationAsync({
            identifier,
            content: {
              title: `موعد صلاة ${p.nameAr}`,
              body: `حان الآن موعد أذان صلاة ${p.nameAr}`,
              sound: config.sound !== "none" ? "default" : undefined,
              vibrate: config.vibration ? [0, 250, 250, 250] : undefined,
              data: {
                type: "prayer_adhan" as NotificationType,
                prayerName: p.key,
                url: `/prayer/${p.key}`,
              },
              ...(Platform.OS === "android"
                ? { channelId: "athar_adhan_channel" }
                : {}),
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: p.time,
            },
          });
        }

        // 2. Schedule Pre-Prayer Reminder (e.g. 15 mins before)
        if (config.prePrayerMinutes > 0) {
          const preTime = new Date(
            p.time.getTime() - config.prePrayerMinutes * 60 * 1000
          );

          if (preTime > now) {
            const dateStr = p.time.toISOString().split("T")[0];
            const preIdentifier = `athar_prayer_${p.key}_${dateStr}_before`;

            await Notifications.scheduleNotificationAsync({
              identifier: preIdentifier,
              content: {
                title: `اقترب موعد صلاة ${p.nameAr}`,
                body: `متبقي ${toArabicNumber(
                  config.prePrayerMinutes
                )} دقيقة على أذان صلاة ${p.nameAr}`,
                sound: "default",
                data: {
                  type: "prayer_before" as NotificationType,
                  prayerName: p.key,
                  url: `/prayer/times`,
                },
                ...(Platform.OS === "android"
                  ? { channelId: "athar_prep_channel" }
                  : {}),
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: preTime,
              },
            });
          }
        }
      }
    }
  }

  static async sendTestNotification(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "تجربة تنبيهات أَثَر",
        body: "تم تفعيل التنبيهات الإسلامية بنجاح في تطبيق أَثَر.",
        sound: "default",
        data: { type: "general" as NotificationType },
        ...(Platform.OS === "android"
          ? { channelId: "athar_general_channel" }
          : {}),
      },
      trigger: null, // send immediately
    });
  }
}
