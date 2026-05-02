import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";

import { Background, GlassButton, GlassCard, GlassInput, Header } from "@/components/glass";
import { MediaAttachSheet } from "@/components/MediaAttachSheet";
import type { MessageAttachmentKind } from "@/lib/types";
import { useAppData } from "@/contexts/AppDataContext";
import { useColors } from "@/hooks/useColors";
import {
  aiChatAsync,
  aiSummarizeTextAsync,
  aiSummarizeUrlAsync,
  aiSummarizeVideoAsync,
  aiTranslateAsync,
  extractReminders,
  type ExtractedReminder,
} from "@/lib/ai";
import { ApiError } from "@/lib/api";
import { fmtDateTime } from "@/lib/format";
import { genId } from "@/lib/storage";

interface Msg {
  id: string;
  role: "user" | "ai";
  text: string;
  reminders?: ExtractedReminder[];
  pending?: boolean;
}

const STARTERS = [
  "Remind me to submit CS161 PSet by Friday 6pm",
  "Give me 3 study tips before my CS161 final",
  "I'm stressed about midterms",
  "Help me plan my week",
  "summarize: photosynthesis is the process by which plants convert sunlight, water and carbon dioxide into glucose and oxygen using chlorophyll. it occurs primarily in the chloroplasts of leaf cells and is essential for life on earth, providing both food and oxygen for most living organisms.",
  "translate to Spanish: I have a final exam tomorrow morning, wish me luck.",
  "summarize url: https://en.wikipedia.org/wiki/Active_recall",
  "summarize transcript: today we covered Newton's three laws of motion. The first law states an object at rest stays at rest...",
];

const URL_PREFIX = /^summari[sz]e\s+url\s*[:,-]?\s*/i;
const TEXT_PREFIX = /^summari[sz]e\s*[:,-]?\s*/i;
const VIDEO_PREFIX = /^summari[sz]e\s+(?:transcript|video|lecture)\s*[:,-]?\s*/i;
const TRANSLATE_PREFIX = /^translate\s+(?:to\s+)?([A-Za-z\s\-]+?)\s*[:,-]\s*/i;

async function classifyAndAnswer(prompt: string): Promise<string> {
  const trimmed = prompt.trim();
  if (URL_PREFIX.test(trimmed)) {
    const url = trimmed.replace(URL_PREFIX, "").trim();
    return aiSummarizeUrlAsync(url);
  }
  if (VIDEO_PREFIX.test(trimmed)) {
    const transcript = trimmed.replace(VIDEO_PREFIX, "").trim();
    return aiSummarizeVideoAsync(transcript);
  }
  const translateMatch = trimmed.match(TRANSLATE_PREFIX);
  if (translateMatch) {
    const lang = translateMatch[1]?.trim() ?? "";
    const body = trimmed.replace(TRANSLATE_PREFIX, "").trim();
    return aiTranslateAsync(body, lang);
  }
  if (TEXT_PREFIX.test(trimmed) && trimmed.length > 40) {
    const body = trimmed.replace(TEXT_PREFIX, "").trim();
    return aiSummarizeTextAsync(body);
  }
  return aiChatAsync(trimmed);
}

