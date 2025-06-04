"use client"

import { TaskList } from "@/components/TaskList"
import { TaskModal } from "@/components/TaskModal"
import { SidebarToggleButton, TaskSidebar } from "@/components/TaskSidebar"
import { NotificationSettings } from "@/components/NotificationSettings"
import { useTasks } from "@/hooks/useTasks"
import type { Task } from "@/types/task"
import { useState, useEffect } from "react"
import { View, StatusBar, Animated, Platform, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

export default function Index() {
  const {
    tasks,
    allTasks,
    isLoading,
    filter,
    setFilter,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    allTags,
  } = useTasks()

  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [notificationSettingsVisible, setNotificationSettingsVisible] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [fadeAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  const handleAddTask = () => {
    setEditingTask(undefined)
    setModalVisible(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setModalVisible(true)
  }

  const handleSaveTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData)
    } else {
      createTask(taskData)
    }
    setModalVisible(false)
    setEditingTask(undefined)
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={Platform.OS === "android"} />
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
          {/* Header with notification settings button */}
          <View className="flex-row justify-end px-4 py-2">
            <TouchableOpacity
              onPress={() => setNotificationSettingsVisible(true)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <Ionicons name="notifications" size={24} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View className="flex-1">
            <TaskList
              tasks={tasks}
              isLoading={isLoading}
              onEditTask={handleEditTask}
              onDeleteTask={deleteTask}
              onToggleTaskStatus={toggleTaskStatus}
              onCreateTask={handleAddTask}
            />
          </View>

          {/* Floating Action Button */}
          <SidebarToggleButton onPress={() => setSidebarVisible(true)} />

          {/* Sidebar */}
          <TaskSidebar
            filter={filter}
            onFilterChange={setFilter}
            allTags={allTags}
            onAddTask={handleAddTask}
            visible={sidebarVisible}
            onClose={() => setSidebarVisible(false)}
          />

          {/* Task Modal */}
          <TaskModal
            task={editingTask}
            visible={modalVisible}
            onClose={() => {
              setModalVisible(false)
              setEditingTask(undefined)
            }}
            onSave={handleSaveTask}
            availableTags={allTags}
          />

          {/* Notification Settings Modal */}
          <NotificationSettings
            visible={notificationSettingsVisible}
            onClose={() => setNotificationSettingsVisible(false)}
            tasks={allTasks}
          />
        </Animated.View>
      </SafeAreaView>
    </>
  )
}
