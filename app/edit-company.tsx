import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useState } from "react";
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
        "Error",
        "Please enter company name, industry and location"
      );
      return;
    }

    setLoading(true);

    const token = await SecureStore.getItemAsync("token");

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
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Edit Company
      </Text>

      <TextInput
        label="Company Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Industry"
        value={industry}
        onChangeText={setIndustry}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Location"
        value={location}
        onChangeText={setLocation}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Website"
        value={website}
        onChangeText={setWebsite}
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

      <Button mode="contained" onPress={handleUpdate} loading={loading}>
        Update Company
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 15,
  },
});