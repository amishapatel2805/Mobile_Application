import { useState, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Card, Text, Button, Avatar } from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import { router, useFocusEffect } from "expo-router";

export default function ProfileScreen() {
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("No email found");

  async function loadUser() {
    const savedName = await SecureStore.getItemAsync("userName");
    const savedEmail = await SecureStore.getItemAsync("userEmail");

    setUserName(savedName || "User");
    setUserEmail(savedEmail || "No email found");
  }

  async function handleLogout() {
    try {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("userEmail");
      await SecureStore.deleteItemAsync("userName");

      router.replace("/login");
    } catch (error) {
      Alert.alert("Error", "Logout failed. Please try again.");
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Avatar.Text
            size={86}
            label={userName ? userName.charAt(0).toUpperCase() : "U"}
            style={styles.avatar}
            color="white"
          />

          <Text style={styles.title}>My Profile</Text>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{userName}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{userEmail}</Text>
          </View>

          <Button
            mode="contained"
            buttonColor="#EF4444"
            textColor="white"
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: 26,
    backgroundColor: "white",
    elevation: 5,
  },
  content: {
    alignItems: "center",
    paddingVertical: 30,
  },
  avatar: {
    backgroundColor: "#1976D2",
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 24,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#F4F6F8",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  label: {
    color: "#6B7280",
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 18,
    borderRadius: 12,
    width: "100%",
  },
});