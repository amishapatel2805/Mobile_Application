import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Login" }}
      />

      <Stack.Screen
        name="register"
        options={{ title: "Register" }}
      />

      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="add-company"
        options={{ title: "Add Company" }}
      />
    </Stack>
  );
}