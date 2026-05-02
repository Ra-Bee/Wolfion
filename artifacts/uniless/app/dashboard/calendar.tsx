import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { Background, GlassButton, GlassCard, GlassInput, Header, SectionHeader, TagChip } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useColors } from "@/hooks/useColors";
import { fmtDate } from "@/lib/format";
import type { UniversityEvent } from "@/lib/types";

const KIND_OPTIONS: UniversityEvent["kind"][] = [
  "semester",
  "holiday",
  "midterm",
  "finals",
  "deadline",
  "custom",
];

const KIND_LABEL: Record<UniversityEvent["kind"], string> = {
  semester: "Semester",
  holiday: "Holiday",
  midterm: "Midterm",
  finals: "Finals",
  deadline: "Deadline",
  custom: "Custom",
};

export default function CalendarScreen() {
  const c = useColors();
  const { universityEvents, addUniversityEvent, removeUniversityEvent } = useAppData();

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<UniversityEvent["kind"]>("deadline");
  const [inDays, setInDays] = useState("3");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    const days = Math.max(0, Number.parseFloat(inDays) || 0);
    await addUniversityEvent({
      title: title.trim(),
      kind,
      startsAt: Date.now() + days * 24 * 60 * 60 * 1000,
      notes: notes.trim() || undefined,
    });
    setTitle("");
    setNotes("");
    setSubmitting(false);
  };

  const sorted = [...universityEvents].sort((a, b) => a.startsAt - b.startsAt);

  return (
    <Background>
      <Header title="University calendar" subtitle="Holidays, deadlines, finals" back />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
          <GlassCard padding={16}>
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 16,
                marginBottom: 12,
              }}
            >
              Add an event
            </Text>
            <GlassInput label="Title" placeholder="Course add/drop deadline" value={title} onChangeText={setTitle} />
            <Text style={{ color: c.mutedForeground, fontSize: 13, marginBottom: 6, fontFamily: "Inter_500Medium" }}>
              Kind
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 6 }}>
              {KIND_OPTIONS.map((k) => (
                <TagChip key={k} label={KIND_LABEL[k]} active={kind === k} onPress={() => setKind(k)} />
              ))}
            </View>
            <GlassInput
              label="In (days)"
              placeholder="3"
              keyboardType="number-pad"
              value={inDays}
              onChangeText={setInDays}
            />
            <GlassInput label="Notes" multiline value={notes} onChangeText={setNotes} />
            <GlassButton title="Add event" full loading={submitting} onPress={submit} disabled={!title.trim()} />
          </GlassCard>

          <SectionHeader title="All events" />
          <GlassCard padding={14}>
            {sorted.length === 0 ? (
              <Text
                style={{
                  color: c.mutedForeground,
                  textAlign: "center",
                  paddingVertical: 12,
                }}
              >
                No university events yet.
              </Text>
            ) : (
              sorted.map((ue, i) => (
                <View
                  key={ue.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 10,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: c.border,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                      {ue.title}
                    </Text>
                    <Text style={{ color: c.mutedForeground, fontSize: 12, marginTop: 2 }}>
                      {KIND_LABEL[ue.kind]} · {fmtDate(ue.startsAt)}
                      {ue.endsAt ? ` → ${fmtDate(ue.endsAt)}` : ""}
                    </Text>
                  </View>
                  <Pressable onPress={() => removeUniversityEvent(ue.id)} hitSlop={8}>
                    <Feather name="trash-2" size={18} color={c.mutedForeground} />
                  </Pressable>
                </View>
              ))
            )}
          </GlassCard>

          <View style={{ marginTop: 18 }}>
            <GlassButton title="Done" variant="ghost" full onPress={() => router.back()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
}
