import { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { router } from "expo-router";

import { register } from "../services/authService";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert(
        "Missing details",
        "Please fill all fields."
      );
      return;
    }

    const result = await register(
      name,
      email,
      password
    );

    if (!result.success) {
      Alert.alert(
        "Registration failed",
        result.message
      );
      return;
    }

    Alert.alert(
      "Success",
      "Account created successfully"
    );

    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topPanel}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>JT</Text>
            </View>

            <Text style={styles.appTitle}>
              Create Account
            </Text>

            <Text style={styles.subtitle}>
              Start tracking your applications.
            </Text>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>
                Register
              </Text>

              <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                left={
                  <TextInput.Icon icon="account-outline" />
                }
              />

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                left={
                  <TextInput.Icon icon="email-outline" />
                }
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                left={
                  <TextInput.Icon icon="lock-outline" />
                }
              />

              <Button
                mode="contained"
                buttonColor="#2D8FE3"
                textColor="white"
                onPress={handleRegister}
                style={styles.registerButton}
              >
                Register
              </Button>

              <Button
                mode="text"
                textColor="#2D8FE3"
                onPress={() =>
                  router.replace("/")
                }
              >
                Already have an account? Login
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
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

  registerButton: {
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 12,
  },
});