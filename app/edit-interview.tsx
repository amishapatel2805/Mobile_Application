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
import { updateInterview } from "../services/interviewService";
import { fetchApplications } from "../services/applicationService";

export default function EditInterviewScreen() {
  const params = useLocalSearchParams();

  const [round, setRound] = useState(String(params.round || ""));
  const [interviewDate, setInterviewDate] = useState(
    params.interviewDate
      ? new Date(String(params.interviewDate))
      : new Date()
  );
  const [mode, setMode] = useState(String(params.mode || "Online"));
  const [outcome, setOutcome] = useState(String(params.outcome || "Pending"));
  const [notes, setNotes] = useState(String(params.notes || ""));
  const [loading, setLoading] = useState(false);

  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState(
    String(params.application || "")
  );
  const [selectedApplicationName, setSelectedApplicationName] = useState(
    String(params.applicationName || "Select application")
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modeMenuVisible, setModeMenuVisible] = useState(false);
  const [outcomeMenuVisible, setOutcomeMenuVisible] = useState(false);
  const [applicationMenuVisible, setApplicationMenuVisible] = useState(false);

  async function loadApplications() {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const result = await fetchApplications(token, 1, "", "newest", 100);

    if (result.success) {
      setApplications(result.data || []);
    }
  }

  async function handleUpdate() {
    if (!round || !selectedApplicationId) {
      Alert.alert("Missing details", "Please enter round and select application.");
      return;
    }

    setLoading(true);

    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    const result = await updateInterview(
      String(params.id),
      {
        round,
        interviewDate: interviewDate.toISOString().split("T")[0],
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

    Alert.alert("Success", "Interview updated successfully");
    router.replace("/(tabs)/interviews");
  }

  useEffect(() => {
    loadApplications();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Edit Interview</Text>

      <TextInput
        label="Round *"
        value={round}
        onChangeText={setRound}
        mode="outlined"
        style={styles.input}
        outlineColor="#D1D5DB"
        activeOutlineColor="#1976D2"
        textColor="#111827"
        theme={inputTheme}
      />

      <Text style={styles.label}>Interview Date</Text>
      <Button
        mode="outlined"
        style={styles.dropdown}
        contentStyle={styles.dropdownContent}
        labelStyle={styles.dropdownText}
        onPress={() => setShowDatePicker(true)}
      >
        {interviewDate.toLocaleDateString("en-AU")}
      </Button>

      {showDatePicker && (
        <View style={styles.datePickerBox}>
          <DateTimePicker
            value={interviewDate instanceof Date ? interviewDate : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            textColor="#111827"
            themeVariant="light"
            onChange={(event, selectedDate) => {
              if (Platform.OS !== "ios") {
                setShowDatePicker(false);
              }

              if (selectedDate) {
                setInterviewDate(selectedDate);
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

      <Text style={styles.label}>Mode</Text>
      <Menu
        visible={modeMenuVisible}
        onDismiss={() => setModeMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            style={styles.dropdown}
            contentStyle={styles.dropdownContent}
            labelStyle={styles.dropdownText}
            onPress={() => setModeMenuVisible(true)}
          >
            {mode}
          </Button>
        }
      >
        {["Online", "In-person", "Phone"].map((item) => (
          <Menu.Item
            key={item}
            title={item}
            onPress={() => {
              setMode(item);
              setModeMenuVisible(false);
            }}
          />
        ))}
      </Menu>

      <Text style={styles.label}>Outcome</Text>
      <Menu
        visible={outcomeMenuVisible}
        onDismiss={() => setOutcomeMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            style={styles.dropdown}
            contentStyle={styles.dropdownContent}
            labelStyle={styles.dropdownText}
            onPress={() => setOutcomeMenuVisible(true)}
          >
            {outcome}
          </Button>
        }
      >
        {["Pending", "Passed", "Failed"].map((item) => (
          <Menu.Item
            key={item}
            title={item}
            onPress={() => {
              setOutcome(item);
              setOutcomeMenuVisible(false);
            }}
          />
        ))}
      </Menu>

      <Text style={styles.label}>Select Application</Text>
      <Menu
        visible={applicationMenuVisible}
        onDismiss={() => setApplicationMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            style={styles.dropdown}
            contentStyle={styles.dropdownContent}
            labelStyle={[
              styles.dropdownText,
              !selectedApplicationId && styles.placeholderText,
            ]}
            onPress={() => setApplicationMenuVisible(true)}
          >
            {selectedApplicationName || "Select application"}
          </Button>
        }
      >
        {applications.map((item: any) => {
          const title = `${item.roleTitle || "Untitled Role"} - ${
            item.company?.name || item.companyName || "No company"
          }`;

          return (
            <Menu.Item
              key={item._id || item.id}
              title={title}
              onPress={() => {
                setSelectedApplicationId(item._id || item.id);
                setSelectedApplicationName(title);
                setApplicationMenuVisible(false);
              }}
            />
          );
        })}
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
        Update Interview
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