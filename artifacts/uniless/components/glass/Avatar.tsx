import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { initials } from "@/lib/format";

export function Avatar({
  name,
  color,
  size = 40,
  ring,
}: {
  name: string;
  color: string;
  size?: number;
  ring?: string | null;
}) {
  const inner = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
      }}
    >
      <LinearGradient
        colors={[color, shade(color, -20)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}>
        <Text
          style={{
            color: "#fff",
            fontFamily: "Inter_700Bold",
            fontSize: size * 0.38,
          }}
        >
          {initials(name)}
        </Text>
      </View>
    </View>
  );
  if (!ring) return inner;
  return (
    <View
      style={{
        padding: 2,
        borderRadius: (size + 6) / 2,
        backgroundColor: ring,
      }}
    >
      {inner}
    </View>
  );
}

function shade(hex: string, amt: number): string {
  const m = hex.replace("#", "");
  const r = clamp(parseInt(m.slice(0, 2), 16) + amt);
  const g = clamp(parseInt(m.slice(2, 4), 16) + amt);
  const b = clamp(parseInt(m.slice(4, 6), 16) + amt);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
function clamp(n: number) {
  return Math.max(0, Math.min(255, n));
}
