import * as Location from "expo-location";
import { Coordinates } from "../../types/prayer";
import { CityPreset } from "../../types/settings";

export const CITY_PRESETS: CityPreset[] = [
  {
    id: "cairo",
    nameAr: "القاهرة",
    nameEn: "Cairo",
    countryAr: "مصر",
    coords: { latitude: 30.0444, longitude: 31.2357 },
    method: "Egyptian",
  },
  {
    id: "alexandria",
    nameAr: "الإسكندرية",
    nameEn: "Alexandria",
    countryAr: "مصر",
    coords: { latitude: 31.2001, longitude: 29.9187 },
    method: "Egyptian",
  },
  {
    id: "giza",
    nameAr: "الجيزة",
    nameEn: "Giza",
    countryAr: "مصر",
    coords: { latitude: 30.0131, longitude: 31.2089 },
    method: "Egyptian",
  },
  {
    id: "minya",
    nameAr: "المنيا",
    nameEn: "Minya",
    countryAr: "مصر",
    coords: { latitude: 28.1099, longitude: 30.7503 },
    method: "Egyptian",
  },
  {
    id: "mansoura",
    nameAr: "المنصورة",
    nameEn: "Mansoura",
    countryAr: "مصر",
    coords: { latitude: 31.0409, longitude: 31.3785 },
    method: "Egyptian",
  },
  {
    id: "assiut",
    nameAr: "أسيوط",
    nameEn: "Assiut",
    countryAr: "مصر",
    coords: { latitude: 27.1809, longitude: 31.1837 },
    method: "Egyptian",
  },
  {
    id: "makkah",
    nameAr: "مكة المكرمة",
    nameEn: "Makkah",
    countryAr: "السعودية",
    coords: { latitude: 21.4225, longitude: 39.8262 },
    method: "UmmAlQura",
  },
  {
    id: "madinah",
    nameAr: "المدينة المنورة",
    nameEn: "Madinah",
    countryAr: "السعودية",
    coords: { latitude: 24.5247, longitude: 39.5692 },
    method: "UmmAlQura",
  },
  {
    id: "riyadh",
    nameAr: "الرياض",
    nameEn: "Riyadh",
    countryAr: "السعودية",
    coords: { latitude: 24.7136, longitude: 46.6753 },
    method: "UmmAlQura",
  },
  {
    id: "dubai",
    nameAr: "دبي",
    nameEn: "Dubai",
    countryAr: "الإمارات",
    coords: { latitude: 25.2048, longitude: 55.2708 },
    method: "Dubai",
  },
  {
    id: "kuwait",
    nameAr: "الكويت",
    nameEn: "Kuwait City",
    countryAr: "الكويت",
    coords: { latitude: 29.3759, longitude: 47.9774 },
    method: "Kuwait",
  },
  {
    id: "doha",
    nameAr: "الدوحة",
    nameEn: "Doha",
    countryAr: "قطر",
    coords: { latitude: 25.2854, longitude: 51.531 },
    method: "Qatar",
  },
  {
    id: "amman",
    nameAr: "عمان",
    nameEn: "Amman",
    countryAr: "الأردن",
    coords: { latitude: 31.9454, longitude: 35.9284 },
    method: "MuslimWorldLeague",
  },
  {
    id: "jerusalem",
    nameAr: "القدس الشريف",
    nameEn: "Jerusalem",
    countryAr: "فلسطين",
    coords: { latitude: 31.7683, longitude: 35.2137 },
    method: "Egyptian",
  },
];

export class LocationService {
  static async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    } catch (e) {
      console.warn("Error requesting location permission:", e);
      return false;
    }
  }

  static async getCurrentCoordinates(): Promise<Coordinates | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) return null;

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (e) {
      console.warn("Failed to get current GPS location:", e);
      return null;
    }
  }
}
