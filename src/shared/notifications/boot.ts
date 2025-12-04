import { getReminderSettings, saveReminderSettings } from "@features/reminder/services/reminderStorage";
import { cancelReminder, scheduleDailyReminder } from "./reminderService";

export async function bootRescheduleReminderIfNeeded() {
  const s = await getReminderSettings();
  if (!s) return;
  if (!s.enabled) return;

  // estrategia simple: cancelar y reprogramar para garantizar que existe
  await cancelReminder(s.notificationId);
  const id = await scheduleDailyReminder(s.hour, s.minute);
  await saveReminderSettings({ ...s, notificationId: id, updatedAt: Date.now() });
}
