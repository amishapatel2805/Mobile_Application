import { useEffect, useState } from "react";
import { StyleSheet, Alert, ScrollView } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { updateApplication } from "../services/applicationService";
import { fetchCompanies } from "../services/companyService";

export default function EditApplicationScreen() {
  const params = useLocalSearchParams();

  const rawDate = String(params.applicationDate || "");
  const formattedDate = rawDate.includes("T")
    ? formatDateForDisplay(rawDate.split("T")[0])
    : rawDate;

  const [role, setRole] = useState(String(params.roleTitle || ""));
  const [status, setStatus] = useState(String(params.status || "Applied"));
  const [applicationDate, setApplicationDate] = useState(formattedDate);
  const [salaryExpectation, setSalaryExpectation] = useState(
    String(params.salaryExpectation || "")
  );
  const [notes, setNotes] = useState(String(params.notes || ""));

  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    String(params.company || "")
  );

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

  function formatDateForDisplay(dateText: string) {
    const parts = dateText.split("-");

    if (parts.length !== 3) {
      return dateText;
    }

    const [year, month, day] = parts;

    return `${day}-${month}-${year}`;
  }

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
    if (!role || !applicationDate || !selectedCompanyId) {
      Alert.alert(
        "Error",
        "Please enter role, application date and select a company"
      );
      return;
    }

    setLoading(true);

    const token = await SecureStore.getItemAsync("token");

    const result = await updateApplication(
      String(params.id),
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

    Alert.alert("Success", "Application updated successfully");
    router.replace("/(tabs)/applications");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>
        Edit Application
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
        onPress={handleUpdate}
        loading={loading}
        style={styles.saveButton}
      >
        Update Application
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