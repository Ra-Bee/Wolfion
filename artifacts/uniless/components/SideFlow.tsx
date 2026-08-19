import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

const IS_WEB = Platform.OS === "web";
// On native, native-driver interpolated parallax is silky. On web it stutters
// because RN Web can't drive transforms off the main JS thread reliably.
const ENABLE_PARALLAX = !IS_WEB;

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
  const { width: winW } = useWindowDimensions();
  const safeInitial = Math.min(Math.max(0, initialIndex), items.length - 1);
  const scrollX = useRef(new Animated.Value(safeInitial * winW)).current;
  const [active, setActive] = useState(safeInitial);
  // Track which slides have ever been visited so we can keep them mounted
  // (preserves scroll position / form state) but never mount a slide the
  // user hasn't navigated near.
  const [visited, setVisited] = useState<Set<number>>(
    () => new Set([safeInitial, safeInitial - 1, safeInitial + 1].filter((i) => i >= 0 && i < items.length)),
  );
  const ref = useRef<ScrollView | null>(null);

  // Keep scroll offset locked to the active slide if the viewport resizes
  // (e.g. iframe resize on web, device rotation).
  useEffect(() => {
    const id = setTimeout(() => {
      ref.current?.scrollTo({ x: active * winW, animated: false });
    }, 0);
    return () => clearTimeout(id);
  }, [winW, active]);

  const markVisited = (i: number) => {
    setVisited((prev) => {
      if (prev.has(i) && prev.has(i - 1) && prev.has(i + 1)) return prev;
      const next = new Set(prev);
      [i - 1, i, i + 1].forEach((k) => {
        if (k >= 0 && k < items.length) next.add(k);
      });
      return next;
    });
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / winW);
    setActive(i);
    markVisited(i);
  };

  const goTo = (i: number) => {
    ref.current?.scrollTo({ x: i * winW, animated: true });
    setActive(i);
    markVisited(i);
  };

  const onScroll = useMemo(
    () =>
      ENABLE_PARALLAX
        ? Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true },
          )
        : undefined,
    [scrollX],
  );

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        ref={(node) => {
          ref.current = node as unknown as ScrollView | null;
        }}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        bounces={false}
        overScrollMode="never"
        // Web hint to opt scroll containers into compositor-accelerated scrolling.
        {...(IS_WEB ? { style: { willChange: "transform" } as object } : null)}
      >
        {items.map((item, i) => {
          const isMounted = visited.has(i);
          const content = isMounted ? item.render() : null;
          if (!ENABLE_PARALLAX) {
            return (
              <View key={item.key} style={{ width: winW, flex: 1 }}>
                {content}
              </View>
            );
          }
          const inputRange = [(i - 1) * winW, i * winW, (i + 1) * winW];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.94, 1, 0.94],
            extrapolate: "clamp",
          });
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [10, 0, 10],
            extrapolate: "clamp",
          });
          return (
            <View key={item.key} style={{ width: winW, flex: 1 }}>
              <Animated.View
                style={{
                  flex: 1,
                  transform: [{ scale }, { translateY }],
                }}
              >
                {content}
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
