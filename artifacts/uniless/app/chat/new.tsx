import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Avatar, Background, GlassButton, GlassCard, GlassInput, Header } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function NewChat() {
  const c = useColors();
  const { user, allUsers } = useAuth();
  const { ensureDirectChat, createGroupChat } = useAppData();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [groupTitle, setGroupTitle] = useState("");

  const others = useMemo(
    () =>
      allUsers
        .filter((u) => u.id !== user?.id)
        .filter((u) =>
          q.trim()
            ? u.displayName.toLowerCase().includes(q.toLowerCase()) ||
              u.username.toLowerCase().includes(q.toLowerCase())
            : true,
        ),
    [allUsers, user, q],
  );

  const startGroup = async () => {
    if (selected.length < 2) return;
    const ch = await createGroupChat(groupTitle.trim() || "Group chat", selected);
    router.replace({ pathname: "/chat/[id]", params: { id: ch.id } });
  };

  return (
    <Background>
      <Header
        title="Start a chat"
        back
        trailing={
          selected.length >= 2 ? (
            <GlassButton title={`Group (${selected.length})`} small onPress={startGroup} />
          ) : null
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        <GlassCard padding={14}>
          <GlassInput placeholder="Search by name or username" value={q} onChangeText={setQ} />
          {selected.length >= 2 ? (
            <GlassInput
              label="Group name (optional)"
              placeholder="e.g. CS161 Study Squad"
              value={groupTitle}
              onChangeText={setGroupTitle}
            />
          ) : (
            <Text style={{ color: c.mutedForeground, fontSize: 12, marginBottom: 6 }}>
              Tap a person to chat. Select 2+ people to start a group.
            </Text>
          )}
        </GlassCard>

        <View style={{ marginTop: 12, gap: 8 }}>
          {others.map((u) => {
            const isSel = selected.includes(u.id);
            return (
              <Pressable
                key={u.id}
                onPress={async () => {
                  if (selected.length === 0) {
                    const ch = await ensureDirectChat(u.id);
                    router.replace({ pathname: "/chat/[id]", params: { id: ch.id } });
                  } else {
                    setSelected(isSel ? selected.filter((x) => x !== u.id) : [...selected, u.id]);
                  }
                }}
                onLongPress={() =>
                  setSelected(isSel ? selected.filter((x) => x !== u.id) : [...selected, u.id])
                }
              >
                <GlassCard padding={12}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Avatar name={u.displayName} color={u.avatarColor} size={42} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: c.foreground, fontFamily: "Inter_600SemiBold" }}>
                        {u.displayName}
                      </Text>
                      <Text style={{ color: c.mutedForeground, fontSize: 12 }}>
                        @{u.username} · {u.major}
                      </Text>
                    </View>
                    {selected.length > 0 ? (
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          borderWidth: 2,
                          borderColor: isSel ? c.primary : c.border,
                          backgroundColor: isSel ? c.primary : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isSel ? <Text style={{ color: "#fff", fontSize: 12 }}>✓</Text> : null}
                      </View>
                    ) : null}
                  </View>
                </GlassCard>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Background>
  );
}
