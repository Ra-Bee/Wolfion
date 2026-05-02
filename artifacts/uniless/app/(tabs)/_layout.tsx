import { Redirect, Stack } from "expo-router";
import React from "react";

import { useAuth } from "@/contexts/AuthContext";

export default function TabLayout() {
  const { ready, user } = useAuth();
  if (!ready) return null;
  if (!user) return <Redirect href="/(auth)/welcome" />;
  return <Stack screenOptions={{ headerShown: false, animation: "fade" }} />;
}
