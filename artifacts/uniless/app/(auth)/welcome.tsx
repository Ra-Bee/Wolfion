import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Background, GlassButton, GlassCard } from "@/components/glass";
import { useColors } from "@/hooks/useColors";

const HIGHLIGHTS: { icon: keyof typeof Feather.glyphMap; title: string; body: string }[] = [
  { icon: "users", title: "A real campus feed", body: "Posts, stories and study buddies — only people from your campus." },
  { icon: "calendar", title: "Smart academic dashboard", body: "Track classes, assignments and exam countdowns in one place." },
  { icon: "message-circle", title: "Built-in messaging", body: "Direct messages and group chats for projects, clubs and friends." },
  { icon: "zap", title: "Skill exchange", body: "Trade what you're good at for what you want to learn." },
];

export default function Welcome() {
  const c = useColors();
  return (
    <Background>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 80, paddingBottom: 40 }}>
        <View style={styles.brand}>
          <LinearGradient
            colors={[c.primary, c.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 36 }}>U</Text>
          </LinearGradient>
          <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 38, marginTop: 18 }}>
            UniRab
          </Text>
          <Text
            style={{
              color: c.mutedForeground,
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              textAlign: "center",
              marginTop: 8,
              maxWidth: 320,
            }}
          >
            The social productivity app for university students. Less doom-scrolling, more campus life.
          </Text>
        </View>

        <View style={{ marginTop: 32, gap: 12 }}>
          {HIGHLIGHTS.map((h) => (
            <GlassCard key={h.title}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: c.secondary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Feather name={h.icon} size={20} color={c.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.foreground, fontFamily: "Inter_600SemiBold", fontSize: 15 }}>
                    {h.title}
                  </Text>
                  <Text
                    style={{
                      color: c.mutedForeground,
                      fontFamily: "Inter_400Regular",
                      fontSize: 13,
                      marginTop: 2,
                      lineHeight: 18,
                    }}
                  >
                    {h.body}
                  </Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>

        <View style={{ marginTop: 28, gap: 10 }}>
          <GlassButton title="Create your account" full onPress={() => router.push("/(auth)/signup")} />
          <GlassButton
            title="I already have an account"
            variant="ghost"
            full
            onPress={() => router.push("/(auth)/login")}
          />
        </View>

        <Text
          style={{
            textAlign: "center",
            color: c.mutedForeground,
            fontSize: 11,
            marginTop: 18,
            fontFamily: "Inter_400Regular",
          }}
        >
          Demo build · all data stays on your device
        </Text>
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: "center" },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
