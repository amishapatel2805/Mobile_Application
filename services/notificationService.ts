import { Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== "granted") {
    Alert.alert(
      "Permission required",
      "Please allow notifications to receive reminders."
    );
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("job-tracker-reminders", {
      name: "Job Tracker Reminders",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  return true;
}

export async function scheduleApplicationReminder(
  companyName: string,
  roleTitle: string
) {
  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Application Reminder",
      body: `Follow up for ${roleTitle} at ${companyName}.`,
      sound: true,
    },
    trigger: {
      seconds: 10,
      channelId: "job-tracker-reminders",
    },
  });

  Alert.alert("Reminder set", "You will receive a notification in 10 seconds.");
}