import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Linking, Platform, Pressable, Text, View } from "react-native";

import { Avatar, Background, GlassButton, GlassInput, Header, TagChip } from "@/components/glass";
import {
  MediaAttachSheet,
  attachmentIcon,
  attachmentLabel,
} from "@/components/MediaAttachSheet";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { fmtTime } from "@/lib/format";
import type { MessageAttachment } from "@/lib/types";

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
  const [pendingAttachment, setPendingAttachment] = useState<MessageAttachment | undefined>(undefined);
  const [sheetOpen, setSheetOpen] = useState(false);
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

  useEffect(() => {
    if (!chat || !user) return;
    void markChatRead(chat.id);
  }, [chat, user, chatMessages.length, markChatRead]);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
  }, [chatMessages.length]);

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
            const att = item.attachment;
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
                  {att && att.kind === "photo" ? (
                    <Image
                      source={{ uri: att.uri }}
                      style={{ width: 220, height: 220, borderRadius: 16, marginBottom: 4 }}
                      contentFit="cover"
                    />
                  ) : null}
                  {att && att.kind !== "photo" ? (
                    <Pressable
                      onPress={() => Linking.openURL(att.uri).catch(() => null)}
                      style={({ pressed }) => ({
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 10,
                        borderRadius: 14,
                        backgroundColor: isMe ? c.primary : c.cardSolid,
                        marginBottom: 4,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: isMe ? "rgba(255,255,255,0.2)" : c.secondary,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 10,
                        }}
                      >
                        <Feather
                          name={attachmentIcon(att.kind)}
                          size={16}
                          color={isMe ? c.primaryForeground : c.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          style={{
                            color: isMe ? c.primaryForeground : c.foreground,
                            fontSize: 13,
                            fontFamily: "Inter_700Bold",
                          }}
                        >
                          {attachmentLabel(att)}
                        </Text>
                        <Text
                          style={{
                            color: isMe ? "rgba(255,255,255,0.85)" : c.mutedForeground,
                            fontSize: 11,
                          }}
                        >
                          {att.kind.toUpperCase()}
                          {att.size ? ` · ${(att.size / 1024).toFixed(0)} KB` : ""}
                        </Text>
                      </View>
                    </Pressable>
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

        {pendingAttachment ? (
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
            {pendingAttachment.kind === "photo" ? (
              <Image
                source={{ uri: pendingAttachment.uri }}
                style={{ width: 48, height: 48, borderRadius: 8, marginRight: 8 }}
                contentFit="cover"
              />
            ) : (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  marginRight: 8,
                  backgroundColor: c.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name={attachmentIcon(pendingAttachment.kind)} size={20} color={c.primaryForeground} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ color: c.foreground, fontSize: 13, fontFamily: "Inter_700Bold" }}>
                {attachmentLabel(pendingAttachment)}
              </Text>
              <Text style={{ color: c.mutedForeground, fontSize: 11 }}>
                {pendingAttachment.kind.toUpperCase()} attached
              </Text>
            </View>
            <Pressable onPress={() => setPendingAttachment(undefined)} hitSlop={8}>
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
            onPress={() => setSheetOpen(true)}
            style={{
              padding: 10,
              marginRight: 4,
              marginBottom: 8,
            }}
            hitSlop={6}
          >
            <Feather name="plus-circle" size={22} color={c.primary} />
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
              disabled={!text.trim() && !pendingAttachment}
              onPress={async () => {
                const t = text;
                const att = pendingAttachment;
                const ttl = ttlSeconds;
                setText("");
                setPendingAttachment(undefined);
                await sendMessage(chat.id, t, { attachment: att, ttlSeconds: ttl });
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
      <MediaAttachSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onPicked={(att) => setPendingAttachment(att)}
      />
    </Background>
  );
}
