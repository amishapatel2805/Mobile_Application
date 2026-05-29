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
      await SecureStore.setItemAsync("token", token);
    await SecureStore.setItemAsync("userEmail", email);
    } catch (error) {
      console.log("SecureStore error:", error);
      Alert.alert("Login failed", "Could not save login token.");
      return;
    }

    router.replace("/dashboard");
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
              outlineColor="#D0D7DE"
              activeOutlineColor="#2D8FE3"
              left={<TextInput.Icon icon="email-outline" />}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              outlineColor="#D0D7DE"
              activeOutlineColor="#2D8FE3"
              left={<TextInput.Icon icon="lock-outline" />}
            />

            <Button
              mode="contained"
              buttonColor="#2D8FE3"
              textColor="white"
              onPress={handleLogin}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
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
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
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
    lineHeight: 22,
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
  buttonContent: {
    paddingVertical: 6,
  },
});