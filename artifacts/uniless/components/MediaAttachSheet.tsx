import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert, Modal, Pressable, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { MessageAttachment, MessageAttachmentKind } from "@/lib/types";

type IconName = keyof typeof Feather.glyphMap;

interface Option {
  kind: MessageAttachmentKind;
  label: string;
  icon: IconName;
}

const OPTIONS: Option[] = [
  { kind: "photo", label: "Photo", icon: "image" },
  { kind: "video", label: "Video", icon: "video" },
  { kind: "audio", label: "Audio", icon: "mic" },
  { kind: "pdf", label: "PDF", icon: "file-text" },
  { kind: "file", label: "File", icon: "paperclip" },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onPicked?: (attachment: MessageAttachment) => void;
  onChooseKind?: (kind: MessageAttachmentKind) => void;
  enabled?: MessageAttachmentKind[];
}

export async function pickAttachment(kind: MessageAttachmentKind): Promise<MessageAttachment | null> {
  if (kind === "photo" || kind === "video") {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo library access to attach media.");
      return null;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: kind === "photo" ? ["images"] : ["videos"],
      quality: 0.8,
    });
    if (res.canceled || !res.assets[0]) return null;
    const a = res.assets[0];
    return {
      kind,
      uri: a.uri,
      name: a.fileName ?? undefined,
      mimeType: a.mimeType ?? undefined,
      size: a.fileSize ?? undefined,
    };
  }
  const type =
    kind === "audio" ? "audio/*" : kind === "pdf" ? "application/pdf" : "*/*";
  const res = await DocumentPicker.getDocumentAsync({
    type,
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (res.canceled || !res.assets?.[0]) return null;
  const a = res.assets[0];
  return {
    kind,
    uri: a.uri,
    name: a.name,
    mimeType: a.mimeType ?? undefined,
    size: a.size ?? undefined,
  };
}

export function MediaAttachSheet({ visible, onClose, onPicked, onChooseKind, enabled }: Props) {
  const c = useColors();
  const opts = enabled ? OPTIONS.filter((o) => enabled.includes(o.kind)) : OPTIONS;

  const choose = async (kind: MessageAttachmentKind) => {
    onClose();
    if (onChooseKind) {
      onChooseKind(kind);
      return;
    }
    try {
      const att = await pickAttachment(kind);
      if (att && onPicked) onPicked(att);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not attach that file.";
      Alert.alert("Attach failed", msg);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: c.cardSolid,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            paddingTop: 12,
            paddingBottom: 28,
            paddingHorizontal: 16,
          }}
        >
          <View
            style={{
              alignSelf: "center",
              width: 38,
              height: 4,
              borderRadius: 2,
              backgroundColor: c.border,
              marginBottom: 14,
            }}
          />
          <Text
            style={{
              color: c.foreground,
              fontFamily: "Inter_700Bold",
              fontSize: 16,
              marginBottom: 12,
            }}
          >
            Attach
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 }}>
            {opts.map((o) => (
              <Pressable
                key={o.kind}
                onPress={() => choose(o.kind)}
                style={({ pressed }) => ({
                  width: "33.333%",
                  paddingHorizontal: 6,
                  paddingVertical: 6,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <View
                  style={{
                    backgroundColor: c.secondary,
                    borderRadius: 16,
                    paddingVertical: 18,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: c.primary,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Feather name={o.icon} size={20} color={c.primaryForeground} />
                  </View>
                  <Text
                    style={{
                      color: c.foreground,
                      fontFamily: "Inter_700Bold",
                      fontSize: 13,
                    }}
                  >
                    {o.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function attachmentIcon(kind: MessageAttachmentKind): IconName {
  switch (kind) {
    case "photo":
      return "image";
    case "video":
      return "video";
    case "audio":
      return "mic";
    case "pdf":
      return "file-text";
    default:
      return "paperclip";
  }
}

export function attachmentLabel(att: MessageAttachment): string {
  if (att.name) return att.name;
  switch (att.kind) {
    case "photo":
      return "Photo";
    case "video":
      return "Video";
    case "audio":
      return "Audio clip";
    case "pdf":
      return "PDF document";
    default:
      return "File";
  }
}
