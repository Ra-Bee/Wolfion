import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Avatar, Background, EmptyState, GlassButton, GlassCard, Header, SectionHeader } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function FriendsScreen() {
  const c = useColors();
  const { user, allUsers } = useAuth();
  const { friends, friendRequests, respondFriendRequest, removeFriend, sendFriendRequest, ensureDirectChat } =
    useAppData();

  const userMap = useMemo(() => Object.fromEntries(allUsers.map((u) => [u.id, u])), [allUsers]);
  const myFriendIds = (user && friends[user.id]) || [];
  const myFriends = myFriendIds.map((id) => userMap[id]).filter((u): u is NonNullable<typeof u> => Boolean(u));
  const incoming = friendRequests.filter((r) => r.toId === user?.id && r.status === "pending");
  const outgoing = friendRequests.filter((r) => r.fromId === user?.id && r.status === "pending");
  const suggestions = allUsers.filter(
    (u) =>
      u.id !== user?.id &&
      u.privacy !== "private" &&
      !myFriendIds.includes(u.id) &&
      !outgoing.some((r) => r.toId === u.id) &&
      !incoming.some((r) => r.fromId === u.id),
  );

  return (
    <Background>
      <Header title="Friends" subtitle={`${myFriends.length} friend${myFriends.length === 1 ? "" : "s"}`} back />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}>
        {incoming.length ? (
          <>
            <SectionHeader title="Friend requests" />
            <View style={{ gap: 8 }}>
              {incoming.map((r) => {
                const u = userMap[r.fromId];
                if (!u) return null;
                return (
                  <GlassCard key={r.id} padding={12}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Avatar name={u.displayName} color={u.avatarColor} size={42} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ color: c.foreground, fontFamily: "Inter_600SemiBold" }}>
                          {u.displayName}
                        </Text>
                        <Text style={{ color: c.mutedForeground, fontSize: 12 }}>@{u.username}</Text>
                      </View>
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        <GlassButton
                          title="Accept"
                          small
                          onPress={() => respondFriendRequest(r.id, true)}
                        />
                        <GlassButton
                          title="Decline"
                          small
                          variant="ghost"
                          onPress={() => respondFriendRequest(r.id, false)}
                        />
                      </View>
                    </View>
                  </GlassCard>
                );
              })}
            </View>
          </>
        ) : null}

        <SectionHeader title="Your friends" />
        {myFriends.length === 0 ? (
          <EmptyState icon="users" title="No friends yet" body="Send requests below to grow your network." />
        ) : (
          <View style={{ gap: 8 }}>
            {myFriends.map((u) => (
              <GlassCard key={u.id} padding={12}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Pressable
                    onPress={() => router.push({ pathname: "/profile/[id]", params: { id: u.id } })}
                    style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                  >
                    <Avatar name={u.displayName} color={u.avatarColor} size={42} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: c.foreground, fontFamily: "Inter_600SemiBold" }}>
                        {u.displayName}
                      </Text>
                      <Text style={{ color: c.mutedForeground, fontSize: 12 }}>
                        @{u.username} · {u.major}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={async () => {
                      const ch = await ensureDirectChat(u.id);
                      router.push({ pathname: "/chat/[id]", params: { id: ch.id } });
                    }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: c.secondary,
                      marginRight: 6,
                    }}
                  >
                    <Feather name="message-circle" size={16} color={c.primary} />
                  </Pressable>
                  <Pressable
                    onPress={() => removeFriend(u.id)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: c.secondary,
                    }}
                  >
                    <Feather name="user-x" size={16} color={c.destructive} />
                  </Pressable>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {suggestions.length ? (
          <>
            <SectionHeader title="Suggested" />
            <View style={{ gap: 8 }}>
              {suggestions.slice(0, 6).map((u) => (
                <GlassCard key={u.id} padding={12}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Pressable
                      onPress={() => router.push({ pathname: "/profile/[id]", params: { id: u.id } })}
                      style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                    >
                      <Avatar name={u.displayName} color={u.avatarColor} size={42} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ color: c.foreground, fontFamily: "Inter_600SemiBold" }}>
                          {u.displayName}
                        </Text>
                        <Text style={{ color: c.mutedForeground, fontSize: 12 }}>
                          @{u.username} · {u.major}
                        </Text>
                      </View>
                    </Pressable>
                    <GlassButton
                      title="Add"
                      small
                      variant="secondary"
                      onPress={() => sendFriendRequest(u.id)}
                    />
                  </View>
                </GlassCard>
              ))}
            </View>
          </>
        ) : null}

        {outgoing.length ? (
          <>
            <SectionHeader title="Sent requests" />
            <View style={{ gap: 8 }}>
              {outgoing.map((r) => {
                const u = userMap[r.toId];
                if (!u) return null;
                return (
                  <GlassCard key={r.id} padding={12}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Avatar name={u.displayName} color={u.avatarColor} size={42} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ color: c.foreground, fontFamily: "Inter_600SemiBold" }}>
                          {u.displayName}
                        </Text>
                        <Text style={{ color: c.mutedForeground, fontSize: 12 }}>Pending…</Text>
                      </View>
                    </View>
                  </GlassCard>
                );
              })}
            </View>
          </>
        ) : null}
      </ScrollView>
    </Background>
  );
}
