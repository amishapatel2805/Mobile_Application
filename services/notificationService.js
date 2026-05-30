import * as Notifications from "expo-notifications";

export async function scheduleInterviewReminder(companyName, interviewDate) {
  const permission = await Notifications.requestPermissionsAsync();

  if (!permission.granted) {
    return {
      success: false,
      message: "Notification permission was not granted.",
    };
  }

  const interviewTime = new Date(interviewDate).getTime();
  const reminderTime = interviewTime - 24 * 60 * 60 * 1000;
  const now = Date.now();

  if (reminderTime <= now) {
    return {
      success: false,
      message: "Interview is less than 24 hours away, so reminder was not scheduled.",
    };
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Interview Reminder",
      body: `You have an interview with ${companyName} tomorrow.`,
    },
    trigger: {
      date: new Date(reminderTime),
    },
  });

  return {
    success: true,
    message: "Interview reminder scheduled successfully.",
  };
}