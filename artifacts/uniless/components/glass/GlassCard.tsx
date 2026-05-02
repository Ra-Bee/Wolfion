import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  padding?: number;
  bordered?: boolean;
}

export function GlassCard({ children, style, intensity = 50, padding = 16, bordered = true }: Props) {
  const c = useColors();
  const isWeb = Platform.OS === "web";
  return (
    <View
      style={[
        styles.wrap,
        {
          borderRadius: c.radius,
          borderColor: bordered ? c.glassBorder : "transparent",
          borderWidth: bordered ? StyleSheet.hairlineWidth * 2 : 0,
          backgroundColor: isWeb ? c.card : "transparent",
        },
        style,
      ]}
    >
      {!isWeb ? (
        <BlurView
          intensity={intensity}
          tint={c.scheme === "dark" ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: c.glassTint }]} />
      <View style={{ padding, zIndex: 1 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
  },
});
