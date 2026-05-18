import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="dashboard"
        options={{ title: "Dashboard" }}
      />

      <Tabs.Screen
        name="companies"
        options={{ title: "Companies" }}
      />

      <Tabs.Screen
        name="applications"
        options={{ title: "Applications" }}
      />

      <Tabs.Screen
        name="interviews"
        options={{ title: "Interviews" }}
      />
    </Tabs>
  );
}