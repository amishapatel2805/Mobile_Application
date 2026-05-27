import { Tabs } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <PaperProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#1976D2",
          tabBarInactiveTintColor: "#6B7280",
          tabBarStyle: {
            height: 65,
            paddingBottom: 8,
            paddingTop: 6,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="view-dashboard"
                color={color}
                size={size}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="companies"
          options={{
            title: "Companies",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="office-building"
                color={color}
                size={size}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="applications"
          options={{
            title: "Applications",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="briefcase"
                color={color}
                size={size}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="interviews"
          options={{
            title: "Interviews",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account-tie"
                color={color}
                size={size}
              />
            ),
          }}
        />
      </Tabs>
    </PaperProvider>
  );
}