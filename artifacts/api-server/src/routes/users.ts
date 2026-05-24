import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { clerkClient, getAuth } from "@clerk/express";
import { ADMIN_EMAILS } from "../lib/admin";

const ADMIN_EMAIL_SET = new Set(
  ADMIN_EMAILS.map((e) => e.trim().toLowerCase()),
);

const router: IRouter = Router();

const listLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const auth = getAuth(req);
    return auth?.userId ?? req.ip ?? "anon";
  },
  message: { error: "Too many requests" },
});

type UserListItem = {
  id: string;
  email: string | null;
  fullName: string | null;
  imageUrl: string | null;
  isAdmin: boolean;
  createdAt: number | null;
  lastSignInAt: number | null;
  lastActiveAt: number | null;
};

/**
 * GET /api/users
 *
 * Admin-only. Returns every Clerk user (sign-ups) with the data needed
 * to render an "online / offline" user list in the admin dashboard.
 *
 * "Online" is computed on the client as: lastActiveAt within the last
 * ~5 minutes. Clerk updates lastActiveAt on every active session
 * heartbeat, so anyone with the app open in the foreground will tick.
 */
router.get("/users", listLimiter, async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Sign in required" });
    return;
  }
  try {
    const me = await clerkClient.users.getUser(auth.userId);
    const myEmail =
      me.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
    if (!myEmail || !ADMIN_EMAIL_SET.has(myEmail)) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    // Paginate through Clerk to gather every user. One getUserList call
    // is capped at 500 — without looping we'd silently truncate larger
    // tenants and the "Total / Online / Offline" counters would lie.
    const PAGE = 500;
    const HARD_CAP = 10_000; // safety net against runaway loops
    type ClerkUser = Awaited<
      ReturnType<typeof clerkClient.users.getUserList>
    >["data"][number];
    const collected: ClerkUser[] = [];
    let offset = 0;
    let totalCount = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const page = await clerkClient.users.getUserList({
        limit: PAGE,
        offset,
        orderBy: "-created_at",
      });
      totalCount = page.totalCount;
      collected.push(...page.data);
      if (
        page.data.length < PAGE ||
        collected.length >= totalCount ||
        collected.length >= HARD_CAP
      ) {
        break;
      }
      offset += PAGE;
    }

    const users: UserListItem[] = collected.map((u) => {
      const email =
        u.primaryEmailAddress?.emailAddress ??
        u.emailAddresses[0]?.emailAddress ??
        null;
      const fullName =
        [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || null;
      return {
        id: u.id,
        email,
        fullName,
        imageUrl: u.imageUrl ?? null,
        isAdmin: email
          ? ADMIN_EMAIL_SET.has(email.trim().toLowerCase())
          : false,
        createdAt: u.createdAt ?? null,
        lastSignInAt: u.lastSignInAt ?? null,
        lastActiveAt: u.lastActiveAt ?? null,
      };
    });

    res.json({ users, totalCount });
  } catch (err) {
    req.log?.error({ err }, "users list fetch failed");
    res.status(500).json({ error: "Could not fetch users" });
  }
});

export default router;
