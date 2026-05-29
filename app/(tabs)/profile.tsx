import { View, StyleSheet, Alert } from "react-native";
import { Card, Text, Button } from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

export default function ProfileScreen() {
  async function handleLogout() {
    try {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("userEmail");

      router.replace("/login");
    } catch (error) {
      Alert.alert("Error", "Logout failed. Please try again.");
    }
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Profile</Text>

          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>User</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>Logged In User</Text>

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
    borderRadius: 24,
    backgroundColor: "white",
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#111827",
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#111827",
  },
  logoutButton: {
    marginTop: 25,
    borderRadius: 12,
  },
});