import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

const THEME_KEY = "wolfion_theme";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  return { theme, setTheme, toggleTheme };
}
