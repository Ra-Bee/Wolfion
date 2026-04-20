import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import { isAdminEmail } from "@/lib/admin";

export type Mode = "admin" | "customer";
export type Role = Mode | null;

const STORAGE_KEY = "wolfion_mode";

function readStoredMode(): Mode | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "admin" || v === "customer" ? v : null;
  } catch {
    return null;
  }
}

export function useRole() {
  const { user, isLoaded } = useUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = isAdminEmail(email);

  const [storedMode, setStoredMode] = useState<Mode | null>(() => readStoredMode());

  // Keep state in sync if storage changes (other tabs)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setStoredMode(readStoredMode());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Effective role:
  //  - Until user is loaded → null (router will wait)
  //  - Non-admins are always "customer" (no choice)
  //  - Admins use their stored choice; null means "needs to pick"
  let role: Role;
  if (!isLoaded) {
    role = null;
  } else if (!user) {
    role = null;
  } else if (!isAdmin) {
    role = "customer";
  } else {
    role = storedMode;
  }

  const setRole = useCallback(
    (newRole: Role) => {
      // Non-admins can never become admin
      if (!isAdmin && newRole === "admin") return;
      setStoredMode(newRole);
      try {
        if (newRole) localStorage.setItem(STORAGE_KEY, newRole);
        else localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    },
    [isAdmin],
  );

  return { role, setRole, isAdmin };
}
