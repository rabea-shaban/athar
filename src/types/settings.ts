import { SalawatConfig, PrayerNotificationConfig } from "./notification";
import { CalculationMethodName, MadhabName, Coordinates } from "./prayer";

export interface CityPreset {
  id: string;
  nameAr: string;
  nameEn: string;
  countryAr: string;
  coords: Coordinates;
  method: CalculationMethodName;
}

export interface AppSettings {
  salawat: SalawatConfig;
  prayerNotifications: PrayerNotificationConfig;
  calculationMethod: CalculationMethodName;
  madhab: MadhabName;
  useGps: boolean;
  selectedCity: CityPreset;
  customCoords: Coordinates | null;
}
