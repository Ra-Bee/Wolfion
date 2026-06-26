import React from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props extends TextInputProps {
  label?: string;
  error?: string | null;
  multiline?: boolean;
}

export function GlassInput({ label, error, style, multiline, ...rest }: Props) {
  const c = useColors();
  const radius = c.radius;
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? (
        <Text style={{ color: c.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 6, fontSize: 13 }}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          borderRadius: radius,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: error ? c.destructive : c.border,
          backgroundColor: c.cardSolid,
        }}
      >
        <TextInput
          placeholderTextColor={c.mutedForeground}
          {...rest}
          multiline={multiline}
          style={[
            {
              color: c.foreground,
              fontFamily: "Inter_400Regular",
              paddingHorizontal: 14,
              paddingVertical: multiline ? 12 : 12,
              fontSize: 15,
              minHeight: multiline ? 110 : 46,
              textAlignVertical: multiline ? "top" : "center",
            },
            style as object,
          ]}
        />
      </View>
      {error ? (
        <Text style={{ color: c.destructive, fontSize: 12, marginTop: 4 }}>{error}</Text>
      ) : null}
    </View>
  );
}
