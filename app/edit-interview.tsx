import { useState } from "react";
import { StyleSheet, Alert, ScrollView } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { updateInterview } from "../services/interviewService";

export default function EditInterviewScreen() {
  const params = useLocalSearchParams();

  const [round, setRound] = useState(String(params.round || ""));
  const [interviewDate, setInterviewDate] = useState(
    String(params.interviewDate || "")
  );
  const [mode, setMode] = useState(String(params.mode || "Online"));
  const [outcome, setOutcome] = useState(String(params.outcome || "Pending"));
  const [notes, setNotes] = useState(String(params.notes || ""));
  const [loading, setLoading] = useState(false);

  function convertDateToBackendFormat(dateText: string) {
    if (dateText.includes("T")) {
      return dateText.split("T")[0];
    }

    const parts = dateText.split("-");

    if (parts.length !== 3) {
      return dateText;
    }

    const [day, month, year] = parts;

    if (year.length === 4) {
      return `${year}-${month}-${day}`;
    }

    return dateText;
  }

  async function handleUpdate() {
    if (!round || !interviewDate) {
      Alert.alert("Error", "Please enter round and interview date");
      return;
    }

    setLoading(true);

    const token = await SecureStore.getItemAsync("token");

    const result = await updateInterview(
      String(params.id),
      {
        round,
        interviewDate: convertDateToBackendFormat(interviewDate),
        mode,
        outcome,
        application: String(params.application || ""),
        notes,
      },
      token
    );

    setLoading(false);

    if (!result.success) {
      Alert.alert("Error", result.message);
      return;
    }

    Alert.alert("Success", "Interview updated successfully");
    router.replace("/(tabs)/interviews");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>
        Edit Interview
      </Text>

      <TextInput
        label="Round"
        value={round}
        onChangeText={setRound}
        mode="outlined"
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
        style={styles.input}
      />

      <TextInput
        label="Outcome"
        value={outcome}
        onChangeText={setOutcome}
        mode="outlined"
        style={styles.input}
      />

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
        onPress={handleUpdate}
        loading={loading}
        style={styles.saveButton}
      >
        Update Interview
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  content: { padding: 20 },
  title: { marginBottom: 24, fontWeight: "bold" },
  input: { marginBottom: 16, backgroundColor: "white" },
  saveButton: { marginTop: 10, borderRadius: 10 },
});