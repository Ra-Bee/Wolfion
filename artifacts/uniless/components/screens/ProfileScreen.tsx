import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Avatar, Background, EmptyState, GlassButton, GlassCard, Header, SectionHeader, TagChip } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { timeAgo } from "@/lib/format";

export default function ProfileScreen() {
  const c = useColors();
  const { user, logout } = useAuth();
  const { posts, friends, assignments } = useAppData();

  const myPosts = useMemo(
    () => posts.filter((p) => p.authorId === user?.id).sort((a, b) => b.createdAt - a.createdAt),
    [posts, user],
  );
  const myFriends = (user && friends[user.id]) || [];
  const assignmentsRemaining = useMemo(
    () => assignments.filter((a) => a.ownerId === user?.id && !a.done).length,
    [assignments, user],
  );

  if (!user) return null;

  return (
    <Background>
      <Header
        title="Profile"
        trailing={
          <Pressable
            onPress={() => router.push("/settings")}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: c.secondary,
            }}
          >
            <Feather name="settings" size={18} color={c.foreground} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}>
        <GlassCard padding={20}>
          <View style={{ alignItems: "center" }}>
            <Avatar name={user.displayName} color={user.avatarColor} size={84} />
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 22,
                marginTop: 12,
              }}
            >
              {user.displayName}
            </Text>
            <Text style={{ color: c.mutedForeground, fontFamily: "Inter_500Medium", marginTop: 2 }}>
              @{user.username}
            </Text>
            <View
              style={{
                marginTop: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: c.secondary,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Feather
                name={user.privacy === "public" ? "globe" : user.privacy === "friends" ? "users" : "lock"}
                size={11}
                color={c.secondaryForeground}
              />
              <Text
                style={{
                  color: c.secondaryForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 11,
                  marginLeft: 4,
                  textTransform: "capitalize",
                }}
              >
                {user.privacy} profile
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 18 }}>
            <Stat label="Posts" value={myPosts.length} />
            <Stat label="Friends" value={myFriends.length} />
            <Stat
              label="Tasks left"
              value={assignmentsRemaining}
              tint={assignmentsRemaining > 0 ? c.primary : c.success}
            />
            <Stat label="Joined" value={timeAgo(user.createdAt)} />
          </View>

          {user.bio ? (
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                marginTop: 14,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              {user.bio}
            </Text>
          ) : null}

          <Text
            style={{
              color: c.mutedForeground,
              fontSize: 12,
              textAlign: "center",
              marginTop: 14,
              fontFamily: "Inter_500Medium",
            }}
          >
            {user.major} · {user.year} · {user.university}
          </Text>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
            <GlassButton
              title="Edit profile"
              variant="secondary"
              onPress={() => router.push("/profile/edit")}
              style={{ flex: 1 }}
            />
            <GlassButton
              title="Friends"
              variant="ghost"
              onPress={() => router.push("/friends")}
              style={{ flex: 1 }}
            />
          </View>
        </GlassCard>

        {user.interests.length ? (
          <>
            <SectionHeader title="Interests" />
            <GlassCard padding={14}>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {user.interests.map((i) => (
                  <TagChip key={i} label={i} />
                ))}
              </View>
            </GlassCard>
          </>
        ) : null}

        {user.skillsOffered.length || user.skillsWanted.length ? (
          <>
            <SectionHeader title="Skills" action="Trade" onAction={() => router.push("/skill-exchange")} />
            <GlassCard padding={14}>
              {user.skillsOffered.length ? (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ color: c.success, fontFamily: "Inter_700Bold", fontSize: 11, marginBottom: 6 }}>
                    OFFERING
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {user.skillsOffered.map((s) => (
                      <TagChip key={s} label={s} tint={c.success} />
                    ))}
                  </View>
                </View>
              ) : null}
              {user.skillsWanted.length ? (
                <View>
                  <Text style={{ color: c.warning, fontFamily: "Inter_700Bold", fontSize: 11, marginBottom: 6 }}>
                    WANT TO LEARN
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {user.skillsWanted.map((s) => (
                      <TagChip key={s} label={s} tint={c.warning} />
                    ))}
                  </View>
                </View>
              ) : null}
            </GlassCard>
          </>
        ) : null}

        <SectionHeader title="Discover" />
        <GlassCard padding={14}>
          <DiscoverRow icon="users" label="Find friends" onPress={() => router.push("/friends")} />
          <DiscoverRow icon="monitor" label="Study rooms" onPress={() => router.push("/study-rooms")} />
          <DiscoverRow icon="repeat" label="Skill exchange" onPress={() => router.push("/skill-exchange")} />
          <DiscoverRow icon="zap" label="RabChat AI" onPress={() => router.push("/ai-assistant")} />
        </GlassCard>

        <SectionHeader title="My posts" />
        {myPosts.length === 0 ? (
          <EmptyState
            icon="edit-3"
            title="No posts yet"
            body="Share what's on your mind."
            action={<GlassButton title="New post" onPress={() => router.push("/post/new")} />}
          />
        ) : (
          <View style={{ gap: 8 }}>
            {myPosts.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push({ pathname: "/post/[id]", params: { id: p.id } })}
              >
                <GlassCard padding={12}>
                  <Text style={{ color: c.foreground, fontSize: 14 }} numberOfLines={3}>
                    {p.text}
                  </Text>
                  <Text style={{ color: c.mutedForeground, fontSize: 11, marginTop: 6 }}>
                    {timeAgo(p.createdAt)} · {p.likes.length} likes · {p.comments.length} comments
                  </Text>
                </GlassCard>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ marginTop: 28 }}>
          <GlassButton
            title="Log out"
            variant="ghost"
            full
            onPress={async () => {
              await logout();
              router.replace("/(auth)/welcome");
            }}
          />
        </View>
      </ScrollView>
    </Background>
  );
}

function Stat({ label, value, tint }: { label: string; value: number | string; tint?: string }) {
  const c = useColors();
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ color: tint ?? c.foreground, fontFamily: "Inter_700Bold", fontSize: 18 }}>{value}</Text>
      <Text style={{ color: c.mutedForeground, fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

function DiscoverRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: c.secondary,
          marginRight: 12,
        }}
      >
        <Feather name={icon} size={16} color={c.primary} />
      </View>
      <Text style={{ flex: 1, color: c.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
        {label}
      </Text>
      <Feather name="chevron-right" size={18} color={c.mutedForeground} />
    </Pressable>
  );
}
