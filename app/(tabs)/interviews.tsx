import { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Card, Text, Button } from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import {
  fetchInterviews,
  deleteInterview,
} from "../../services/interviewService";

export default function InterviewsScreen() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadInterviews() {
    setLoading(true);

    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      setLoading(false);
      router.replace("/");
      return;
    }

    const result = await fetchInterviews(token);

    if (result.success) {
      setInterviews(result.data || []);
    }

    setLoading(false);
  }

  function formatDate(dateValue: string) {
    if (!dateValue) return "N/A";

    const dateOnly = dateValue.includes("T")
      ? dateValue.split("T")[0]
      : dateValue;

    const parts = dateOnly.split("-");

    if (parts.length !== 3) return dateValue;

    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }

  function getOutcomeStyle(outcome: string) {
    if (outcome === "Passed") return styles.passed;
    if (outcome === "Failed") return styles.failed;
    return styles.pending;
  }

  async function handleDelete(id: string) {
    Alert.alert("Delete Interview", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const token = await SecureStore.getItemAsync("token");

          if (!token) {
            router.replace("/");
            return;
          }

          const result = await deleteInterview(id, token);

          if (!result.success) {
            Alert.alert("Error", result.message);
            return;
          }

          Alert.alert("Success", "Interview deleted");
          loadInterviews();
        },
      },
    ]);
  }

  useEffect(() => {
    loadInterviews();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.darkText}>Loading interviews...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Interviews</Text>

      <Button
        mode="contained"
        buttonColor="#1976D2"
        textColor="white"
        style={styles.addButton}
        onPress={() => router.push("/add-interview")}
      >
        + Add Interview
      </Button>

      <FlatList
        data={interviews}
        keyExtractor={(item: any) => item._id || item.id}
        renderItem={({ item }: any) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.rowText}>
                <Text style={styles.label}>Round: </Text>
                {item.round || "N/A"}
              </Text>

              <Text style={styles.rowText}>
                <Text style={styles.label}>Date: </Text>
                {formatDate(item.interviewDate)}
              </Text>

              <Text style={styles.rowText}>
                <Text style={styles.label}>Mode: </Text>
                {item.mode || "N/A"}
              </Text>

              <View style={styles.badgeRow}>
                <Text style={styles.label}>Outcome: </Text>
                <Text style={[styles.badge, getOutcomeStyle(item.outcome)]}>
                  {(item.outcome || "Pending").toUpperCase()}
                </Text>
              </View>

              <Text style={styles.rowText}>
                <Text style={styles.label}>Application: </Text>
                {item.application?.roleTitle || "N/A"}
              </Text>
            </Card.Content>

            <Card.Actions style={styles.actions}>
              <Button
                mode="contained"
                buttonColor="#2D8FE3"
                textColor="white"
                style={styles.actionButton}
                onPress={() =>
                  router.push({
                    pathname: "/edit-interview",
                    params: {
                      id: item._id || item.id,
                      round: item.round || "",
                      interviewDate: item.interviewDate || "",
                      mode: item.mode || "",
                      outcome: item.outcome || "",
                      application:
                        item.application?._id || item.application || "",
                      notes: item.notes || "",
                    },
                  })
                }
              >
                Edit
              </Button>

              <Button
                mode="contained"
                buttonColor="#FF4D4F"
                textColor="white"
                style={styles.actionButton}
                onPress={() => handleDelete(item._id || item.id)}
              >
                Delete
              </Button>
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No interviews found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F4F6F8",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F6F8",
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#111827",
  },
  addButton: {
    marginBottom: 20,
    borderRadius: 10,
  },
  card: {
    marginBottom: 15,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    elevation: 3,
  },
  rowText: {
    fontSize: 16,
    marginBottom: 9,
    color: "#111827",
  },
  label: {
    fontWeight: "bold",
    color: "#111827",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontWeight: "bold",
    fontSize: 12,
    overflow: "hidden",
  },
  passed: {
    backgroundColor: "#C6F6D5",
    color: "#15803D",
  },
  failed: {
    backgroundColor: "#FFD6D6",
    color: "#DC2626",
  },
  pending: {
    backgroundColor: "#D8EAFE",
    color: "#1D4ED8",
  },
  actions: {
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  actionButton: {
    borderRadius: 10,
    minWidth: 120,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#111827",
  },
  darkText: {
    color: "#111827",
  },
});