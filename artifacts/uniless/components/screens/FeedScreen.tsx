import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";

import { Avatar, Background, EmptyState, GlassButton, GlassCard, GlassFAB, Header, TagChip } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { timeAgo } from "@/lib/format";
import { POST_CATEGORIES, type Post, type PostCategory, type UnilessUser } from "@/lib/types";

const CATEGORY_LABEL: Record<PostCategory | "all", string> = {
  all: "All",
  study: "Study",
  questions: "Questions",
  events: "Events",
  notes: "Notes",
};

const CATEGORY_TINT: Record<PostCategory, string> = {
  study: "#3aa9ff",
  questions: "#CDB4FF",
  events: "#9BF6FF",
  notes: "#7ddfc6",
};

export default function FeedScreen() {
  const c = useColors();
  const { user, allUsers } = useAuth();
  const { posts, friends, togglePostLike } = useAppData();
  const [filter, setFilter] = useState<PostCategory | "all">("all");

  const userMap = useMemo(() => Object.fromEntries(allUsers.map((u) => [u.id, u])), [allUsers]);
  const myFriends = (user && friends[user.id]) || [];

  const visiblePosts = useMemo(() => {
    if (!user) return [];
    return posts
      .filter((p) => {
        if (p.privacy === "public") return true;
        if (p.authorId === user.id) return true;
        if (p.privacy === "friends") return myFriends.includes(p.authorId);
        return false;
      })
      .filter((p) => filter === "all" || p.category === filter)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [posts, user, myFriends, filter]);

  return (
    <Background>
      <Header
        title="Home"
        subtitle={user ? `Hey ${user.displayName.split(" ")[0]} 👋` : undefined}
        trailing={
          <Pressable
            onPress={() => router.push("/notifications")}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: c.secondary,
            }}
          >
            <Feather name="bell" size={18} color={c.foreground} />
          </Pressable>
        }
      />
      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 8 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 6, gap: 6 }}
            >
              {(["all", ...POST_CATEGORIES] as (PostCategory | "all")[]).map((cat) => (
                <TagChip
                  key={cat}
                  label={CATEGORY_LABEL[cat]}
                  active={filter === cat}
                  onPress={() => setFilter(cat)}
                />
              ))}
            </ScrollView>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => <PostCard post={item} onLike={() => togglePostLike(item.id)} userMap={userMap} />}
        ListEmptyComponent={
          <EmptyState
            icon="message-square"
            title={filter === "all" ? "No posts yet" : `No ${CATEGORY_LABEL[filter]} posts`}
            body={
              filter === "all"
                ? "Share something with your campus to get the feed going."
                : "Try another filter or share the first one in this category."
            }
            action={<GlassButton title="New post" onPress={() => router.push("/post/new")} />}
          />
        }
      />
      <GlassFAB icon="edit-3" onPress={() => router.push("/post/new")} bottom={120} />
    </Background>
  );
}

function PostCard({
  post,
  onLike,
  userMap,
}: {
  post: Post;
  onLike: () => void;
  userMap: Record<string, UnilessUser | undefined>;
}) {
  const c = useColors();
  const { user } = useAuth();
  const author = userMap[post.authorId];
  const liked = user ? post.likes.includes(user.id) : false;
  const tint = CATEGORY_TINT[post.category] ?? c.primary;
  return (
    <GlassCard padding={14}>
      <Pressable
        onPress={() => router.push({ pathname: "/profile/[id]", params: { id: post.authorId } })}
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
      >
        <Avatar name={author?.displayName ?? "?"} color={author?.avatarColor ?? c.primary} size={36} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={{ color: c.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
            {author?.displayName ?? "Unknown"}
          </Text>
          <Text style={{ color: c.mutedForeground, fontSize: 11, fontFamily: "Inter_400Regular" }}>
            @{author?.username ?? "?"} · {timeAgo(post.createdAt)} ·{" "}
            {post.privacy === "public" ? "🌐" : post.privacy === "friends" ? "👥" : "🔒"}
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: tint + "33",
            borderWidth: 1,
            borderColor: tint + "66",
          }}
        >
          <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 0.5 }}>
            {(CATEGORY_LABEL[post.category] ?? "Post").toUpperCase()}
          </Text>
        </View>
      </Pressable>
      <Pressable onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}>
        {post.text ? (
          <Text style={{ color: c.foreground, fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 21 }}>
            {post.text}
          </Text>
        ) : null}
        {post.images?.length ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: post.text ? 10 : 0, marginHorizontal: -2 }}>
            {post.images.slice(0, 4).map((uri, i) => (
              <View
                key={uri + i}
                style={{ width: post.images!.length === 1 ? "100%" : "50%", padding: 2 }}
              >
                <Image
                  source={{ uri }}
                  style={{
                    width: "100%",
                    height: post.images!.length === 1 ? 220 : 140,
                    borderRadius: 12,
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
      </Pressable>
      <View style={{ flexDirection: "row", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: c.border }}>
        <Pressable onPress={onLike} style={{ flexDirection: "row", alignItems: "center", marginRight: 18 }} hitSlop={8}>
          <Feather name="heart" size={16} color={liked ? c.destructive : c.mutedForeground} />
          <Text style={{ color: liked ? c.destructive : c.mutedForeground, marginLeft: 6, fontSize: 13 }}>
            {post.likes.length}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}
          style={{ flexDirection: "row", alignItems: "center" }}
          hitSlop={8}
        >
          <Feather name="message-circle" size={16} color={c.mutedForeground} />
          <Text style={{ color: c.mutedForeground, marginLeft: 6, fontSize: 13 }}>
            {post.comments.length}
          </Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}
