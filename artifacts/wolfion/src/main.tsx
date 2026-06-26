import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

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
