import { NativeModules, Platform, DeviceEventEmitter } from "react-native";

export interface NativePrayerScheduleItem {
  prayerKey: "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
  prayerNameAr: string;
  timestamp: number;
  isPrePrayer: boolean;
  preMinutes: number;
  soundUrl?: string;
}

export interface QiblaHeadingData {
  magneticHeading: number;
  trueHeading: number;
  declination: number;
  accuracy: number;
  isAvailable: boolean;
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

  saveCalculationParams(
    latitude: number,
    longitude: number,
    methodName: string,
    madhabName: string,
    prePrayerMinutes: number,
    soundUrl: string | null,
    fajrSoundUrl: string | null,
    fajr: boolean,
    dhuhr: boolean,
    asr: boolean,
    maghrib: boolean,
    isha: boolean
  ): void {
    if (this.isAvailable()) {
      try {
        AtharNativeModule.saveCalculationParams(
          latitude,
          longitude,
          methodName,
          madhabName,
          prePrayerMinutes,
          soundUrl || null,
          fajrSoundUrl || null,
          fajr,
          dhuhr,
          asr,
          maghrib,
          isha
        );
      } catch (e) {
        console.warn("[AtharNativeModule] saveCalculationParams error:", e);
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

  setAdhanVolume(volumePercent: number): void {
    if (this.isAvailable()) {
      try {
        AtharNativeModule.setAdhanVolume(Math.round(volumePercent));
      } catch (e) {
        console.warn("[AtharNativeModule] setAdhanVolume error:", e);
      }
    }
  },

  async getAdhanVolume(): Promise<number> {
    if (this.isAvailable()) {
      try {
        return await AtharNativeModule.getAdhanVolume();
      } catch (e) {
        console.warn("[AtharNativeModule] getAdhanVolume error:", e);
      }
    }
    return 100;
  },

  startAdhanVolumePreview(volumePercent: number): void {
    if (this.isAvailable()) {
      try {
        AtharNativeModule.startAdhanVolumePreview(Math.round(volumePercent));
      } catch (e) {
        console.warn("[AtharNativeModule] startAdhanVolumePreview error:", e);
      }
    }
  },

  stopAdhanVolumePreview(): void {
    if (this.isAvailable()) {
      try {
        AtharNativeModule.stopAdhanVolumePreview();
      } catch (e) {
        console.warn("[AtharNativeModule] stopAdhanVolumePreview error:", e);
      }
    }
  },

  startQiblaCompass(latitude: number, longitude: number): void {
    if (this.isAvailable()) {
      try {
        AtharNativeModule.startQiblaCompass(latitude, longitude);
      } catch (e) {
        console.warn("[AtharNativeModule] startQiblaCompass error:", e);
      }
    }
  },

  stopQiblaCompass(): void {
    if (this.isAvailable()) {
      try {
        AtharNativeModule.stopQiblaCompass();
      } catch (e) {
        console.warn("[AtharNativeModule] stopQiblaCompass error:", e);
      }
    }
  },

  addQiblaHeadingListener(
    callback: (data: QiblaHeadingData) => void
  ): { remove: () => void } {
    try {
      const subscription = DeviceEventEmitter.addListener(
        "onQiblaHeadingUpdate",
        callback
      );
      return {
        remove: () => {
          subscription.remove();
        },
      };
    } catch (e) {
      console.warn("[AtharNativeModule] addQiblaHeadingListener error:", e);
      return { remove: () => {} };
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
