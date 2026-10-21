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

import { create } from "zustand";
import { SafeStorage } from "../utils/storage";
import { AppSettings, CityPreset } from "../types/settings";
import {
  SalawatConfig,
  PrayerNotificationConfig,
} from "../types/notification";
import {
  CalculationMethodName,
  MadhabName,
  Coordinates,
} from "../types/prayer";
import { CITY_PRESETS, LocationService } from "../services/location/LocationService";
import { PrayerTimesService } from "../services/prayer/PrayerTimesService";
import { NotificationService } from "../services/notifications/NotificationService";
import { UserPushPreferences } from "../types/fcm";
import { NativeEngine } from "../services/native/AtharNativeModule";
import { getAdhanById } from "../data/adhans";

const SETTINGS_STORAGE_KEY = "@athar_app_settings_v1";

interface SettingsStoreState extends AppSettings {
  isLoading: boolean;
  pushPreferences: UserPushPreferences;
  setSalawatConfig: (config: Partial<SalawatConfig>) => void;
  setPrayerNotificationConfig: (
    config: Partial<PrayerNotificationConfig>
  ) => void;
  setPushPreferences: (config: Partial<UserPushPreferences>) => void;
  setCalculationMethod: (method: CalculationMethodName) => void;
  setMadhab: (madhab: MadhabName) => void;
  setUseGps: (useGps: boolean) => void;
  setSelectedCity: (city: CityPreset) => void;
  setCustomCoords: (coords: Coordinates | null) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  rescheduleNotifications: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  isLoading: true,
  salawat: {
    enabled: true,
    intervalHours: 1,
    startHour: 8,
    endHour: 22,
  },
  prayerNotifications: {
    enabled: true,
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    prePrayerMinutes: 15,
    sound: "makkah",
    fajrSound: "fajr",
    vibration: true,
    adhanVolume: 100,
  },
  pushPreferences: {
    appUpdatesEnabled: true,
    announcementsEnabled: true,
    islamicContentEnabled: true,
  },
  calculationMethod: "Egyptian",
  madhab: "shafi",
  useGps: true,
  selectedCity: CITY_PRESETS[0],
  customCoords: null,

  setSalawatConfig: (config) => {
    set({ salawat: { ...get().salawat, ...config } });
    get().saveSettings();
    get().rescheduleNotifications();
  },

  setPrayerNotificationConfig: (config) => {
    const newConfig = { ...get().prayerNotifications, ...config };
    set({ prayerNotifications: newConfig });
    if (config.adhanVolume !== undefined) {
      NativeEngine.setAdhanVolume(config.adhanVolume);
    }
    get().saveSettings();
    get().rescheduleNotifications();
  },

  setPushPreferences: (config) => {
    set({
      pushPreferences: { ...get().pushPreferences, ...config },
    });
    get().saveSettings();
  },

  setCalculationMethod: (calculationMethod) => {
    set({ calculationMethod });
    get().saveSettings();
    get().rescheduleNotifications();
  },

  setMadhab: (madhab) => {
    set({ madhab });
    get().saveSettings();
    get().rescheduleNotifications();
  },

  setUseGps: async (useGps) => {
    set({ useGps });
    if (useGps) {
      const gpsCoords = await LocationService.getCurrentCoordinates();
      if (gpsCoords) {
        set({ customCoords: gpsCoords });
      }
    }
    get().saveSettings();
    get().rescheduleNotifications();
  },

  setSelectedCity: (selectedCity) => {
    set({
      selectedCity,
      useGps: false,
      calculationMethod: selectedCity.method || get().calculationMethod,
    });
    get().saveSettings();
    get().rescheduleNotifications();
  },

  setCustomCoords: (customCoords) => {
    set({ customCoords });
    get().saveSettings();
    get().rescheduleNotifications();
  },

  loadSettings: async () => {
    try {
      const data = await SafeStorage.getItem(SETTINGS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const prayerNotifs = {
          adhanVolume: 100,
          ...(parsed.prayerNotifications || {}),
        };
        set({
          ...parsed,
          prayerNotifications: prayerNotifs,
          pushPreferences: {
            appUpdatesEnabled: true,
            announcementsEnabled: true,
            islamicContentEnabled: true,
            ...(parsed.pushPreferences || {}),
          },
          isLoading: false,
        });

        // Sync volume setting natively
        NativeEngine.setAdhanVolume(prayerNotifs.adhanVolume);
      } else {
        set({ isLoading: false });
        NativeEngine.setAdhanVolume(100);
      }
    } catch (e) {
      console.warn("Failed to load settings:", e);
      set({ isLoading: false });
      NativeEngine.setAdhanVolume(100);
    }
  },

  saveSettings: async () => {
    try {
      const state = get();
      const payload = {
        salawat: state.salawat,
        prayerNotifications: state.prayerNotifications,
        pushPreferences: state.pushPreferences,
        calculationMethod: state.calculationMethod,
        madhab: state.madhab,
        useGps: state.useGps,
        selectedCity: state.selectedCity,
        customCoords: state.customCoords,
      };
      await SafeStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(payload)
      );
    } catch (e) {
      console.warn("Failed to save settings:", e);
    }
  },

  rescheduleNotifications: async () => {
    try {
      const state = get();
      await NotificationService.cancelAllAtharNotifications();

      // Schedule Salawat
      if (state.salawat.enabled) {
        await NotificationService.scheduleSalawatNotifications(state.salawat);
      }

      // Schedule Prayers for next 7 days
      if (state.prayerNotifications.enabled) {
        const effectiveCoords: Coordinates =
          state.useGps && state.customCoords
            ? state.customCoords
            : state.selectedCity.coords;

        const chosenSoundId = state.prayerNotifications.sound || "makkah";
        const chosenFajrSoundId = state.prayerNotifications.fajrSound || "fajr";
        const generalTrack = getAdhanById(chosenSoundId);
        const fajrTrack = getAdhanById(chosenFajrSoundId);

        NativeEngine.saveCalculationParams(
          effectiveCoords.latitude,
          effectiveCoords.longitude,
          state.calculationMethod,
          state.madhab,
          state.prayerNotifications.prePrayerMinutes || 15,
          generalTrack?.audioUrl || null,
          fajrTrack?.audioUrl || null,
          state.prayerNotifications.fajr !== false,
          state.prayerNotifications.dhuhr !== false,
          state.prayerNotifications.asr !== false,
          state.prayerNotifications.maghrib !== false,
          state.prayerNotifications.isha !== false
        );

        const schedule = PrayerTimesService.calculateScheduleForDays(
          effectiveCoords,
          7,
          state.calculationMethod,
          state.madhab
        );

        await NotificationService.schedulePrayerNotifications(
          schedule,
          state.prayerNotifications
        );
      }
    } catch (e) {
      console.warn("Failed to reschedule notifications:", e);
    }
  },
}));
