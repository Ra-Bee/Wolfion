import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { Background, GlassButton, GlassCard, GlassInput, Header, TagChip } from "@/components/glass";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { POST_CATEGORIES, POST_MAX_CHARS, type PostCategory, type Privacy } from "@/lib/types";

const CATEGORY_LABEL: Record<PostCategory, string> = {
  study: "Study",
  questions: "Questions",
  events: "Events",
  notes: "Notes",
};

export default function NewPost() {
  const c = useColors();
  const { user } = useAuth();
  const { createPost } = useAppData();
  const [text, setText] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<Privacy>("public");
  const [category, setCategory] = useState<PostCategory>("study");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const remaining = POST_MAX_CHARS - text.length;
  const overLimit = remaining < 0;
  const counterTone =
    remaining < 0 ? c.destructive : remaining < 30 ? c.warning : c.mutedForeground;

  const addTag = () => {
    const t = tagInput.trim().replace(/^#+/, "").toLowerCase();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput("");
  };

  const onChangeText = (next: string) => {
    if (next.length > POST_MAX_CHARS) {
      setText(next.slice(0, POST_MAX_CHARS));
    } else {
      setText(next);
    }
  };

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 4,
    });
    if (!res.canceled) {
      const uris = res.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...uris].slice(0, 4));
    }
  };

  const submit = async () => {
    if (!user || (!text.trim() && images.length === 0) || overLimit) return;
    setSubmitting(true);
    await createPost({
      authorId: user.id,
      text: text.trim(),
      category,
      tags,
      privacy,
      images: images.length ? images : undefined,
    });
    router.back();
  };

  return (
    <Background>
      <Header
        title="New post"
        back
        trailing={
          <GlassButton
            title="Post"
            small
            onPress={submit}
            loading={submitting}
            disabled={(!text.trim() && images.length === 0) || overLimit}
          />
        }
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
          <GlassCard padding={16}>
            <GlassInput
              placeholder="What's on your mind, scholar?"
              multiline
              autoFocus
              value={text}
              onChangeText={onChangeText}
              maxLength={POST_MAX_CHARS}
            />
            <Text
              style={{
                color: counterTone,
                fontSize: 11,
                fontFamily: "Inter_600SemiBold",
                textAlign: "right",
                marginTop: -8,
                marginBottom: 8,
              }}
            >
              {remaining} / {POST_MAX_CHARS}
            </Text>

            {images.length ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 10 }}>
                {images.map((uri, i) => (
                  <View key={uri + i} style={{ marginRight: 8, marginBottom: 8 }}>
                    <Image
                      source={{ uri }}
                      style={{ width: 88, height: 88, borderRadius: 12, backgroundColor: c.secondary }}
                      contentFit="cover"
                    />
                    <Pressable
                      onPress={() => setImages(images.filter((_, idx) => idx !== i))}
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: c.foreground,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather name="x" size={12} color={c.background} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}

            <Pressable
              onPress={pickImages}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 8,
                marginBottom: 6,
              }}
            >
              <Feather name="image" size={16} color={c.primary} />
              <Text style={{ color: c.primary, fontFamily: "Inter_600SemiBold", marginLeft: 6 }}>
                {images.length ? `Add more (${images.length}/4)` : "Attach photos"}
              </Text>
            </Pressable>

            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                marginBottom: 6,
                marginTop: 8,
              }}
            >
              Category
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {POST_CATEGORIES.map((cat) => (
                <TagChip
                  key={cat}
                  label={CATEGORY_LABEL[cat]}
                  active={category === cat}
                  onPress={() => setCategory(cat)}
                />
              ))}
            </View>

            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                marginBottom: 6,
                marginTop: 12,
              }}
            >
              Tags
            </Text>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <GlassInput
                  placeholder="add a tag"
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                  returnKeyType="done"
                />
              </View>
              <View style={{ marginLeft: 8 }}>
                <GlassButton title="Add" small variant="secondary" onPress={addTag} />
              </View>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
              {tags.map((t) => (
                <TagChip
                  key={t}
                  label={`#${t}`}
                  active
                  onPress={() => setTags(tags.filter((x) => x !== t))}
                />
              ))}
            </View>

            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                marginBottom: 6,
                marginTop: 12,
              }}
            >
              Who can see this?
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {(["public", "friends", "private"] as Privacy[]).map((p) => (
                <TagChip key={p} label={p} active={privacy === p} onPress={() => setPrivacy(p)} />
              ))}
            </View>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
}
