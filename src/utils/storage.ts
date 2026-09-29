import AsyncStorage from "@react-native-async-storage/async-storage";

const memoryFallback = new Map<string, string>();

export const SafeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === "function") {
        const val = await AsyncStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      // fallback to memory
    }
    return memoryFallback.get(key) || null;
  },

  setItem: async (key: string, value: string): Promise<void> => {
    memoryFallback.set(key, value);
    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === "function") {
        await AsyncStorage.setItem(key, value);
      }
    } catch (e) {
      // fallback to memory only
    }
  },

  removeItem: async (key: string): Promise<void> => {
    memoryFallback.delete(key);
    try {
      if (AsyncStorage && typeof AsyncStorage.removeItem === "function") {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      // ignore
    }
  },
};
