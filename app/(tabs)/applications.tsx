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
  fetchApplications,
  deleteApplication,
} from "../../services/applicationService";

export default function ApplicationsScreen() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadApplications() {
    setLoading(true);
    setErrorMessage("");

    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      router.replace("/");
      return;
    }
    const result = await fetchApplications(token);

    if (!result.success) {
      setErrorMessage(result.message);
      setApplications([]);
      setLoading(false);
      return;
    }

    setApplications(result.data || []);
    setLoading(false);
  }

  function formatDate(dateValue: string) {
    if (!dateValue) return "N/A";

    const dateOnly = dateValue.includes("T")
      ? dateValue.split("T")[0]
      : dateValue;

    const parts = dateOnly.split("-");

    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }

    return dateValue;
  }

  function getStatusStyle(status: string) {
    const lower = status?.toLowerCase();

    if (lower?.includes("rejected")) {
      return {
        backgroundColor: "#FDEDEC",
        color: "#D32F2F",
      };
    }

    if (lower?.includes("offered") || lower?.includes("accepted")) {
      return {
        backgroundColor: "#E8F8EF",
        color: "#1E8449",
      };
    }

    if (lower?.includes("interview")) {
      return {
        backgroundColor: "#FFF3CD",
        color: "#D68910",
      };
    }

    return {
      backgroundColor: "#E3F2FD",
      color: "#1565C0",
    };
  }

  async function handleDelete(id: string) {
    Alert.alert("Delete Application", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const token = await SecureStore.getItemAsync("token");
          const result = await deleteApplication(id, token);

          if (!result.success) {
            Alert.alert("Error", result.message);
            return;
          }

          Alert.alert("Success", "Application deleted");
          loadApplications();
        },
      },
    ]);
  }

  function handleEdit(item: any) {
    router.push({
      pathname: "/edit-application",
      params: {
        id: item._id || item.id,
        roleTitle: item.roleTitle || "",
        company: item.company?._id || item.company || "",
        companyName: item.company?.name || "",
        applicationDate: item.applicationDate || "",
        salaryExpectation: item.salaryExpectation || "",
        status: item.status || "",
        notes: item.notes || "",
      },
    });
  }

  useEffect(() => {
    loadApplications();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Loading applications...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{errorMessage}</Text>
        <Button mode="contained" onPress={loadApplications}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.heading}>
        Applications
      </Text>

      <Button
        mode="contained"
        buttonColor="#1976D2"
        textColor="white"
        style={styles.addButton}
        onPress={() => router.push("/add-application")}
      >
        + Add Application
      </Button>

      <FlatList
        data={applications}
        keyExtractor={(item: any) => item._id || item.id}
        renderItem={({ item }: any) => {
          const statusStyle = getStatusStyle(item.status || "Applied");

          return (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="titleLarge" style={styles.title}>
                    {item.roleTitle || "Untitled Role"}
                  </Text>

                  <Text
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: statusStyle.backgroundColor,
                        color: statusStyle.color,
                      },
                    ]}
                  >
                    {(item.status || "Applied").toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.detailText}>
                  Company: {item.company?.name || item.companyName || "N/A"}
                </Text>

                <Text style={styles.detailText}>
                  Date: {formatDate(item.applicationDate)}
                </Text>

                {item.salaryExpectation ? (
                  <Text style={styles.detailText}>
                    Salary: {item.salaryExpectation}
                  </Text>
                ) : null}

                {item.notes ? (
                  <Text style={styles.notesText} numberOfLines={2}>
                    Notes: {item.notes}
                  </Text>
                ) : null}
              </Card.Content>

              <Card.Actions style={styles.actions}>
                <Button
                  mode="contained"
                  buttonColor="#1976D2"
                  textColor="white"
                  onPress={() => handleEdit(item)}
                  style={styles.actionButton}
                >
                  Edit
                </Button>

                <Button
                  mode="contained"
                  buttonColor="#EF4444"
                  textColor="white"
                  onPress={() => handleDelete(item._id || item.id)}
                  style={styles.actionButton}
                >
                  Delete
                </Button>
              </Card.Actions>
            </Card>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.message}>No applications found.</Text>
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
  heading: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F6F8",
  },
  addButton: {
    marginBottom: 20,
    borderRadius: 10,
  },
  card: {
    marginBottom: 15,
    borderRadius: 16,
    backgroundColor: "white",
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 10,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
    overflow: "hidden",
  },
  detailText: {
    marginBottom: 4,
    color: "#555",
  },
  notesText: {
    marginTop: 6,
    color: "#777",
  },
  actions: {
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  actionButton: {
    borderRadius: 10,
  },
  message: {
    textAlign: "center",
    marginTop: 20,
  },
  error: {
    color: "#D32F2F",
    marginBottom: 20,
    textAlign: "center",
  },
});