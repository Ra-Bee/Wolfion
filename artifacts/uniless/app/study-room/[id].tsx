import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";

import { Avatar, Background, GlassButton, GlassCard, Header, SectionHeader } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { fmtDateTime, untilLabel } from "@/lib/format";

export default function StudyRoomDetail() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, allUsers } = useAuth();
  const { studyRooms, joinStudyRoom, leaveStudyRoom, ensureDirectChat } = useAppData();
  const userMap = useMemo(() => Object.fromEntries(allUsers.map((u) => [u.id, u])), [allUsers]);
  const room = studyRooms.find((r) => r.id === id);

  if (!room) {
    return (
      <Background>
        <Header title="Study room" back />
        <View style={{ padding: 24 }}>
          <Text style={{ color: c.mutedForeground, textAlign: "center" }}>This room is no longer open.</Text>
        </View>
      </Background>
    );
  }

  const host = userMap[room.hostId];
  const joined = user ? room.participantIds.includes(user.id) : false;
  const full = room.participantIds.length >= room.capacity;

  return (
    <Background>
      <Header title={room.title} subtitle={`${room.subject} · ${fmtDateTime(room.scheduledFor)}`} back />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}>
        <GlassCard padding={16}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: room.isLive ? c.destructive : c.primary,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 11 }}>
                {room.isLive ? "● LIVE" : untilLabel(room.scheduledFor).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            <Text style={{ color: c.mutedForeground }}>
              {room.participantIds.length}/{room.capacity} joined
            </Text>
          </View>

          {room.description ? (
            <Text style={{ color: c.foreground, fontSize: 15, lineHeight: 22 }}>{room.description}</Text>
          ) : (
            <Text style={{ color: c.mutedForeground, fontStyle: "italic" }}>
              No description yet.
            </Text>
          )}

          <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
            <GlassButton
              title={joined ? "Leave room" : full ? "Room is full" : "Join room"}
              variant={joined ? "ghost" : "primary"}
              disabled={!joined && full}
              onPress={() => (joined ? leaveStudyRoom(room.id) : joinStudyRoom(room.id))}
              style={{ flex: 1 }}
              icon={joined ? <Feather name="log-out" size={14} color={c.foreground} /> : undefined}
            />
            {host && host.id !== user?.id ? (
              <GlassButton
                title="Message host"
                variant="secondary"
                onPress={async () => {
                  const ch = await ensureDirectChat(host.id);
                  router.push({ pathname: "/chat/[id]", params: { id: ch.id } });
                }}
                style={{ flex: 1 }}
              />
            ) : null}
          </View>
        </GlassCard>

        <SectionHeader title="Participants" />
        <GlassCard padding={14}>
          {room.participantIds.map((pid, i) => {
            const u = userMap[pid];
            if (!u) return null;
            return (
              <View
                key={pid}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 10,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: c.border,
                }}
              >
                <Avatar name={u.displayName} color={u.avatarColor} size={36} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: c.foreground, fontFamily: "Inter_600SemiBold" }}>
                    {u.displayName} {pid === room.hostId ? <Text style={{ color: c.primary }}>· host</Text> : null}
                  </Text>
                  <Text style={{ color: c.mutedForeground, fontSize: 12 }}>{u.major}</Text>
                </View>
              </View>
            );
          })}
        </GlassCard>
      </ScrollView>
    </Background>
  );
}
