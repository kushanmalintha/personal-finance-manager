import { Redirect, Stack } from "expo-router";

import { useAuthSessionStore } from "@/src/store/authSessionStore";

export default function AuthLayout() {
  const userId = useAuthSessionStore((state) => state.userId);

  // Authenticated users should not remain in authentication screens.
  if (userId) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
