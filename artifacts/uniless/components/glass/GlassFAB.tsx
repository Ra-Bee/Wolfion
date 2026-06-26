import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function GlassFAB({
  icon = "plus",
  onPress,
  bottom = 96,
  right = 18,
}: {
  icon?: keyof typeof Feather.glyphMap;
  onPress: () => void;
  bottom?: number;
  right?: number;
}) {
  const c = useColors();
  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress();
  };
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.fab,
        {
          bottom,
          right,
          opacity: pressed ? 0.85 : 1,
          shadowColor: c.primary,
        },
      ]}
    >
      <LinearGradient
        colors={[c.primary, c.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ zIndex: 1 }}>
        <Feather name={icon} size={26} color="#fff" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
