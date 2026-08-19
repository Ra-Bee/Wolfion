import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function EmptyState({
  icon = "inbox",
  title,
  body,
  action,
}: {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  const c = useColors();
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 48,
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 64,
          backgroundColor: c.secondary,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Feather name={icon} size={28} color={c.primary} />
      </View>
      <Text
        style={{
          color: c.foreground,
          fontFamily: "Inter_700Bold",
          fontSize: 17,
          marginBottom: 6,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      {body ? (
        <Text
          style={{
            color: c.mutedForeground,
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            textAlign: "center",
            lineHeight: 20,
            marginBottom: action ? 18 : 0,
          }}
        >
          {body}
        </Text>
      ) : null}
      {action}
    </View>
  );
}
