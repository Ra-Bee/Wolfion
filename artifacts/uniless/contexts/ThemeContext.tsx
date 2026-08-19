import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

import { readJSON, StorageKeys, writeJSON } from "@/lib/storage";
import type { ThemePref } from "@/lib/types";

interface ThemeCtx {
  pref: ThemePref;
  setPref: (p: ThemePref) => Promise<void>;
  effectiveScheme: "light" | "dark";
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme() ?? "light";
  const [pref, setPrefState] = useState<ThemePref>("system");

  useEffect(() => {
    (async () => {
      const stored = await readJSON<ThemePref>(StorageKeys.themePref, "system");
      setPrefState(stored);
    })();
  }, []);

  const setPref = useCallback(async (p: ThemePref) => {
    setPrefState(p);
    await writeJSON(StorageKeys.themePref, p);
  }, []);

  const effectiveScheme: "light" | "dark" =
    pref === "system" ? (systemScheme === "dark" ? "dark" : "light") : pref;

  const value = useMemo<ThemeCtx>(() => ({ pref, setPref, effectiveScheme }), [pref, setPref, effectiveScheme]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme must be used inside <ThemeProvider>");
  return c;
}
