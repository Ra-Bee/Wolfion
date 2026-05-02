import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";

import { Background, GlassButton, GlassCard, Header, ListRow, SectionHeader, TagChip } from "@/components/glass";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useColors } from "@/hooks/useColors";
import type { ThemePref } from "@/lib/types";

export default function Settings() {
  const c = useColors();
  const { user, logout, updateProfile } = useAuth();
  const { pref, setPref } = useTheme();

  if (!user) return null;

  return (
    <Background>
      <Header title="Settings" back />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}>
        <SectionHeader title="Appearance" />
        <GlassCard padding={14}>
          <Text style={{ color: c.mutedForeground, fontSize: 13, marginBottom: 8, fontFamily: "Inter_500Medium" }}>
            Theme
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {(["system", "light", "dark"] as ThemePref[]).map((p) => (
              <TagChip key={p} label={p} active={pref === p} onPress={() => setPref(p)} />
            ))}
          </View>
        </GlassCard>

        <SectionHeader title="Privacy" />
        <GlassCard padding={4}>
          <ListRow
            leading={<Feather name="globe" size={18} color={user.privacy === "public" ? c.primary : c.mutedForeground} />}
            title="Public profile"
            subtitle="Anyone on RabChat can see your profile."
            trailing={user.privacy === "public" ? <Feather name="check" size={16} color={c.primary} /> : null}
            onPress={() => updateProfile({ privacy: "public" })}
          />
          <View style={{ height: 1, backgroundColor: c.border }} />
          <ListRow
            leading={<Feather name="users" size={18} color={user.privacy === "friends" ? c.primary : c.mutedForeground} />}
            title="Friends only"
            subtitle="Only your friends can see posts and details."
            trailing={user.privacy === "friends" ? <Feather name="check" size={16} color={c.primary} /> : null}
            onPress={() => updateProfile({ privacy: "friends" })}
          />
          <View style={{ height: 1, backgroundColor: c.border }} />
          <ListRow
            leading={<Feather name="lock" size={18} color={user.privacy === "private" ? c.primary : c.mutedForeground} />}
            title="Private"
            subtitle="Hidden from search; only you can see your activity."
            trailing={user.privacy === "private" ? <Feather name="check" size={16} color={c.primary} /> : null}
            onPress={() => updateProfile({ privacy: "private" })}
          />
        </GlassCard>

        <SectionHeader title="Account" />
        <GlassCard padding={14}>
          <ListRow title="Display name" subtitle={user.displayName} chevron onPress={() => router.push("/profile/edit")} />
          <View style={{ height: 1, backgroundColor: c.border }} />
          <ListRow title="Email" subtitle={user.email} />
          <View style={{ height: 1, backgroundColor: c.border }} />
          <ListRow title="University" subtitle={user.university} chevron onPress={() => router.push("/profile/edit")} />
        </GlassCard>

        <SectionHeader title="About" />
        <GlassCard padding={14}>
          <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 16 }}>RabChat</Text>
          <Text style={{ color: c.mutedForeground, fontSize: 13, marginTop: 4, lineHeight: 19 }}>
            A social productivity app for university students. Posts, study rooms, an academic dashboard, and a built-in
            study assistant — all on your device.
          </Text>
          <Text style={{ color: c.mutedForeground, fontSize: 11, marginTop: 10, fontFamily: "Inter_500Medium" }}>
            Demo build · v1.0.0
          </Text>
        </GlassCard>

        <View style={{ marginTop: 24 }}>
          <GlassButton
            title="Log out"
            variant="destructive"
            full
            onPress={async () => {
              await logout();
              router.replace("/(auth)/welcome");
            }}
          />
        </View>
      </ScrollView>
    </Background>
  );
}
