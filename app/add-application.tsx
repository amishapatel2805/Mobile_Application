import { useEffect, useState } from "react";
import { StyleSheet, Alert, ScrollView } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { createApplication } from "../services/applicationService";
import { fetchCompanies } from "../services/companyService";

export default function AddApplicationScreen() {
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [applicationDate, setApplicationDate] = useState("");
  const [salaryExpectation, setSalaryExpectation] = useState("");
  const [notes, setNotes] = useState("");

  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadCompanies() {
    const token = await SecureStore.getItemAsync("token");
    const result = await fetchCompanies(token);

    if (result.success) {
      setCompanies(result.data || []);
    }
  }

  useEffect(() => {
    loadCompanies();
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
    if (!role || !applicationDate || !selectedCompanyId) {
      Alert.alert(
        "Error",
        "Please enter role, application date and select a company"
      );
      return;
    }

    setLoading(true);

    const token = await SecureStore.getItemAsync("token");

    const result = await createApplication(
      {
        roleTitle: role,
        status,
        applicationDate: convertDateToBackendFormat(applicationDate),
        salaryExpectation,
        company: selectedCompanyId,
        notes,
      },
      token
    );

    setLoading(false);

    if (!result.success) {
      Alert.alert("Error", result.message);
      return;
    }

    Alert.alert("Success", "Application added successfully");
    router.replace("/(tabs)/applications");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>
        Add Application
      </Text>

      <TextInput
        label="Role"
        value={role}
        onChangeText={setRole}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Status"
        value={status}
        onChangeText={setStatus}
        mode="outlined"
        placeholder="Applied / Under Review / Interview Scheduled"
        style={styles.input}
      />

      <TextInput
        label="Application Date"
        value={applicationDate}
        onChangeText={setApplicationDate}
        mode="outlined"
        placeholder="DD-MM-YYYY"
        style={styles.input}
      />

      <TextInput
        label="Salary Expectation"
        value={salaryExpectation}
        onChangeText={setSalaryExpectation}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Select Company</Text>

      {companies.map((company: any) => (
        <Card
          key={company._id || company.id}
          style={[
            styles.companyCard,
            selectedCompanyId === (company._id || company.id) &&
              styles.selectedCard,
          ]}
          onPress={() => setSelectedCompanyId(company._id || company.id)}
        >
          <Card.Content>
            <Text style={styles.companyName}>{company.name}</Text>
            <Text>{company.industry}</Text>
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
        Save Application
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
  companyCard: {
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: "white",
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#1976D2",
  },
  companyName: {
    fontWeight: "bold",
  },
  saveButton: {
    marginTop: 10,
    borderRadius: 10,
  },
});