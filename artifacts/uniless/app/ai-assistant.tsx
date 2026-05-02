import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";

import { Background, GlassButton, GlassCard, GlassInput, Header } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useColors } from "@/hooks/useColors";
import { aiAssistantReply, extractReminders, type ExtractedReminder } from "@/lib/ai";
import { fmtDateTime } from "@/lib/format";
import { genId } from "@/lib/storage";

interface Msg {
  id: string;
  role: "user" | "ai";
  text: string;
  reminders?: ExtractedReminder[];
}

const STARTERS = [
  "Remind me to submit CS161 PSet by Friday 6pm",
  "Give me 3 study tips before my CS161 final",
  "I'm stressed about midterms",
  "Help me plan my week",
  "summarize: photosynthesis is the process by which plants convert sunlight, water and carbon dioxide into glucose and oxygen using chlorophyll. it occurs primarily in the chloroplasts of leaf cells and is essential for life on earth, providing both food and oxygen for most living organisms.",
];

export default function AIAssistant() {
  const c = useColors();
  const { addAssignment } = useAppData();
  const [text, setText] = useState("");
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: genId("ai"),
      role: "ai",
      text:
        "Hi! I'm your study buddy. I can summarize notes, share study tips, help with planning, or just chat about campus stress. Try a 'remind me to ...' prompt and I'll offer to add it as an assignment.",
    },
  ]);
  const listRef = useRef<FlatList>(null);

  const send = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    const userMsg: Msg = { id: genId("u"), role: "user", text: t };
    const reminders = extractReminders(t);
    const replyText = reminders.length
      ? `Got it — I picked up ${reminders.length} reminder${reminders.length === 1 ? "" : "s"} in there. Tap below to add to your dashboard.`
      : aiAssistantReply(t);
    const aiMsg: Msg = { id: genId("ai"), role: "ai", text: replyText, reminders };
    setMessages((m) => [...m, userMsg, aiMsg]);
    setText("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
  };

  const addReminder = async (msgId: string, idx: number, r: ExtractedReminder) => {
    await addAssignment({
      title: r.title,
      dueAt: r.dueAt,
      priority: r.priority,
      notes: "Added by AI assistant",
    });
    setAdded((s) => ({ ...s, [`${msgId}-${idx}`]: true }));
  };

  return (
    <Background>
      <Header title="AI study assistant" subtitle="On-device · no data leaves your phone" back />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                justifyContent: item.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 8,
              }}
            >
              {item.role === "ai" ? (
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: c.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 8,
                  }}
                >
                  <Feather name="zap" size={14} color="#fff" />
                </View>
              ) : null}
              <View style={{ maxWidth: "82%" }}>
                <View
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 18,
                    borderTopLeftRadius: item.role === "ai" ? 4 : 18,
                    borderTopRightRadius: item.role === "user" ? 4 : 18,
                    backgroundColor: item.role === "user" ? c.primary : c.cardSolid,
                  }}
                >
                  <Text
                    style={{
                      color: item.role === "user" ? c.primaryForeground : c.foreground,
                      fontSize: 15,
                      lineHeight: 22,
                    }}
                  >
                    {item.text}
                  </Text>
                </View>
                {item.reminders?.map((r: ExtractedReminder, idx: number) => {
                  const key = `${item.id}-${idx}`;
                  const isAdded = added[key];
                  return (
                    <View
                      key={key}
                      style={{
                        marginTop: 6,
                        padding: 12,
                        borderRadius: 14,
                        backgroundColor: c.cardSolid,
                        borderWidth: 1,
                        borderColor: c.glassBorder,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                        <Feather name="bell" size={14} color={c.primary} />
                        <Text
                          style={{
                            color: c.foreground,
                            fontFamily: "Inter_700Bold",
                            fontSize: 14,
                            marginLeft: 6,
                            flex: 1,
                          }}
                          numberOfLines={2}
                        >
                          {r.title}
                        </Text>
                      </View>
                      <Text style={{ color: c.mutedForeground, fontSize: 12, marginBottom: 8 }}>
                        Due {fmtDateTime(r.dueAt)} · priority {r.priority}
                      </Text>
                      <GlassButton
                        title={isAdded ? "Added to dashboard ✓" : "Add as assignment"}
                        small
                        variant={isAdded ? "ghost" : "primary"}
                        disabled={isAdded}
                        onPress={() => addReminder(item.id, idx, r)}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          )}
          ListFooterComponent={
            messages.length <= 1 ? (
              <GlassCard padding={14} style={{ marginTop: 12 }}>
                <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 14, marginBottom: 8 }}>
                  Try a prompt
                </Text>
                {STARTERS.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => send(s)}
                    style={({ pressed }) => ({
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      backgroundColor: c.secondary,
                      marginBottom: 6,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ color: c.secondaryForeground, fontSize: 13 }} numberOfLines={2}>
                      {s}
                    </Text>
                  </Pressable>
                ))}
              </GlassCard>
            ) : null
          }
        />
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
            <GlassInput placeholder="Ask anything…" value={text} onChangeText={setText} multiline />
          </View>
          <View style={{ marginLeft: 8, marginBottom: 12 }}>
            <GlassButton title="Send" small disabled={!text.trim()} onPress={() => send(text)} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Background>
  );
}
