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
    Alert.alert(
      "Delete Company",
      "Are you sure you want to delete this company?",
      [
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
      ]
    );
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

        <Button mode="contained" onPress={loadCompanies}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        style={styles.addButton}
        onPress={() => router.push("/add-company")}
      >
        Add Company
      </Button>

      <FlatList
        data={companies}
        keyExtractor={(item: any) =>
          item.id?.toString() || item._id?.toString()
        }
        renderItem={({ item }: any) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge">
                {item.name || item.companyName}
              </Text>

              <Text>{item.industry || "No industry provided"}</Text>
              <Text>{item.location || "No location provided"}</Text>
            </Card.Content>

            <Card.Actions>
              <Button onPress={() => handleEdit(item)}>Edit</Button>

              <Button
                textColor="red"
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
    backgroundColor: "#f5f5f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  addButton: {
    marginBottom: 20,
  },
  card: {
    marginBottom: 15,
  },
  message: {
    marginTop: 10,
    textAlign: "center",
  },
  error: {
    marginBottom: 20,
    color: "red",
    textAlign: "center",
    fontSize: 16,
  },
});