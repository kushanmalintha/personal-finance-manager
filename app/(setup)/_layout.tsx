import { Redirect, Stack } from "expo-router";

import { useAuthSessionStore } from "@/src/store/authSessionStore";

export default function SetupLayout() {
  const userId = useAuthSessionStore((state) => state.userId);
  const setupComplete = useAuthSessionStore((state) => state.setupComplete);

  if (!userId) {
    return <Redirect href="/(auth)/login" />;
  }

  if (setupComplete) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
