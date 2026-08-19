import { useEffect, useState } from "react";
import {
  AuthenticateWithRedirectCallback,
  useClerk,
  useUser,
} from "@clerk/react";
import { useSignIn } from "@clerk/react/legacy";
import { useLocation } from "wouter";
import { AuthShell } from "@/components/auth-shell";
import { isNativeApp, openInSystemBrowser } from "@/lib/native";

const HANDOFF_FLAG = "wolfion-app-handoff";

/** True when this browser tab was opened by the Android app to do login. */
function isHandoffSession(): boolean {
  try {
    return (
      new URLSearchParams(window.location.search).get("handoff") === "app" ||
      sessionStorage.getItem(HANDOFF_FLAG) === "1"
    );
  } catch {
    return false;
  }
}

/**
 * Custom sign-in page.
 *
 * Why not Clerk's <SignIn> component?
 * 1. Its hosted flow can demand an email verification code (e.g. "verify
 *    this device"), which the owner does not want — a correct password
 *    must be enough.
 * 2. Its Google button uses a popup (window.open), which inside the
 *    Android app's WebView opens an external browser and strands the user
 *    there. authenticateWithRedirect keeps the whole Google flow inside
 *    the WebView (allowNavigation covers the hop hosts).
 *
 * The /sign-in/sso-callback subpath still needs Clerk's callback handler
 * to finish OAuth (including transferring brand-new Google users into a
 * sign-up), so we render <AuthenticateWithRedirectCallback> there.
 */
export default function SignInPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const isSsoCallback = window.location.pathname.includes("/sso-callback");

  if (isSsoCallback) {
    return (
      <AuthShell
        eyebrow="Sign in"
        title="Finishing sign-in"
        subtitle="One moment while we complete your Google sign-in…"
      >
        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl={`${basePath}/`}
          signUpFallbackRedirectUrl={`${basePath}/`}
        />
      </AuthShell>
    );
  }

  return <SignInForm basePath={basePath} />;
}

/**
 * Runs in the phone's REAL browser (Chrome Custom Tab) after the Android
 * app sends the user here with ?handoff=app. Once a Clerk session exists
 * in this browser (via Google or password), it asks the API for a one-time
 * sign-in ticket and bounces back into the app via the wolfion:// deep
 * link, where the app signs in with that ticket. This avoids doing Google
 * OAuth inside the WebView entirely — Google blocks embedded browsers.
 */
function HandoffReturn({ basePath }: { basePath: string }) {
  const clerk = useClerk();
  const { isSignedIn, isLoaded } = useUser();
  const [state, setState] = useState<"working" | "ready" | "error">("working");
  const [deepLink, setDeepLink] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await clerk.session?.getToken();
        const res = await fetch(`${basePath}/api/auth/handoff`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`handoff failed: ${res.status}`);
        const { ticket } = (await res.json()) as { ticket: string };
        if (cancelled) return;
        // Verified Android App Link (https) — only the Wolfion app, proven
        // by assetlinks.json + its signing cert, can claim this URL. The
        // /app-sso page itself falls back to the legacy wolfion:// scheme
        // if the link opens in the browser instead of the app.
        const url = `${window.location.origin}${basePath}/app-sso?ticket=${encodeURIComponent(ticket)}`;
        setDeepLink(url);
        setState("ready");
        try {
          sessionStorage.removeItem(HANDOFF_FLAG);
        } catch {}
        // Auto-jump back into the app.
        window.location.href = url;
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, clerk, basePath]);

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="mt-4 rounded-[10px] border border-[#1ABBC4]/40 bg-[#1ABBC4]/10 p-4 text-center">
      {state === "error" ? (
        <p className="text-[13px] text-red-300">
          Could not hand the login back to the app. Close this window and try
          again.
        </p>
      ) : (
        <>
          <p className="text-[14px] font-semibold text-white">
            You're signed in!
          </p>
          <p className="mt-1 text-[13px] text-white/70">
            Returning to the Wolfion app…
          </p>
          {deepLink ? (
            <a
              href={deepLink}
              className="mt-3 inline-block rounded-[10px] bg-gradient-to-r from-[#1ABBC4] to-[#16D4DD] px-5 py-2.5 font-semibold text-black"
            >
              Open Wolfion app
            </a>
          ) : null}
        </>
      )}
    </div>
  );
}

