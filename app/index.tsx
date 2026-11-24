import { Redirect } from "expo-router";

import { useAuthSessionStore } from "@/src/store/authSessionStore";

export default function IndexScreen() {
  const userId = useAuthSessionStore((state) => state.userId);
  const setupComplete = useAuthSessionStore((state) => state.setupComplete);

  if (!userId) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!setupComplete) {
    return <Redirect href="/(setup)/initial-setup" />;
  }

  return <Redirect href="/(tabs)" />;
}
