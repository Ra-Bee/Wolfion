import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";

import { Background, GlassButton, GlassCard, Header } from "@/components/glass";
import { useColors } from "@/hooks/useColors";
import { aiSummarizePdfAsync, type PdfSummaryResult } from "@/lib/ai";
import { ApiError } from "@/lib/api";

const MAX_PDF_BYTES = 15 * 1024 * 1024;

export default function AISummarizePdf() {
  const c = useColors();
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [filename, setFilename] = useState("");
  const [result, setResult] = useState<PdfSummaryResult | null>(null);

  const pickAndSummarize = async () => {
    setBusy(true);
    setStatusText("Picking PDF…");
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (picked.canceled) {
        setBusy(false);
        setStatusText("");
        return;
      }
      const asset = picked.assets?.[0];
      if (!asset?.uri) {
        Alert.alert("No file", "No file was returned from the picker.");
        return;
      }
      setStatusText("Reading PDF…");
      const file = new File(asset.uri);
      const size = file.exists ? file.size ?? 0 : 0;
      if (size && size > MAX_PDF_BYTES) {
        Alert.alert("PDF too large", "Please pick a PDF under 15 MB.");
        return;
      }
      const base64 = await file.base64();
      const name = asset.name || "document.pdf";
      setFilename(name);
      setStatusText("Sending to AI…");
      const out = await aiSummarizePdfAsync(base64, name);
      setResult(out);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Could not summarize that PDF.";
      Alert.alert("Summarize failed", msg);
    } finally {
      setBusy(false);
      setStatusText("");
    }
  };

  const reset = () => {
    setResult(null);
    setFilename("");
  };

  return (
    <Background>
      <Header title="Summarize PDF" subtitle="Upload a lecture PDF and get the gist" back />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <GlassCard padding={16}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
            <Feather name="file" size={16} color={c.primary} />
            <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 16, marginLeft: 6 }}>
              Pick a PDF
            </Text>
          </View>
          <Text style={{ color: c.mutedForeground, fontSize: 13, marginBottom: 12 }}>
            Text-based PDFs only — scanned images won't have selectable text. Up to 15 MB.
          </Text>
          <GlassButton
            title={result ? "Pick another PDF" : "Choose PDF file"}
            variant="primary"
            onPress={pickAndSummarize}
            disabled={busy}
          />
          {filename ? (
            <Text style={{ color: c.mutedForeground, fontSize: 12, marginTop: 8 }} numberOfLines={1}>
              {filename}
            </Text>
          ) : null}
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

        {result ? (
          <>
            <View style={{ height: 12 }} />
            <GlassCard padding={16}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Feather name="zap" size={16} color={c.primary} />
                <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 16, marginLeft: 6 }}>
                  Summary
                </Text>
              </View>
              <Text style={{ color: c.mutedForeground, fontSize: 12, marginBottom: 8 }}>
                {result.pageCount} page{result.pageCount === 1 ? "" : "s"} ·{" "}
                {result.characterCount.toLocaleString()} characters extracted
              </Text>
              <Text style={{ color: c.foreground, fontSize: 14, lineHeight: 21 }} selectable>
                {result.summary}
              </Text>
            </GlassCard>
          </>
        ) : null}

        <View style={{ height: 16 }} />
        {result ? (
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <GlassButton title="Clear" variant="ghost" onPress={reset} disabled={busy} />
            </View>
            <View style={{ flex: 1 }}>
              <GlassButton title="Back" variant="ghost" onPress={() => router.back()} disabled={busy} />
            </View>
          </View>
        ) : (
          <GlassButton title="Back to assistant" variant="ghost" onPress={() => router.back()} />
        )}
      </ScrollView>
    </Background>
  );
}
