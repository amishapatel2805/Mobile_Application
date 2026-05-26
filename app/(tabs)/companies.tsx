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
  fetchCompanies,
  deleteCompany,
} from "../../services/companyService";

export default function CompaniesScreen() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadCompanies() {
    setLoading(true);
    setErrorMessage("");

    const token = await SecureStore.getItemAsync("token");
    const result = await fetchCompanies(token);

    if (!result.success) {
      setErrorMessage(result.message);
      setCompanies([]);
      setLoading(false);
      return;
    }

    setCompanies(result.data || []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    Alert.alert("Delete Company", "Are you sure you want to delete this company?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const token = await SecureStore.getItemAsync("token");
          const result = await deleteCompany(id, token);

          if (!result.success) {
            Alert.alert("Error", result.message);
            return;
          }

          Alert.alert("Success", "Company deleted successfully");
          loadCompanies();
        },
      },
    ]);
  }

  function handleEdit(item: any) {
    router.push({
      pathname: "/edit-company",
      params: {
        id: item._id || item.id,
        name: item.name || item.companyName || "",
        industry: item.industry || "",
        location: item.location || "",
        website: item.website || "",
        notes: item.notes || "",
      },
    });
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Loading companies...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{errorMessage}</Text>

        <Button mode="contained" buttonColor="#1976D2" onPress={loadCompanies}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.heading}>
        Companies
      </Text>

      <Button
        mode="contained"
        buttonColor="#1976D2"
        textColor="white"
        style={styles.addButton}
        onPress={() => router.push("/add-company")}
      >
        + Add Company
      </Button>

      <FlatList
        data={companies}
        keyExtractor={(item: any) =>
          item.id?.toString() || item._id?.toString()
        }
        renderItem={({ item }: any) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.companyName}>
                {item.name || item.companyName}
              </Text>

              <Text style={styles.detailText}>
                Industry: {item.industry || "No industry provided"}
              </Text>

              <Text style={styles.detailText}>
                Location: {item.location || "No location provided"}
              </Text>

              {item.website ? (
                <Text style={styles.linkText}>{item.website}</Text>
              ) : null}

              {item.notes ? (
                <Text style={styles.notesText}>{item.notes}</Text>
              ) : null}
            </Card.Content>

            <Card.Actions style={styles.actions}>
              <Button
                mode="contained-tonal"
                buttonColor="#D6EAF8"
                textColor="#1565C0"
                onPress={() => handleEdit(item)}
              >
                Edit
              </Button>

              <Button
                mode="contained-tonal"
                buttonColor="#FDEDEC"
                textColor="#D32F2F"
                onPress={() => handleDelete(item._id || item.id)}
              >
                Delete
              </Button>
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.message}>No companies found.</Text>
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
    padding: 20,
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
  companyName: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  detailText: {
    marginBottom: 4,
    color: "#555",
  },
  linkText: {
    marginTop: 4,
    color: "#1976D2",
  },
  notesText: {
    marginTop: 8,
    color: "#777",
  },
  actions: {
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  message: {
    marginTop: 10,
    textAlign: "center",
  },
  error: {
    marginBottom: 20,
    color: "#D32F2F",
    textAlign: "center",
    fontSize: 16,
  },
});