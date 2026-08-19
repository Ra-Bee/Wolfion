import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Older Android WebViews lack crypto.randomUUID; admin pages call it on
// render, which crashed the app with the error boundary. Polyfill it.
try {
  if (typeof crypto !== "undefined" && !crypto.randomUUID) {
    (crypto as { randomUUID?: () => string }).randomUUID = () => {
      const b = new Uint8Array(16);
      crypto.getRandomValues(b);
      b[6] = (b[6] & 0x0f) | 0x40;
      b[8] = (b[8] & 0x3f) | 0x80;
      const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
      return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    };
  }
} catch {
  /* ignore */
}

// Mark the document when running inside the Capacitor Android shell so CSS
// can guarantee top clearance for the camera cutout / status bar even when
// the WebView reports zero safe-area insets.
try {
  const cap = (window as unknown as {
    Capacitor?: { isNativePlatform?: () => boolean };
  }).Capacitor;
  if (cap?.isNativePlatform?.()) {
    document.documentElement.classList.add("native-app");
  }
} catch {
  /* website: ignore */
}

createRoot(document.getElementById("root")!).render(<App />);

declare global {
  interface Window {
    __wolfionHideSplash?: () => void;
  }
}

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    window.__wolfionHideSplash?.();
  });
});
