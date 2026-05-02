import React from "react";

import { SideFlow, type SideFlowItem } from "@/components/SideFlow";
import DashboardScreen from "@/components/screens/DashboardScreen";
import FeedScreen from "@/components/screens/FeedScreen";
import MessagesScreen from "@/components/screens/MessagesScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";
import StoriesScreen from "@/components/screens/StoriesScreen";

const ITEMS: SideFlowItem[] = [
  { key: "stories", title: "Stories", icon: "camera", render: () => <StoriesScreen /> },
  { key: "feed", title: "Home", icon: "home", render: () => <FeedScreen /> },
  { key: "dashboard", title: "Dashboard", icon: "grid", render: () => <DashboardScreen /> },
  { key: "messages", title: "Messages", icon: "message-circle", render: () => <MessagesScreen /> },
  { key: "profile", title: "Profile", icon: "user", render: () => <ProfileScreen /> },
];

export default function SideFlowHome() {
  return <SideFlow items={ITEMS} initialIndex={1} />;
}
