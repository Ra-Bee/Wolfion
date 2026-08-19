import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export function Header({
  title,
  back,
  trailing,
  subtitle,
}: {
  title: string;
  back?: boolean;
  trailing?: React.ReactNode;
  subtitle?: string;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.row, { paddingTop: insets.top + 8 }]}>
      {back ? (
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: c.secondary,
            marginRight: 10,
          }}
        >
          <Feather name="chevron-left" size={22} color={c.foreground} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 22 }}>{title}</Text>
        {subtitle ? (
          <Text
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
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
});
