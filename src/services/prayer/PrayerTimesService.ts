import {
  Coordinates as AdhanCoordinates,
  CalculationMethod,
  CalculationParameters,
  Madhab,
  PrayerTimes,
} from "adhan";
import {
  Coordinates,
  CalculationMethodName,
  MadhabName,
  PrayerTimesDay,
  NextPrayerInfo,
} from "../../types/prayer";
import { PRAYER_NAMES_AR } from "../../utils/arabic";

export class PrayerTimesService {
  static getParameters(
    methodName: CalculationMethodName,
    madhabName: MadhabName
  ): CalculationParameters {
    let params: CalculationParameters;

    switch (methodName) {
      case "Egyptian":
        params = CalculationMethod.Egyptian();
        break;
      case "UmmAlQura":
        params = CalculationMethod.UmmAlQura();
        break;
      case "MuslimWorldLeague":
        params = CalculationMethod.MuslimWorldLeague();
        break;
      case "NorthAmerica":
        params = CalculationMethod.NorthAmerica();
        break;
      case "MoonsightingCommittee":
        params = CalculationMethod.MoonsightingCommittee();
        break;
      case "Dubai":
        params = CalculationMethod.Dubai();
        break;
      case "Qatar":
        params = CalculationMethod.Qatar();
        break;
      case "Kuwait":
        params = CalculationMethod.Kuwait();
        break;
      case "Karachi":
        params = CalculationMethod.Karachi();
        break;
      case "Singapore":
        params = CalculationMethod.Singapore();
        break;
      case "Tehran":
        params = CalculationMethod.Tehran();
        break;
      default:
        params = CalculationMethod.Egyptian();
    }

    params.madhab = madhabName === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
    return params;
  }

  static calculateDayPrayers(
    coords: Coordinates,
    date: Date = new Date(),
    method: CalculationMethodName = "Egyptian",
    madhab: MadhabName = "shafi"
  ): PrayerTimesDay {
    const adhanCoords = new AdhanCoordinates(coords.latitude, coords.longitude);
    const params = this.getParameters(method, madhab);
    const pt = new PrayerTimes(adhanCoords, date, params);

    return {
      date,
      fajr: pt.fajr,
      sunrise: pt.sunrise,
      dhuhr: pt.dhuhr,
      asr: pt.asr,
      maghrib: pt.maghrib,
      isha: pt.isha,
    };
  }

  static calculateScheduleForDays(
    coords: Coordinates,
    daysCount = 7,
    method: CalculationMethodName = "Egyptian",
    madhab: MadhabName = "shafi"
  ): PrayerTimesDay[] {
    const schedule: PrayerTimesDay[] = [];
    const today = new Date();

    for (let i = 0; i < daysCount; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      schedule.push(this.calculateDayPrayers(coords, d, method, madhab));
    }

    return schedule;
  }

  static getNextPrayer(
    coords: Coordinates,
    method: CalculationMethodName = "Egyptian",
    madhab: MadhabName = "shafi"
  ): NextPrayerInfo {
    const now = new Date();
    const todayPrayers = this.calculateDayPrayers(coords, now, method, madhab);

    const prayerOrder: { name: NextPrayerInfo["name"]; time: Date }[] = [
      { name: "Fajr", time: todayPrayers.fajr },
      { name: "Sunrise", time: todayPrayers.sunrise },
      { name: "Dhuhr", time: todayPrayers.dhuhr },
      { name: "Asr", time: todayPrayers.asr },
      { name: "Maghrib", time: todayPrayers.maghrib },
      { name: "Isha", time: todayPrayers.isha },
    ];

    for (const p of prayerOrder) {
      if (p.time > now) {
        const countdownSeconds = Math.floor(
          (p.time.getTime() - now.getTime()) / 1000
        );
        return {
          name: p.name,
          nameAr: PRAYER_NAMES_AR[p.name] || p.name,
          time: p.time,
          countdownSeconds,
        };
      }
    }

    // If all prayers today passed, next is tomorrow's Fajr
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowPrayers = this.calculateDayPrayers(
      coords,
      tomorrow,
      method,
      madhab
    );
    const countdownSeconds = Math.floor(
      (tomorrowPrayers.fajr.getTime() - now.getTime()) / 1000
    );

    return {
      name: "Fajr",
      nameAr: PRAYER_NAMES_AR.Fajr,
      time: tomorrowPrayers.fajr,
      countdownSeconds,
    };
  }
}
