import { router } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { Avatar, Background, EmptyState, GlassButton, GlassCard, GlassFAB, Header } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { timeAgo } from "@/lib/format";

export default function MessagesScreen() {
  const c = useColors();
  const { user, allUsers } = useAuth();
  const { chats, messages } = useAppData();

  const userMap = useMemo(() => Object.fromEntries(allUsers.map((u) => [u.id, u])), [allUsers]);

  const myChats = useMemo(() => {
    if (!user) return [];
    return chats
      .filter((ch) => ch.participantIds.includes(user.id))
      .map((ch) => {
        const lastMsg = [...messages]
          .filter((m) => m.chatId === ch.id)
          .sort((a, b) => b.createdAt - a.createdAt)[0];
        return { ...ch, lastMsg };
      })
      .sort((a, b) => (b.lastMsg?.createdAt ?? b.lastMessageAt) - (a.lastMsg?.createdAt ?? a.lastMessageAt));
  }, [chats, messages, user]);

  return (
    <Background>
      <Header
        title="Messages"
        subtitle={`${myChats.length} active conversation${myChats.length === 1 ? "" : "s"}`}
      />
      <FlatList
        data={myChats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => {
          const other = item.isGroup
            ? null
            : userMap[item.participantIds.find((p) => p !== user?.id) ?? ""];
          const title = item.isGroup ? item.title ?? "Group chat" : other?.displayName ?? "Unknown";
          const subtitle = item.lastMsg
            ? `${item.lastMsg.authorId === user?.id ? "You: " : ""}${item.lastMsg.text}`
            : "Say hi 👋";
          return (
            <Pressable onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.id } })}>
              <GlassCard padding={12}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Avatar
                    name={title}
                    color={item.isGroup ? c.accent : other?.avatarColor ?? c.primary}
                    size={48}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text
                        style={{
                          color: c.foreground,
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 15,
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {title}
                      </Text>
                      <Text style={{ color: c.mutedForeground, fontSize: 11 }}>
                        {timeAgo(item.lastMsg?.createdAt ?? item.lastMessageAt)}
                      </Text>
                    </View>
                    <Text
                      style={{ color: c.mutedForeground, fontSize: 13, marginTop: 2 }}
                      numberOfLines={1}
                    >
                      {subtitle}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="message-circle"
            title="No messages yet"
            body="Start a conversation with a friend or open a study room chat."
            action={<GlassButton title="New chat" onPress={() => router.push("/chat/new")} />}
          />
        }
      />
      <GlassFAB icon="edit" onPress={() => router.push("/chat/new")} bottom={120} />
    </Background>
  );
}
