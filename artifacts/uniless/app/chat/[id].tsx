import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";

import { Avatar, Background, GlassButton, GlassInput, Header, TagChip } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { fmtTime } from "@/lib/format";

const TTL_OPTIONS: { label: string; seconds: number }[] = [
  { label: "off", seconds: 0 },
  { label: "1m", seconds: 60 },
  { label: "1h", seconds: 60 * 60 },
  { label: "24h", seconds: 60 * 60 * 24 },
];

export default function ChatScreen() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, allUsers } = useAuth();
  const { chats, messages, sendMessage, toggleSaveMessage, markChatRead } = useAppData();
  const [text, setText] = useState("");
  const [pendingImage, setPendingImage] = useState<string | undefined>(undefined);
  const [ttlSeconds, setTtlSeconds] = useState<number>(0);
  const listRef = useRef<FlatList>(null);

  const userMap = useMemo(() => Object.fromEntries(allUsers.map((u) => [u.id, u])), [allUsers]);
  const chat = chats.find((c) => c.id === id);
  const chatMessages = useMemo(
    () =>
      messages
        .filter((m) => m.chatId === id)
        .filter((m) => m.saved || !m.expiresAt || m.expiresAt > Date.now())
        .sort((a, b) => a.createdAt - b.createdAt),
    [messages, id],
  );

  // mark messages from other authors as read when chat opens / new arrives
  useEffect(() => {
    if (!chat || !user) return;
    void markChatRead(chat.id);
  }, [chat, user, chatMessages.length, markChatRead]);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
  }, [chatMessages.length]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      setPendingImage(res.assets[0].uri);
    }
  };

  if (!chat) {
    return (
      <Background>
        <Header title="Chat" back />
        <View style={{ padding: 24 }}>
          <Text style={{ color: c.mutedForeground, textAlign: "center" }}>
            This chat is no longer available.
          </Text>
        </View>
      </Background>
    );
  }

  const otherId = chat.participantIds.find((p) => p !== user?.id);
  const other = otherId ? userMap[otherId] : null;
  const title = chat.isGroup
    ? chat.title ?? "Group chat"
    : other?.displayName ?? "Conversation";
  const subtitle = chat.isGroup
    ? `${chat.participantIds.length} members`
    : other
      ? `@${other.username}`
      : "";

  return (
    <Background>
      <Header title={title} subtitle={subtitle} back />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={listRef}
          data={chatMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
          renderItem={({ item, index }) => {
            const isMe = item.authorId === user?.id;
            const author = userMap[item.authorId];
            const prev = chatMessages[index - 1];
            const showAuthor =
              !isMe && (!prev || prev.authorId !== item.authorId) && chat.isGroup;
            const otherReaders = (item.readBy ?? []).filter((u: string) => u !== user?.id);
            const seenByOther = isMe && !chat.isGroup && otherReaders.length > 0;
            const ttlLeft = item.expiresAt && !item.saved ? item.expiresAt - Date.now() : 0;
            return (
              <Pressable
                onLongPress={() => isMe && toggleSaveMessage(item.id)}
                delayLongPress={350}
                style={{
                  flexDirection: "row",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  marginBottom: 6,
                }}
              >
                {!isMe ? (
                  <View style={{ marginRight: 8 }}>
                    <Avatar name={author?.displayName ?? "?"} color={author?.avatarColor ?? c.primary} size={28} />
                  </View>
                ) : null}
                <View style={{ maxWidth: "75%" }}>
                  {showAuthor ? (
                    <Text style={{ color: c.mutedForeground, fontSize: 11, marginLeft: 4, marginBottom: 2 }}>
                      {author?.displayName}
                    </Text>
                  ) : null}
                  {item.imageUri ? (
                    <Image
                      source={{ uri: item.imageUri }}
                      style={{ width: 220, height: 220, borderRadius: 16, marginBottom: 4 }}
                      contentFit="cover"
                    />
                  ) : null}
                  {item.text ? (
                    <View
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 9,
                        borderRadius: 18,
                        borderTopLeftRadius: !isMe ? 4 : 18,
                        borderTopRightRadius: isMe ? 4 : 18,
                        backgroundColor: isMe ? c.primary : c.cardSolid,
                      }}
                    >
                      <Text style={{ color: isMe ? c.primaryForeground : c.foreground, fontSize: 15 }}>
                        {item.text}
                      </Text>
                    </View>
                  ) : null}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      alignSelf: isMe ? "flex-end" : "flex-start",
                      marginTop: 2,
                      marginHorizontal: 4,
                    }}
                  >
                    {item.saved ? (
                      <Feather name="bookmark" size={11} color={c.warning} style={{ marginRight: 4 }} />
                    ) : ttlLeft > 0 ? (
                      <Feather name="clock" size={11} color={c.mutedForeground} style={{ marginRight: 4 }} />
                    ) : null}
                    <Text style={{ color: c.mutedForeground, fontSize: 10 }}>
                      {fmtTime(item.createdAt)}
                    </Text>
                    {seenByOther ? (
                      <Text style={{ color: c.primary, fontSize: 10, marginLeft: 6, fontFamily: "Inter_600SemiBold" }}>
                        Seen
                      </Text>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 80 }}>
              <Text style={{ color: c.mutedForeground }}>Send the first message 👋</Text>
            </View>
          }
        />

        {pendingImage ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 8,
              marginHorizontal: 12,
              borderRadius: 12,
              backgroundColor: c.secondary,
            }}
          >
            <Image
              source={{ uri: pendingImage }}
              style={{ width: 48, height: 48, borderRadius: 8, marginRight: 8 }}
              contentFit="cover"
            />
            <Text style={{ flex: 1, color: c.foreground, fontSize: 13 }}>Photo attached</Text>
            <Pressable onPress={() => setPendingImage(undefined)} hitSlop={8}>
              <Feather name="x" size={16} color={c.mutedForeground} />
            </Pressable>
          </View>
        ) : null}

        <View
          style={{
            paddingHorizontal: 12,
            paddingTop: 6,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ color: c.mutedForeground, fontSize: 11, marginRight: 6 }}>Disappear:</Text>
          {TTL_OPTIONS.map((o) => (
            <TagChip
              key={o.label}
              label={o.label}
              active={ttlSeconds === o.seconds}
              onPress={() => setTtlSeconds(o.seconds)}
            />
          ))}
        </View>

        <View
          style={{
            padding: 12,
            borderTopWidth: 1,
            borderTopColor: c.border,
            backgroundColor: c.cardSolid,
            flexDirection: "row",
            alignItems: "flex-end",
          }}
        >
          <Pressable
            onPress={pickImage}
            style={{
              padding: 10,
              marginRight: 4,
              marginBottom: 8,
            }}
            hitSlop={6}
          >
            <Feather name="image" size={20} color={c.primary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <GlassInput
              placeholder="Type a message…"
              value={text}
              onChangeText={setText}
              multiline
            />
          </View>
          <View style={{ marginLeft: 8, marginBottom: 12 }}>
            <GlassButton
              title="Send"
              small
              disabled={!text.trim() && !pendingImage}
              onPress={async () => {
                const t = text;
                const img = pendingImage;
                const ttl = ttlSeconds;
                setText("");
                setPendingImage(undefined);
                await sendMessage(chat.id, t, { imageUri: img, ttlSeconds: ttl });
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Background>
  );
}
