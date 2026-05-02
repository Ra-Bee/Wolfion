import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

const { width: WIN_W } = Dimensions.get("window");

export interface SideFlowItem {
  key: string;
  title: string;
  icon: keyof typeof Feather.glyphMap;
  render: () => React.ReactNode;
}

interface SideFlowProps {
  items: SideFlowItem[];
  initialIndex?: number;
}

export function SideFlow({ items, initialIndex = 1 }: SideFlowProps) {
  const c = useColors();
  const safeInitial = Math.min(Math.max(0, initialIndex), items.length - 1);
  const scrollX = useRef(new Animated.Value(safeInitial * WIN_W)).current;
  const [active, setActive] = useState(safeInitial);
  const ref = useRef<ScrollView | null>(null);

  useEffect(() => {
    setTimeout(() => {
      ref.current?.scrollTo({ x: safeInitial * WIN_W, animated: false });
    }, 0);
  }, [safeInitial]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActive(Math.round(e.nativeEvent.contentOffset.x / WIN_W));
  };

  const goTo = (i: number) => {
    ref.current?.scrollTo({ x: i * WIN_W, animated: true });
    setActive(i);
  };

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        ref={(node) => {
          ref.current = node as unknown as ScrollView | null;
        }}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        bounces={false}
        overScrollMode="never"
      >
        {items.map((item, i) => {
          const inputRange = [(i - 1) * WIN_W, i * WIN_W, (i + 1) * WIN_W];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.92, 1, 0.92],
            extrapolate: "clamp",
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.55, 1, 0.55],
            extrapolate: "clamp",
          });
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [12, 0, 12],
            extrapolate: "clamp",
          });
          return (
            <View key={item.key} style={{ width: WIN_W, flex: 1 }}>
              <Animated.View
                style={{
                  flex: 1,
                  transform: [{ scale }, { translateY }],
                  opacity,
                }}
              >
                {item.render()}
              </Animated.View>
            </View>
          );
        })}
      </Animated.ScrollView>

      {/* dock */}
      <View
        pointerEvents="box-none"
        style={[
          styles.dockWrap,
          { paddingBottom: 22 },
        ]}
      >
        <View
          style={[
            styles.dock,
            {
              backgroundColor: "rgba(8,36,61,0.92)",
              borderColor: "rgba(155,200,235,0.25)",
              shadowColor: "#000",
            },
          ]}
        >
          {items.map((item, i) => {
            const isActive = i === active;
            return (
              <Pressable
                key={item.key}
                onPress={() => goTo(i)}
                style={({ pressed }) => ({
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                  flex: 1,
                })}
                hitSlop={6}
              >
                <View
                  style={{
                    width: isActive ? 38 : 30,
                    height: isActive ? 38 : 30,
                    borderRadius: 19,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isActive ? c.primary : "transparent",
                  }}
                >
                  <Feather
                    name={item.icon}
                    size={isActive ? 18 : 16}
                    color={isActive ? c.primaryForeground : "rgba(230,247,255,0.75)"}
                  />
                </View>
                {isActive ? (
                  <Text
                    numberOfLines={1}
                    style={{
                      color: "#E6F7FF",
                      fontSize: 10,
                      fontFamily: "Inter_700Bold",
                      marginTop: 2,
                    }}
                  >
                    {item.title}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  dock: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 28,
    borderWidth: 1,
    minWidth: 280,
    maxWidth: 360,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
