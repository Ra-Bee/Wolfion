import { useState } from "react";
import { useSignIn } from "@clerk/react/legacy";
import { useLocation } from "wouter";
import { AuthShell } from "@/components/auth-shell";
import { apiFetch } from "@/lib/api";
import {
  isNativeApp,
  openInSystemBrowser,
  hasSystemBrowser,
} from "@/lib/native";

/**
 * Custom sign-up page.
 *
 * Why not Clerk's <SignUp> component? Its hosted flow forces an email
 * verification code after entering a password, which the owner does not
 * want. Instead we create the account server-side (POST /api/auth/signup
 * -> Clerk Backend API, email arrives already verified) and then sign the
 * user straight in with the same password — no code step at all.
 */
export default function SignUpPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const { signIn, setActive, isLoaded } = useSignIn();
  const [, navigate] = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !isLoaded || !signIn) return;
    setError(null);

    const emailTrim = email.trim();
    if (!emailTrim || !/^\S+@\S+\.\S+$/.test(emailTrim)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setBusy(true);
    try {
      const [firstName, ...rest] = name.trim().split(/\s+/).filter(Boolean);
      const res = await apiFetch("auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailTrim,
          password,
          firstName: firstName ?? "",
          lastName: rest.join(" "),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Sign-up failed. Please try again.");
        setBusy(false);
        return;
      }

      // Account created (email already verified) — sign straight in.
      // One retry after a short delay absorbs the rare case where the
      // freshly created user hasn't propagated yet.
      let attempt;
      try {
        attempt = await signIn.create({ identifier: emailTrim, password });
      } catch {
        await new Promise((r) => setTimeout(r, 1200));
        attempt = await signIn.create({ identifier: emailTrim, password });
      }
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        navigate("/");
      } else {
        // Extremely unlikely (no 2FA configured); fall back to sign-in page.
        navigate("/sign-in");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    // Inside the Android app: Google OAuth must run in the phone's real
    // browser (Google blocks WebViews). The browser hands the finished
    // login back via wolfion:// deep link. Same flow as the sign-in page.
    if (isNativeApp()) {
      if (!hasSystemBrowser()) {
        setError(
          "Google login needs the new app version (1.0.9). Please install the latest APK / update from Google Play, then try again.",
        );
        return;
      }
      await openInSystemBrowser(
        `${window.location.origin}${basePath}/sign-in?handoff=app`,
      );
      return;
    }
    if (!isLoaded || !signIn) return;
    setError(null);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${basePath}/sign-in/sso-callback`,
        redirectUrlComplete: `${basePath}/`,
      });
    } catch {
      setError("Google sign-up failed. Please try again.");
    }
  };

  const inputCls =
    "h-12 w-full rounded-full border border-neutral-300 dark:border-white/15 bg-white dark:bg-white/[0.04] px-4 text-sm text-black dark:text-white placeholder:text-neutral-500 dark:placeholder:text-white/35 outline-none transition-all focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white";

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Welcome to Wolfion"
      subtitle="Join the world of premium fashion in under a minute"
    >
      <div className="w-full">
        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-neutral-300 dark:border-white/10 bg-white/50 dark:bg-[#0a0a0a]/50 text-[11px] uppercase tracking-widest font-medium text-black dark:text-white backdrop-blur-md shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-all hover:bg-neutral-100 dark:hover:bg-white/10 active:scale-[0.98] disabled:opacity-60"
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
          <span className="text-[9px] uppercase tracking-widest text-neutral-400">or sign up with email</span>
          <div className="h-px flex-1 bg-neutral-200 dark:bg-white/15" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-2 block pl-2 text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-500">
              Name
            </label>
            <input
              className={inputCls}
              type="text"
              autoComplete="name"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
            <label className="mb-2 block pl-2 text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-500">
              Password
            </label>
            <input
              className={inputCls}
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
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
            {busy ? "Creating your account…" : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-neutral-500 font-light">
          Already have an account?{" "}
          <a
            href={`${basePath}/sign-in`}
            className="font-medium text-black dark:text-white no-underline hover:underline transition-colors"
          >
            Sign in
          </a>
        </p>
      </div>
    </AuthShell>
  );
}
