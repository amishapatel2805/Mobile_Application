import { useState, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { Card, Text, Button } from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import { router, useFocusEffect } from "expo-router";
import { fetchApplications } from "../../services/applicationService";
import { fetchInterviews } from "../../services/interviewService";

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);

  async function loadDashboard() {
    setLoading(true);

    const token = await SecureStore.getItemAsync("token");

    const applicationsResult = await fetchApplications(token);
    const interviewsResult = await fetchInterviews(token);

    if (applicationsResult.success) {
      setApplications(applicationsResult.data || []);
    }

    if (interviewsResult.success) {
      setInterviews(interviewsResult.data || []);
    }

    setLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const offers = applications.filter(
    (item: any) => item.status === "Offered"
  ).length;

  const rejections = applications.filter(
    (item: any) => item.status === "Rejected"
  ).length;

  const scheduledInterviews = applications.filter(
    (item: any) => item.status === "Interview Scheduled"
  ).length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Dashboard</Text>
      <Text style={styles.subheading}>Welcome back</Text>

      <View style={styles.grid}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statLabel}>Total Applications</Text>
            <Text style={styles.statNumber}>{applications.length}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statLabel}>Interviews Scheduled</Text>
            <Text style={styles.statNumber}>{scheduledInterviews}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statLabel}>Offers Received</Text>
            <Text style={styles.statNumber}>{offers}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statLabel}>Rejections</Text>
            <Text style={styles.statNumber}>{rejections}</Text>
          </Card.Content>
        </Card>
      </View>

      <Button
        mode="outlined"
        style={styles.quickButton}
        onPress={() => router.push("/add-application")}
      >
        + Add Application
      </Button>

      <Button
        mode="outlined"
        style={styles.quickButton}
        onPress={() => router.push("/add-company")}
      >
        + Add Company
      </Button>

      <Button
        mode="outlined"
        style={styles.quickButton}
        onPress={() => router.push("/add-interview")}
      >
        + Schedule Interview
      </Button>

      <Card style={styles.latestCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Latest Applications</Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, { flex: 1 }]}>Company</Text>
            <Text style={[styles.headerText, { flex: 1 }]}>Role</Text>
            <Text style={[styles.headerText, { flex: 1 }]}>Status</Text>
          </View>

          {applications.slice(0, 3).map((item: any) => (
            <View key={item._id || item.id} style={styles.tableRow}>
              <Text style={[styles.rowText, { flex: 1 }]}>
                {item.company?.name || "N/A"}
              </Text>

              <Text style={[styles.rowText, { flex: 1 }]}>
                {item.roleTitle}
              </Text>

              <Text style={[styles.rowText, { flex: 1 }]}>
                {item.status}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  content: {
    padding: 16,
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
  },
  subheading: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  statCard: {
    width: "48%",
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: "white",
    elevation: 2,
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 13,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  quickButton: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "white",
  },
  latestCard: {
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: "white",
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 10,
  },
  headerText: {
    fontWeight: "bold",
    color: "#111827",
    fontSize: 14,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  rowText: {
    color: "#374151",
    fontSize: 13,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F6F8",
  },
});