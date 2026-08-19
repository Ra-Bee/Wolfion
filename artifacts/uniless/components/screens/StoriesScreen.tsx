import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Avatar, Background, EmptyState, GlassButton, GlassCard, Header } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { timeAgo } from "@/lib/format";

export default function StoriesScreen() {
  const c = useColors();
  const { user, allUsers } = useAuth();
  const { stories } = useAppData();
  const userMap = useMemo(() => Object.fromEntries(allUsers.map((u) => [u.id, u])), [allUsers]);

  const visible = useMemo(
    () => stories.filter((s) => s.expiresAt > Date.now()).sort((a, b) => b.createdAt - a.createdAt),
    [stories],
  );

  const myStories = visible.filter((s) => s.authorId === user?.id);
  const others = visible.filter((s) => s.authorId !== user?.id);

  return (
    <Background>
      <Header
        title="Stories"
        subtitle={`${visible.length} story moment${visible.length === 1 ? "" : "s"} live`}
        trailing={
          <Pressable
            onPress={() => router.push("/story/new")}
            style={{
              paddingHorizontal: 12,
              height: 36,
              borderRadius: 18,
              backgroundColor: c.primary,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <Feather name="plus" size={16} color={c.primaryForeground} />
            <Text
              style={{
                color: c.primaryForeground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 13,
                marginLeft: 4,
              }}
            >
              Share
            </Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}>
        <Pressable onPress={() => router.push("/story/new")}>
          <GlassCard padding={16} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  borderWidth: 2,
                  borderStyle: "dashed",
                  borderColor: c.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="plus" size={22} color={c.primary} />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 16 }}>
                  Add to your story
                </Text>
                <Text style={{ color: c.mutedForeground, fontSize: 12, marginTop: 2 }}>
                  Visible for 24 hours · {myStories.length} live now
                </Text>
              </View>
            </View>
          </GlassCard>
        </Pressable>

        {visible.length === 0 ? (
          <EmptyState
            icon="camera"
            title="No stories yet"
            body="Share a moment with your campus to start the day's stories."
            action={<GlassButton title="Share a story" onPress={() => router.push("/story/new")} />}
          />
        ) : null}

        {others.length > 0 ? (
          <Text
            style={{
              color: c.mutedForeground,
              fontSize: 11,
              fontFamily: "Inter_700Bold",
              letterSpacing: 0.6,
              marginTop: 8,
              marginBottom: 8,
            }}
          >
            FRIENDS' STORIES
          </Text>
        ) : null}

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 }}>
          {visible.map((s) => {
            const author = userMap[s.authorId];
            return (
              <Pressable
                key={s.id}
                onPress={() => router.push({ pathname: "/story/[id]", params: { id: s.id } })}
                style={{ width: "50%", padding: 6 }}
              >
                <View
                  style={{
                    height: 220,
                    borderRadius: 18,
                    overflow: "hidden",
                    backgroundColor: s.bgColor ?? c.primary,
                  }}
                >
                  {s.imageUri ? (
                    <Image
                      source={{ uri: s.imageUri }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                  ) : null}
                  <View
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: 12,
                      backgroundColor: "rgba(0,0,0,0.35)",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                      <Avatar
                        name={author?.displayName ?? "?"}
                        color={author?.avatarColor ?? c.primary}
                        size={26}
                      />
                      <Text
                        numberOfLines={1}
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          fontFamily: "Inter_700Bold",
                          marginLeft: 6,
                          flex: 1,
                        }}
                      >
                        {author?.displayName ?? "?"}
                      </Text>
                    </View>
                    {s.text ? (
                      <Text
                        numberOfLines={2}
                        style={{
                          color: "#fff",
                          fontSize: 13,
                          fontFamily: "Inter_600SemiBold",
                        }}
                      >
                        {s.text}
                      </Text>
                    ) : null}
                    <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 10, marginTop: 4 }}>
                      {timeAgo(s.createdAt)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Background>
  );
}
