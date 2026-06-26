import { useColorScheme as useRNColorScheme } from "react-native";

import colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";

export function useColors() {
  const sysScheme = useRNColorScheme();
  let pref: "system" | "light" | "dark" = "system";
  try {
    pref = useTheme().pref;
  } catch {
    pref = "system";
  }
  const effective: "light" | "dark" =
    pref === "system" ? (sysScheme === "dark" ? "dark" : "light") : pref;
  const palette = effective === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius, scheme: effective };
}
