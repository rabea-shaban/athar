import { Platform } from "react-native";
import {
  NotificationsWrapper,
  SchedulableTriggerInputTypes,
  AndroidImportance,
} from "./NotificationsWrapper";
import {
  SalawatConfig,
  PrayerNotificationConfig,
  NotificationType,
} from "../../types/notification";
import { PrayerTimesDay } from "../../types/prayer";
import { PRAYER_NAMES_AR, toArabicNumber } from "../../utils/arabic";
import { NativeEngine, NativePrayerScheduleItem } from "../native/AtharNativeModule";
import { getAdhanById } from "../../data/adhans";

export class NotificationService {
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (NativeEngine.isAvailable()) {
      NativeEngine.initializeEngine();
    }

    try {
      NotificationsWrapper.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch (e) {
      console.warn("Notification handler warning:", e);
    }

    try {
      if (Platform.OS === "android") {
        await NotificationsWrapper.setNotificationChannelAsync("athar_adhan_channel", {
          name: "تنبيهات الأذان ومواقيت الصلاة",
          importance: AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250, 500],
          lightColor: "#10b981",
          sound: "default",
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
        });

        await NotificationsWrapper.setNotificationChannelAsync("athar_prep_channel", {
          name: "التذكير قبل دخول وقت الصلاة",
          importance: AndroidImportance.HIGH,
          vibrationPattern: [0, 200, 200, 200],
          lightColor: "#d97706",
          sound: "default",
          enableLights: true,
          enableVibrate: true,
        });

        await NotificationsWrapper.setNotificationChannelAsync("athar_salawat_channel", {
          name: "الصلاة على النبي ﷺ",
          importance: AndroidImportance.HIGH,
          vibrationPattern: [0, 150, 150, 150],
          lightColor: "#10b981",
          sound: "default",
          enableLights: true,
          enableVibrate: true,
        });

        await NotificationsWrapper.setNotificationChannelAsync("athar_general_channel", {
          name: "إشعارات عامة وتذكيرات",
          importance: AndroidImportance.DEFAULT,
          sound: "default",
        });
      }
    } catch (e) {
      console.warn("Notification channels setup warning:", e);
    }
  }

  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await NotificationsWrapper.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await NotificationsWrapper.requestPermissionsAsync();
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
      if (NativeEngine.isAvailable()) {
        NativeEngine.cancelAllSchedules();
      }
      await NotificationsWrapper.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.warn("Failed to cancel notifications:", e);
    }
  }

  static async scheduleSalawatNotifications(
    config: SalawatConfig
  ): Promise<void> {
    try {
      if (!config.enabled) return;

      if (NativeEngine.isAvailable()) {
        NativeEngine.scheduleSalawat(
          config.enabled,
          config.intervalHours || 1,
          config.startHour ?? 8,
          config.endHour ?? 22
        );
        return;
      }

      // JS Fallback for iOS / Web
      const interval = Math.max(1, config.intervalHours || 1);
      const start = config.startHour ?? 8;
      const end = config.endHour ?? 22;

      for (let hour = start; hour <= end; hour += interval) {
        const identifier = `athar_salawat_${hour}_00`;

        await NotificationsWrapper.scheduleNotificationAsync({
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
            type: SchedulableTriggerInputTypes.DAILY,
            hour,
            minute: 0,
          },
        });
      }
    } catch (e) {
      console.warn("Schedule salawat warning:", e);
    }
  }

  static async schedulePrayerNotifications(
    schedule: PrayerTimesDay[],
    config: PrayerNotificationConfig
  ): Promise<void> {
    try {
      if (!config.enabled) return;

      const now = new Date();

      if (NativeEngine.isAvailable()) {
        const nativeItems: NativePrayerScheduleItem[] = [];

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

            const chosenSoundId = p.key === "fajr"
              ? (config.fajrSound || "fajr")
              : (config.sound || "makkah");
            const adhanTrack = getAdhanById(chosenSoundId);
            const soundUrl = adhanTrack?.audioUrl;

            if (p.time > now) {
              nativeItems.push({
                prayerKey: p.key,
                prayerNameAr: p.nameAr,
                timestamp: p.time.getTime(),
                isPrePrayer: false,
                preMinutes: 0,
                soundUrl: soundUrl,
              });
            }

            if (config.prePrayerMinutes > 0) {
              const preTime = new Date(
                p.time.getTime() - config.prePrayerMinutes * 60 * 1000
              );
              if (preTime > now) {
                nativeItems.push({
                  prayerKey: p.key,
                  prayerNameAr: p.nameAr,
                  timestamp: preTime.getTime(),
                  isPrePrayer: true,
                  preMinutes: config.prePrayerMinutes,
                });
              }
            }
          }
        }

        NativeEngine.schedulePrayerTimes(nativeItems);
        return;
      }

      // JS Fallback for iOS / Web
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

          if (p.time > now) {
            const dateStr = p.time.toISOString().split("T")[0];
            const identifier = `athar_prayer_${p.key}_${dateStr}`;

            await NotificationsWrapper.scheduleNotificationAsync({
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
                type: SchedulableTriggerInputTypes.DATE,
                date: p.time,
              },
            });
          }

          if (config.prePrayerMinutes > 0) {
            const preTime = new Date(
              p.time.getTime() - config.prePrayerMinutes * 60 * 1000
            );

            if (preTime > now) {
              const dateStr = p.time.toISOString().split("T")[0];
              const preIdentifier = `athar_prayer_${p.key}_${dateStr}_before`;

              await NotificationsWrapper.scheduleNotificationAsync({
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
                  type: SchedulableTriggerInputTypes.DATE,
                  date: preTime,
                },
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn("Schedule prayer notifications warning:", e);
    }
  }

  static async sendTestNotification(): Promise<void> {
    try {
      await NotificationsWrapper.scheduleNotificationAsync({
        content: {
          title: "تجربة تنبيهات أَثَر",
          body: "تم تفعيل التنبيهات الإسلامية بنجاح في تطبيق أَثَر.",
          sound: "default",
          data: { type: "general" as NotificationType },
          ...(Platform.OS === "android"
            ? { channelId: "athar_general_channel" }
            : {}),
        },
        trigger: null,
      });
    } catch (e) {
      console.warn("Test notification error:", e);
    }
  }
}
