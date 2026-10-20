import { NativeModules, Platform } from "react-native";

export interface NativePrayerScheduleItem {
  prayerKey: "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
  prayerNameAr: string;
  timestamp: number;
  isPrePrayer: boolean;
  preMinutes: number;
  soundUrl?: string;
}

const { AtharNativeModule } = NativeModules;

export const NativeEngine = {
  isAvailable(): boolean {
    return Platform.OS === "android" && Boolean(AtharNativeModule);
  },

  initializeEngine(): void {
    if (this.isAvailable()) {
      try {
        AtharNativeModule.initializeEngine();
      } catch (e) {
        console.warn("[AtharNativeModule] initializeEngine error:", e);
      }
    }
  },

  schedulePrayerTimes(schedule: NativePrayerScheduleItem[]): void {
    if (this.isAvailable()) {
      try {
        const jsonString = JSON.stringify(schedule);
        AtharNativeModule.schedulePrayerTimes(jsonString);
      } catch (e) {
        console.warn("[AtharNativeModule] schedulePrayerTimes error:", e);
      }
    }
  },

  scheduleSalawat(
    enabled: boolean,
    intervalHours: number,
    startHour: number,
    endHour: number
  ): void {
    if (this.isAvailable()) {
      try {
        AtharNativeModule.scheduleSalawat(
          enabled,
          intervalHours,
          startHour,
          endHour
        );
      } catch (e) {
        console.warn("[AtharNativeModule] scheduleSalawat error:", e);
      }
    }
  },

  startSalawatTest(): void {
    if (this.isAvailable()) {
      try {
        AtharNativeModule.startSalawatTest();
      } catch (e) {
        console.warn("[AtharNativeModule] startSalawatTest error:", e);
      }
    }
  },

  cancelAllSchedules(): void {
    if (this.isAvailable()) {
      try {
        AtharNativeModule.cancelAllSchedules();
      } catch (e) {
        console.warn("[AtharNativeModule] cancelAllSchedules error:", e);
      }
    }
  },

  startAdhanTest(prayerNameAr: string = "الظهر", soundUrl?: string): void {
    if (this.isAvailable()) {
      try {
        AtharNativeModule.startAdhanTest(prayerNameAr, soundUrl || null);
      } catch (e) {
        console.warn("[AtharNativeModule] startAdhanTest error:", e);
      }
    }
  },

  scheduleTestAdhanInOneMinute(prayerNameAr: string = "الظهر", soundUrl?: string): void {
    if (this.isAvailable()) {
      try {
        AtharNativeModule.scheduleTestAdhanInOneMinute(prayerNameAr, soundUrl || null);
      } catch (e) {
        console.warn("[AtharNativeModule] scheduleTestAdhanInOneMinute error:", e);
      }
    }
  },

  stopAdhan(): void {
    if (this.isAvailable()) {
      try {
        AtharNativeModule.stopAdhan();
      } catch (e) {
        console.warn("[AtharNativeModule] stopAdhan error:", e);
      }
    }
  },

  async canScheduleExactAlarms(): Promise<boolean> {
    if (this.isAvailable()) {
      try {
        return await AtharNativeModule.canScheduleExactAlarms();
      } catch (e) {
        console.warn("[AtharNativeModule] canScheduleExactAlarms error:", e);
      }
    }
    return true;
  },

  openExactAlarmSettings(): void {
    if (this.isAvailable()) {
      try {
        AtharNativeModule.openExactAlarmSettings();
      } catch (e) {
        console.warn("[AtharNativeModule] openExactAlarmSettings error:", e);
      }
    }
  },

  openBatteryOptimizationSettings(): void {
    if (this.isAvailable()) {
      try {
        AtharNativeModule.openBatteryOptimizationSettings();
      } catch (e) {
        console.warn("[AtharNativeModule] openBatteryOptimizationSettings error:", e);
      }
    }
  },
};
