import { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Card, Text, Button, TextInput, Menu } from "react-native-paper";
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
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const [visibleCount, setVisibleCount] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);
  const itemsPerPage = 5;

  async function loadApplications() {
    setLoading(true);
    setErrorMessage("");

    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      setLoading(false);
      router.replace("/login");
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

  async function handleDelete(id: string) {
    Alert.alert("Delete Application", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const token = await SecureStore.getItemAsync("token");

          if (!token) {
            router.replace("/login");
            return;
          }

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

  const filteredApplications = applications
    .filter((item: any) => {
      const text = `${item.roleTitle || ""} ${
        item.company?.name || ""
      } ${item.companyName || ""} ${item.status || ""}`.toLowerCase();

      return text.includes(search.toLowerCase());
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || a.applicationDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.applicationDate || 0).getTime();

      if (sortOption === "oldest") {
        return dateA - dateB;
      }

      return dateB - dateA;
    });

  const visibleApplications = filteredApplications.slice(0, visibleCount);

  function loadMoreApplications() {
    if (loadingMore || visibleCount >= filteredApplications.length) {
      return;
    }

    setLoadingMore(true);

    setTimeout(() => {
      setVisibleCount((prev) => prev + itemsPerPage);
      setLoadingMore(false);
    }, 1500);
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
      <Text style={styles.heading}>Applications</Text>

      <TextInput
        label="Search applications"
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          setVisibleCount(5);
        }}
        mode="outlined"
        left={<TextInput.Icon icon="magnify" />}
        style={styles.searchInput}
      />

      <View style={styles.topActions}>
        <Button
          mode="contained"
          buttonColor="#1976D2"
          textColor="white"
          style={styles.addButton}
          onPress={() => router.push("/add-application")}
        >
          + Add Application
        </Button>

        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              style={styles.sortButton}
              onPress={() => setSortMenuVisible(true)}
            >
              Sort: {sortOption}
            </Button>
          }
        >
          <Menu.Item
            title="newest"
            onPress={() => {
              setSortOption("newest");
              setVisibleCount(5);
              setSortMenuVisible(false);
            }}
          />

          <Menu.Item
            title="oldest"
            onPress={() => {
              setSortOption("oldest");
              setVisibleCount(5);
              setSortMenuVisible(false);
            }}
          />
        </Menu>
      </View>

      <FlatList
        data={visibleApplications}
        keyExtractor={(item: any) => item._id || item.id}
        onEndReached={loadMoreApplications}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color="#1976D2" />
              <Text style={styles.loadingText}>
                Loading more applications...
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }: any) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>
                {item.roleTitle || "Untitled Role"}
              </Text>

              <Text style={styles.label}>Company</Text>
              <Text style={styles.value}>
                {item.company?.name || item.companyName || "N/A"}
              </Text>

              <Text style={styles.label}>Status</Text>
              <Text style={styles.value}>{item.status || "Applied"}</Text>

              <Text style={styles.label}>Application Date</Text>
              <Text style={styles.value}>
                {formatDate(item.applicationDate)}
              </Text>

              {item.salaryExpectation ? (
                <>
                  
                  <Text style={styles.value}>{item.salaryExpectation}</Text>
                </>
              ) : null}

              {item.notes ? (
                <>
                  <Text style={styles.label}>Notes</Text>
                  <Text style={styles.notes}>{item.notes}</Text>
                </>
              ) : null}
            </Card.Content>

            <Card.Actions style={styles.actions}>
              <Button
                mode="contained"
                buttonColor="#2D8FE3"
                textColor="white"
                style={styles.actionButton}
                onPress={() => handleEdit(item)}
              >
                Edit
              </Button>

              <Button
                mode="contained"
                buttonColor="#EF4444"
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
          <Text style={styles.message}>No applications found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F4F6F8",
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#111827",
  },
  searchInput: {
    marginBottom: 14,
    backgroundColor: "white",
  },
  topActions: {
    marginBottom: 18,
  },
  addButton: {
    borderRadius: 12,
    marginBottom: 10,
  },
  sortButton: {
    borderRadius: 12,
    backgroundColor: "white",
  },
  card: {
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#111827",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: "#475569",
    marginBottom: 6,
  },
  notes: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 6,
  },
  actions: {
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  actionButton: {
    borderRadius: 10,
    minWidth: 110,
  },
  loaderBox: {
    paddingVertical: 24,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F6F8",
  },
  message: {
    textAlign: "center",
    marginTop: 20,
    color: "#6B7280",
  },
  error: {
    color: "#D32F2F",
    marginBottom: 20,
    textAlign: "center",
  },
});