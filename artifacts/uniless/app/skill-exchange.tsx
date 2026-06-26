import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { Avatar, Background, EmptyState, GlassButton, GlassCard, GlassFAB, GlassInput, Header, TagChip } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { timeAgo } from "@/lib/format";

export default function SkillExchange() {
  const c = useColors();
  const { user, allUsers } = useAuth();
  const { skillExchanges, createSkillPost, removeSkillPost, ensureDirectChat } = useAppData();
  const [filter, setFilter] = useState<"all" | "offer" | "request">("all");
  const [creating, setCreating] = useState(false);
  const [type, setType] = useState<"offer" | "request">("offer");
  const [skill, setSkill] = useState("");
  const [description, setDescription] = useState("");
  const [exchangeFor, setExchangeFor] = useState("");

  const userMap = useMemo(() => Object.fromEntries(allUsers.map((u) => [u.id, u])), [allUsers]);
  const filtered = useMemo(
    () => skillExchanges.filter((s) => filter === "all" || s.type === filter),
    [skillExchanges, filter],
  );

  const submit = async () => {
    if (!skill.trim()) return;
    await createSkillPost({
      type,
      skill: skill.trim(),
      description: description.trim(),
      exchangeFor: exchangeFor.trim(),
    });
    setSkill("");
    setDescription("");
    setExchangeFor("");
    setCreating(false);
  };

  return (
    <Background>
      <Header title="Skill exchange" subtitle="Trade what you know for what you want to learn" back />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListHeaderComponent={
          <View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
              <TagChip label="All" active={filter === "all"} onPress={() => setFilter("all")} />
              <TagChip label="Offers" active={filter === "offer"} onPress={() => setFilter("offer")} />
              <TagChip label="Requests" active={filter === "request"} onPress={() => setFilter("request")} />
            </View>
            {creating ? (
              <GlassCard padding={16} style={{ marginBottom: 12 }}>
                <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", marginBottom: 10 }}>
                  New listing
                </Text>
                <Text style={{ color: c.mutedForeground, fontSize: 13, marginBottom: 6, fontFamily: "Inter_500Medium" }}>
                  Type
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 10 }}>
                  <TagChip label="I'm offering" active={type === "offer"} onPress={() => setType("offer")} />
                  <TagChip label="I'm requesting" active={type === "request"} onPress={() => setType("request")} />
                </View>
                <GlassInput label="Skill" placeholder="e.g. Calculus tutoring" value={skill} onChangeText={setSkill} />
                <GlassInput
                  label="Description"
                  multiline
                  placeholder="Briefly describe what you can offer or want to learn"
                  value={description}
                  onChangeText={setDescription}
                />
                <GlassInput
                  label={type === "offer" ? "What I want in return" : "What I can give back"}
                  placeholder="e.g. Spanish conversation"
                  value={exchangeFor}
                  onChangeText={setExchangeFor}
                />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <GlassButton title="Cancel" variant="ghost" onPress={() => setCreating(false)} style={{ flex: 1 }} />
                  <GlassButton title="Post" onPress={submit} style={{ flex: 1 }} />
                </View>
              </GlassCard>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const author = userMap[item.authorId];
          const isMine = item.authorId === user?.id;
          return (
            <GlassCard padding={14}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    borderRadius: 999,
                    backgroundColor: item.type === "offer" ? c.success : c.warning,
                  }}
                >
                  <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 10 }}>
                    {item.type === "offer" ? "OFFERING" : "REQUESTING"}
                  </Text>
                </View>
                <View style={{ flex: 1 }} />
                <Text style={{ color: c.mutedForeground, fontSize: 11 }}>{timeAgo(item.createdAt)}</Text>
              </View>
              <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 17, marginTop: 8 }}>
                {item.skill}
              </Text>
              {item.description ? (
                <Text style={{ color: c.foreground, fontSize: 14, marginTop: 6, lineHeight: 20 }}>
                  {item.description}
                </Text>
              ) : null}
              {item.exchangeFor ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 10,
                    backgroundColor: c.secondary,
                    padding: 10,
                    borderRadius: 12,
                  }}
                >
                  <Feather name="repeat" size={14} color={c.primary} />
                  <Text
                    style={{
                      color: c.foreground,
                      fontSize: 13,
                      marginLeft: 8,
                      flex: 1,
                      fontFamily: "Inter_500Medium",
                    }}
                  >
                    {item.type === "offer" ? "In return: " : "Can give: "}
                    {item.exchangeFor}
                  </Text>
                </View>
              ) : null}
              {author ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 12,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: c.border,
                  }}
                >
                  <Pressable
                    onPress={() => router.push({ pathname: "/profile/[id]", params: { id: author.id } })}
                    style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                  >
                    <Avatar name={author.displayName} color={author.avatarColor} size={28} />
                    <Text style={{ color: c.foreground, fontFamily: "Inter_500Medium", marginLeft: 8 }}>
                      {author.displayName}
                    </Text>
                  </Pressable>
                  {isMine ? (
                    <GlassButton title="Remove" small variant="ghost" onPress={() => removeSkillPost(item.id)} />
                  ) : (
                    <GlassButton
                      title="Message"
                      small
                      onPress={async () => {
                        const ch = await ensureDirectChat(author.id);
                        router.push({ pathname: "/chat/[id]", params: { id: ch.id } });
                      }}
                    />
                  )}
                </View>
              ) : null}
            </GlassCard>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="repeat"
            title="No listings yet"
            body="Be the first to offer or request a skill."
            action={<GlassButton title="Create listing" onPress={() => setCreating(true)} />}
          />
        }
      />
      {!creating ? <GlassFAB icon="plus" onPress={() => setCreating(true)} /> : null}
    </Background>
  );
}
