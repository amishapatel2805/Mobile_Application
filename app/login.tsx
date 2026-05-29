import { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { login } from "../services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Missing details", "Please enter email and password.");
      return;
    }

    const result = await login(email, password); 
    console.log("LOGIN RESPONSE:", JSON.stringify(result.data, null, 2)); 

    if (!result.success) {
      Alert.alert("Login failed", result.message);
      return;
    }

    const token = result.data?.token;

    if (!token) {
      Alert.alert("Login failed", "No token was returned from the server.");
      return;
    }

    try {
      const savedName =
        result.data?.name ||
        result.data?.user?.name ||
        email.split("@")[0];

      const savedEmail =
        result.data?.email ||
        result.data?.user?.email ||
        email;
      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("userEmail", email);
      await SecureStore.setItemAsync("userName", result.data.name);
      
      console.log("SAVED NAME:", result.data.name);
      console.log("SAVED EMAIL:", result.data.email);
      const userName = email.split("@")[0];

    } catch (error) {
      Alert.alert("Login failed", "Could not save login token.");
      return;
    }

    router.replace("/(tabs)/dashboard");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topPanel}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>JT</Text>
          </View>

          <Text style={styles.appTitle}>Job Tracker</Text>

          <Text style={styles.subtitle}>
            Track applications and land your dream job.
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Welcome Back</Text>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="email-outline" />}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              left={<TextInput.Icon icon="lock-outline" />}
            />

            <Button
              mode="contained"
              buttonColor="#2D8FE3"
              textColor="white"
              onPress={handleLogin}
              style={styles.loginButton}
            >
              Login
            </Button>

            <Button
              mode="text"
              textColor="#2D8FE3"
              onPress={() => router.push("/register")}
            >
              Don’t have an account? Register
            </Button>
          </Card.Content>
        </Card>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  wrapper: {
    flex: 1,
    padding: 22,
    justifyContent: "center",
  },
  topPanel: {
    backgroundColor: "#285BD6",
    borderRadius: 28,
    padding: 28,
    marginBottom: 22,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  logoText: {
    color: "#285BD6",
    fontSize: 22,
    fontWeight: "bold",
  },
  appTitle: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#EAF1FF",
    fontSize: 15,
  },
  card: {
    borderRadius: 24,
    backgroundColor: "white",
    elevation: 5,
    paddingVertical: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 14,
    backgroundColor: "white",
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 12,
  },
});