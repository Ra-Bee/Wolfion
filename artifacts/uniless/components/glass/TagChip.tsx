import React from "react";
import { Pressable, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function TagChip({
  label,
  onPress,
  active,
  tint,
}: {
  label: string;
  onPress?: () => void;
  active?: boolean;
  tint?: string;
}) {
  const c = useColors();
  const Wrap: typeof View | typeof Pressable = onPress ? Pressable : View;
  return (
    <Wrap
      onPress={onPress as () => void}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: active ? c.primary : tint ?? c.secondary,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          color: active ? c.primaryForeground : tint ? "#fff" : c.secondaryForeground,
          fontFamily: "Inter_500Medium",
          fontSize: 12,
        }}
      >
        {label}
      </Text>
    </Wrap>
  );
}
