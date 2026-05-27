import { useEffect, useState } from "react";
import { StyleSheet, Alert, ScrollView } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { createInterview } from "../services/interviewService";
import { fetchApplications } from "../services/applicationService";

export default function AddInterviewScreen() {
  const [round, setRound] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [mode, setMode] = useState("Online");
  const [outcome, setOutcome] = useState("Pending");
  const [notes, setNotes] = useState("");

  const [applications, setApplications] = useState([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadApplications() {
    const token = await SecureStore.getItemAsync("token");
    const result = await fetchApplications(token);

    if (result.success) {
      setApplications(result.data || []);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  function convertDateToBackendFormat(dateText: string) {
    const parts = dateText.split("-");

    if (parts.length !== 3) {
      return dateText;
    }

    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }

  async function handleSave() {
    if (!round || !interviewDate || !selectedApplicationId) {
      Alert.alert(
        "Error",
        "Please enter round, interview date and select an application"
      );
      return;
    }

    setLoading(true);

    const token = await SecureStore.getItemAsync("token");

    const result = await createInterview(
      {
        round,
        interviewDate: convertDateToBackendFormat(interviewDate),
        mode,
        outcome,
        application: selectedApplicationId,
        notes,
      },
      token
    );

    setLoading(false);

    if (!result.success) {
      Alert.alert("Error", result.message);
      return;
    }

    Alert.alert("Success", "Interview added successfully");
    router.replace("/(tabs)/interviews");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>
        Add Interview
      </Text>

      <TextInput
        label="Round"
        value={round}
        onChangeText={setRound}
        mode="outlined"
        placeholder="Final interview"
        style={styles.input}
      />

      <TextInput
        label="Interview Date"
        value={interviewDate}
        onChangeText={setInterviewDate}
        mode="outlined"
        placeholder="DD-MM-YYYY"
        style={styles.input}
      />

      <TextInput
        label="Mode"
        value={mode}
        onChangeText={setMode}
        mode="outlined"
        placeholder="Online / In-person"
        style={styles.input}
      />

      <TextInput
        label="Outcome"
        value={outcome}
        onChangeText={setOutcome}
        mode="outlined"
        placeholder="Pending / Passed / Failed"
        style={styles.input}
      />

      <Text style={styles.label}>Select Application</Text>

      {applications.map((application: any) => (
        <Card
          key={application._id || application.id}
          style={[
            styles.applicationCard,
            selectedApplicationId === (application._id || application.id) &&
              styles.selectedCard,
          ]}
          onPress={() =>
            setSelectedApplicationId(application._id || application.id)
          }
        >
          <Card.Content>
            <Text style={styles.applicationName}>
              {application.roleTitle || "Untitled Role"}
            </Text>
            <Text>
              {application.company?.name || application.companyName || "No company"}
            </Text>
          </Card.Content>
        </Card>
      ))}

      <TextInput
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
      />

      <Button
        mode="contained"
        buttonColor="#1976D2"
        textColor="white"
        onPress={handleSave}
        loading={loading}
        style={styles.saveButton}
      >
        Save Interview
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 24,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "white",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  applicationCard: {
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: "white",
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#1976D2",
  },
  applicationName: {
    fontWeight: "bold",
  },
  saveButton: {
    marginTop: 10,
    borderRadius: 10,
  },
});