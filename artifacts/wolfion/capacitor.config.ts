import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.wolfion.app",
  appName: "Wolfion",
  webDir: "dist/public",
  android: {
    allowMixedContent: false,
  },
  // Present a standard Chrome-on-Android user agent (no "wv" WebView marker)
  // so Google's OAuth "disallowed_useragent" check passes and users can sign
  // in with Google inside the app instead of being kicked to external Chrome.
  overrideUserAgent:
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  server: {
    androidScheme: "https",
    // Mirror the live website exactly: the app loads wolfion.website
    // directly, so the app and site are always identical (same design,
    // same data, same domain) and website updates appear instantly with
    // no app rebuild. Requires internet, which the app needs anyway.
    url: "https://www.wolfion.com.au",
    cleartext: false,
    // Keep the OAuth (Google + Clerk) redirect chain inside the app's
    // WebView instead of bouncing out to an external browser, so the
    // sign-in session lands back in the app.
    // NOTE: Google's sign-in chain hops through more hosts than just
    // accounts.google.com — notably accounts.youtube.com (a cookie-sync
    // redirect). Any host missing from this list gets kicked out to the
    // external browser mid-login, stranding the user (this is why tapping
    // "Continue with Google" used to open Chrome on a YouTube page).
    // Keep this least-privilege: only hosts the login flow top-level
    // navigates to. Sub-resources (gstatic, googleusercontent images,
    // etc.) do NOT need listing.
    allowNavigation: [
      "www.wolfion.com.au",
      "wolfion.com.au",
      // Old domain — kept during the transition so existing links and any
      // redirects from wolfion.website still stay inside the app.
      "wolfion.website",
      "accounts.google.com",
      "accounts.youtube.com",
      "myaccount.google.com",
      "*.clerk.accounts.dev",
    ],
  },
};

export default config;
