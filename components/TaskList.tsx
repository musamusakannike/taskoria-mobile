"use client"

import type { Task, TaskStatus } from "@/types/task"
import React, { useEffect, useState } from "react"
import { Animated, RefreshControl, ScrollView, Text, View } from "react-native"
import { EmptyState } from "./EmptyState"
import { TaskItem } from "./TaskItem"

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
  onToggleTaskStatus: (id: string) => void
  onCreateTask: () => void
}

export function TaskList({
  tasks,
  isLoading,
  onEditTask,
  onDeleteTask,
  onToggleTaskStatus,
  onCreateTask,
}: TaskListProps) {
  const [refreshing, setRefreshing] = useState(false)
  const [fadeAnim] = useState(() => new Animated.Value(0))
  const [slideAnim] = useState(() => new Animated.Value(50))
  const isMounted = React.useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!isLoading && isMounted.current) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isLoading, fadeAnim, slideAnim])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <View className="flex-1 px-4 pt-6">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Loading Tasks...</Text>
        <View className="space-y-4">
          {[1, 2, 3].map((index) => (
            <Animated.View
              key={index}
              className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 shadow-sm"
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <View className="flex-row items-center mb-4">
                <View className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full mr-4" />
                <View className="flex-1">
                  <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" style={{ width: "70%" }} />
                  <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded" style={{ width: "40%" }} />
                </View>
              </View>
              <View className="flex-row space-x-2">
                <View className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <View className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </View>
            </Animated.View>
          ))}
        </View>
      </View>
    )
  }

  if (tasks.length === 0) {
    return <EmptyState onAction={onCreateTask} />
  }

  const sections: { title: string; status: TaskStatus; tasks: Task[]; color: string; icon: string }[] = [
    {
      title: "To Do",
      status: "todo",
      tasks: tasks.filter((t) => t.status === "todo"),
      color: "#3B82F6",
      icon: "radio-button-off",
    },
    {
      title: "In Progress",
      status: "in-progress",
      tasks: tasks.filter((t) => t.status === "in-progress"),
      color: "#F59E0B",
      icon: "time",
    },
    {
      title: "Completed",
      status: "completed",
      tasks: tasks.filter((t) => t.status === "completed"),
      color: "#10B981",
      icon: "checkmark-circle",
    },
  ]

  return (
    <Animated.View
      className="flex-1"
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" colors={["#3B82F6"]} />
        }
      >
        {/* Header */}
        <View className="pt-6 pb-4">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Tasks</Text>
          <Text className="text-gray-600 dark:text-gray-400">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} total
          </Text>
        </View>

        {/* Task Sections */}
        {sections.map((section, sectionIndex) =>
          section.tasks.length > 0 ? (
            <Animated.View
              key={section.title}
              className="mb-8"
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, 50 + sectionIndex * 20],
                    }),
                  },
                ],
              }}
            >
              {/* Section Header */}
              <View className="flex-row items-center mb-4">
                <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: section.color }} />
                <Text className="text-xl font-bold text-gray-900 dark:text-white">{section.title}</Text>
                <View className="ml-auto bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">{section.tasks.length}</Text>
                </View>
              </View>

              {/* Tasks */}
              <View className="space-y-3">
                {section.tasks.map((task, taskIndex) => (
                  <Animated.View
                    key={task.id}
                    style={{
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateY: slideAnim.interpolate({
                            inputRange: [0, 50],
                            outputRange: [0, 50 + taskIndex * 10],
                          }),
                        },
                      ],
                    }}
                  >
                    <TaskItem
                      task={task}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onToggleStatus={onToggleTaskStatus}
                    />
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          ) : null,
        )}

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>
    </Animated.View>
  )
}
