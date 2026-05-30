import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="register"
          options={{ title: "Register" }}
        />

        <Stack.Screen
          name="add-company"
          options={{ title: "Add Company" }}
        />

        <Stack.Screen
          name="edit-company"
          options={{ title: "Edit Company" }}
        />

        <Stack.Screen
          name="add-application"
          options={{ title: "Add Application" }}
        />

        <Stack.Screen
          name="edit-application"
          options={{ title: "Edit Application" }}
        />

        <Stack.Screen
          name="add-interview"
          options={{ title: "Add Interview" }}
        />

        <Stack.Screen
          name="edit-interview"
          options={{ title: "Edit Interview" }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="login"
          options={{ headerShown: false }}
        />
      </Stack>
    </PaperProvider>
  );
}