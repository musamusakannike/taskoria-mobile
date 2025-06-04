"use client"

import { useState, useEffect } from "react"
import { View, Text, Switch, TouchableOpacity, Modal, ScrollView, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Notifications from "expo-notifications"
import {
    getNotificationSettings,
    saveNotificationSettings,
    requestNotificationPermissions,
    rescheduleAllReminders,
    type NotificationSettings as NotificationSettingsType,
} from "@/services/NotificationService"
import type { Task } from "@/types/task"

interface NotificationSettingsProps {
    visible: boolean
    onClose: () => void
    tasks: Task[]
}

export function NotificationSettings({ visible, onClose, tasks }: NotificationSettingsProps) {
    const [settings, setSettings] = useState<NotificationSettingsType>({
        enabled: true,
        reminderTime: 30,
        soundEnabled: true,
    })
    const [permissionStatus, setPermissionStatus] = useState<string | null>(null)
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(0))

    // Reminder time options in minutes
    const reminderOptions = [
        { label: "At time of due date", value: 0 },
        { label: "5 minutes before", value: 5 },
        { label: "15 minutes before", value: 15 },
        { label: "30 minutes before", value: 30 },
        { label: "1 hour before", value: 60 },
        { label: "2 hours before", value: 120 },
        { label: "1 day before", value: 1440 },
    ]

    // Load settings when modal opens
    useEffect(() => {
        if (visible) {
            loadSettings()
            checkPermissions()

            // Animate in
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start()
        } else {
            // Animate out
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start()
        }
    }, [visible, fadeAnim, slideAnim])

    const loadSettings = async () => {
        const savedSettings = await getNotificationSettings()
        setSettings(savedSettings)
    }

    const checkPermissions = async () => {
        const { status } = await Notifications.getPermissionsAsync()
        setPermissionStatus(status)
    }

    const handleRequestPermissions = async () => {
        const granted = await requestNotificationPermissions()
        setPermissionStatus(granted ? "granted" : "denied")

        // Update settings
        setSettings((prev) => ({ ...prev, enabled: granted }))
        await saveNotificationSettings({ ...settings, enabled: granted })
    }

    const handleToggleEnabled = async (value: boolean) => {
        if (value && permissionStatus !== "granted") {
            // If trying to enable but don't have permissions, request them
            await handleRequestPermissions()
        } else {
            // Otherwise just update the setting
            const newSettings = { ...settings, enabled: value }
            setSettings(newSettings)
            await saveNotificationSettings(newSettings)
            await rescheduleAllReminders(tasks)
        }
    }

    const handleToggleSound = async (value: boolean) => {
        const newSettings = { ...settings, soundEnabled: value }
        setSettings(newSettings)
        await saveNotificationSettings(newSettings)
        await rescheduleAllReminders(tasks)
    }

    const handleSetReminderTime = async (minutes: number) => {
        const newSettings = { ...settings, reminderTime: minutes }
        setSettings(newSettings)
        await saveNotificationSettings(newSettings)
        await rescheduleAllReminders(tasks)
    }

    return (
        <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
            <Animated.View className="flex-1 bg-black/50 justify-center items-center" style={{ opacity: fadeAnim }}>
                <Animated.View
                    className="bg-white dark:bg-gray-900 w-[90%] max-w-md rounded-2xl overflow-hidden"
                    style={{
                        transform: [
                            {
                                scale: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.9, 1],
                                }),
                            },
                        ],
                    }}
                >
                    {/* Header */}
                    <View className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-xl font-bold text-gray-900 dark:text-white">Notification Settings</Text>
                            <TouchableOpacity onPress={onClose} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                                <Ionicons name="close" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView className="max-h-[70vh]">
                        <View className="p-6">
                            {/* Enable Notifications */}
                            <View className="mb-6">
                                <View className="flex-row justify-between items-center mb-2">
                                    <View className="flex-row items-center">
                                        <Ionicons name="notifications" size={20} color="#3B82F6" className="mr-2" />
                                        <Text className="text-lg font-semibold text-gray-900 dark:text-white">Enable Reminders</Text>
                                    </View>
                                    <Switch
                                        value={settings.enabled && permissionStatus === "granted"}
                                        onValueChange={handleToggleEnabled}
                                        trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                                        thumbColor={settings.enabled ? "#FFFFFF" : "#F3F4F6"}
                                    />
                                </View>

                                {permissionStatus !== "granted" && (
                                    <View className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-xl mb-4">
                                        <Text className="text-amber-800 dark:text-amber-300">
                                            Notification permissions are required to receive reminders.
                                        </Text>
                                        <TouchableOpacity
                                            onPress={handleRequestPermissions}
                                            className="bg-amber-500 mt-2 py-2 px-4 rounded-lg self-start"
                                        >
                                            <Text className="text-white font-medium">Grant Permission</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <Text className="text-gray-600 dark:text-gray-400">Receive reminders for tasks with due dates.</Text>
                            </View>

                            {/* Reminder Time */}
                            <View className="mb-6">
                                <View className="flex-row items-center mb-4">
                                    <Ionicons name="time" size={20} color="#3B82F6" className="mr-2" />
                                    <Text className="text-lg font-semibold text-gray-900 dark:text-white">Default Reminder Time</Text>
                                </View>

                                <View className="space-y-2">
                                    {reminderOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            onPress={() => handleSetReminderTime(option.value)}
                                            className={`
                        flex-row items-center p-4 rounded-xl border
                        ${settings.reminderTime === option.value
                                                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                                                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                                }
                      `}
                                        >
                                            <View
                                                className={`
                        w-5 h-5 rounded-full border-2 mr-3
                        ${settings.reminderTime === option.value
                                                        ? "border-blue-500 bg-blue-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                    }
                      `}
                                            >
                                                {settings.reminderTime === option.value && (
                                                    <View className="w-2 h-2 bg-white rounded-full m-auto" />
                                                )}
                                            </View>
                                            <Text
                                                className={`
                        ${settings.reminderTime === option.value
                                                        ? "text-blue-700 dark:text-blue-300 font-medium"
                                                        : "text-gray-700 dark:text-gray-300"
                                                    }
                      `}
                                            >
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Sound */}
                            <View className="mb-6">
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-row items-center">
                                        <Ionicons name="volume-high" size={20} color="#3B82F6" className="mr-2" />
                                        <Text className="text-lg font-semibold text-gray-900 dark:text-white">Sound</Text>
                                    </View>
                                    <Switch
                                        value={settings.soundEnabled}
                                        onValueChange={handleToggleSound}
                                        trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                                        thumbColor={settings.soundEnabled ? "#FFFFFF" : "#F3F4F6"}
                                    />
                                </View>
                                <Text className="text-gray-600 dark:text-gray-400 mt-2">
                                    Play a sound when reminders are displayed.
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View className="p-6 border-t border-gray-100 dark:border-gray-800">
                        <TouchableOpacity
                            onPress={onClose}
                            className="bg-blue-500 py-4 rounded-xl items-center shadow-lg"
                            style={{
                                shadowColor: "#3B82F6",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 4,
                            }}
                        >
                            <Text className="text-white font-semibold text-base">Save Settings</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    )
}
