import { clerkClient, getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

// Admin allowlist mirrored from artifacts/wolfion/src/lib/admin.ts.
// Keep these in sync when adding new admins.
export const ADMIN_EMAILS: string[] = [
  "md.rabbybaparilmn@gmail.com",
  "md.rabbybaparilmn4@gmail.com",
];

const ADMIN_EMAIL_SET = new Set(
  ADMIN_EMAILS.map((e) => e.trim().toLowerCase()),
);

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAIL_SET.has(email.trim().toLowerCase());
}

/**
 * Express middleware that gates a route to admin users only.
 *
 * Verifies the request carries a Clerk session, then fetches the user
 * record so we can check their primary email against ADMIN_EMAILS.
 * Returns 401 for unauthenticated requests, 403 for non-admin users,
 * and 500 if the Clerk lookup fails.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Sign in required" });
    return;
  }
  try {
    const user = await clerkClient.users.getUser(auth.userId);
    const email = user.primaryEmailAddress?.emailAddress;
    if (!isAdminEmail(email)) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
    next();
  } catch (err) {
    req.log?.error({ err }, "admin lookup failed");
    res.status(500).json({ error: "Could not verify admin access" });
  }
}