function SignInForm({ basePath }: { basePath: string }) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // "password" = normal form, "emailCode" = OTP login, "reset" = forgot password
  const [mode, setMode] = useState<"password" | "emailCode" | "reset">("password");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [info, setInfo] = useState<string | null>(null);

  const validEmail = (): string | null => {
    const emailTrim = email.trim();
    if (!emailTrim || !/^\S+@\S+\.\S+$/.test(emailTrim)) {
      setError("Please enter a valid email address.");
      return null;
    }
    return emailTrim;
  };

  const finishSession = async (sessionId: string | null | undefined) => {
    await setActive?.({ session: sessionId });
    if (!handoff) navigate("/");
    else setBusy(false);
  };

  /** Send a one-time login code to the email. */
  const startEmailCode = async () => {
    if (busy || !isLoaded || !signIn) return;
    setError(null);
    setInfo(null);
    const emailTrim = validEmail();
    if (!emailTrim) return;
    setBusy(true);
    try {
      const attempt = await signIn.create({ identifier: emailTrim });
      const factor = attempt.supportedFirstFactors?.find(
        (f) => f.strategy === "email_code",
      ) as { emailAddressId?: string } | undefined;
      if (!factor?.emailAddressId) {
        setError("Email code login is not available for this account.");
        setBusy(false);
        return;
      }
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: factor.emailAddressId,
      });
      setMode("emailCode");
      setCode("");
      setInfo(`We emailed a login code to ${emailTrim}.`);
    } catch (err) {
      const msg =
        (err as { errors?: Array<{ message?: string; code?: string }> })
          ?.errors?.[0] ?? null;
      if (msg?.code === "form_identifier_not_found") {
        setError("No account found with this email. Please sign up first.");
      } else {
        setError(msg?.message ?? "Could not send the code. Please try again.");
      }
    }
    setBusy(false);
  };

  /** Verify the emailed login code. */
  const verifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !isLoaded || !signIn) return;
    setError(null);
    if (!code.trim()) {
      setError("Please enter the code from your email.");
      return;
    }
    setBusy(true);
    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: code.trim(),
      });
      if (attempt.status === "complete") {
        await finishSession(attempt.createdSessionId);
        return;
      }
      setError("Could not sign you in with this code.");
    } catch {
      setError("Wrong or expired code. Please try again.");
    }
    setBusy(false);
  };

  /** Send a password-reset code to the email. */
  const startReset = async () => {
    if (busy || !isLoaded || !signIn) return;
    setError(null);
    setInfo(null);
    const emailTrim = validEmail();
    if (!emailTrim) return;
    setBusy(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailTrim,
      });
      setMode("reset");
      setCode("");
      setNewPassword("");
      setInfo(`We emailed a reset code to ${emailTrim}.`);
    } catch (err) {
      const msg =
        (err as { errors?: Array<{ message?: string; code?: string }> })
          ?.errors?.[0] ?? null;
      if (msg?.code === "form_identifier_not_found") {
        setError("No account found with this email. Please sign up first.");
      } else {
        setError(msg?.message ?? "Could not send the reset code. Please try again.");
      }
    }
    setBusy(false);
  };

  /** Verify reset code and set the new password. */
  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !isLoaded || !signIn) return;
    setError(null);
    if (!code.trim()) {
      setError("Please enter the code from your email.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
      });
      if (attempt.status === "needs_new_password") {
        const done = await signIn.resetPassword({ password: newPassword });
        if (done.status === "complete") {
          await finishSession(done.createdSessionId);
          return;
        }
        setError("Could not set the new password. Please try again.");
      } else if (attempt.status === "complete") {
        await finishSession(attempt.createdSessionId);
        return;
      } else {
        setError("Could not reset your password. Please try again.");
      }
    } catch {
      setError("Wrong or expired code. Please try again.");
    }
    setBusy(false);
  };

  const backToPassword = () => {
    setMode("password");
    setError(null);
    setInfo(null);
    setCode("");
    setNewPassword("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !isLoaded || !signIn) return;
    setError(null);

    const emailTrim = email.trim();
    if (!emailTrim || !/^\S+@\S+\.\S+$/.test(emailTrim)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setBusy(true);
    try {
      const attempt = await signIn.create({
        identifier: emailTrim,
        password,
      });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        // In app-handoff mode stay on this page: <HandoffReturn> picks up
        // the fresh session and bounces back into the Android app.
        if (!handoff) navigate("/");
        else setBusy(false);
        return;
      }
      // Any non-complete status (2FA is not configured for this app) —
      // treat as failure rather than walking into a code step.
      setError("Could not sign you in. Please check your email and password.");
      setBusy(false);
    } catch (err) {
      const msg =
        (err as { errors?: Array<{ message?: string; code?: string }> })
          ?.errors?.[0] ?? null;
      if (msg?.code === "form_identifier_not_found") {
        setError("No account found with this email. Please sign up first.");
      } else if (msg?.code === "form_password_incorrect") {
        setError("Incorrect password. Please try again.");
      } else {
        setError(msg?.message ?? "Sign-in failed. Please try again.");
      }
      setBusy(false);
    }
  };

  const handoff = isHandoffSession();

  const onGoogle = async () => {
    // Inside the Android app: never run Google OAuth in the WebView
    // (Google blocks embedded browsers with "this browser may not be
    // secure"). Open the phone's real browser instead; it hands the
    // finished login back to the app via a wolfion:// deep link.
    if (isNativeApp()) {
      await openInSystemBrowser(
        `${window.location.origin}${basePath}/sign-in?handoff=app`,
      );
      return;
    }
    if (!isLoaded || !signIn) return;
    setError(null);
    try {
      if (handoff) {
        try {
          sessionStorage.setItem(HANDOFF_FLAG, "1");
        } catch {}
      }
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${basePath}/sign-in/sso-callback`,
        redirectUrlComplete: handoff
          ? `${basePath}/sign-in?handoff=app`
          : `${basePath}/`,
      });
    } catch {
      setError("Google sign-in failed. Please try again.");
    }
  };

  const inputCls =
    "h-12 w-full rounded-full border border-neutral-300 dark:border-white/15 bg-white dark:bg-white/[0.04] px-4 text-sm text-black dark:text-white placeholder:text-neutral-500 dark:placeholder:text-white/35 outline-none transition-all focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white";

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Welcome back"
      subtitle="Sign in to continue your Wolfion journey"
    >
      <div className="w-full">
        {handoff ? <HandoffReturn basePath={basePath} /> : null}
        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-neutral-300 bg-white text-[11px] uppercase tracking-widest font-medium text-black shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-all hover:bg-neutral-100 active:scale-[0.98] disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden width="16" height="16">
            <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.46a5.53 5.53 0 0 1-2.4 3.62v3h3.88c2.27-2.1 3.56-5.18 3.56-8.81Z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.1A12 12 0 0 0 12 24Z" />
            <path fill="#FBBC05" d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78l4.01-3.1Z" />
            <path fill="#EA4335" d="M12 4.76c1.76 0 3.34.6 4.59 1.8l3.44-3.44A11.98 11.98 0 0 0 1.27 6.61l4.01 3.1C6.22 6.87 8.87 4.76 12 4.76Z" />
          </svg>
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200 dark:bg-white/15" />
          <span className="text-[9px] uppercase tracking-widest text-neutral-400">or sign in with email</span>
          <div className="h-px flex-1 bg-neutral-200 dark:bg-white/15" />
        </div>

        {info ? (
          <p className="mb-3 text-center text-[13px] text-emerald-500">{info}</p>
        ) : null}

        {mode === "emailCode" ? (
          <form onSubmit={verifyEmailCode} className="space-y-4" noValidate>
            <div>
              <label className="mb-2 block pl-2 text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-500">
                Login code from email
              </label>
              <input
                className={inputCls}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter the 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            {error ? (
              <p className="mt-1 text-center text-[13px] text-red-500" role="alert">{error}</p>
            ) : null}
            <button
              type="submit"
              disabled={busy || !isLoaded}
              className="mt-2 h-14 w-full rounded-full bg-black text-white dark:bg-white dark:text-black font-medium tracking-[0.2em] uppercase text-[10px] shadow-[0_4px_14px_rgba(0,0,0,0.2)] transition-all hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? "Checking…" : "Sign in with code"}
            </button>
            <p className="text-center">
              <button type="button" onClick={backToPassword} className="text-xs text-neutral-500 underline">
                Back to password login
              </button>
            </p>
          </form>
        ) : mode === "reset" ? (
          <form onSubmit={submitReset} className="space-y-4" noValidate>
            <div>
              <label className="mb-2 block pl-2 text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-500">
                Reset code from email
              </label>
              <input
                className={inputCls}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter the 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-2 block pl-2 text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-500">
                New password
              </label>
              <input
                className={inputCls}
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            {error ? (
              <p className="mt-1 text-center text-[13px] text-red-500" role="alert">{error}</p>
            ) : null}
            <button
              type="submit"
              disabled={busy || !isLoaded}
              className="mt-2 h-14 w-full rounded-full bg-black text-white dark:bg-white dark:text-black font-medium tracking-[0.2em] uppercase text-[10px] shadow-[0_4px_14px_rgba(0,0,0,0.2)] transition-all hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? "Saving…" : "Set new password & sign in"}
            </button>
            <p className="text-center">
              <button type="button" onClick={backToPassword} className="text-xs text-neutral-500 underline">
                Back to password login
              </button>
            </p>
          </form>
        ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-2 block pl-2 text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-500">
              Email address
            </label>
            <input
              className={inputCls}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between pl-2 pr-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-500">
                Password
              </label>
              <button
                type="button"
                onClick={startReset}
                disabled={busy}
                className="text-[11px] text-neutral-500 underline disabled:opacity-60"
                data-testid="forgot-password"
              >
                Forgot password?
              </button>
            </div>
            <input
              className={inputCls}
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error ? (
            <p className="mt-1 text-center text-[13px] text-red-500" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy || !isLoaded}
            className="mt-2 h-14 w-full rounded-full bg-black text-white dark:bg-white dark:text-black font-medium tracking-[0.2em] uppercase text-[10px] shadow-[0_4px_14px_rgba(0,0,0,0.2)] transition-all hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? "Signing you in…" : "Sign in"}
          </button>

          <button
            type="button"
            onClick={startEmailCode}
            disabled={busy || !isLoaded}
            className="h-12 w-full rounded-full border border-neutral-300 dark:border-white/15 bg-transparent text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-700 dark:text-white/80 transition-all hover:bg-neutral-100 dark:hover:bg-white/10 active:scale-[0.98] disabled:opacity-60"
            data-testid="email-code-login"
          >
            Email me a login code
          </button>
        </form>
        )}

        <p className="mt-8 text-center text-xs text-neutral-500 font-light">
          New to Wolfion?{" "}
          <a
            href={`${basePath}/sign-up`}
            className="font-medium text-black dark:text-white no-underline hover:underline"
          >
            Create an account
          </a>
        </p>
      </div>
    </AuthShell>
  );
}
