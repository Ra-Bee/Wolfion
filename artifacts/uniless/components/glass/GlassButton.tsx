import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  full?: boolean;
  small?: boolean;
  icon?: React.ReactNode;
}

export function GlassButton({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
  full,
  small,
  icon,
}: Props) {
  const c = useColors();
  const radius = c.radius;
  const height = small ? 38 : 50;

  const handlePress = () => {
    if (disabled || loading) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress?.();
  };

  const fg =
    variant === "primary"
      ? c.primaryForeground
      : variant === "destructive"
        ? c.destructiveForeground
        : variant === "ghost"
          ? c.foreground
          : c.secondaryForeground;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          height,
          borderRadius: radius,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: full ? "stretch" : "auto",
          overflow: "hidden",
        },
        style,
      ]}
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={[c.primary, c.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor:
                variant === "destructive"
                  ? c.destructive
                  : variant === "ghost"
                    ? "transparent"
                    : c.secondary,
              borderWidth: variant === "ghost" ? StyleSheet.hairlineWidth * 2 : 0,
              borderColor: c.border,
              borderRadius: radius,
            },
          ]}
        />
      )}
      <View style={[styles.row, { paddingHorizontal: small ? 14 : 20 }]}>
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <>
            {icon}
            <Text
              style={{
                color: fg,
                fontSize: small ? 14 : 16,
                fontFamily: "Inter_600SemiBold",
                marginLeft: icon ? 8 : 0,
              }}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
