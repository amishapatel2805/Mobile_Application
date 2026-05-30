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
  fetchInterviews,
  deleteInterview,
} from "../../services/interviewService";

export default function InterviewsScreen() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const [visibleCount, setVisibleCount] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);
  const itemsPerPage = 5;

  async function loadInterviews() {
    setLoading(true);

    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      setLoading(false);
      router.replace("/login");
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
            router.replace("/login");
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

  const filteredInterviews = interviews
    .filter((item: any) => {
      const text = `${item.round || ""} ${item.mode || ""} ${
        item.outcome || ""
      } ${item.application?.roleTitle || ""}`.toLowerCase();

      return text.includes(search.toLowerCase());
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || a.interviewDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.interviewDate || 0).getTime();

      if (sortOption === "oldest") {
        return dateA - dateB;
      }

      return dateB - dateA;
    });

  const visibleInterviews = filteredInterviews.slice(0, visibleCount);

  function loadMoreInterviews() {
    if (loadingMore || visibleCount >= filteredInterviews.length) {
      return;
    }

    setLoadingMore(true);

    setTimeout(() => {
      setVisibleCount((prev) => prev + itemsPerPage);
      setLoadingMore(false);
    }, 1500);
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

      <TextInput
        label="Search interviews"
        value={search}
        onChangeText={setSearch}
        mode="outlined"
        left={<TextInput.Icon icon="magnify" />}
        style={styles.searchInput}
        textColor="#111827"
        outlineColor="#D1D5DB"
        activeOutlineColor="#1976D2"
        theme={{
          colors: {
            onSurface: "#111827",
            onSurfaceVariant: "#6B7280",
          },
        }}
      />

      <View style={styles.topActions}>
        <Button
          mode="contained"
          buttonColor="#1976D2"
          textColor="white"
          style={styles.addButton}
          onPress={() => router.push("/add-interview")}
        >
          + Add Interview
        </Button>

        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              style={styles.sortButton}
              labelStyle={{
                color: "#111827",
                fontSize: 16,
                textAlign: "center",
              }}
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
        data={visibleInterviews}
        keyExtractor={(item: any) => item._id || item.id}
        onEndReached={loadMoreInterviews}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color="#1976D2" />
              <Text style={styles.loadingText}>
                Loading more interviews...
              </Text>
            </View>
          ) : null
        }
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
  searchInput: {
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },
  topActions: {
    marginBottom: 18,
  },
  addButton: {
    marginBottom: 10,
    borderRadius: 10,
  },
  sortButton: {
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
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
  loaderBox: {
    paddingVertical: 24,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 14,
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