import AsyncStorage from "@react-native-async-storage/async-storage";

export type ReminderSettings = {
  enabled: boolean;
  hour: number;   // 0..23
  minute: number; // 0..59
  notificationId?: string;
  updatedAt: number;
};

const KEY = "rutacheck:reminder-settings";

export async function getReminderSettings(): Promise<ReminderSettings | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as ReminderSettings) : null;
}

export async function saveReminderSettings(s: ReminderSettings) {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
}
