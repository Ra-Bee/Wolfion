import { useEffect, useRef, useState } from "react";
import { useSignIn } from "@clerk/react/legacy";
import { useLocation } from "wouter";
import { isNativeApp, onDeepLink, closeSystemBrowser } from "@/lib/native";

/**
 * Android-app only: listens for the wolfion://sso?ticket=… deep link that
 * the system browser sends back after Google (or password) login finishes
 * on wolfion.website. Signs the WebView in with the one-time ticket.
 *
 * Mounted once at the app root so the deep link is caught no matter which
 * screen the user is on — including when the link LAUNCHES the app.
 */
export function DeepLinkSignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [, navigate] = useLocation();
  const [pendingTicket, setPendingTicket] = useState<string | null>(null);
  const consumedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isNativeApp()) return;
    return onDeepLink((url) => {
      try {
        // Only accept the exact links that carry the login ticket:
        //  - https://wolfion.website/app-sso?ticket=… (verified App Link)
        //  - wolfion://sso?ticket=…                  (legacy fallback)
        // Reject anything else so a crafted link can't inject a ticket.
        const parsed = new URL(url);
        const TRUSTED_HOSTS = [
          "www.wolfion.com.au",
          "wolfion.com.au",
          // Old domain — kept during the transition period.
          "wolfion.website",
        ];
        const isAppLink =
          parsed.protocol === "https:" &&
          TRUSTED_HOSTS.includes(parsed.host) &&
          parsed.pathname.replace(/\/+$/, "") === "/app-sso";
        const isLegacy =
          parsed.protocol === "wolfion:" &&
          (parsed.host || parsed.pathname.replace(/^\/+/, "")) === "sso";
        if (!isAppLink && !isLegacy) return;
        const ticket = parsed.searchParams.get("ticket");
        if (ticket) setPendingTicket(ticket);
      } catch {
        /* ignore malformed links */
      }
    });
  }, []);

  useEffect(() => {
    if (!pendingTicket || !isLoaded || !signIn) return;
    if (consumedRef.current === pendingTicket) return;
    consumedRef.current = pendingTicket;

    (async () => {
      try {
        await closeSystemBrowser();
        const attempt = await signIn.create({
          strategy: "ticket",
          ticket: pendingTicket,
        });
        if (attempt.status === "complete") {
          await setActive({ session: attempt.createdSessionId });
          navigate("/");
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[wolfion] ticket sign-in failed", err);
      } finally {
        setPendingTicket(null);
      }
    })();
  }, [pendingTicket, isLoaded, signIn, setActive, navigate]);

  return null;
}
