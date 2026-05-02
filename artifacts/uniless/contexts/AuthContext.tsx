import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { demoHashPassword, isValidEmail, verifyDemoPassword } from "@/lib/auth";
import { pickColor, SEED_USERS } from "@/lib/seed";
import { genId, readJSON, StorageKeys, writeJSON } from "@/lib/storage";
import type { Privacy, UnilessUser } from "@/lib/types";

interface SessionData {
  userId: string;
}

interface SignupInput {
  email: string;
  password: string;
  displayName: string;
  username: string;
  university: string;
  major: string;
  year: string;
  bio?: string;
  privacy?: Privacy;
}

interface AuthContextValue {
  ready: boolean;
  user: UnilessUser | null;
  allUsers: UnilessUser[];
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (input: SignupInput) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<UnilessUser>) => Promise<void>;
  reloadUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<UnilessUser | null>(null);
  const [allUsers, setAllUsers] = useState<UnilessUser[]>([]);

  const loadAll = useCallback(async () => {
    let users = await readJSON<UnilessUser[]>(StorageKeys.users, []);
    if (users.length === 0) {
      users = SEED_USERS;
      await writeJSON(StorageKeys.users, users);
    }
    setAllUsers(users);
    return users;
  }, []);

  useEffect(() => {
    (async () => {
      const users = await loadAll();
      const session = await readJSON<SessionData | null>(StorageKeys.session, null);
      if (session) {
        const u = users.find((x) => x.id === session.userId) ?? null;
        setUser(u);
      }
      setReady(true);
    })();
  }, [loadAll]);

  const reloadUsers = useCallback(async () => {
    const users = await loadAll();
    if (user) {
      const refreshed = users.find((u) => u.id === user.id) ?? null;
      setUser(refreshed);
    }
  }, [loadAll, user]);

  const login = useCallback<AuthContextValue["login"]>(async (email, password) => {
    const users = await readJSON<UnilessUser[]>(StorageKeys.users, []);
    const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u) return { ok: false, error: "No account with that email." };
    const ok = u.passwordHash === "demo" || verifyDemoPassword(password, u.passwordHash);
    if (!ok) return { ok: false, error: "Wrong password." };
    await writeJSON<SessionData>(StorageKeys.session, { userId: u.id });
    setUser(u);
    return { ok: true };
  }, []);

  const signup = useCallback<AuthContextValue["signup"]>(async (input) => {
    if (!isValidEmail(input.email)) return { ok: false, error: "Invalid email address." };
    if (input.password.length < 6) return { ok: false, error: "Password must be 6+ characters." };
    if (!input.displayName.trim()) return { ok: false, error: "Display name is required." };
    if (!input.username.trim()) return { ok: false, error: "Username is required." };

    const users = await readJSON<UnilessUser[]>(StorageKeys.users, []);
    if (users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    if (users.some((u) => u.username.toLowerCase() === input.username.trim().toLowerCase())) {
      return { ok: false, error: "Username is taken." };
    }

    const newUser: UnilessUser = {
      id: genId("u"),
      email: input.email.trim(),
      passwordHash: demoHashPassword(input.password),
      displayName: input.displayName.trim(),
      username: input.username.trim(),
      university: input.university.trim() || "My University",
      major: input.major.trim() || "Undeclared",
      year: input.year.trim() || "First-year",
      bio: input.bio?.trim() ?? "",
      avatarColor: pickColor(input.username),
      privacy: input.privacy ?? "public",
      interests: [],
      skillsOffered: [],
      skillsWanted: [],
      createdAt: Date.now(),
    };

    const next = [...users, newUser];
    await writeJSON(StorageKeys.users, next);
    await writeJSON<SessionData>(StorageKeys.session, { userId: newUser.id });
    setAllUsers(next);
    setUser(newUser);
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await writeJSON<SessionData | null>(StorageKeys.session, null);
    setUser(null);
  }, []);

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(
    async (patch) => {
      if (!user) return;
      const users = await readJSON<UnilessUser[]>(StorageKeys.users, []);
      const next = users.map((u) => (u.id === user.id ? { ...u, ...patch, id: u.id, email: u.email, passwordHash: u.passwordHash } : u));
      await writeJSON(StorageKeys.users, next);
      setAllUsers(next);
      const updated = next.find((u) => u.id === user.id) ?? null;
      setUser(updated);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ ready, user, allUsers, login, signup, logout, updateProfile, reloadUsers }),
    [ready, user, allUsers, login, signup, logout, updateProfile, reloadUsers],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
