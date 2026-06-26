import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  onPress,
  chevron,
}: {
  leading?: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  chevron?: boolean;
}) {
  const c = useColors();
  const Wrap: typeof View | typeof Pressable = onPress ? Pressable : View;
  return (
    <Wrap
      onPress={onPress as () => void}
      style={({ pressed }: { pressed?: boolean }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 4,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {leading ? <View style={{ marginRight: 12 }}>{leading}</View> : null}
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{ color: c.foreground, fontFamily: "Inter_600SemiBold", fontSize: 15 }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={{
              color: c.mutedForeground,
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
      {chevron ? <Feather name="chevron-right" size={18} color={c.mutedForeground} /> : null}
    </Wrap>
  );
}
