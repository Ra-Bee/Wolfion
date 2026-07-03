import { createRoot } from "react-dom/client";
import { inject } from '@vercel/analytics';
import App from "./App";
import "./index.css";

inject();

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
