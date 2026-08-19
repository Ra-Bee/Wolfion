import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { Avatar, Background, GlassButton, GlassCard, GlassInput, Header, TagChip } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { timeAgo } from "@/lib/format";

export default function PostDetail() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, allUsers } = useAuth();
  const { posts, addComment, togglePostLike, deletePost } = useAppData();
  const [text, setText] = useState("");

  const userMap = useMemo(() => Object.fromEntries(allUsers.map((u) => [u.id, u])), [allUsers]);
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <Background>
        <Header title="Post" back />
        <View style={{ padding: 24 }}>
          <Text style={{ color: c.mutedForeground, textAlign: "center" }}>This post no longer exists.</Text>
        </View>
      </Background>
    );
  }

  const author = userMap[post.authorId];
  const liked = user ? post.likes.includes(user.id) : false;
  const isMine = user?.id === post.authorId;

  return (
    <Background>
      <Header
        title="Post"
        back
        trailing={
          isMine ? (
            <Pressable
              onPress={async () => {
                await deletePost(post.id);
                router.back();
              }}
              hitSlop={8}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: c.secondary,
              }}
            >
              <Feather name="trash-2" size={16} color={c.destructive} />
            </Pressable>
          ) : null
        }
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
          <GlassCard padding={16}>
            <Pressable
              onPress={() => router.push({ pathname: "/profile/[id]", params: { id: post.authorId } })}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
            >
              <Avatar name={author?.displayName ?? "?"} color={author?.avatarColor ?? c.primary} size={40} />
              <View style={{ marginLeft: 10 }}>
                <Text style={{ color: c.foreground, fontFamily: "Inter_600SemiBold" }}>
                  {author?.displayName}
                </Text>
                <Text style={{ color: c.mutedForeground, fontSize: 12 }}>
                  @{author?.username} · {timeAgo(post.createdAt)}
                </Text>
              </View>
            </Pressable>
            {post.text ? (
              <Text style={{ color: c.foreground, fontSize: 16, lineHeight: 23, fontFamily: "Inter_400Regular" }}>
                {post.text}
              </Text>
            ) : null}
            {post.images?.length ? (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginTop: post.text ? 12 : 0,
                  marginHorizontal: -3,
                }}
              >
                {post.images.map((uri, i) => (
                  <View
                    key={uri + i}
                    style={{
                      width: post.images!.length === 1 ? "100%" : "50%",
                      padding: 3,
                    }}
                  >
                    <Image
                      source={{ uri }}
                      style={{
                        width: "100%",
                        height: post.images!.length === 1 ? 260 : 160,
                        borderRadius: 14,
                        backgroundColor: c.secondary,
                      }}
                      contentFit="cover"
                    />
                  </View>
                ))}
              </View>
            ) : null}
            {post.tags.length ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
                {post.tags.map((t) => (
                  <TagChip key={t} label={`#${t}`} />
                ))}
              </View>
            ) : null}
            <View style={{ flexDirection: "row", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border }}>
              <Pressable
                onPress={() => togglePostLike(post.id)}
                style={{ flexDirection: "row", alignItems: "center", marginRight: 18 }}
                hitSlop={8}
              >
                <Feather name="heart" size={18} color={liked ? c.destructive : c.mutedForeground} />
                <Text style={{ color: liked ? c.destructive : c.mutedForeground, marginLeft: 6 }}>
                  {post.likes.length} likes
                </Text>
              </Pressable>
              <Text style={{ color: c.mutedForeground }}>{post.comments.length} comments</Text>
            </View>
          </GlassCard>

          <View style={{ marginTop: 14, gap: 8 }}>
            {post.comments.map((c2) => {
              const a = userMap[c2.authorId];
              return (
                <GlassCard key={c2.id} padding={12}>
                  <View style={{ flexDirection: "row" }}>
                    <Avatar name={a?.displayName ?? "?"} color={a?.avatarColor ?? c.primary} size={32} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={{ color: c.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
                          {a?.displayName ?? "?"}
                        </Text>
                        <Text style={{ color: c.mutedForeground, fontSize: 11, marginLeft: 6 }}>
                          {timeAgo(c2.createdAt)}
                        </Text>
                      </View>
                      <Text style={{ color: c.foreground, fontSize: 14, marginTop: 4 }}>{c2.text}</Text>
                    </View>
                  </View>
                </GlassCard>
              );
            })}
          </View>
        </ScrollView>
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
          <View style={{ flex: 1 }}>
            <GlassInput
              placeholder="Add a comment…"
              value={text}
              onChangeText={setText}
              multiline
            />
          </View>
          <View style={{ marginLeft: 8, marginBottom: 12 }}>
            <GlassButton
              title="Send"
              small
              onPress={async () => {
                await addComment(post.id, text);
                setText("");
              }}
              disabled={!text.trim()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Background>
  );
}
