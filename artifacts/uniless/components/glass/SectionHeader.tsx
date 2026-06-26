import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const c = useColors();
  return (
    <View style={styles.row}>
      <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 18 }}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text style={{ color: c.primary, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
});
