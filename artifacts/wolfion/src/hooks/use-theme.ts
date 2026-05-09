import { useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
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
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return "system";
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

function resolve(pref: ThemePreference): ThemeMode {
  return pref === "system" ? getSystemMode() : pref;
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(getInitialPreference);
  const [theme, setTheme] = useState<ThemeMode>(() => resolve(getInitialPreference()));

  // Apply theme + persist preference
  useEffect(() => {
    const mode = resolve(preference);
    setTheme(mode);
    applyTheme(mode);
    try {
      localStorage.setItem(THEME_KEY, preference);
    } catch {
      /* ignore */
    }
  }, [preference]);

  // Live-follow OS dark mode toggle while preference === "system"
  useEffect(() => {
    if (preference !== "system" || typeof window === "undefined" || !window.matchMedia) {
      return;
    }
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const mode: ThemeMode = mql.matches ? "dark" : "light";
      setTheme(mode);
      applyTheme(mode);
    };
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [preference]);

  // Cycle: light -> dark -> system -> light ...
  function toggleTheme() {
    setPreference((prev) => (prev === "light" ? "dark" : prev === "dark" ? "system" : "light"));
  }

  return { theme, preference, setPreference, toggleTheme };
}
