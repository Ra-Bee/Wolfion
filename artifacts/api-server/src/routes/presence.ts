import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { getAuth } from "@clerk/express";
import { firebaseDb } from "../lib/firebase";

const router: IRouter = Router();

// A signed-in client pings this every ~60s while the app is open. Allow a
// generous burst (multiple tabs / quick foreground toggles) but still cap
// abuse. Keyed per Clerk user id when present.
const presenceLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const auth = getAuth(req);
    return auth?.userId ?? req.ip ?? "anon";
  },
  message: { error: "Too many presence pings" },
});

/**
 * POST /api/presence
 *
 * Records a live "heartbeat" for the signed-in user in Firebase RTDB at
 * `presence/<clerkUserId>`. The admin user list reads these heartbeats to
 * show an accurate "online now" status.
 *
 * Why this exists: Clerk's own `lastActiveAt` only advances roughly once a
 * day, so a person actively using the app was showing up as "seen hours
 * ago". This endpoint gives us a fresh, first-party timestamp instead.
 */
router.post("/presence", presenceLimiter, async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Sign in required" });
    return;
  }
  try {
    await firebaseDb()
      .ref(`presence/${auth.userId}`)
      .set({ lastSeen: Date.now() });
    res.json({ ok: true });
  } catch (err) {
    req.log?.error({ err }, "presence write failed");
    res.status(500).json({ error: "Could not record presence" });
  }
});

export default router;
