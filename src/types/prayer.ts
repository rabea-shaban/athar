export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type CalculationMethodName =
  | "Egyptian"
  | "UmmAlQura"
  | "MuslimWorldLeague"
  | "NorthAmerica"
  | "MoonsightingCommittee"
  | "Dubai"
  | "Qatar"
  | "Kuwait"
  | "Karachi"
  | "Singapore"
  | "Tehran";

export type MadhabName = "shafi" | "hanafi";

export interface PrayerTimesDay {
  date: Date;
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export interface NextPrayerInfo {
  name: "Fajr" | "Sunrise" | "Dhuhr" | "Asr" | "Maghrib" | "Isha" | "None";
  nameAr: string;
  time: Date;
  countdownSeconds: number;
}
