import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { Background, EmptyState, GlassCard, Header } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { timeAgo } from "@/lib/format";

const ICON: Record<string, keyof typeof Feather.glyphMap> = {
  social: "users",
  academic: "book-open",
  system: "info",
  ai: "zap",
};

export default function Notifications() {
  const c = useColors();
  const { user } = useAuth();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    dismissedSynth,
    dismissSynthNotification,
    dismissAllSynth,
    friendRequests,
    posts,
    classes,
    assignments,
  } = useAppData();

  // Synthesize a few helpful notifications based on app state so the page is never empty.
  // Synth notifications can be dismissed/marked read by tracking their IDs in storage.
  const synth = useMemo(() => {
    if (!user) return [] as { id: string; title: string; body: string; createdAt: number; category: string; read: boolean }[];
    const items: { id: string; title: string; body: string; createdAt: number; category: string; read: boolean }[] = [];
    const now = Date.now();
    const dueSoon = assignments
      .filter((a) => a.ownerId === user.id && !a.done && a.dueAt - now < 1000 * 60 * 60 * 24 && a.dueAt - now > 0);
    for (const a of dueSoon) {
      const id = `synth-due-${a.id}`;
      items.push({
        id,
        title: "Assignment due soon",
        body: `${a.title} is due in less than 24 hours.`,
        createdAt: now - 1000 * 60 * 5,
        category: "academic",
        read: dismissedSynth.includes(id),
      });
    }
    const today = new Date().getDay();
    const todayClasses = classes.filter((cl) => cl.ownerId === user.id && cl.dayOfWeek === today);
    if (todayClasses.length) {
      const id = "synth-today";
      items.push({
        id,
        title: "You have classes today",
        body: `${todayClasses.length} on your schedule. Check the dashboard.`,
        createdAt: now - 1000 * 60 * 30,
        category: "academic",
        read: dismissedSynth.includes(id),
      });
    }
    const incoming = friendRequests.filter((r) => r.toId === user.id && r.status === "pending");
    for (const r of incoming) {
      const id = `synth-fr-${r.id}`;
      items.push({
        id,
        title: "New friend request",
        body: "Open the Friends page to respond.",
        createdAt: r.createdAt,
        category: "social",
        read: dismissedSynth.includes(id),
      });
    }
    const recentLikes = posts
      .filter((p) => p.authorId === user.id)
      .flatMap((p) => p.likes.map((uid) => ({ uid, postId: p.id, postText: p.text })))
      .slice(0, 3);
    for (const l of recentLikes) {
      const id = `synth-like-${l.postId}-${l.uid}`;
      items.push({
        id,
        title: "Someone liked your post",
        body: l.postText.slice(0, 60) + (l.postText.length > 60 ? "…" : ""),
        createdAt: now - 1000 * 60 * 60 * 3,
        category: "social",
        read: dismissedSynth.includes(id),
      });
    }
    return items;
  }, [user, assignments, classes, friendRequests, posts, dismissedSynth]);

  const all = useMemo(
    () =>
      [...notifications.filter((n) => n.ownerId === user?.id), ...synth].sort(
        (a, b) => b.createdAt - a.createdAt,
      ),
    [notifications, synth, user],
  );

  const hasUnread = all.some((n) => !n.read);

  return (
    <Background>
      <Header
        title="Notifications"
        back
        trailing={
          hasUnread ? (
            <Pressable
              onPress={async () => {
                await markAllNotificationsRead();
                await dismissAllSynth(synth.filter((s) => !s.read).map((s) => s.id));
              }}
              hitSlop={10}
            >
              <Text style={{ color: c.primary, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
                Mark all read
              </Text>
            </Pressable>
          ) : null
        }
      />
      <FlatList
        data={all}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={async () => {
              if (item.id.startsWith("synth-")) {
                await dismissSynthNotification(item.id);
              } else {
                await markNotificationRead(item.id);
              }
            }}
          >
            <GlassCard padding={14}>
              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: c.secondary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Feather name={ICON[item.category] ?? "bell"} size={16} color={c.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ color: c.foreground, fontFamily: "Inter_600SemiBold", flex: 1 }}>
                      {item.title}
                    </Text>
                    {!item.read ? (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: c.primary,
                        }}
                      />
                    ) : null}
                  </View>
                  <Text style={{ color: c.mutedForeground, fontSize: 13, marginTop: 4 }}>{item.body}</Text>
                  <Text style={{ color: c.mutedForeground, fontSize: 11, marginTop: 4 }}>
                    {timeAgo(item.createdAt)}
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState icon="bell" title="You're all caught up" body="No new notifications right now." />
        }
      />
    </Background>
  );
}
