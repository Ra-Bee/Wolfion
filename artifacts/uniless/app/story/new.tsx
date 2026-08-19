import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Background, GlassButton, GlassCard, GlassInput, Header } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

export default function NewStory() {
  const c = useColors();
  const { user } = useAuth();
  const { createStory } = useAppData();
  const [text, setText] = useState("");
  const [bg, setBg] = useState(COLORS[0]!);
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: false,
    });
    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
    }
  };

  const submit = async () => {
    if (!user || (!text.trim() && !imageUri)) return;
    await createStory({ authorId: user.id, text: text.trim(), bgColor: bg, imageUri });
    router.back();
  };

  return (
    <Background>
      <Header
        title="New story"
        back
        trailing={
          <GlassButton title="Share" small onPress={submit} disabled={!text.trim() && !imageUri} />
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        <View
          style={{
            height: 360,
            borderRadius: c.radius,
            backgroundColor: bg,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            overflow: "hidden",
          }}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
              contentFit="cover"
            />
          ) : null}
          {imageUri ? (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.25)",
              }}
            />
          ) : null}
          <Text
            style={{
              color: "#fff",
              fontFamily: "Inter_700Bold",
              fontSize: 24,
              textAlign: "center",
              lineHeight: 32,
              textShadowColor: "rgba(0,0,0,0.4)",
              textShadowRadius: 6,
            }}
          >
            {text.trim() || (imageUri ? "" : "Your story preview…")}
          </Text>
        </View>

        <GlassCard padding={16} style={{ marginTop: 16 }}>
          <GlassInput
            label="Caption"
            placeholder="Type something inspiring…"
            value={text}
            onChangeText={setText}
            multiline
          />

          <Pressable
            onPress={pickImage}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 8,
              marginBottom: 10,
            }}
          >
            <Feather name="image" size={16} color={c.primary} />
            <Text style={{ color: c.primary, fontFamily: "Inter_600SemiBold", marginLeft: 6 }}>
              {imageUri ? "Replace photo" : "Add a photo"}
            </Text>
            {imageUri ? (
              <Pressable onPress={() => setImageUri(undefined)} style={{ marginLeft: "auto" }}>
                <Text style={{ color: c.mutedForeground, fontSize: 12 }}>remove</Text>
              </Pressable>
            ) : null}
          </Pressable>

          <Text style={{ color: c.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13, marginBottom: 8 }}>
            Background
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {COLORS.map((col) => (
              <Pressable
                key={col}
                onPress={() => setBg(col)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: col,
                  borderWidth: bg === col ? 3 : 0,
                  borderColor: c.foreground,
                }}
              />
            ))}
          </View>
          <Text style={{ color: c.mutedForeground, fontSize: 12, marginTop: 16 }}>
            Stories disappear after 24 hours.
          </Text>
        </GlassCard>
      </ScrollView>
    </Background>
  );
}
