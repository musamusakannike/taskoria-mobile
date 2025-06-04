"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Platform,
  Animated,
  KeyboardAvoidingView,
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Ionicons } from "@expo/vector-icons"

// Types
interface Task {
  id: string
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string | null
  tags: string[]
  subtasks: SubTask[]
  createdAt: string
  updatedAt: string
}

interface SubTask {
  id: string
  title: string
  completed: boolean
}

type TaskPriority = "low" | "medium" | "high"
type TaskStatus = "todo" | "in-progress" | "completed"

interface TaskModalProps {
  task?: Task
  visible: boolean
  onClose: () => void
  onSave: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
  availableTags: string[]
}

const defaultTask: Omit<Task, "id" | "createdAt" | "updatedAt"> = {
  title: "",
  description: "",
  priority: "medium",
  status: "todo",
  dueDate: null,
  tags: [],
  subtasks: [],
}

export function TaskModal({ task, visible, onClose, onSave, availableTags }: TaskModalProps) {
  const [formState, setFormState] = useState<Omit<Task, "id" | "createdAt" | "updatedAt">>(defaultTask)
  const [newTag, setNewTag] = useState("")
  const [newSubtask, setNewSubtask] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [slideAnim] = useState(new Animated.Value(0))
  const [fadeAnim] = useState(new Animated.Value(0))
  const isEditing = !!task

  useEffect(() => {
    if (task) {
      setFormState(task)
    } else {
      setFormState(defaultTask)
    }
  }, [task])

  useEffect(() => {
    if (visible) {
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

  const handleInputChange = (
    field: keyof Task,
    value: string | string[] | boolean | null | TaskPriority | TaskStatus,
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formState.tags.includes(newTag.trim())) {
      setFormState((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormState((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const subtask: SubTask = {
        id: Date.now().toString() + Math.random().toString(),
        title: newSubtask.trim(),
        completed: false,
      }

      setFormState((prev) => ({
        ...prev,
        subtasks: [...prev.subtasks, subtask],
      }))

      setNewSubtask("")
    }
  }

  const handleSubtaskChange = (subtaskId: string, completed: boolean) => {
    setFormState((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((st) => (st.id === subtaskId ? { ...st, completed } : st)),
    }))
  }

  const handleRemoveSubtask = (subtaskId: string) => {
    setFormState((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((st) => st.id !== subtaskId),
    }))
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios")
    if (selectedDate) {
      handleInputChange("dueDate", selectedDate.toISOString())
    }
  }

  const handleSubmit = () => {
    if (!formState.title.trim()) {
      Alert.alert("Error", "Please enter a title for the task")
      return
    }
    onSave(formState)
    onClose()
  }

  const getPriorityConfig = (priority: TaskPriority) => {
    switch (priority) {
      case "low":
        return {
          color: "#10B981",
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-200 dark:border-green-800",
        }
      case "medium":
        return {
          color: "#F59E0B",
          bg: "bg-amber-50 dark:bg-amber-900/20",
          border: "border-amber-200 dark:border-amber-800",
        }
      case "high":
        return { color: "#EF4444", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800" }
      default:
        return { color: "#6B7280", bg: "bg-gray-50 dark:bg-gray-800", border: "border-gray-200 dark:border-gray-700" }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Modal visible={visible} animationType="none" presentationStyle="pageSheet" onRequestClose={onClose}>
      <Animated.View
        className="flex-1 bg-white dark:bg-gray-900"
        style={{
          opacity: fadeAnim,
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
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <TouchableOpacity onPress={onClose} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditing ? "Edit Task" : "Create New Task"}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {isEditing ? "Update your task details" : "Add a new task to your list"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-blue-500 px-6 py-3 rounded-xl shadow-lg"
              style={{
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Text className="text-white font-semibold">{isEditing ? "Save" : "Create"}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Task Title
              </Text>
              <TextInput
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 text-lg"
                value={formState.title}
                onChangeText={(text) => handleInputChange("title", text)}
                placeholder="Enter a descriptive title..."
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Description
              </Text>
              <TextInput
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 min-h-[100px]"
                value={formState.description}
                onChangeText={(text) => handleInputChange("description", text)}
                placeholder="Add more details about this task..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Priority and Status */}
            <View className="flex-row gap-4 mb-6">
              {/* Priority */}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                  Priority Level
                </Text>
                <View className="gap-2">
                  {(["low", "medium", "high"] as TaskPriority[]).map((priority) => {
                    const config = getPriorityConfig(priority)
                    const isSelected = formState.priority === priority

                    return (
                      <TouchableOpacity
                        key={priority}
                        onPress={() => handleInputChange("priority", priority)}
                        className={`
                          flex-row items-center p-4 rounded-xl border-2
                          ${isSelected ? `${config.bg} ${config.border}` : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"}
                        `}
                      >
                        <View className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: config.color }} />
                        <Text
                          className={`capitalize font-medium ${isSelected ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                            }`}
                        >
                          {priority} Priority
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={config.color}
                            style={{ marginLeft: "auto" }}
                          />
                        )}
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>

              {/* Status */}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                  Current Status
                </Text>
                <View className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  {(["todo", "in-progress", "completed"] as TaskStatus[]).map((status, index) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => handleInputChange("status", status)}
                      className={`
                        p-4 ${index > 0 ? "border-t border-gray-200 dark:border-gray-700" : ""}
                        ${formState.status === status ? "bg-blue-50 dark:bg-blue-900/30" : "bg-gray-50 dark:bg-gray-800"}
                      `}
                    >
                      <Text
                        className={`font-medium ${formState.status === status
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {status === "todo" ? "To Do" : status === "in-progress" ? "In Progress" : "Completed"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Due Date */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Due Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex-row items-center bg-gray-50 dark:bg-gray-800"
              >
                <Ionicons name="calendar" size={24} color="#3B82F6" />
                <Text className="ml-3 text-gray-900 dark:text-white font-medium flex-1">
                  {formState.dueDate ? formatDate(formState.dueDate) : "Select a due date"}
                </Text>
                {formState.dueDate && (
                  <TouchableOpacity onPress={() => handleInputChange("dueDate", null)}>
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={formState.dueDate ? new Date(formState.dueDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Tags */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Tags
              </Text>
              <View className="flex-row gap-2 mb-4">
                <TextInput
                  className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800"
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Add a tag..."
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={handleAddTag} className="bg-blue-500 px-6 py-4 rounded-xl justify-center">
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {/* Available Tags */}
              {availableTags.length > 0 && (
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick Add:</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {availableTags
                      .filter((tag) => !formState.tags.includes(tag))
                      .map((tag) => (
                        <TouchableOpacity
                          key={tag}
                          onPress={() => {
                            if (!formState.tags.includes(tag)) {
                              handleInputChange("tags", [...formState.tags, tag])
                            }
                          }}
                          className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg"
                        >
                          <Text className="text-gray-700 dark:text-gray-300 text-sm">#{tag}</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              )}

              {/* Selected Tags */}
              {formState.tags.length > 0 && (
                <View className="flex-row flex-wrap gap-2">
                  {formState.tags.map((tag) => (
                    <View key={tag} className="bg-blue-500 px-3 py-2 rounded-lg flex-row items-center">
                      <Text className="text-white text-sm font-medium mr-2">#{tag}</Text>
                      <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                        <Ionicons name="close" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Subtasks */}
            <View className="mb-8">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Subtasks
              </Text>
              <View className="flex-row gap-2 mb-4">
                <TextInput
                  className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800"
                  value={newSubtask}
                  onChangeText={setNewSubtask}
                  placeholder="Add a subtask..."
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  onPress={handleAddSubtask}
                  className="bg-blue-500 px-6 py-4 rounded-xl justify-center items-center"
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {/* Subtasks List */}
              {formState.subtasks.length > 0 && (
                <View className="gap-2">
                  {formState.subtasks.map((subtask) => (
                    <View key={subtask.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl flex-row items-center">
                      <TouchableOpacity
                        onPress={() => handleSubtaskChange(subtask.id, !subtask.completed)}
                        className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${subtask.completed ? "bg-blue-500 border-blue-500" : "border-gray-300 dark:border-gray-600"
                          }`}
                      >
                        {subtask.completed && <Ionicons name="checkmark" size={16} color="white" />}
                      </TouchableOpacity>
                      <Text
                        className={`flex-1 ${subtask.completed
                          ? "line-through text-gray-500 dark:text-gray-400"
                          : "text-gray-900 dark:text-white"
                          }`}
                      >
                        {subtask.title}
                      </Text>
                      <TouchableOpacity onPress={() => handleRemoveSubtask(subtask.id)} className="p-2">
                        <Ionicons name="trash" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  )
}
