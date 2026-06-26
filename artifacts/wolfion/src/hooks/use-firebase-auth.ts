import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import {
  signInWithCustomToken,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { useRole } from "@/hooks/use-role";

type CloudStatus = "idle" | "signing-in" | "ready" | "error" | "not-admin";

/**
 * Bridges Clerk auth -> Firebase Auth so the admin client can open
 * authenticated Realtime Database subscriptions.
 *
 * Lifecycle:
 *   1. Wait for Clerk to load and confirm the user is a signed-in admin.
 *   2. Get a Clerk session JWT, POST it to /api/firebase/token, receive
 *      a Firebase custom token.
 *   3. signInWithCustomToken on the Firebase client.
 *   4. Observe firebase auth state, expose `ready` when uid matches.
 *
 * Re-runs if the Clerk user id changes (sign-in / sign-out / switch).
 * Safe to mount multiple times: the `signInWithCustomToken` call is
 * naturally idempotent for the same uid and we short-circuit when the
 * Firebase client is already signed in as the expected user.
 *
 * Non-admin or signed-out Clerk state -> we sign the Firebase client
 * out so a previously authenticated admin session can't linger after
 * a role switch or logout.
 */
export function useFirebaseAuth() {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();
  const { isAdmin } = useRole();
  const [status, setStatus] = useState<CloudStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  // Subscribe to Firebase auth state so the rest of the app can react
  // to "we're actually signed in to Firebase now".
  useEffect(() => {
    const auth = firebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid ?? null);
      // If something else (e.g. token expiry) drops the session and we
      // were previously ready, fall back to idle so the next effect run
      // can re-bridge.
      if (!u) {
        setStatus((prev) => (prev === "ready" ? "idle" : prev));
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const auth = firebaseAuth();

    // Clerk signed out -> drop Firebase session too.
    if (!isSignedIn || !userId) {
      if (auth.currentUser) void signOut(auth);
      setStatus("idle");
      setError(null);
      return;
    }

    // Signed-in non-admin (customer mode). Make sure any leftover
    // Firebase admin session is killed before declaring not-admin.
    if (!isAdmin) {
      if (auth.currentUser) void signOut(auth);
      setStatus("not-admin");
      setError(null);
      return;
    }

    // Already signed in as the right user -> nothing to do.
    const expectedUid = `clerk_${userId}`;
    if (auth.currentUser?.uid === expectedUid) {
      setStatus("ready");
      return;
    }

    let cancelled = false;
    setStatus("signing-in");
    setError(null);

    (async () => {
      try {
        // Re-check inside async in case another effect already finished
        // the sign-in by the time we run (StrictMode double-invoke).
        if (firebaseAuth().currentUser?.uid === expectedUid) {
          if (!cancelled) setStatus("ready");
          return;
        }
        const sessionToken = await getToken();
        if (!sessionToken) throw new Error("No Clerk session token");
        const res = await fetch(
          `${import.meta.env.BASE_URL}api/firebase/token`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${sessionToken}`,
            },
          },
        );
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(body.error ?? `Token mint failed (${res.status})`);
        }
        const { token } = (await res.json()) as { token: string };
        // Once more — bail if a parallel mount finished first.
        if (firebaseAuth().currentUser?.uid === expectedUid) {
          if (!cancelled) setStatus("ready");
          return;
        }
        await signInWithCustomToken(firebaseAuth(), token);
        if (!cancelled) setStatus("ready");
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setError(err instanceof Error ? err.message : String(err));
          // eslint-disable-next-line no-console
          console.error("[wolfion] firebase bridge failed", err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // user object identity changes on every Clerk poll; key on userId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, userId, isAdmin]);

  return {
    cloudReady: status === "ready" && uid !== null,
    cloudStatus: status,
    cloudError: error,
    cloudUid: uid,
    cloudEmail:
      user?.primaryEmailAddress?.emailAddress ??
      user?.emailAddresses?.[0]?.emailAddress ??
      null,
  };
}
