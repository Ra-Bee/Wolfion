import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";

import { Avatar, Background, EmptyState, GlassButton, GlassCard, Header, SectionHeader, TagChip } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { timeAgo } from "@/lib/format";
import type { FieldPrivacy, Privacy, PublicUser } from "@/lib/types";
import { DEFAULT_FIELD_PRIVACY } from "@/lib/types";

function fieldVisible(target: PublicUser, key: keyof FieldPrivacy, isMe: boolean, isFriend: boolean) {
  if (isMe) return true;
  const fp = target.fieldPrivacy ?? DEFAULT_FIELD_PRIVACY;
  const setting: Privacy = fp[key];
  if (setting === "public") return true;
  if (setting === "friends") return isFriend;
  return false;
}

export default function PublicProfile() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, allUsers } = useAuth();
  const { posts, friends, friendRequests, sendFriendRequest, ensureDirectChat, removeFriend } = useAppData();

  const target = allUsers.find((u) => u.id === id);

  const myFriends = (user && friends[user.id]) || [];
  const isFriend = myFriends.includes(id);
  const pending = friendRequests.some(
    (r) => r.fromId === user?.id && r.toId === id && r.status === "pending",
  );
  const incoming = friendRequests.some(
    (r) => r.fromId === id && r.toId === user?.id && r.status === "pending",
  );

  const visiblePosts = useMemo(() => {
    if (!target) return [];
    return posts
      .filter((p) => p.authorId === target.id)
      .filter((p) => {
        if (target.id === user?.id) return true;
        if (target.privacy === "private") return false;
        if (p.privacy === "public") return true;
        if (p.privacy === "friends") return isFriend;
        return false;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [posts, target, user, isFriend]);

  if (!target) {
    return (
      <Background>
        <Header title="Profile" back />
        <View style={{ padding: 24 }}>
          <Text style={{ color: c.mutedForeground, textAlign: "center" }}>User not found.</Text>
        </View>
      </Background>
    );
  }

  const isMe = target.id === user?.id;
  const lockedDown = !isMe && target.privacy === "private" && !isFriend;
  const showBio = !!target.bio && fieldVisible(target, "bio", isMe, isFriend);
  const showMajor = fieldVisible(target, "major", isMe, isFriend);
  const showYear = fieldVisible(target, "year", isMe, isFriend);
  const showInterests = !!target.interests.length && fieldVisible(target, "interests", isMe, isFriend);
  const showSkills =
    (target.skillsOffered.length > 0 || target.skillsWanted.length > 0) &&
    fieldVisible(target, "skills", isMe, isFriend);
  const showLinkedin = !!target.linkedinUrl && fieldVisible(target, "linkedin", isMe, isFriend);
  const showCv = !!target.cv && fieldVisible(target, "cv", isMe, isFriend);

  return (
    <Background>
      <Header title={target.displayName} back />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}>
        <GlassCard padding={20}>
          <View style={{ alignItems: "center" }}>
            <Avatar name={target.displayName} color={target.avatarColor} size={80} />
            <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 22, marginTop: 12 }}>
              {target.displayName}
            </Text>
            <Text style={{ color: c.mutedForeground, fontFamily: "Inter_500Medium", marginTop: 2 }}>
              @{target.username}
            </Text>
            {showMajor || showYear ? (
              <Text style={{ color: c.mutedForeground, fontSize: 12, marginTop: 6 }}>
                {[showMajor ? target.major : null, showYear ? target.year : null].filter(Boolean).join(" · ")}
              </Text>
            ) : null}
            {showBio ? (
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  marginTop: 10,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                {target.bio}
              </Text>
            ) : null}
            {showLinkedin ? (
              <Pressable
                onPress={() => target.linkedinUrl && Linking.openURL(target.linkedinUrl)}
                style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
                hitSlop={6}
              >
                <Feather name="linkedin" size={14} color={c.primary} />
                <Text
                  style={{
                    color: c.primary,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                    marginLeft: 6,
                  }}
                  numberOfLines={1}
                >
                  LinkedIn profile
                </Text>
              </Pressable>
            ) : null}
          </View>
          {!isMe ? (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
              <GlassButton
                title="Message"
                onPress={async () => {
                  const ch = await ensureDirectChat(target.id);
                  router.push({ pathname: "/chat/[id]", params: { id: ch.id } });
                }}
                style={{ flex: 1 }}
              />
              {isFriend ? (
                <GlassButton
                  title="Friends ✓"
                  variant="secondary"
                  onPress={() => removeFriend(target.id)}
                  style={{ flex: 1 }}
                />
              ) : pending ? (
                <GlassButton title="Request sent" variant="secondary" disabled style={{ flex: 1 }} />
              ) : incoming ? (
                <GlassButton
                  title="Respond"
                  variant="secondary"
                  onPress={() => router.push("/friends")}
                  style={{ flex: 1 }}
                />
              ) : (
                <GlassButton
                  title="Add friend"
                  variant="secondary"
                  onPress={() => sendFriendRequest(target.id)}
                  style={{ flex: 1 }}
                  icon={<Feather name="user-plus" size={14} color={c.foreground} />}
                />
              )}
            </View>
          ) : null}
        </GlassCard>

        {showCv ? (
          <>
            <SectionHeader title="Digital CV" />
            <GlassCard padding={14}>
              <Text style={{ color: c.foreground, fontSize: 14, lineHeight: 21 }}>{target.cv}</Text>
            </GlassCard>
          </>
        ) : null}

        {showInterests ? (
          <>
            <SectionHeader title="Interests" />
            <GlassCard padding={14}>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {target.interests.map((i) => (
                  <TagChip key={i} label={i} />
                ))}
              </View>
            </GlassCard>
          </>
        ) : null}

        {showSkills ? (
          <>
            <SectionHeader title="Skills" />
            <GlassCard padding={14}>
              {target.skillsOffered.length ? (
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ color: c.success, fontFamily: "Inter_700Bold", fontSize: 11, marginBottom: 6 }}>
                    OFFERS
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {target.skillsOffered.map((s) => (
                      <TagChip key={s} label={s} tint={c.success} />
                    ))}
                  </View>
                </View>
              ) : null}
              {target.skillsWanted.length ? (
                <View>
                  <Text style={{ color: c.warning, fontFamily: "Inter_700Bold", fontSize: 11, marginBottom: 6 }}>
                    WANTS TO LEARN
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {target.skillsWanted.map((s) => (
                      <TagChip key={s} label={s} tint={c.warning} />
                    ))}
                  </View>
                </View>
              ) : null}
            </GlassCard>
          </>
        ) : null}

        <SectionHeader title="Posts" />
        {lockedDown ? (
          <EmptyState icon="lock" title="This profile is private" body="Send a friend request to see more." />
        ) : visiblePosts.length === 0 ? (
          <EmptyState icon="message-square" title="No posts to show" />
        ) : (
          <View style={{ gap: 8 }}>
            {visiblePosts.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push({ pathname: "/post/[id]", params: { id: p.id } })}
              >
                <GlassCard padding={12}>
                  <Text style={{ color: c.foreground, fontSize: 14 }} numberOfLines={3}>
                    {p.text}
                  </Text>
                  <Text style={{ color: c.mutedForeground, fontSize: 11, marginTop: 6 }}>
                    {timeAgo(p.createdAt)} · {p.likes.length} likes
                    {p.images?.length ? ` · ${p.images.length} photo${p.images.length > 1 ? "s" : ""}` : ""}
                  </Text>
                </GlassCard>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </Background>
  );
}
