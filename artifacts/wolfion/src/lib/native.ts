/**
 * Helpers for running inside the Capacitor Android shell.
 *
 * The app loads wolfion.website remotely (capacitor.config.ts server.url),
 * so we cannot import @capacitor/* JS packages at build time for the web
 * bundle — instead we talk to the injected `window.Capacitor` bridge.
 * The native plugins (@capacitor/app, @capacitor/browser) ARE installed in
 * the Android project, which is what makes these bridge calls work.
 */

type CapacitorBridge = {
  isNativePlatform?: () => boolean;
  Plugins?: {
    Browser?: {
      open: (opts: { url: string }) => Promise<void>;
      close: () => Promise<void>;
    };
    App?: {
      addListener: (
        event: "appUrlOpen",
        cb: (data: { url: string }) => void,
      ) => Promise<{ remove: () => void }> | { remove: () => void };
      getLaunchUrl: () => Promise<{ url?: string } | null>;
    };
  };
};

function bridge(): CapacitorBridge | undefined {
  return (window as unknown as { Capacitor?: CapacitorBridge }).Capacitor;
}

/** True when running inside the Android (Capacitor) app. */
export function isNativeApp(): boolean {
  try {
    return !!bridge()?.isNativePlatform?.();
  } catch {
    return false;
  }
}

/**
 * True when the installed app version has the Browser plugin (v1.0.9+).
 * Older versions can't open the system browser or receive the wolfion://
 * deep link, so Google login is impossible there.
 */
export function hasSystemBrowser(): boolean {
  try {
    return !!bridge()?.Plugins?.Browser;
  } catch {
    return false;
  }
}

/** Open a URL in the system browser (Chrome Custom Tab). */
export async function openInSystemBrowser(url: string): Promise<void> {
  const b = bridge()?.Plugins?.Browser;
  if (b) {
    await b.open({ url });
  } else {
    window.open(url, "_blank");
  }
}

/** Close the system browser sheet if it is open. Best-effort. */
export async function closeSystemBrowser(): Promise<void> {
  try {
    await bridge()?.Plugins?.Browser?.close();
  } catch {
    /* not fatal */
  }
}

/**
 * Subscribe to deep links (wolfion://…) that open the app, including the
 * one that may have launched it. Returns an unsubscribe function.
 */
export function onDeepLink(cb: (url: string) => void): () => void {
  const app = bridge()?.Plugins?.App;
  if (!app) return () => {};

  let removed = false;
  let remover: (() => void) | null = null;

  Promise.resolve(app.addListener("appUrlOpen", (data) => cb(data.url))).then(
    (handle) => {
      if (removed) handle.remove();
      else remover = () => handle.remove();
    },
  );

  app
    .getLaunchUrl()
    .then((res) => {
      if (res?.url) cb(res.url);
    })
    .catch(() => {});

  return () => {
    removed = true;
    remover?.();
  };
}
