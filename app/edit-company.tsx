import { useState } from "react";
import { StyleSheet, Alert, ScrollView } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { updateCompany } from "../services/companyService";

export default function EditCompanyScreen() {
  const params = useLocalSearchParams();

  const [name, setName] = useState(String(params.name || ""));
  const [industry, setIndustry] = useState(String(params.industry || ""));
  const [location, setLocation] = useState(String(params.location || ""));
  const [website, setWebsite] = useState(String(params.website || ""));
  const [notes, setNotes] = useState(String(params.notes || ""));
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    if (!name || !industry || !location) {
      Alert.alert(
        "Missing details",
        "Please enter company name, industry and location."
      );
      return;
    }

    setLoading(true);

    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    const result = await updateCompany(
      String(params.id),
      {
        name,
        industry,
        location,
        website,
        notes,
      },
      token
    );

    setLoading(false);

    if (!result.success) {
      Alert.alert("Error", result.message);
      return;
    }

    Alert.alert("Success", "Company updated successfully");
    router.replace("/(tabs)/companies");
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Edit Company</Text>

      <TextInput
        label="Name *"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
        outlineColor="#D1D5DB"
        activeOutlineColor="#1976D2"
        textColor="#111827"
        theme={inputTheme}
      />

      <TextInput
        label="Industry *"
        value={industry}
        onChangeText={setIndustry}
        mode="outlined"
        style={styles.input}
        outlineColor="#D1D5DB"
        activeOutlineColor="#1976D2"
        textColor="#111827"
        theme={inputTheme}
      />

      <TextInput
        label="Location *"
        value={location}
        onChangeText={setLocation}
        mode="outlined"
        style={styles.input}
        outlineColor="#D1D5DB"
        activeOutlineColor="#1976D2"
        textColor="#111827"
        theme={inputTheme}
      />

      <TextInput
        label="Website"
        value={website}
        onChangeText={setWebsite}
        mode="outlined"
        style={styles.input}
        outlineColor="#D1D5DB"
        activeOutlineColor="#1976D2"
        textColor="#111827"
        autoCapitalize="none"
        keyboardType="url"
        theme={inputTheme}
      />

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
  input: {
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
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