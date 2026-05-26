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

      <Stack.Screen 
          name="add-application" 
          options={{ title: "Add Application" }} 
          />
      <Stack.Screen 
          name="edit-application" 
          options={{ title: "Edit Application" }} />
          </Stack>
  );
}