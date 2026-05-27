import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, Menu, Text } from "react-native-paper";
import { deleteCompany, fetchCompanies } from "../../services/companyService";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
];

export default function CompaniesScreen() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("oldest");
  const [menuVisible, setMenuVisible] = useState(false);

  async function loadCompanies(pageNumber = 1, reset = false) {
    if (loadingMore) return;
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    const token = await SecureStore.getItemAsync("token");
    const result = await fetchCompanies(token, pageNumber, search, sort);
    if (!result.success) {
      setErrorMessage(result.message);
      setLoading(false);
      setLoadingMore(false);
      return;
    }
    const newCompanies = result.data?.companies || result.data || [];
    setCompanies((prev) => (reset ? newCompanies : [...prev, ...newCompanies]));
    setHasMore(newCompanies.length > 0);
    setPage(pageNumber);
    setLoading(false);
    setLoadingMore(false);
  }

  async function handleDelete(id: string) {
    Alert.alert(
      "Delete Company",
      "Are you sure you want to delete this company?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
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
            loadCompanies(1, true);
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
    const delay = setTimeout(() => {
      loadCompanies(1, true);
    }, 400);
    return () => clearTimeout(delay);
  }, [search, sort]);

  const activeSortLabel =
    SORT_OPTIONS.find((item) => item.value === sort)?.label || "Sort";

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
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Companies</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/add-company")}
        >
          <Text style={styles.addButtonPlus}>+</Text>
          <Text style={styles.addButtonLabel}>Add Company</Text>
        </TouchableOpacity>
      </View>

      {/* Search + Filter */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search companies..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setMenuVisible(true)}
            >
              <Text style={styles.filterLabel}>{activeSortLabel}</Text>
              <Text style={styles.chevron}>⌄</Text>
            </TouchableOpacity>
          }
        >
          {SORT_OPTIONS.map((item) => (
            <Menu.Item
              key={item.value}
              title={item.label}
              onPress={() => {
                setSort(item.value);
                setMenuVisible(false);
              }}
            />
          ))}
        </Menu>
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2E86DE" />
          <Text style={styles.message}>Loading companies...</Text>
        </View>
      ) : (
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
                  Industry: {item.industry || "N/A"}
                </Text>

                <Text style={styles.detailText}>
                  Location: {item.location || "N/A"}
                </Text>
              </Card.Content>

              <Card.Actions style={styles.actions}>
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
          onEndReached={() => {
            if (hasMore && !loadingMore) {
              loadCompanies(page + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View
                style={{
                  paddingVertical: 20,
                }}
              >
                <ActivityIndicator />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#F4F6F8",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  heading: {
    fontSize: 30,
    fontWeight: "800",
  },

  addButton: {
    backgroundColor: "#2E86DE",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },

  addButtonPlus: {
    color: "#fff",
    fontSize: 24,
    marginRight: 6,
  },

  addButtonLabel: {
    color: "#fff",
    fontWeight: "700",
  },

  searchRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },

  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    fontSize: 16,
  },

  filterButton: {
    height: 50,
    minWidth: 160,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  filterLabel: {
    fontWeight: "600",
  },

  chevron: {
    fontSize: 20,
    color: "#64748B",
  },

  card: {
    marginBottom: 15,
    borderRadius: 16,
  },

  companyName: {
    fontWeight: "bold",
  },

  detailText: {
    color: "#555",
    marginTop: 4,
  },

  actions: {
    justifyContent: "space-between",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  message: {
    marginTop: 10,
  },

  error: {
    color: "red",
    marginBottom: 10,
  },
});
