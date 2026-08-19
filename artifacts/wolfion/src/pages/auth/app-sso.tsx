import { useEffect, useState } from "react";
import { isNativeApp } from "@/lib/native";

/**
 * Fallback page for the https://wolfion.website/app-sso?ticket=… App Link.
 *
 * Normally the OS hands this URL straight to the Wolfion Android app
 * (verified App Link) and this page never renders. If App Link
 * verification is unavailable (old Android, sideloaded build with a
 * different cert, etc.) the browser lands here instead — so we bounce the
 * one-time ticket into the app via the legacy wolfion://sso scheme.
 *
 * Inside the app's own WebView the ticket is redeemed by DeepLinkSignIn
 * at the app root, so this page does nothing there.
 */
export default function AppSsoPage() {
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isNativeApp()) return; // DeepLinkSignIn handles it in the app
    const ticket = new URLSearchParams(window.location.search).get("ticket");
    if (!ticket) return;
    const url = `wolfion://sso?ticket=${encodeURIComponent(ticket)}`;
    setFallbackUrl(url);
    window.location.href = url;
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-center">
      <div>
        <p className="text-[15px] font-semibold text-white">
          Returning to the Wolfion app…
        </p>
        <p className="mt-2 text-[13px] text-white/60">
          If nothing happens, tap the button below.
        </p>
        {fallbackUrl ? (
          <a
            href={fallbackUrl}
            className="mt-4 inline-block rounded-[10px] bg-gradient-to-r from-[#1ABBC4] to-[#16D4DD] px-5 py-2.5 font-semibold text-black"
          >
            Open Wolfion app
          </a>
        ) : null}
      </div>
    </div>
  );
}
