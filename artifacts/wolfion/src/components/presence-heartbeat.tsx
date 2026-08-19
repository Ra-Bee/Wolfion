import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api";

const HEARTBEAT_MS = 60_000;

/**
 * Pings the backend while a signed-in user has the app open so the admin
 * "User List" can show an accurate live "online now" status.
 *
 * Clerk's own lastActiveAt only advances about once a day, which made an
 * actively-using person appear as "seen hours ago". This sends a fresh
 * first-party heartbeat on mount, every 60s, and whenever the app returns
 * to the foreground. Renders nothing.
 */
export function PresenceHeartbeat() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;

    const ping = async () => {
      try {
        const token = await getToken();
        if (cancelled || !token) return;
        await apiFetch("presence", {
          method: "POST",
          headers: { authorization: `Bearer ${token}` },
        });
      } catch {
        // Presence is best-effort; ignore transient failures.
      }
    };

    void ping();
    const interval = setInterval(() => void ping(), HEARTBEAT_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void ping();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isLoaded, isSignedIn, getToken]);

  return null;
}
