import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { clerkClient, getAuth } from "@clerk/express";
import { ADMIN_EMAILS } from "../lib/admin";
import { firebaseAuth } from "../lib/firebase";

const ADMIN_EMAIL_SET = new Set(
  ADMIN_EMAILS.map((e) => e.trim().toLowerCase()),
);

const router: IRouter = Router();

// Throttle the token mint endpoint to defend against:
//   - a stolen Clerk session being used to spam token mints (Firebase
//     custom-token minting + Clerk user lookups both have cost/quota);
//   - a misbehaving client looping on the bridge endpoint.
// Limit is per Clerk user id when present (more precise than IP behind
// the Replit proxy), with IP as fallback for unauthenticated retries.
const tokenLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const auth = getAuth(req);
    return auth?.userId ?? req.ip ?? "anon";
  },
  message: { error: "Too many token requests; please slow down." },
});

/**
 * POST /api/firebase/token
 *
 * Exchanges a Clerk session for a short-lived Firebase custom token that
 * the web client uses to sign in to Firebase Auth and open authenticated
 * Realtime Database subscriptions.
 *
 * Steps:
 *   1. Verify Clerk session (via clerkMiddleware mounted in app.ts).
 *   2. Look up the user, pull primary email.
 *   3. Reject if the email is not in the admin allow-list.
 *   4. Mint a Firebase custom token with uid = `clerk_<userId>` and
 *      custom claims { admin: true, email }. RTDB rules use
 *      `auth.token.admin === true` to authorise reads/writes.
 */
router.post("/firebase/token", tokenLimiter, async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Sign in required" });
    return;
  }
  try {
    const user = await clerkClient.users.getUser(auth.userId);
    const email = user.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
    if (!email || !ADMIN_EMAIL_SET.has(email)) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
    const uid = `clerk_${auth.userId}`;
    const token = await firebaseAuth().createCustomToken(uid, {
      admin: true,
      email,
    });
    res.json({ token, uid, email });
  } catch (err) {
    req.log?.error({ err }, "firebase token mint failed");
    res.status(500).json({ error: "Could not mint Firebase token" });
  }
});

export default router;
