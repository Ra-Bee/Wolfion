import { router } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { Background, GlassButton, GlassCard, GlassInput, Header, TagChip } from "@/components/glass";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import type { Privacy } from "@/lib/types";

export default function Signup() {
  const c = useColors();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("Sophomore");
  const [privacy, setPrivacy] = useState<Privacy>("public");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(null);
    setLoading(true);
    const r = await signup({
      email,
      password,
      displayName,
      username,
      university,
      major,
      year,
      privacy,
    });
    setLoading(false);
    if (!r.ok) setErr(r.error ?? "Signup failed");
    else router.replace("/(tabs)");
  };

  return (
    <Background>
      <Header title="Create account" back />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <GlassCard padding={20}>
            <GlassInput
              label="Display name"
              placeholder="Maya Patel"
              value={displayName}
              onChangeText={setDisplayName}
            />
            <GlassInput
              label="Username"
              placeholder="mayap"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
            <GlassInput
              label="Email"
              placeholder="you@university.edu"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <GlassInput
              label="Password"
              placeholder="6+ characters"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <GlassInput
              label="University"
              placeholder="e.g. Stanford University"
              value={university}
              onChangeText={setUniversity}
            />
            <GlassInput
              label="Major"
              placeholder="e.g. Computer Science"
              value={major}
              onChangeText={setMajor}
            />

            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_500Medium",
                marginBottom: 6,
                fontSize: 13,
              }}
            >
              Year
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
              {["First-year", "Sophomore", "Junior", "Senior", "Graduate"].map((y) => (
                <TagChip key={y} label={y} active={year === y} onPress={() => setYear(y)} />
              ))}
            </View>

            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_500Medium",
                marginBottom: 6,
                fontSize: 13,
                marginTop: 4,
              }}
            >
              Profile privacy
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
              {(["public", "friends", "private"] as Privacy[]).map((p) => (
                <TagChip key={p} label={p} active={privacy === p} onPress={() => setPrivacy(p)} />
              ))}
            </View>

            {err ? (
              <Text style={{ color: c.destructive, fontSize: 13, marginBottom: 8 }}>{err}</Text>
            ) : null}

            <GlassButton title="Create account" full loading={loading} onPress={submit} />
          </GlassCard>

          <View style={{ marginTop: 20, alignItems: "center" }}>
            <Pressable onPress={() => router.replace("/(auth)/login")}>
              <Text style={{ color: c.primary, fontFamily: "Inter_600SemiBold" }}>
                Already have an account? Log in
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
}
