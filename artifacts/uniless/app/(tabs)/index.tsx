import React from "react";

import { SideFlow, type SideFlowItem } from "@/components/SideFlow";
import { AIAssistantContent } from "@/app/ai-assistant";
import DashboardScreen from "@/components/screens/DashboardScreen";
import FeedScreen from "@/components/screens/FeedScreen";
import MessagesScreen from "@/components/screens/MessagesScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";

const ITEMS: SideFlowItem[] = [
  { key: "feed", title: "Home", icon: "home", render: () => <FeedScreen /> },
  { key: "dashboard", title: "Dashboard", icon: "grid", render: () => <DashboardScreen /> },
  { key: "rabchat", title: "RabChat AI", icon: "zap", render: () => <AIAssistantContent /> },
  { key: "messages", title: "Messages", icon: "message-circle", render: () => <MessagesScreen /> },
  { key: "profile", title: "Profile", icon: "user", render: () => <ProfileScreen /> },
];

export default function SideFlowHome() {
  return <SideFlow items={ITEMS} initialIndex={0} />;
}
