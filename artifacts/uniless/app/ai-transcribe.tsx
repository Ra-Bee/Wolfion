import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";

import { Background, GlassButton, GlassCard, Header } from "@/components/glass";
import { useColors } from "@/hooks/useColors";
import { aiSummarizeTextAsync, aiTranscribeAsync } from "@/lib/ai";
import { ApiError } from "@/lib/api";

const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

function extFromName(name: string): string | undefined {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m?.[1];
}

export default function AITranscribe() {
  const c = useColors();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recState = useAudioRecorderState(recorder);
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [permGranted, setPermGranted] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const perm = await AudioModule.requestRecordingPermissionsAsync();
        setPermGranted(perm.granted);
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      } catch {
        setPermGranted(false);
      }
    })();
  }, []);

  const transcribeUri = async (uri: string, formatHint?: string) => {
    setBusy(true);
    setStatusText("Reading audio…");
    try {
      const file = new File(uri);
      const info = file.exists ? { size: file.size ?? 0 } : { size: 0 };
      if (info.size && info.size > MAX_AUDIO_BYTES) {
        Alert.alert("Audio too large", "Please pick a clip under 20 MB.");
        return;
      }
      const base64 = await file.base64();
      setStatusText("Sending to AI…");
      const text = await aiTranscribeAsync(base64, formatHint);
      setTranscript(text || "(no speech detected)");
      setSummary("");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Could not transcribe.";
      Alert.alert("Transcription failed", msg);
    } finally {
      setBusy(false);
      setStatusText("");
    }
  };

  const startRecording = async () => {
    if (!permGranted) {
      Alert.alert("Microphone needed", "Please allow microphone access to record audio.");
      return;
    }
    try {
      setTranscript("");
      setSummary("");
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (err) {
      Alert.alert("Recording failed", err instanceof Error ? err.message : "Unknown error");
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        Alert.alert("No audio", "Recording produced no file.");
        return;
      }
      await transcribeUri(uri, "m4a");
    } catch (err) {
      Alert.alert("Recording failed", err instanceof Error ? err.message : "Unknown error");
    }
  };

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      const hint = extFromName(asset.name ?? "");
      await transcribeUri(asset.uri, hint);
    } catch (err) {
      Alert.alert("Pick failed", err instanceof Error ? err.message : "Unknown error");
    }
  };

  const summarize = async () => {
    if (!transcript.trim()) return;
    setBusy(true);
    setStatusText("Summarizing transcript…");
    try {
      const out = await aiSummarizeTextAsync(transcript);
      setSummary(out);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Could not summarize.";
      Alert.alert("Summary failed", msg);
    } finally {
      setBusy(false);
      setStatusText("");
    }
  };

  const isRecording = recState.isRecording;
  const seconds = Math.floor((recState.durationMillis ?? 0) / 1000);

  return (
    <Background>
      <Header title="Audio to text" subtitle="Record or upload — get a transcript and summary" back />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <GlassCard padding={16}>
          <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 4 }}>
            Record voice
          </Text>
          <Text style={{ color: c.mutedForeground, fontSize: 13, marginBottom: 12 }}>
            Tap to record a lecture clip, voice note, or question — up to 20 MB.
          </Text>

          {isRecording ? (
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: c.destructive,
                  marginRight: 8,
                }}
              />
              <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold" }}>
                Recording… {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                {String(seconds % 60).padStart(2, "0")}
              </Text>
            </View>
          ) : null}

          <View style={{ flexDirection: "row", gap: 10 }}>
            {isRecording ? (
              <View style={{ flex: 1 }}>
                <GlassButton title="Stop & transcribe" variant="primary" onPress={stopRecording} disabled={busy} />
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <GlassButton
                  title={permGranted === false ? "Mic blocked" : "Start recording"}
                  variant="primary"
                  onPress={startRecording}
                  disabled={busy || permGranted === false}
                />
              </View>
            )}
          </View>
        </GlassCard>

        <View style={{ height: 12 }} />

        <GlassCard padding={16}>
          <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 4 }}>
            Upload audio file
          </Text>
          <Text style={{ color: c.mutedForeground, fontSize: 13, marginBottom: 12 }}>
            mp3, wav, m4a, webm, ogg — under 20 MB.
          </Text>
          <GlassButton title="Pick audio file" variant="ghost" onPress={pickAudio} disabled={busy || isRecording} />
        </GlassCard>

        {busy ? (
          <View
            style={{
              marginTop: 16,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: c.cardSolid,
              borderRadius: 14,
            }}
          >
            <ActivityIndicator size="small" color={c.primary} style={{ marginRight: 10 }} />
            <Text style={{ color: c.foreground, fontSize: 14 }}>{statusText || "Working…"}</Text>
          </View>
        ) : null}

        {transcript ? (
          <>
            <View style={{ height: 12 }} />
            <GlassCard padding={16}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Feather name="file-text" size={16} color={c.primary} />
                <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 16, marginLeft: 6 }}>
                  Transcript
                </Text>
              </View>
              <Text style={{ color: c.foreground, fontSize: 14, lineHeight: 21, marginBottom: 12 }} selectable>
                {transcript}
              </Text>
              <GlassButton
                title={summary ? "Re-summarize transcript" : "Summarize transcript"}
                small
                variant="primary"
                onPress={summarize}
                disabled={busy}
              />
            </GlassCard>
          </>
        ) : null}

        {summary ? (
          <>
            <View style={{ height: 12 }} />
            <GlassCard padding={16}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Feather name="zap" size={16} color={c.primary} />
                <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 16, marginLeft: 6 }}>
                  Summary
                </Text>
              </View>
              <Text style={{ color: c.foreground, fontSize: 14, lineHeight: 21 }} selectable>
                {summary}
              </Text>
            </GlassCard>
          </>
        ) : null}

        <View style={{ height: 16 }} />
        <GlassButton title="Back to assistant" variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </Background>
  );
}
