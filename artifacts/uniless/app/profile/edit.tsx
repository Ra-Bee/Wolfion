import { router } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";

import { Background, GlassButton, GlassCard, GlassInput, Header, TagChip } from "@/components/glass";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import type { FieldPrivacy, Privacy } from "@/lib/types";
import { DEFAULT_FIELD_PRIVACY } from "@/lib/types";

const FIELDS: { key: keyof FieldPrivacy; label: string }[] = [
  { key: "bio", label: "Bio" },
  { key: "major", label: "Major" },
  { key: "year", label: "Year" },
  { key: "interests", label: "Interests" },
  { key: "skills", label: "Skills" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "cv", label: "Digital CV" },
];

export default function EditProfile() {
  const c = useColors();
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl ?? "");
  const [cv, setCv] = useState(user?.cv ?? "");
  const [university, setUniversity] = useState(user?.university ?? "");
  const [major, setMajor] = useState(user?.major ?? "");
  const [year, setYear] = useState(user?.year ?? "");
  const [privacy, setPrivacy] = useState<Privacy>(user?.privacy ?? "public");
  const [fieldPrivacy, setFieldPrivacy] = useState<FieldPrivacy>(
    user?.fieldPrivacy ?? DEFAULT_FIELD_PRIVACY,
  );
  const [interests, setInterests] = useState<string[]>(user?.interests ?? []);
  const [interestInput, setInterestInput] = useState("");
  const [skillsOffered, setSkillsOffered] = useState<string[]>(user?.skillsOffered ?? []);
  const [offerInput, setOfferInput] = useState("");
  const [skillsWanted, setSkillsWanted] = useState<string[]>(user?.skillsWanted ?? []);
  const [wantInput, setWantInput] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const addTo = (input: string, list: string[], setList: (v: string[]) => void, clear: () => void) => {
    const t = input.trim();
    if (!t || list.includes(t)) return;
    setList([...list, t]);
    clear();
  };

  const submit = async () => {
    setSaving(true);
    await updateProfile({
      displayName: displayName.trim() || user.displayName,
      bio: bio.trim(),
      linkedinUrl: linkedinUrl.trim() || undefined,
      cv: cv.trim() || undefined,
      university: university.trim(),
      major: major.trim(),
      year,
      privacy,
      fieldPrivacy,
      interests,
      skillsOffered,
      skillsWanted,
    });
    setSaving(false);
    router.back();
  };

  return (
    <Background>
      <Header
        title="Edit profile"
        back
        trailing={<GlassButton title="Save" small onPress={submit} loading={saving} />}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
          <GlassCard padding={16}>
            <GlassInput label="Display name" value={displayName} onChangeText={setDisplayName} />
            <GlassInput
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell others about you"
              multiline
            />
            <GlassInput label="University" value={university} onChangeText={setUniversity} />
            <GlassInput label="Major" value={major} onChangeText={setMajor} />

            <Text style={{ color: c.mutedForeground, fontSize: 13, marginBottom: 6, fontFamily: "Inter_500Medium" }}>
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
                fontSize: 13,
                marginBottom: 6,
                marginTop: 4,
                fontFamily: "Inter_500Medium",
              }}
            >
              Overall profile privacy
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {(["public", "friends", "private"] as Privacy[]).map((p) => (
                <TagChip key={p} label={p} active={privacy === p} onPress={() => setPrivacy(p)} />
              ))}
            </View>
          </GlassCard>

          <GlassCard padding={16} style={{ marginTop: 12 }}>
            <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", marginBottom: 4 }}>
              Professional
            </Text>
            <Text style={{ color: c.mutedForeground, fontSize: 12, marginBottom: 10 }}>
              Build your digital CV — let recruiters and study partners see what you bring.
            </Text>
            <GlassInput
              label="LinkedIn URL"
              value={linkedinUrl}
              onChangeText={setLinkedinUrl}
              placeholder="https://www.linkedin.com/in/yourname"
              autoCapitalize="none"
              keyboardType="url"
            />
            <GlassInput
              label="Digital CV"
              value={cv}
              onChangeText={setCv}
              placeholder="Experience, projects, awards…"
              multiline
            />
          </GlassCard>

          <GlassCard padding={16} style={{ marginTop: 12 }}>
            <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", marginBottom: 4 }}>
              Per-field visibility
            </Text>
            <Text style={{ color: c.mutedForeground, fontSize: 12, marginBottom: 12 }}>
              Choose who can see each section of your profile. Friends-only items only appear once they accept your request.
            </Text>
            {FIELDS.map((f) => (
              <View
                key={f.key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 8,
                  borderTopWidth: f.key === "bio" ? 0 : 1,
                  borderTopColor: c.border,
                }}
              >
                <Text style={{ color: c.foreground, fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 }}>
                  {f.label}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  {(["public", "friends", "private"] as Privacy[]).map((p) => (
                    <TagChip
                      key={p}
                      label={p}
                      active={fieldPrivacy[f.key] === p}
                      onPress={() => setFieldPrivacy({ ...fieldPrivacy, [f.key]: p })}
                    />
                  ))}
                </View>
              </View>
            ))}
          </GlassCard>

          <GlassCard padding={16} style={{ marginTop: 12 }}>
            <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", marginBottom: 8 }}>Interests</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {interests.map((i) => (
                <TagChip
                  key={i}
                  label={i}
                  active
                  onPress={() => setInterests(interests.filter((x) => x !== i))}
                />
              ))}
            </View>
            <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 6 }}>
              <View style={{ flex: 1 }}>
                <GlassInput
                  placeholder="add interest"
                  value={interestInput}
                  onChangeText={setInterestInput}
                  onSubmitEditing={() =>
                    addTo(interestInput, interests, setInterests, () => setInterestInput(""))
                  }
                />
              </View>
              <View style={{ marginLeft: 8 }}>
                <GlassButton
                  title="Add"
                  small
                  variant="secondary"
                  onPress={() => addTo(interestInput, interests, setInterests, () => setInterestInput(""))}
                />
              </View>
            </View>
          </GlassCard>

          <GlassCard padding={16} style={{ marginTop: 12 }}>
            <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", marginBottom: 8 }}>
              Skills you can offer
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {skillsOffered.map((i) => (
                <TagChip
                  key={i}
                  label={i}
                  tint={c.success}
                  onPress={() => setSkillsOffered(skillsOffered.filter((x) => x !== i))}
                />
              ))}
            </View>
            <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 6 }}>
              <View style={{ flex: 1 }}>
                <GlassInput
                  placeholder="e.g. Python tutoring"
                  value={offerInput}
                  onChangeText={setOfferInput}
                  onSubmitEditing={() =>
                    addTo(offerInput, skillsOffered, setSkillsOffered, () => setOfferInput(""))
                  }
                />
              </View>
              <View style={{ marginLeft: 8 }}>
                <GlassButton
                  title="Add"
                  small
                  variant="secondary"
                  onPress={() => addTo(offerInput, skillsOffered, setSkillsOffered, () => setOfferInput(""))}
                />
              </View>
            </View>
          </GlassCard>

          <GlassCard padding={16} style={{ marginTop: 12 }}>
            <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", marginBottom: 8 }}>
              Skills you want to learn
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {skillsWanted.map((i) => (
                <TagChip
                  key={i}
                  label={i}
                  tint={c.warning}
                  onPress={() => setSkillsWanted(skillsWanted.filter((x) => x !== i))}
                />
              ))}
            </View>
            <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 6 }}>
              <View style={{ flex: 1 }}>
                <GlassInput
                  placeholder="e.g. Spanish basics"
                  value={wantInput}
                  onChangeText={setWantInput}
                  onSubmitEditing={() =>
                    addTo(wantInput, skillsWanted, setSkillsWanted, () => setWantInput(""))
                  }
                />
              </View>
              <View style={{ marginLeft: 8 }}>
                <GlassButton
                  title="Add"
                  small
                  variant="secondary"
                  onPress={() => addTo(wantInput, skillsWanted, setSkillsWanted, () => setWantInput(""))}
                />
              </View>
            </View>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
}
