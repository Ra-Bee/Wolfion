import { router } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { Background, GlassButton, GlassCard, GlassInput, Header } from "@/components/glass";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { SEED_USERS } from "@/lib/seed";

export default function Login() {
  const c = useColors();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(null);
    setLoading(true);
    const r = await login(email, password);
    setLoading(false);
    if (!r.ok) setErr(r.error ?? "Login failed");
    else router.replace("/(tabs)");
  };

  const useDemo = async (e: string) => {
    setLoading(true);
    setErr(null);
    const r = await login(e, "demo");
    setLoading(false);
    if (!r.ok) setErr(r.error ?? "Login failed");
    else router.replace("/(tabs)");
  };

  return (
    <Background>
      <Header title="Welcome back" back />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <GlassCard padding={20}>
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
              placeholder="••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={err}
            />
            <GlassButton title="Log in" full loading={loading} onPress={submit} />
          </GlassCard>

          <Text
            style={{
              color: c.mutedForeground,
              fontSize: 13,
              marginTop: 24,
              marginBottom: 8,
              textAlign: "center",
              fontFamily: "Inter_500Medium",
            }}
          >
            Or try a demo account
          </Text>
          <GlassCard padding={12}>
            {SEED_USERS.map((u, i) => (
              <Pressable
                key={u.id}
                onPress={() => useDemo(u.email)}
                style={({ pressed }) => ({
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: c.border,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text style={{ color: c.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                  {u.displayName}
                </Text>
                <Text style={{ color: c.mutedForeground, fontSize: 12, marginTop: 2 }}>
                  {u.email} · {u.major}, {u.year}
                </Text>
              </Pressable>
            ))}
          </GlassCard>

          <View style={{ marginTop: 20, alignItems: "center" }}>
            <Pressable onPress={() => router.replace("/(auth)/signup")}>
              <Text style={{ color: c.primary, fontFamily: "Inter_600SemiBold" }}>
                Don't have an account? Sign up
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
}
