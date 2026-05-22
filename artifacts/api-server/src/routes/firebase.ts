import { Router, type IRouter } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { ADMIN_EMAILS } from "../lib/admin";
import { firebaseAuth } from "../lib/firebase";

const ADMIN_EMAIL_SET = new Set(
  ADMIN_EMAILS.map((e) => e.trim().toLowerCase()),
);

const router: IRouter = Router();

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
router.post("/firebase/token", async (req, res) => {
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
