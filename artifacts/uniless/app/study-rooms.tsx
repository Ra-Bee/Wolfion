import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { Avatar, Background, EmptyState, GlassButton, GlassCard, GlassFAB, GlassInput, Header, TagChip } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { fmtDateTime, untilLabel } from "@/lib/format";

export default function StudyRooms() {
  const c = useColors();
  const { user, allUsers } = useAuth();
  const { studyRooms, joinStudyRoom, leaveStudyRoom, createStudyRoom } = useAppData();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("6");
  const [inHours, setInHours] = useState("2");

  const userMap = useMemo(() => Object.fromEntries(allUsers.map((u) => [u.id, u])), [allUsers]);
  const sorted = useMemo(
    () =>
      [...studyRooms].sort((a, b) => {
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        return a.scheduledFor - b.scheduledFor;
      }),
    [studyRooms],
  );

  const create = async () => {
    if (!title.trim() || !subject.trim()) return;
    const hours = Math.max(0, Number.parseFloat(inHours) || 0);
    const cap = Math.max(2, Math.min(50, Number.parseInt(capacity, 10) || 6));
    await createStudyRoom({
      title: title.trim(),
      subject: subject.trim(),
      description: description.trim(),
      capacity: cap,
      scheduledFor: Date.now() + hours * 60 * 60 * 1000,
    });
    setTitle("");
    setSubject("");
    setDescription("");
    setCreating(false);
  };

  return (
    <Background>
      <Header title="Study rooms" subtitle="Drop in or schedule a session" back />
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListHeaderComponent={
          creating ? (
            <GlassCard padding={16} style={{ marginBottom: 16 }}>
              <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", marginBottom: 10 }}>
                New study room
              </Text>
              <GlassInput label="Title" placeholder="CS161 PSet party" value={title} onChangeText={setTitle} />
              <GlassInput label="Subject / class" placeholder="CS161" value={subject} onChangeText={setSubject} />
              <GlassInput label="Description" multiline value={description} onChangeText={setDescription} />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <GlassInput
                    label="Capacity"
                    placeholder="6"
                    keyboardType="number-pad"
                    value={capacity}
                    onChangeText={setCapacity}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <GlassInput
                    label="Starts in (hours)"
                    placeholder="2"
                    keyboardType="number-pad"
                    value={inHours}
                    onChangeText={setInHours}
                  />
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <GlassButton title="Cancel" variant="ghost" onPress={() => setCreating(false)} style={{ flex: 1 }} />
                <GlassButton title="Create room" onPress={create} style={{ flex: 1 }} />
              </View>
            </GlassCard>
          ) : null
        }
        renderItem={({ item }) => {
          const host = userMap[item.hostId];
          const joined = user ? item.participantIds.includes(user.id) : false;
          const full = item.participantIds.length >= item.capacity;
          return (
            <Pressable
              onPress={() => router.push({ pathname: "/study-room/[id]", params: { id: item.id } })}
            >
              <GlassCard padding={14}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  {item.isLive ? (
                    <TagChip label="● LIVE" tint={c.destructive} />
                  ) : (
                    <TagChip label={untilLabel(item.scheduledFor)} tint={c.primary} />
                  )}
                  <View style={{ flex: 1 }} />
                  <Text style={{ color: c.mutedForeground, fontSize: 11 }}>
                    {item.participantIds.length}/{item.capacity}
                  </Text>
                </View>
                <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 16 }}>
                  {item.title}
                </Text>
                <Text style={{ color: c.mutedForeground, fontSize: 12, marginTop: 2 }}>
                  {item.subject} · {fmtDateTime(item.scheduledFor)}
                </Text>
                {item.description ? (
                  <Text
                    style={{ color: c.foreground, fontSize: 13, marginTop: 8, lineHeight: 18 }}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                ) : null}
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
                  {host ? (
                    <Avatar name={host.displayName} color={host.avatarColor} size={28} />
                  ) : null}
                  <Text style={{ color: c.mutedForeground, fontSize: 12, marginLeft: 8, flex: 1 }}>
                    Hosted by {host?.displayName ?? "?"}
                  </Text>
                  <GlassButton
                    title={joined ? "Leave" : full ? "Full" : "Join"}
                    small
                    variant={joined ? "ghost" : full ? "secondary" : "primary"}
                    disabled={!joined && full}
                    onPress={() => (joined ? leaveStudyRoom(item.id) : joinStudyRoom(item.id))}
                  />
                </View>
              </GlassCard>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="monitor"
            title="No study rooms yet"
            body="Create one and invite your friends!"
            action={<GlassButton title="Create room" onPress={() => setCreating(true)} />}
          />
        }
      />
      {!creating ? <GlassFAB icon="plus" onPress={() => setCreating(true)} /> : null}
    </Background>
  );
}
