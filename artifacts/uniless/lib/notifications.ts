import { Platform } from "react-native";

let notifications: typeof import("expo-notifications") | null = null;
let setupPromise: Promise<void> | null = null;

async function ensureSetup(): Promise<typeof import("expo-notifications") | null> {
  if (Platform.OS === "web") return null;
  if (notifications) return notifications;
  if (!setupPromise) {
    setupPromise = (async () => {
      try {
        const mod = await import("expo-notifications");
        mod.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowAlert: true,
          }),
        });
        notifications = mod;
      } catch {
        notifications = null;
      }
    })();
  }
  await setupPromise;
  return notifications;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const n = await ensureSetup();
  if (!n) return false;
  try {
    const settings = await n.getPermissionsAsync();
    if (settings.status === "granted") return true;
    const next = await n.requestPermissionsAsync();
    return next.status === "granted";
  } catch {
    return false;
  }
}

export interface ScheduleInput {
  title: string;
  body: string;
  when: number; // ms epoch
}

export async function scheduleReminder(input: ScheduleInput): Promise<string | null> {
  const n = await ensureSetup();
  if (!n) return null;
  const seconds = Math.max(1, Math.floor((input.when - Date.now()) / 1000));
  if (seconds <= 1) return null;
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return null;
    const id = await n.scheduleNotificationAsync({
      content: { title: input.title, body: input.body, sound: "default" },
      trigger: { type: n.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: false },
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelReminder(id: string | undefined | null): Promise<void> {
  if (!id) return;
  const n = await ensureSetup();
  if (!n) return;
  try {
    await n.cancelScheduledNotificationAsync(id);
  } catch {
    // ignore
  }
}
