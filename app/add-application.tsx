import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { TextInput, Button, Text, Menu } from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";

import { createApplication } from "../services/applicationService";
import { fetchCompanies } from "../services/companyService";

export default function AddApplicationScreen() {
  const [roleTitle, setRoleTitle] = useState("");
  const [status, setStatus] = useState("Applied");
  const [applicationDate, setApplicationDate] = useState(new Date());
  const [salaryExpectation, setSalaryExpectation] = useState("");
  const [company, setCompany] = useState("");
  const [selectedCompanyName, setSelectedCompanyName] = useState("");
  const [notes, setNotes] = useState("");

  const [companies, setCompanies] = useState<any[]>([]);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [companyMenuVisible, setCompanyMenuVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  async function loadCompanies() {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const result = await fetchCompanies(token, 1, "", "newest", 100);

    if (result.success) {
      setCompanies(result.data || []);
    }
  }

  async function handleSave() {
    if (!roleTitle || !company) {
      Alert.alert("Missing details", "Please enter role and select company.");
      return;
    }

    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const application = {
      roleTitle,
      status,
      applicationDate: applicationDate.toISOString().split("T")[0],
      salaryExpectation,
      company,
      notes,
    };

    const result = await createApplication(application, token);

    if (!result.success) {
      Alert.alert("Error", result.message);
      return;
    }

    Alert.alert("Success", "Application added successfully");
    router.replace("/(tabs)/applications");
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Add Application</Text>

      <TextInput
        label="Role *"
        value={roleTitle}
        onChangeText={setRoleTitle}
        mode="outlined"
        style={styles.input}
        outlineColor="#D1D5DB"
        textColor="#111827"
        theme={{
          colors: {
            onSurface: "#111827",
            onSurfaceVariant: "#111827",
          },
        }}
      />

      <Text style={styles.label}>Status</Text>
      <Menu
        visible={statusMenuVisible}
        onDismiss={() => setStatusMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            style={styles.dropdown}
            contentStyle={styles.dropdownContent}
            labelStyle={styles.dropdownText}
            onPress={() => setStatusMenuVisible(true)}
          >
            {status}
          </Button>
        }
      >
        {["Applied", "Interview Scheduled", "Offered", "Rejected"].map(
          (item) => (
            <Menu.Item
              key={item}
              title={item}
              onPress={() => {
                setStatus(item);
                setStatusMenuVisible(false);
              }}
            />
          )
        )}
      </Menu>

      <Text style={styles.label}>Application Date</Text>
      <Button
        mode="outlined"
        style={styles.dropdown}
        contentStyle={styles.dropdownContent}
        labelStyle={styles.dropdownText}
        onPress={() => setShowDatePicker(true)}
      >
        {applicationDate.toLocaleDateString("en-AU")}
      </Button>

      {showDatePicker && (
        <View style={styles.datePickerBox}>
          <DateTimePicker
            value={applicationDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            textColor="#111827"
            themeVariant="light"
            onChange={(event, selectedDate) => {
              if (Platform.OS !== "ios") {
                setShowDatePicker(false);
              }

              if (selectedDate) {
                setApplicationDate(selectedDate);
              }
            }}
          />

          {Platform.OS === "ios" ? (
            <Button
              mode="contained"
              buttonColor="#1976D2"
              textColor="white"
              style={styles.doneButton}
              onPress={() => setShowDatePicker(false)}
            >
              Done
            </Button>
          ) : null}
        </View>
      )}
      
        <Text style={styles.label}>Salary Expectation</Text>

          <TextInput
            label="Salary Expectation"
            value={salaryExpectation}
            onChangeText={setSalaryExpectation}
            mode="outlined"
            style={styles.input}
            outlineColor="#D1D5DB"
            activeOutlineColor="#1976D2"
            textColor="#111827"
            theme={{
              colors: {
                onSurface: "#111827",
                onSurfaceVariant: "#111827",
              },
            }}
          />

      <Text style={styles.label}>Company</Text>
      <Menu
        visible={companyMenuVisible}
        onDismiss={() => setCompanyMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            style={styles.dropdown}
            contentStyle={styles.dropdownContent}
            labelStyle={[
              styles.dropdownText,
              !selectedCompanyName && styles.placeholderText,
            ]}
            onPress={() => setCompanyMenuVisible(true)}
          >
            {selectedCompanyName || "Select company"}
          </Button>
        }
      >
        {companies.map((item: any) => (
          <Menu.Item
            key={item._id || item.id}
            title={item.name || item.companyName}
            onPress={() => {
              setCompany(item._id || item.id);
              setSelectedCompanyName(item.name || item.companyName);
              setCompanyMenuVisible(false);
            }}
          />
        ))}
      </Menu>

      <TextInput
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.notes}
        outlineColor="#D1D5DB"
        activeOutlineColor="#1976D2"
        textColor="#111827"
        theme={{
          colors: {
            onSurface: "#111827",
            onSurfaceVariant: "#111827",
          },
        }}
      />

      <Button
        mode="contained"
        buttonColor="#1976D2"
        textColor="white"
        style={styles.saveButton}
        onPress={handleSave}
      >
        Save
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 22,
    color: "#111827",
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 10,
    color: "#111827",
  },

  input: {
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },

  notes: {
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    minHeight: 85,
    color: "#111827",
  },
  dropdown: {
    marginBottom: 14,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    minHeight: 56,
  },
  dropdownContent: {
    justifyContent: "flex-start",
    minHeight: 56,
  },
  dropdownText: {
    color: "#111827",
    fontSize: 16,
    textAlign: "left",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  datePickerBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    marginBottom: 14,
    paddingVertical: 8,
  },
  doneButton: {
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 10,
  },
  saveButton: {
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 35,
  },
});