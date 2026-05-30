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
  fetchCompanies,
  deleteCompany,
} from "../../services/companyService";

export default function CompaniesScreen() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const limit = 5;

  function sortCompanies(data: any[]) {
    const sorted = [...data];

    if (sortOption === "A-Z") {
      return sorted.sort((a, b) =>
        (a.name || a.companyName || "").localeCompare(
          b.name || b.companyName || ""
        )
      );
    }

    if (sortOption === "Z-A") {
      return sorted.sort((a, b) =>
        (b.name || b.companyName || "").localeCompare(
          a.name || a.companyName || ""
        )
      );
    }

    return sorted;
  }

  async function loadCompanies(pageNumber = 1, reset = true) {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    setErrorMessage("");

    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      setLoading(false);
      setLoadingMore(false);
      router.replace("/login");
      return;
    }

    const apiSort =
      sortOption === "A-Z" || sortOption === "Z-A"
        ? "newest"
        : sortOption;

    const result = await fetchCompanies(
      token,
      pageNumber,
      search,
      apiSort,
      limit
    );

    if (!result.success) {
      setErrorMessage(result.message);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    const newCompanies = sortCompanies(result.data || []);

    if (reset) {
      setCompanies(newCompanies);
    } else {
      setCompanies((prev: any[]) => sortCompanies([...prev, ...newCompanies]));
    }

    setHasMore(newCompanies.length === limit);
    setPage(pageNumber);
    setLoading(false);
    setLoadingMore(false);
  }

  function loadMoreCompanies() {
    if (loadingMore || !hasMore || loading) return;

    setLoadingMore(true);

    setTimeout(() => {
      loadCompanies(page + 1, false);
    }, 1500);
  }

  async function handleDelete(id: string) {
    Alert.alert("Delete Company", "Are you sure you want to delete this company?", [
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

          const result = await deleteCompany(id, token);

          if (!result.success) {
            Alert.alert("Error", result.message);
            return;
          }

          Alert.alert("Success", "Company deleted successfully");
          loadCompanies(1, true);
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
    setPage(1);
    setHasMore(true);
    loadCompanies(1, true);
  }, [search, sortOption]);

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
        <Button mode="contained" onPress={() => loadCompanies(1, true)}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Companies</Text>

      <TextInput
        label="Search companies"
        value={search}
        onChangeText={setSearch}
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
          onPress={() => router.push("/add-company")}
        >
          + Add Company
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
          {["newest", "oldest", "A-Z", "Z-A"].map((option) => (
            <Menu.Item
              key={option}
              title={option}
              onPress={() => {
                setSortOption(option);
                setSortMenuVisible(false);
              }}
            />
          ))}
        </Menu>
      </View>

      <FlatList
        data={companies}
        keyExtractor={(item: any) => item._id || item.id}
        onEndReached={loadMoreCompanies}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color="#1976D2" />
              <Text style={styles.loadingText}>Loading more companies...</Text>
            </View>
          ) : null
        }
        renderItem={({ item }: any) => (
          <Card style={styles.companyCard}>
            <Card.Content>
              <Text style={styles.companyTitle}>
                {item.name || item.companyName}
              </Text>

              <Text style={styles.label}>Industry</Text>
              <Text style={styles.companyInfo}>
                {item.industry || "Not specified"}
              </Text>

              <Text style={styles.label}>Location</Text>
              <Text style={styles.companyInfo}>
                {item.location || "Not specified"}
              </Text>

              {item.website ? (
                <>
                  <Text style={styles.label}>Website</Text>
                  <Text style={styles.website}>{item.website}</Text>
                </>
              ) : null}

              {item.notes ? (
                <>
                  <Text style={styles.label}>Notes</Text>
                  <Text style={styles.notes}>{item.notes}</Text>
                </>
              ) : null}
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
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
          <Text style={styles.message}>No companies found.</Text>
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
  companyCard: {
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    elevation: 3,
  },
  companyTitle: {
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
  companyInfo: {
    fontSize: 16,
    color: "#475569",
    marginBottom: 6,
  },
  website: {
    fontSize: 15,
    color: "#2563EB",
    marginBottom: 10,
  },
  notes: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 6,
  },
  cardActions: {
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
    marginBottom: 20,
    color: "#EF4444",
    textAlign: "center",
    fontSize: 16,
  },
});