export function AIAssistantContent({ back = false }: { back?: boolean }) {
  const c = useColors();
  const { addAssignment } = useAppData();
  const [text, setText] = useState("");
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);

  const handleAttach = (kind: MessageAttachmentKind) => {
    if (kind === "pdf") {
      router.push("/ai-summarize-pdf");
    } else if (kind === "audio") {
      router.push("/ai-transcribe");
    } else {
      Alert.alert(
        "Coming soon",
        `RabChat AI can't analyze ${kind === "photo" ? "photos" : kind === "video" ? "videos" : "this file type"} yet. You can share these in your chats with friends. PDFs and audio work great here today!`,
      );
    }
  };
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: genId("ai"),
      role: "ai",
      text:
        "Hi! I'm your AI study buddy. Ask anything, paste notes after 'summarize:', share a URL with 'summarize url: ...', a lecture transcript with 'summarize transcript: ...', or translate with 'translate to Spanish: ...'. I can also pick up reminders from sentences like 'remind me to ...'.",
    },
  ]);
  const listRef = useRef<FlatList>(null);

  const send = async (raw: string) => {
    const t = raw.trim();
    if (!t || busy) return;
    setText("");
    const userMsg: Msg = { id: genId("u"), role: "user", text: t };
    const reminders = extractReminders(t);
    const placeholderId = genId("ai");
    const placeholder: Msg = { id: placeholderId, role: "ai", text: "Thinking…", pending: true, reminders };
    setMessages((m) => [...m, userMsg, placeholder]);
    setBusy(true);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);

    let replyText: string;
    try {
      if (reminders.length) {
        replyText = `Got it — I picked up ${reminders.length} reminder${reminders.length === 1 ? "" : "s"} in there. Tap below to add to your dashboard.`;
      } else {
        replyText = await classifyAndAnswer(t);
        if (!replyText) replyText = "I couldn't get a response. Try rephrasing.";
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Something went wrong reaching the assistant. Check your connection and try again.";
      replyText = msg;
    }

    setMessages((m) =>
      m.map((x) =>
        x.id === placeholderId ? { ...x, text: replyText, pending: false } : x,
      ),
    );
    setBusy(false);
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
      <Header
        title="RabChat AI"
        subtitle="Powered by GPT · summarize, translate, plan"
        back={back}
        trailing={
          <View style={{ flexDirection: "row", gap: 6 }}>
            <Pressable
              onPress={() => router.push("/ai-transcribe")}
              hitSlop={10}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: c.secondary,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Feather name="mic" size={14} color={c.secondaryForeground} />
              <Text style={{ color: c.secondaryForeground, fontSize: 12, fontFamily: "Inter_700Bold", marginLeft: 4 }}>
                Voice
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/ai-summarize-pdf")}
              hitSlop={10}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: c.secondary,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Feather name="file" size={14} color={c.secondaryForeground} />
              <Text style={{ color: c.secondaryForeground, fontSize: 12, fontFamily: "Inter_700Bold", marginLeft: 4 }}>
                PDF
              </Text>
            </Pressable>
          </View>
        }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, paddingBottom: back ? 12 : 110 }}
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
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {item.pending ? (
                    <ActivityIndicator size="small" color={c.primary} style={{ marginRight: 8 }} />
                  ) : null}
                  <Text
                    style={{
                      color: item.role === "user" ? c.primaryForeground : c.foreground,
                      fontSize: 15,
                      lineHeight: 22,
                      flexShrink: 1,
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
            paddingBottom: back ? 12 : 96,
            borderTopWidth: 1,
            borderTopColor: c.border,
            backgroundColor: c.cardSolid,
            flexDirection: "row",
            alignItems: "flex-end",
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Attach media"
            onPress={() => setAttachOpen(true)}
            style={{ padding: 10, marginRight: 4, marginBottom: 6 }}
            hitSlop={6}
          >
            <Feather name="plus-circle" size={22} color={c.primary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <GlassInput placeholder="Ask anything…" value={text} onChangeText={setText} multiline />
          </View>
          <View style={{ marginLeft: 8, marginBottom: 8 }}>
            <GlassButton title={busy ? "…" : "Send"} small disabled={!text.trim() || busy} onPress={() => send(text)} />
          </View>
        </View>
      </KeyboardAvoidingView>
      <MediaAttachSheet
        visible={attachOpen}
        onClose={() => setAttachOpen(false)}
        onChooseKind={handleAttach}
        enabled={["photo", "video", "audio", "pdf", "file"]}
      />
    </Background>
  );
}

export default function AIAssistant() {
  return <AIAssistantContent back />;
}
