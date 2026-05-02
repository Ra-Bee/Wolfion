import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Background, GlassButton, GlassCard, Header, SectionHeader } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { dayName, fmtDate, fmtDateTime, fmtTime, untilLabel } from "@/lib/format";

const DAYS = [1, 2, 3, 4, 5];

const UE_KIND_ICON = {
  semester: "calendar",
  holiday: "sun",
  midterm: "edit-3",
  finals: "award",
  deadline: "alert-circle",
  custom: "star",
} as const;

const UE_KIND_TINT = {
  semester: "#3aa9ff",
  holiday: "#7ddfc6",
  midterm: "#ffd07a",
  finals: "#ff8a8a",
  deadline: "#CDB4FF",
  custom: "#9BF6FF",
} as const;

export default function DashboardScreen() {
  const c = useColors();
  const { user } = useAuth();
  const {
    classes,
    assignments,
    exams,
    universityEvents,
    toggleAssignment,
    removeAssignment,
    removeExam,
    removeClass,
    removeUniversityEvent,
  } = useAppData();

  const myClasses = useMemo(() => classes.filter((cl) => cl.ownerId === user?.id), [classes, user]);
  const myAssignments = useMemo(
    () => assignments.filter((a) => a.ownerId === user?.id).sort((a, b) => a.dueAt - b.dueAt),
    [assignments, user],
  );
  const myExams = useMemo(
    () => exams.filter((e) => e.ownerId === user?.id).sort((a, b) => a.startsAt - b.startsAt),
    [exams, user],
  );
  const myUE = useMemo(
    () => universityEvents.filter((e) => e.ownerId === user?.id).sort((a, b) => a.startsAt - b.startsAt),
    [universityEvents, user],
  );

  const today = new Date().getDay();
  const todayClasses = myClasses
    .filter((cl) => cl.dayOfWeek === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const upcomingDue = myAssignments.filter((a) => !a.done).slice(0, 5);
  const stats = {
    open: myAssignments.filter((a) => !a.done).length,
    done: myAssignments.filter((a) => a.done).length,
    classes: myClasses.length,
    exams: myExams.length,
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = todayStart.getTime() + 24 * 60 * 60 * 1000;
  const weekEnd = todayStart.getTime() + 7 * 24 * 60 * 60 * 1000;

  type Item = {
    id: string;
    kind: "class" | "assignment" | "exam" | "uni";
    when: number;
    label: string;
    sub: string;
    color: string;
    icon: keyof typeof Feather.glyphMap;
  };
  const items: Item[] = [];
  for (const cl of todayClasses) {
    const [hh = "0", mm = "0"] = cl.startTime.split(":");
    const when = todayStart.getTime() + (parseInt(hh, 10) * 60 + parseInt(mm, 10)) * 60 * 1000;
    items.push({
      id: `cls-${cl.id}`,
      kind: "class",
      when,
      label: `${cl.code} · ${cl.name}`,
      sub: `${cl.startTime}–${cl.endTime} · ${cl.location}`,
      color: cl.color,
      icon: "book-open",
    });
  }
  for (const a of myAssignments) {
    if (a.done) continue;
    if (a.dueAt < todayStart.getTime() || a.dueAt >= todayEnd) continue;
    items.push({
      id: `a-${a.id}`,
      kind: "assignment",
      when: a.dueAt,
      label: a.title,
      sub: `Due ${fmtTime(a.dueAt)} · ${untilLabel(a.dueAt)}`,
      color: c.primary,
      icon: "check-square",
    });
  }
  for (const ex of myExams) {
    if (ex.startsAt < todayStart.getTime() || ex.startsAt >= todayEnd) continue;
    items.push({
      id: `e-${ex.id}`,
      kind: "exam",
      when: ex.startsAt,
      label: ex.title,
      sub: `Exam ${fmtTime(ex.startsAt)} · ${ex.location || "TBD"}`,
      color: c.warning,
      icon: "edit",
    });
  }
  for (const ue of myUE) {
    if (ue.startsAt < todayStart.getTime() || ue.startsAt >= todayEnd) continue;
    items.push({
      id: `u-${ue.id}`,
      kind: "uni",
      when: ue.startsAt,
      label: ue.title,
      sub: `${UE_KIND_LABEL[ue.kind]} · ${fmtTime(ue.startsAt)}`,
      color: UE_KIND_TINT[ue.kind],
      icon: UE_KIND_ICON[ue.kind],
    });
  }
  items.sort((a, b) => a.when - b.when);

  // university events upcoming this week (not just today)
  const ueThisWeek = myUE.filter((e) => e.startsAt >= todayStart.getTime() && e.startsAt < weekEnd);

  return (
    <Background>
      <Header
        title="Dashboard"
        subtitle="Your week at a glance"
        trailing={
          <Pressable
            onPress={() => router.push("/dashboard/add")}
            style={{
              paddingHorizontal: 12,
              height: 36,
              borderRadius: 18,
              backgroundColor: c.primary,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <Feather name="plus" size={16} color={c.primaryForeground} />
            <Text
              style={{
                color: c.primaryForeground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 13,
                marginLeft: 4,
              }}
            >
              Add
            </Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <StatCard label="Open tasks" value={stats.open} color={c.primary} />
          <StatCard label="Completed" value={stats.done} color={c.success} />
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <StatCard label="Classes" value={stats.classes} color={c.accent} />
          <StatCard label="Exams" value={stats.exams} color={c.warning} />
        </View>

        <SectionHeader title="Up next today" />
        <GlassCard padding={14}>
          {items.length === 0 ? (
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                textAlign: "center",
                paddingVertical: 12,
              }}
            >
              Nothing scheduled today. Enjoy! 🌴
            </Text>
          ) : (
            items.map((it, i) => (
              <View
                key={it.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 10,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: c.border,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: it.color,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Feather name={it.icon} size={16} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                    {it.label}
                  </Text>
                  <Text style={{ color: c.mutedForeground, fontSize: 12, marginTop: 2 }}>{it.sub}</Text>
                </View>
                {it.kind === "class" ? (
                  <Pressable onPress={() => removeClass(it.id.replace(/^cls-/, ""))} hitSlop={8}>
                    <Feather name="trash-2" size={16} color={c.mutedForeground} />
                  </Pressable>
                ) : null}
              </View>
            ))
          )}
        </GlassCard>

        <SectionHeader
          title="University calendar"
          action="Add"
          onAction={() => router.push("/dashboard/calendar")}
        />
        <GlassCard padding={14}>
          {ueThisWeek.length === 0 && myUE.length === 0 ? (
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_400Regular",
                textAlign: "center",
                paddingVertical: 12,
              }}
            >
              No upcoming university events. Tap “Add” to add one.
            </Text>
          ) : (
            (ueThisWeek.length ? ueThisWeek : myUE.slice(0, 4)).map((ue, i) => (
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
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: UE_KIND_TINT[ue.kind],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Feather name={UE_KIND_ICON[ue.kind]} size={16} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                    {ue.title}
                  </Text>
                  <Text style={{ color: c.mutedForeground, fontSize: 12, marginTop: 2 }}>
                    {UE_KIND_LABEL[ue.kind]} · {fmtDate(ue.startsAt)}
                    {ue.endsAt ? ` → ${fmtDate(ue.endsAt)}` : ""}
                  </Text>
                </View>
                <Pressable onPress={() => removeUniversityEvent(ue.id)} hitSlop={8}>
                  <Feather name="x" size={18} color={c.mutedForeground} />
                </Pressable>
              </View>
            ))
          )}
        </GlassCard>

        <SectionHeader title="This week" />
        <GlassCard padding={14}>
          {DAYS.map((d) => {
            const dayClasses = myClasses
              .filter((cl) => cl.dayOfWeek === d)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            const dayUE = myUE.filter((e) => {
              const dt = new Date(e.startsAt);
              return dt.getDay() === d && e.startsAt >= todayStart.getTime() && e.startsAt < weekEnd;
            });
            return (
              <View
                key={d}
                style={{
                  paddingVertical: 8,
                  borderTopWidth: d === DAYS[0] ? 0 : 1,
                  borderTopColor: c.border,
                }}
              >
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_700Bold",
                    fontSize: 11,
                    marginBottom: 4,
                    letterSpacing: 0.5,
                  }}
                >
                  {dayName(d).toUpperCase()}
                </Text>
                {dayClasses.length === 0 && dayUE.length === 0 ? (
                  <Text style={{ color: c.mutedForeground, fontSize: 13 }}>—</Text>
                ) : (
                  <>
                    {dayClasses.map((cl) => (
                      <Text key={cl.id} style={{ color: c.foreground, fontSize: 13, marginVertical: 1 }}>
                        <Text style={{ color: cl.color, fontFamily: "Inter_700Bold" }}>● </Text>
                        {cl.startTime} {cl.code} ({cl.location})
                      </Text>
                    ))}
                    {dayUE.map((ue) => (
                      <Text key={ue.id} style={{ color: c.foreground, fontSize: 13, marginVertical: 1 }}>
                        <Text style={{ color: UE_KIND_TINT[ue.kind], fontFamily: "Inter_700Bold" }}>★ </Text>
                        {ue.title}
                      </Text>
                    ))}
                  </>
                )}
              </View>
            );
          })}
        </GlassCard>

        <SectionHeader
          title="Assignments"
          action="Add"
          onAction={() => router.push({ pathname: "/dashboard/add", params: { kind: "assignment" } })}
        />
        <GlassCard padding={14}>
          {upcomingDue.length === 0 ? (
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_400Regular",
                textAlign: "center",
                paddingVertical: 12,
              }}
            >
              All caught up. ✨
            </Text>
          ) : (
            upcomingDue.map((a, i) => {
              const overdue = a.dueAt < Date.now();
              const tone = overdue ? c.destructive : a.priority === "high" ? c.warning : c.mutedForeground;
              return (
                <View
                  key={a.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 10,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: c.border,
                  }}
                >
                  <Pressable onPress={() => toggleAssignment(a.id)} hitSlop={10} style={{ marginRight: 10 }}>
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        borderWidth: 2,
                        borderColor: a.done ? c.success : c.border,
                        backgroundColor: a.done ? c.success : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {a.done ? <Feather name="check" size={12} color="#fff" /> : null}
                    </View>
                  </Pressable>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: c.foreground,
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        textDecorationLine: a.done ? "line-through" : "none",
                      }}
                    >
                      {a.title}
                    </Text>
                    <Text style={{ color: tone, fontSize: 12, marginTop: 2 }}>
                      Due {fmtDateTime(a.dueAt)} · {untilLabel(a.dueAt)}
                    </Text>
                  </View>
                  <Pressable onPress={() => removeAssignment(a.id)} hitSlop={8}>
                    <Feather name="x" size={18} color={c.mutedForeground} />
                  </Pressable>
                </View>
              );
            })
          )}
        </GlassCard>

        <SectionHeader
          title="Exams"
          action="Add"
          onAction={() => router.push({ pathname: "/dashboard/add", params: { kind: "exam" } })}
        />
        <GlassCard padding={14}>
          {myExams.length === 0 ? (
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_400Regular",
                textAlign: "center",
                paddingVertical: 12,
              }}
            >
              No exams logged yet.
            </Text>
          ) : (
            myExams.map((e, i) => (
              <View
                key={e.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 10,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: c.border,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: c.warning,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  <Feather name="edit" size={18} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.foreground, fontFamily: "Inter_600SemiBold" }}>{e.title}</Text>
                  <Text style={{ color: c.mutedForeground, fontSize: 12, marginTop: 2 }}>
                    {fmtDate(e.startsAt)} {fmtTime(e.startsAt)} · {e.location || "TBD"}
                  </Text>
                </View>
                <Pressable onPress={() => removeExam(e.id)} hitSlop={8}>
                  <Feather name="x" size={18} color={c.mutedForeground} />
                </Pressable>
              </View>
            ))
          )}
        </GlassCard>

        <View style={{ marginTop: 24 }}>
          <GlassButton
            title="Open RabChat AI"
            full
            icon={<Feather name="zap" size={16} color="#fff" />}
            onPress={() => router.push("/ai-assistant")}
          />
        </View>
      </ScrollView>
    </Background>
  );
}

const UE_KIND_LABEL: Record<keyof typeof UE_KIND_ICON, string> = {
  semester: "Semester",
  holiday: "Holiday",
  midterm: "Midterm",
  finals: "Finals",
  deadline: "Deadline",
  custom: "Event",
};

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const c = useColors();
  return (
    <GlassCard padding={14} style={{ flex: 1 }}>
      <Text style={{ color, fontFamily: "Inter_700Bold", fontSize: 24 }}>{value}</Text>
      <Text style={{ color: c.mutedForeground, fontSize: 12, fontFamily: "Inter_500Medium" }}>{label}</Text>
    </GlassCard>
  );
}
