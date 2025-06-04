"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useState } from "react"
import Toast from "react-native-toast-message"
import type { SubTask, Task, TaskFilter, TaskStatus } from "../types/task"
import {
  scheduleTaskReminder,
  cancelTaskReminder,
  initializeNotifications,
  handleTaskUpdate,
} from "@/services/NotificationService"

// Custom UUID fallback for React Native Hermes
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<TaskFilter>({
    search: "",
    status: "all",
    priority: "all",
    tags: [],
  })

  // Initialize notifications when the hook is first used
  useEffect(() => {
    initializeNotifications()
  }, [])

  // Load tasks from AsyncStorage on initial render
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true)
        const savedTasks = await AsyncStorage.getItem("tasks")
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks))
        }
      } catch (error) {
        console.error("Error loading tasks:", error)
        Toast.show({
          type: "error",
          text1: "Error loading tasks",
          text2: "There was an error loading your tasks.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [])

  // Save tasks to AsyncStorage whenever tasks change
  useEffect(() => {
    const saveTasks = async () => {
      if (!isLoading) {
        try {
          await AsyncStorage.setItem("tasks", JSON.stringify(tasks))
        } catch (error) {
          console.error("Error saving tasks:", error)
        }
      }
    }

    saveTasks()
  }, [tasks, isLoading])

  // Create a new task
  const createTask = async (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setTasks((prevTasks) => [...prevTasks, newTask])

    // Schedule notification if task has due date
    if (newTask.dueDate) {
      await scheduleTaskReminder(newTask)
    }

    Toast.show({
      type: "success",
      text1: "Task created",
      text2: "Your task has been created successfully.",
    })

    return newTask
  }

  // Update an existing task
  const updateTask = async (id: string, updates: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>) => {
    let updatedTask: Task | undefined

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === id) {
          updatedTask = {
            ...task,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
          return updatedTask
        }
        return task
      }),
    )

    // Update notification if task has due date or status changed
    if (updatedTask) {
      await handleTaskUpdate(updatedTask)
    }

    Toast.show({
      type: "success",
      text1: "Task updated",
      text2: "Your task has been updated successfully.",
    })
  }

  // Delete a task
  const deleteTask = async (id: string) => {
    // Cancel any scheduled notifications for this task
    await cancelTaskReminder(id)

    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))

    Toast.show({
      type: "success",
      text1: "Task deleted",
      text2: "Your task has been deleted.",
    })
  }

  // Toggle task status
  const toggleTaskStatus = async (id: string) => {
    let updatedTask: Task | undefined

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === id) {
          const newStatus: TaskStatus =
            task.status === "todo" ? "in-progress" : task.status === "in-progress" ? "completed" : "todo"

          updatedTask = {
            ...task,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          }

          return updatedTask
        }
        return task
      }),
    )

    // If task is completed, cancel the notification
    // If task is uncompleted, reschedule the notification
    if (updatedTask) {
      await handleTaskUpdate(updatedTask)
    }
  }

  // Add a subtask
  const addSubtask = (taskId: string, title: string) => {
    const newSubtask: SubTask = {
      id: uuidv4(),
      title,
      completed: false,
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: [...task.subtasks, newSubtask],
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    )

    return newSubtask
  }

  // Toggle subtask completion
  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map((subtask) =>
            subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
          )
          return {
            ...task,
            subtasks: updatedSubtasks,
            updatedAt: new Date().toISOString(),
          }
        }
        return task
      }),
    )
  }

  // Delete subtask
  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
            updatedAt: new Date().toISOString(),
          }
        }
        return task
      }),
    )
  }

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Filter by search text
    const matchesSearch = filter.search
      ? task.title.toLowerCase().includes(filter.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filter.search.toLowerCase())
      : true

    // Filter by status
    const matchesStatus = filter.status === "all" || task.status === filter.status

    // Filter by priority
    const matchesPriority = filter.priority === "all" || task.priority === filter.priority

    // Filter by tags
    const matchesTags = filter.tags.length === 0 || filter.tags.some((tag) => task.tags.includes(tag))

    return matchesSearch && matchesStatus && matchesPriority && matchesTags
  })

  // Get all tags
  const allTags = Array.from(new Set(tasks.flatMap((task) => task.tags))).sort()

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    isLoading,
    filter,
    setFilter,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    allTags,
  }
}
