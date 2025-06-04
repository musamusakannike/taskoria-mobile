import type { Task } from "@/types/task";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Keys for AsyncStorage
const NOTIFICATION_SETTINGS_KEY = "notification_settings";
const NOTIFICATION_IDS_KEY = "notification_ids";

// Default notification settings
export interface NotificationSettings {
  enabled: boolean;
  reminderTime: number; // minutes before due date
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  reminderTime: 30, // 30 minutes before due date by default
  soundEnabled: true,
};

// Interface to store notification IDs for each task
interface NotificationMap {
  [taskId: string]: string; // taskId -> notificationId
}

/**
 * Request notification permissions
 * @returns Promise<boolean> - Whether permissions were granted
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  // Only ask if permissions have not been determined
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // Update settings based on permission result
  const settings = await getNotificationSettings();
  settings.enabled = finalStatus === "granted";
  await saveNotificationSettings(settings);

  return finalStatus === "granted";
}

/**
 * Get notification settings from AsyncStorage
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const settingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (settingsJson) {
      return JSON.parse(settingsJson);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Error getting notification settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save notification settings to AsyncStorage
 */
export async function saveNotificationSettings(
  settings: NotificationSettings
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      NOTIFICATION_SETTINGS_KEY,
      JSON.stringify(settings)
    );
  } catch (error) {
    console.error("Error saving notification settings:", error);
  }
}

/**
 * Get stored notification IDs
 */
async function getNotificationIds(): Promise<NotificationMap> {
  try {
    const idsJson = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    if (idsJson) {
      return JSON.parse(idsJson);
    }
    return {};
  } catch (error) {
    console.error("Error getting notification IDs:", error);
    return {};
  }
}

/**
 * Save notification ID mapping
 */
async function saveNotificationIds(ids: NotificationMap): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error("Error saving notification IDs:", error);
  }
}

/**
 * Schedule a notification for a task
 */
export async function scheduleTaskReminder(task: Task): Promise<void> {
  // Only schedule if the task has a due date and is not completed
  if (!task.dueDate || task.status === "completed") {
    return;
  }

  const settings = await getNotificationSettings();

  // Don't schedule if notifications are disabled
  if (!settings.enabled) {
    return;
  }

  // Cancel any existing notification for this task
  await cancelTaskReminder(task.id);

  // Calculate notification time (X minutes before due date)
  const dueDate = new Date(task.dueDate);
  const notificationTime = new Date(
    dueDate.getTime() - settings.reminderTime * 60 * 1000
  );

  // Don't schedule if the notification time is in the past
  if (notificationTime <= new Date()) {
    return;
  }

  try {
    // Schedule the notification with properly typed trigger
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Reminder: ${task.title}`,
        body: task.description || "This task is due soon!",
        data: { taskId: task.id },
        sound: settings.soundEnabled ? true : undefined,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notificationTime,
      },
    });

    // Store the notification ID
    const notificationIds = await getNotificationIds();
    notificationIds[task.id] = notificationId;
    await saveNotificationIds(notificationIds);
  } catch (error) {
    console.error("Error scheduling notification:", error);
  }
}

/**
 * Cancel a scheduled notification for a task
 */
export async function cancelTaskReminder(taskId: string): Promise<void> {
  try {
    const notificationIds = await getNotificationIds();
    const notificationId = notificationIds[taskId];

    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      delete notificationIds[taskId];
      await saveNotificationIds(notificationIds);
    }
  } catch (error) {
    console.error("Error canceling notification:", error);
  }
}

/**
 * Reschedule all notifications for tasks
 * Useful when notification settings change
 */
export async function rescheduleAllReminders(tasks: Task[]): Promise<void> {
  // Cancel all existing notifications
  const notificationIds = await getNotificationIds();
  for (const taskId of Object.keys(notificationIds)) {
    await cancelTaskReminder(taskId);
  }

  // Schedule new notifications for all tasks with due dates
  for (const task of tasks) {
    if (task.dueDate && task.status !== "completed") {
      await scheduleTaskReminder(task);
    }
  }
}

/**
 * Initialize the notification service
 */
export async function initializeNotifications(): Promise<void> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3B82F6",
    });
  }

  // Request permissions on initialization
  await requestNotificationPermissions();
}

/**
 * Handle task updates
 */
export async function handleTaskUpdate(task: Task): Promise<void> {
  if (task.dueDate && task.status !== "completed") {
    await scheduleTaskReminder(task);
  } else {
    await cancelTaskReminder(task.id);
  }
}
