import { useEffect, useState } from "react";
import {
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  View,
} from "react-native";
import { TextInput, Button, Text, Menu } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";

import { updateApplication } from "../services/applicationService";
import { fetchCompanies } from "../services/companyService";

export default function EditApplicationScreen() {
  const params = useLocalSearchParams();

  const [roleTitle, setRoleTitle] = useState(String(params.roleTitle || ""));
  const [status, setStatus] = useState(String(params.status || "Applied"));
  const [applicationDate, setApplicationDate] = useState(
    params.applicationDate ? new Date(String(params.applicationDate)) : new Date()
  );
  const [salaryExpectation, setSalaryExpectation] = useState(
    String(params.salaryExpectation || "")
  );
  const [company, setCompany] = useState(String(params.company || ""));
  const [selectedCompanyName, setSelectedCompanyName] = useState(
    String(params.companyName || "")
  );
  const [notes, setNotes] = useState(String(params.notes || ""));

  const [companies, setCompanies] = useState<any[]>([]);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [companyMenuVisible, setCompanyMenuVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

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

  async function handleUpdate() {
    if (!roleTitle || !company) {
      Alert.alert("Missing details", "Please enter role and select company.");
      return;
    }

    setLoading(true);

    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      setLoading(false);
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

    const result = await updateApplication(String(params.id), application, token);

    setLoading(false);

    if (!result.success) {
      Alert.alert("Error", result.message);
      return;
    }

    Alert.alert("Success", "Application updated successfully");
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
      <Text style={styles.heading}>Edit Application</Text>

      <TextInput
        label="Role *"
        value={roleTitle}
        onChangeText={setRoleTitle}
        mode="outlined"
        style={styles.input}
        outlineColor="#D1D5DB"
        activeOutlineColor="#1976D2"
        textColor="#111827"
        theme={inputTheme}
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
            value={applicationDate instanceof Date ? applicationDate : new Date()}
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
        theme={inputTheme}
      />

      <Button
        mode="contained"
        buttonColor="#1976D2"
        textColor="white"
        style={styles.saveButton}
        contentStyle={styles.saveButtonContent}
        onPress={handleUpdate}
        loading={loading}
        disabled={loading}
      >
        Update
      </Button>
    </ScrollView>
  );
}

const inputTheme = {
  colors: {
    onSurface: "#111827",
    onSurfaceVariant: "#6B7280",
  },
};

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
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
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
  notes: {
    backgroundColor: "#FFFFFF",
    minHeight: 90,
    marginBottom: 22,
  },
  saveButton: {
    borderRadius: 10,
    marginTop: 4,
  },
  saveButtonContent: {
    height: 52,
  },
});