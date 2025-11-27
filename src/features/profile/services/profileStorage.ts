import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from "../types/UserProfile";

const KEY = "rutacheck:user-profile";

export async function getProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}

export async function saveProfile(p: Omit<UserProfile, "updatedAt">) {
  const data: UserProfile = { ...p, updatedAt: Date.now() };
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
  return data;
}
