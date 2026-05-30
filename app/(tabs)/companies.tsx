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
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("Newest");
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const [visibleCount, setVisibleCount] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);
  const itemsPerPage = 5;

  async function loadCompanies() {
    setLoading(true);
    setErrorMessage("");

    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      setLoading(false);
      router.replace("/login");
      return;
    }

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

  const filteredCompanies = companies
    .filter((item: any) => {
      const text = `${item.name || ""} ${item.companyName || ""} ${
        item.industry || ""
      } ${item.location || ""}`.toLowerCase();

      return text.includes(search.toLowerCase());
    })
    .sort((a: any, b: any) => {
      if (sortOption === "A-Z") {
        return (a.name || a.companyName || "").localeCompare(
          b.name || b.companyName || ""
        );
      }

      if (sortOption === "Z-A") {
        return (b.name || b.companyName || "").localeCompare(
          a.name || a.companyName || ""
        );
      }

      if (sortOption === "Oldest") {
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );
      }

      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });

  const paginatedCompanies = filteredCompanies.slice(0, visibleCount);

  function loadMoreCompanies() {
    if (visibleCount >= filteredCompanies.length || loadingMore) {
      return;
    }

    setLoadingMore(true);

    setTimeout(() => {
      setVisibleCount((prev) => prev + itemsPerPage);
      setLoadingMore(false);
    }, 700);
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
      <Text style={styles.heading}>Companies</Text>

      <TextInput
        label="Search companies"
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
          {["Newest", "Oldest", "A-Z", "Z-A"].map((option) => (
            <Menu.Item
              key={option}
              title={option}
              onPress={() => {
                setSortOption(option);
                setVisibleCount(5);
                setSortMenuVisible(false);
              }}
            />
          ))}
        </Menu>
      </View>

      <FlatList
        data={paginatedCompanies}
        keyExtractor={(item: any) => item._id || item.id}
        onEndReached={loadMoreCompanies}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" style={styles.footerLoader} />
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
  footerLoader: {
    marginVertical: 20,
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