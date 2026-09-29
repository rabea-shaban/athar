import { useState, useEffect, useMemo } from "react";
import { PrayerTimesService } from "../services/prayer/PrayerTimesService";
import { useSettingsStore } from "../store/settingsStore";
import { PrayerTimesDay, NextPrayerInfo, Coordinates } from "../types/prayer";

export function usePrayerTimes() {
  const {
    useGps,
    customCoords,
    selectedCity,
    calculationMethod,
    madhab,
  } = useSettingsStore();

  const effectiveCoords: Coordinates = useMemo(() => {
    return useGps && customCoords ? customCoords : selectedCity.coords;
  }, [useGps, customCoords, selectedCity]);

  const [todayPrayers, setTodayPrayers] = useState<PrayerTimesDay>(() =>
    PrayerTimesService.calculateDayPrayers(
      effectiveCoords,
      new Date(),
      calculationMethod,
      madhab
    )
  );

  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo>(() =>
    PrayerTimesService.getNextPrayer(
      effectiveCoords,
      calculationMethod,
      madhab
    )
  );

  // Recalculate prayer times when settings/coords change
  useEffect(() => {
    const p = PrayerTimesService.calculateDayPrayers(
      effectiveCoords,
      new Date(),
      calculationMethod,
      madhab
    );
    setTodayPrayers(p);
  }, [effectiveCoords, calculationMethod, madhab]);

  // Live countdown timer ticking every second
  useEffect(() => {
    const interval = setInterval(() => {
      const next = PrayerTimesService.getNextPrayer(
        effectiveCoords,
        calculationMethod,
        madhab
      );
      setNextPrayer(next);
    }, 1000);

    return () => clearInterval(interval);
  }, [effectiveCoords, calculationMethod, madhab]);

  return {
    todayPrayers,
    nextPrayer,
    effectiveCoords,
    cityNameAr: useGps && customCoords ? "موقعي الحالي (GPS)" : selectedCity.nameAr,
  };
}
