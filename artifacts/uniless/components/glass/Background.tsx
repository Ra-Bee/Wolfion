import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

export function Background({ children, style }: { children?: React.ReactNode; style?: ViewStyle }) {
  const c = useColors();
  return (
    <View style={[styles.root, style, { backgroundColor: c.background }]}>
      <LinearGradient
        colors={[c.gradientStart, c.gradientMid, c.gradientEnd]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.blob,
          {
            backgroundColor: c.accent,
            opacity: c.scheme === "dark" ? 0.22 : 0.55,
            top: -120,
            left: -90,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            backgroundColor: c.primary,
            opacity: c.scheme === "dark" ? 0.18 : 0.35,
            bottom: -160,
            right: -100,
            width: 360,
            height: 360,
            borderRadius: 360,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            backgroundColor: "#CDB4FF",
            opacity: c.scheme === "dark" ? 0.12 : 0.3,
            top: "40%",
            right: -60,
            width: 220,
            height: 220,
            borderRadius: 220,
          },
        ]}
      />
      <View style={{ flex: 1, zIndex: 1 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  blob: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 320,
  },
});
