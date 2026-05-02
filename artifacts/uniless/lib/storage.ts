import AsyncStorage from "@react-native-async-storage/async-storage";

export const StorageKeys = {
  users: "uniless:users",
  session: "uniless:session",
  posts: "uniless:posts",
  stories: "uniless:stories",
  classes: "uniless:classes",
  assignments: "uniless:assignments",
  exams: "uniless:exams",
  chats: "uniless:chats",
  messages: "uniless:messages",
  friends: "uniless:friends",
  friendRequests: "uniless:friendRequests",
  studyRooms: "uniless:studyRooms",
  skillExchanges: "uniless:skillExchanges",
  notifications: "uniless:notifications",
  dismissedSynth: "uniless:dismissedSynth",
  universityEvents: "uniless:universityEvents",
  themePref: "uniless:themePref",
  seeded: "uniless:seeded:v2",
} as const;

export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function genId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}
