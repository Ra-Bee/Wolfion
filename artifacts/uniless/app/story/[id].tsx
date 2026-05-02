import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { timeAgo } from "@/lib/format";

const STORY_MS = 6000;

export default function StoryViewer() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { stories, viewStory } = useAppData();
  const { allUsers } = useAuth();
  const userMap = useMemo(() => Object.fromEntries(allUsers.map((u) => [u.id, u])), [allUsers]);

  const ordered = useMemo(
    () =>
      [...stories]
        .filter((s) => s.expiresAt > Date.now())
        .sort((a, b) => b.createdAt - a.createdAt),
    [stories],
  );
  const startIdx = Math.max(
    0,
    ordered.findIndex((s) => s.id === id),
  );
  const [idx, setIdx] = useState(startIdx);
  const story = ordered[idx];
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setIdx(startIdx);
  }, [startIdx]);

  useEffect(() => {
    if (story) viewStory(story.id);
  }, [story, viewStory]);

  useEffect(() => {
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_MS,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) advance();
    });
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, story?.id]);

  const advance = () => {
    if (idx < ordered.length - 1) setIdx(idx + 1);
    else router.back();
  };
  const back = () => {
    if (idx > 0) setIdx(idx - 1);
    else router.back();
  };

  if (!story) return null;
  const author = userMap[story.authorId];

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: story.bgColor }]}>
      {story.imageUri ? (
        <>
          <Image
            source={{ uri: story.imageUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.35)" }]} />
        </>
      ) : null}

      {/* progress bars */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 12,
          flexDirection: "row",
          gap: 4,
        }}
      >
        {ordered.map((s, i) => (
          <View
            key={s.id}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,0.3)",
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={{
                height: 3,
                width:
                  i < idx
                    ? "100%"
                    : i === idx
                      ? progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] })
                      : "0%",
                backgroundColor: "#fff",
              }}
            />
          </View>
        ))}
      </View>

      <View
        style={{
          paddingTop: 8,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Avatar name={author?.displayName ?? "?"} color={author?.avatarColor ?? c.primary} size={40} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 }}>
            {author?.displayName}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 11 }}>{timeAgo(story.createdAt)}</Text>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={{ color: "#fff", fontSize: 22 }}>✕</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 }}>
        <Text
          style={{
            color: "#fff",
            fontSize: 26,
            lineHeight: 34,
            fontFamily: "Inter_700Bold",
            textAlign: "center",
            textShadowColor: "rgba(0,0,0,0.5)",
            textShadowRadius: 8,
          }}
        >
          {story.text}
        </Text>
      </View>

      <Text
        style={{
          textAlign: "center",
          color: "rgba(255,255,255,0.85)",
          fontSize: 12,
          paddingBottom: insets.bottom + 16,
          fontFamily: "Inter_500Medium",
        }}
      >
        Tap left/right to navigate · {idx + 1} / {ordered.length} · {story.views.length}{" "}
        {story.views.length === 1 ? "view" : "views"}
      </Text>

      {/* tap zones */}
      <Pressable
        onPress={back}
        style={{ position: "absolute", left: 0, top: 60, bottom: 80, width: "30%" }}
      />
      <Pressable
        onPress={advance}
        style={{ position: "absolute", right: 0, top: 60, bottom: 80, width: "70%" }}
      />
    </View>
  );
}
