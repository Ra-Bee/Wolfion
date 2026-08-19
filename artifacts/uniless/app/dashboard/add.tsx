import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";

import { Background, GlassButton, GlassCard, GlassInput, Header, TagChip } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useColors } from "@/hooks/useColors";

const KIND_OPTIONS: { id: "class" | "assignment" | "exam"; label: string }[] = [
  { id: "class", label: "Class" },
  { id: "assignment", label: "Assignment" },
  { id: "exam", label: "Exam" },
];

const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#06b6d4", "#10b981", "#f59e0b"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PRIORITIES: ("low" | "med" | "high")[] = ["low", "med", "high"];

export default function DashboardAdd() {
  const c = useColors();
  const { kind: paramKind } = useLocalSearchParams<{ kind?: string }>();
  const initial = (paramKind as "class" | "assignment" | "exam" | undefined) ?? "class";
  const [kind, setKind] = useState<"class" | "assignment" | "exam">(initial);
  const { addClass, addAssignment, addExam } = useAppData();

  // class fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [professor, setProfessor] = useState("");
  const [location, setLocation] = useState("");
  const [day, setDay] = useState(1);
  const [start, setStart] = useState("10:30");
  const [end, setEnd] = useState("11:50");
  const [color, setColor] = useState(COLORS[0]!);

  // assignment fields
  const [aTitle, setATitle] = useState("");
  const [aDueDays, setADueDays] = useState("3");
  const [aPriority, setAPriority] = useState<"low" | "med" | "high">("med");
  const [aNotes, setANotes] = useState("");

  // exam fields
  const [eTitle, setETitle] = useState("");
  const [eInDays, setEInDays] = useState("14");
  const [eLocation, setELocation] = useState("");
  const [eNotes, setENotes] = useState("");

  const submit = async () => {
    if (kind === "class") {
      if (!name.trim() || !code.trim()) return;
      await addClass({
        name: name.trim(),
        code: code.trim(),
        professor: professor.trim(),
        location: location.trim(),
        dayOfWeek: day,
        startTime: start,
        endTime: end,
        color,
      });
    } else if (kind === "assignment") {
      if (!aTitle.trim()) return;
      const days = Math.max(0, Number.parseFloat(aDueDays) || 0);
      await addAssignment({
        title: aTitle.trim(),
        dueAt: Date.now() + days * 24 * 60 * 60 * 1000,
        notes: aNotes.trim(),
        priority: aPriority,
      });
    } else {
      if (!eTitle.trim()) return;
      const days = Math.max(0, Number.parseFloat(eInDays) || 0);
      await addExam({
        title: eTitle.trim(),
        startsAt: Date.now() + days * 24 * 60 * 60 * 1000,
        location: eLocation.trim(),
        notes: eNotes.trim(),
      });
    }
    router.back();
  };

  return (
    <Background>
      <Header
        title="Add to dashboard"
        back
        trailing={<GlassButton title="Save" small onPress={submit} />}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
          <GlassCard padding={14}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {KIND_OPTIONS.map((o) => (
                <TagChip key={o.id} label={o.label} active={kind === o.id} onPress={() => setKind(o.id)} />
              ))}
            </View>
          </GlassCard>

          {kind === "class" ? (
            <GlassCard padding={16} style={{ marginTop: 12 }}>
              <GlassInput label="Class name" placeholder="Algorithms" value={name} onChangeText={setName} />
              <GlassInput label="Course code" placeholder="CS161" value={code} onChangeText={setCode} />
              <GlassInput label="Professor" value={professor} onChangeText={setProfessor} />
              <GlassInput label="Location" placeholder="Hewlett 200" value={location} onChangeText={setLocation} />

              <Text style={{ color: c.mutedForeground, fontSize: 13, marginBottom: 6, fontFamily: "Inter_500Medium" }}>
                Day of week
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
                {DAYS.map((d, i) => (
                  <TagChip key={d} label={d} active={day === i} onPress={() => setDay(i)} />
                ))}
              </View>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <GlassInput label="Start (HH:MM)" placeholder="10:30" value={start} onChangeText={setStart} />
                </View>
                <View style={{ flex: 1 }}>
                  <GlassInput label="End (HH:MM)" placeholder="11:50" value={end} onChangeText={setEnd} />
                </View>
              </View>

              <Text style={{ color: c.mutedForeground, fontSize: 13, marginBottom: 6, fontFamily: "Inter_500Medium" }}>
                Color
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {COLORS.map((col) => (
                  <View
                    key={col}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: col,
                      borderWidth: color === col ? 3 : 0,
                      borderColor: c.foreground,
                    }}
                    onTouchEnd={() => setColor(col)}
                  />
                ))}
              </View>
            </GlassCard>
          ) : kind === "assignment" ? (
            <GlassCard padding={16} style={{ marginTop: 12 }}>
              <GlassInput label="Title" placeholder="CS161 PSet 5" value={aTitle} onChangeText={setATitle} />
              <GlassInput
                label="Due in (days)"
                placeholder="3"
                keyboardType="number-pad"
                value={aDueDays}
                onChangeText={setADueDays}
              />
              <Text style={{ color: c.mutedForeground, fontSize: 13, marginBottom: 6, fontFamily: "Inter_500Medium" }}>
                Priority
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {PRIORITIES.map((p) => (
                  <TagChip key={p} label={p} active={aPriority === p} onPress={() => setAPriority(p)} />
                ))}
              </View>
              <GlassInput label="Notes" multiline value={aNotes} onChangeText={setANotes} />
            </GlassCard>
          ) : (
            <GlassCard padding={16} style={{ marginTop: 12 }}>
              <GlassInput label="Title" placeholder="CS161 Final" value={eTitle} onChangeText={setETitle} />
              <GlassInput
                label="In (days)"
                placeholder="14"
                keyboardType="number-pad"
                value={eInDays}
                onChangeText={setEInDays}
              />
              <GlassInput label="Location" value={eLocation} onChangeText={setELocation} />
              <GlassInput label="Notes" multiline value={eNotes} onChangeText={setENotes} />
            </GlassCard>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
}
