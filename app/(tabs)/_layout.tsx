import { Redirect, Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";

import { useClientOnlyValue } from "@/src/hooks/useClientOnlyValue";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { useAuthSessionStore } from "@/src/store/authSessionStore";
import Colors from "@/src/theme/Colors";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const userId = useAuthSessionStore((state) => state.userId);
  const setupComplete = useAuthSessionStore((state) => state.setupComplete);

  // Do not expose financial screens without an active app session.
  if (!userId) {
    return <Redirect href="/(auth)/login" />;
  }

  // Initial setup must be completed before entering the main application.
  if (!setupComplete) {
    return <Redirect href="/(setup)/initial-setup" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "house",
                android: "home",
                web: "home",
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="accounts"
        options={{
          title: "Accounts",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "building.2",
                android: "account_balance",
                web: "account_balance",
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "list.bullet.rectangle",
                android: "receipt_long",
                web: "receipt_long",
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "chart.bar",
                android: "bar_chart",
                web: "bar_chart",
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "gearshape",
                android: "settings",
                web: "settings",
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
