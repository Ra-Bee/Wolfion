import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { clerkClient, getAuth } from "@clerk/express";

const router: IRouter = Router();

const signupLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many sign-up attempts. Please wait a minute." },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/signup
 *
 * Creates a Clerk user directly through the Backend API instead of the
 * hosted <SignUp> flow. Users created this way have their email address
 * marked verified, so sign-up needs NO email verification code — the
 * client immediately signs the user in with the same password.
 */
router.post("/auth/signup", signupLimiter, async (req, res) => {
  const { email, password, firstName, lastName } = (req.body ?? {}) as {
    email?: unknown;
    password?: unknown;
    firstName?: unknown;
    lastName?: unknown;
  };

  const emailStr = typeof email === "string" ? email.trim().toLowerCase() : "";
  const passwordStr = typeof password === "string" ? password : "";

  if (!EMAIL_RE.test(emailStr)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  if (passwordStr.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters." });
  }

  try {
    await clerkClient.users.createUser({
      emailAddress: [emailStr],
      password: passwordStr,
      ...(typeof firstName === "string" && firstName.trim()
        ? { firstName: firstName.trim().slice(0, 60) }
        : {}),
      ...(typeof lastName === "string" && lastName.trim()
        ? { lastName: lastName.trim().slice(0, 60) }
        : {}),
    });
    return res.status(201).json({ ok: true });
  } catch (err) {
    const anyErr = err as {
      status?: number;
      errors?: Array<{ code?: string; message?: string; longMessage?: string }>;
    };
    const first = anyErr.errors?.[0];
    const code = first?.code ?? "";
    if (
      code === "form_identifier_exists" ||
      code === "duplicate_record" ||
      anyErr.status === 409 ||
      (anyErr.status === 422 && code.includes("exists"))
    ) {
      return res.status(409).json({
        error: "An account with this email already exists. Please sign in.",
      });
    }
    if (code === "form_password_pwned") {
      return res.status(422).json({
        error:
          "This password has appeared in a data breach. Please choose a different password.",
      });
    }
    if (anyErr.status === 422) {
      return res
        .status(422)
        .json({ error: first?.longMessage || first?.message || "Invalid sign-up details." });
    }
    req.log?.error({ err }, "signup failed");
    return res.status(500).json({ error: "Sign-up failed. Please try again." });
  }
});

const loginLimiter = rateLimit({
  windowMs: 60_000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please wait a minute." },
});

/**
 * POST /api/auth/login
 *
 * Password login WITHOUT any email verification code. Clerk started
 * demanding an email-code "second factor" on client-side password
 * sign-ins, which the owner explicitly does not want. So we verify the
 * password server-side via the Backend API (verifyPassword) and return a
 * one-time sign-in ticket the client redeems with strategy "ticket" —
 * ticket sign-ins skip second factors.
 */
router.post("/auth/login", loginLimiter, async (req, res) => {
  const { email, password } = (req.body ?? {}) as {
    email?: unknown;
    password?: unknown;
  };
  const emailStr = typeof email === "string" ? email.trim().toLowerCase() : "";
  const passwordStr = typeof password === "string" ? password : "";
  const INVALID = { error: "Email or password is incorrect." };
  if (!EMAIL_RE.test(emailStr) || passwordStr.length < 1) {
    return res.status(401).json(INVALID);
  }
  try {
    const list = await clerkClient.users.getUserList({
      emailAddress: [emailStr],
      limit: 1,
    });
    const user = list.data[0];
    if (!user) return res.status(401).json(INVALID);
    if (!user.passwordEnabled) {
      return res.status(401).json({
        error:
          "This account uses Google sign-in. Please use the Google button.",
      });
    }
    try {
      await clerkClient.users.verifyPassword({
        userId: user.id,
        password: passwordStr,
      });
    } catch {
      return res.status(401).json(INVALID);
    }
    const token = await clerkClient.signInTokens.createSignInToken({
      userId: user.id,
      expiresInSeconds: 120,
    });
    return res.json({ ticket: token.token });
  } catch (err) {
    req.log?.error({ err }, "password login failed");
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
});

const handoffLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a minute." },
});

/**
 * POST /api/auth/handoff
 *
 * Called from the phone's system browser AFTER the user has a Clerk
 * session there (Google login happens in the real browser because Google
 * blocks OAuth inside WebViews). Issues a one-time Clerk sign-in token
 * that the Android app's WebView redeems (signIn strategy "ticket") to
 * establish the same user's session inside the app.
 *
 * Auth: requires a valid Clerk session JWT (Authorization: Bearer …),
 * verified by clerkMiddleware. The token is scoped to that user only and
 * expires quickly, so it cannot be used to hijack another account.
 */
router.post("/auth/handoff", handoffLimiter, async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Not signed in." });
  }
  try {
    const token = await clerkClient.signInTokens.createSignInToken({
      userId,
      expiresInSeconds: 300,
    });
    return res.json({ ticket: token.token });
  } catch (err) {
    req.log?.error({ err }, "handoff token creation failed");
    return res.status(500).json({ error: "Could not hand off the session." });
  }
});

export default router;
