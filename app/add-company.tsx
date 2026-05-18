import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useState } from "react";
import { router } from "expo-router";

export default function AddCompanyScreen() {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");

  function handleSave() {
    if (!name || !industry) {
      Alert.alert("Error", "Please enter company name and industry");
      return;
    }

    Alert.alert("Success", "Company added successfully");
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Add Company
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

      <Button mode="contained" onPress={handleSave}>
        Save Company
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