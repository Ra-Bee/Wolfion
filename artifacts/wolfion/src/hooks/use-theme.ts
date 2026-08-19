import { useEffect, useState } from "react";

export type ThemePreference = "light" | "dark";
export type ThemeMode = "light" | "dark";

const THEME_KEY = "wolfion_theme";

function getSystemMode(): ThemeMode {
  if (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

function getInitialPreference(): ThemePreference {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    // Migrate legacy "system" preference to a concrete mode based on
    // the user's current OS setting, then forget the system option.
    if (stored === "system") return getSystemMode();
  } catch {
    /* ignore */
  }
  // First-time visitors fall back to whatever their OS prefers, but
  // we lock that choice in immediately rather than tracking it live.
  return getSystemMode();
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  // Keep native form controls / scrollbars in sync with the chosen theme.
  root.style.colorScheme = mode === "dark" ? "dark" : "light";
  root.style.background = mode === "dark" ? "#0a0a0a" : "#ffffff";
  // Flip the Android status-bar / iOS safari URL bar color so the system
  // chrome around the app matches the in-app theme even when the user
  // overrides the OS preference.
  const fill = mode === "dark" ? "#0a0a0a" : "#ffffff";
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  metas.forEach((m) => m.setAttribute("content", fill));
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(getInitialPreference);
  const [theme, setTheme] = useState<ThemeMode>(getInitialPreference);

  // Apply theme + persist preference whenever it changes.
  useEffect(() => {
    setTheme(preference);
    applyTheme(preference);
    try {
      localStorage.setItem(THEME_KEY, preference);
    } catch {
      /* ignore */
    }
  }, [preference]);

  // Simple flip: light <-> dark. The "system" option was removed at
  // the user's request — only two concrete modes are supported now.
  function toggleTheme() {
    setPreference((prev) => (prev === "light" ? "dark" : "light"));
  }

  return { theme, preference, setPreference, toggleTheme };
}
