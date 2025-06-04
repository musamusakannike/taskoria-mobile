import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/types/task";
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import { Text, View, Animated, TouchableOpacity, Alert } from "react-native";

interface TaskItemProps {
    task: Task
    onEdit: (task: Task) => void
    onDelete: (id: string) => void
    onToggleStatus: (id: string) => void
}

export function TaskItem({ task, onEdit, onDelete, onToggleStatus }: TaskItemProps) {
    const [scaleAnim] = useState(new Animated.Value(1))
    const [slideAnim] = useState(new Animated.Value(0))
    const [fadeAnim] = useState(new Animated.Value(1))

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case "high":
                return {
                    bgColor: "bg-red-50 dark:bg-red-900/20",
                    textColor: "text-red-700 dark:text-red-300",
                    borderColor: "border-red-200 dark:border-red-800",
                    icon: "alert-circle",
                    iconColor: "#EF4444"
                }
            case "medium":
                return {
                    bgColor: "bg-amber-50 dark:bg-amber-900/20",
                    textColor: "text-amber-700 dark:text-amber-300",
                    borderColor: "border-amber-200 dark:border-amber-800",
                    icon: "time",
                    iconColor: "#F59E0B"
                }
            case "low":
                return {
                    bgColor: "bg-green-50 dark:bg-green-900/20",
                    textColor: "text-green-700 dark:text-green-300",
                    borderColor: "border-green-200 dark:border-green-800",
                    icon: "chevron-down",
                    iconColor: "#10B981"
                }
            default:
                return {
                    bgColor: "bg-gray-50 dark:bg-gray-800",
                    textColor: "text-gray-700 dark:text-gray-300",
                    borderColor: "border-gray-200 dark:border-gray-700",
                    icon: "minus",
                    iconColor: "#6B7280"
                }
        }
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "todo":
                return {
                    bgColor: "bg-blue-50 dark:bg-blue-900/20",
                    textColor: "text-blue-700 dark:text-blue-300",
                    borderColor: "border-blue-200 dark:border-blue-800",
                    icon: "ellipse",
                    iconColor: "#3B82F6"
                }
            case "in-progress":
                return {
                    bgColor: "bg-purple-50 dark:bg-purple-900/20",
                    textColor: "text-purple-700 dark:text-purple-300",
                    borderColor: "border-purple-200 dark:border-purple-800",
                    icon: "play-circle",
                    iconColor: "#8B5CF6"
                }
            case "completed":
                return {
                    bgColor: "bg-green-50 dark:bg-green-900/20",
                    textColor: "text-green-700 dark:text-green-300",
                    borderColor: "border-green-200 dark:border-green-800",
                    icon: "check-circle",
                    iconColor: "#10B981"
                }
            default:
                return {
                    bgColor: "bg-gray-50 dark:bg-gray-800",
                    textColor: "text-gray-700 dark:text-gray-300",
                    borderColor: "border-gray-200 dark:border-gray-700",
                    icon: "ellipse",
                    iconColor: "#6B7280"
                }
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "todo":
                return "To Do"
            case "in-progress":
                return "In Progress"
            case "completed":
                return "Completed"
            default:
                return status
        }
    }

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.98,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start()
    }

    const handleDelete = () => {
        Alert.alert(
            "Delete Task",
            "Are you sure you want to delete this task? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        Animated.parallel([
                            Animated.timing(fadeAnim, {
                                toValue: 0,
                                duration: 300,
                                useNativeDriver: true,
                            }),
                            Animated.timing(slideAnim, {
                                toValue: -100,
                                duration: 300,
                                useNativeDriver: true,
                            }),
                        ]).start(() => onDelete(task.id))
                    }
                }
            ]
        )
    }

    const completedSubtasks = task.subtasks.filter(st => st.completed).length
    const totalSubtasks = task.subtasks.length
    const subtasksProgress = totalSubtasks > 0 ? `${completedSubtasks}/${totalSubtasks}` : null
    const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

    const priorityConfig = getPriorityConfig(task.priority)
    const statusConfig = getStatusConfig(task.status)

    return (
        <Animated.View
            style={{
                transform: [
                    { scale: scaleAnim },
                    { translateX: slideAnim }
                ],
                opacity: fadeAnim,
            }}
        >
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.95}
                className={`
                    bg-white dark:bg-gray-800 rounded-2xl p-6 mb-4 shadow-sm border
                    ${task.status === 'completed' ? 'opacity-80' : ''}
                    border-gray-100 dark:border-gray-700
                `}
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                }}
            >
                {/* Header */}
                <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-row items-center flex-1 pr-4">
                        <Checkbox
                            checked={task.status === 'completed'}
                            onChange={() => onToggleStatus(task.id)}
                            size={24}
                        />
                        <View className="flex-1 ml-4">
                            <Text className={`
                                text-lg font-semibold dark:text-white
                                ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900'}
                            `}>
                                {task.title}
                            </Text>
                            {task.description ? (
                                <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-5">
                                    {task.description}
                                </Text>
                            ) : null}
                        </View>
                    </View>
                    
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => onEdit(task)}
                            className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-xl"
                        >
                            <Ionicons name="pencil" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleDelete}
                            className="bg-red-50 dark:bg-red-900/30 p-2 rounded-xl"
                        >
                            <Ionicons name="trash" size={16} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Progress Bar for Subtasks */}
                {totalSubtasks > 0 && (
                    <View className="mb-4">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Subtasks Progress
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                                {subtasksProgress}
                            </Text>
                        </View>
                        <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <Animated.View
                                className="h-full bg-blue-500 rounded-full"
                                style={{
                                    width: `${progressPercentage}%`,
                                }}
                            />
                        </View>
                    </View>
                )}

                {/* Badges */}
                <View className="flex-row flex-wrap gap-2 mb-4">
                    <View className={`
                        ${priorityConfig.bgColor} ${priorityConfig.borderColor}
                        px-3 py-1 rounded-full border flex-row items-center
                    `}>
                        <Ionicons 
                            name={priorityConfig.icon as any} 
                            size={12} 
                            color={priorityConfig.iconColor}
                            style={{ marginRight: 4 }}
                        />
                        <Text className={`text-xs font-medium ${priorityConfig.textColor}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                        </Text>
                    </View>

                    <View className={`
                        ${statusConfig.bgColor} ${statusConfig.borderColor}
                        px-3 py-1 rounded-full border flex-row items-center
                    `}>
                        <Ionicons 
                            name={statusConfig.icon as any} 
                            size={12} 
                            color={statusConfig.iconColor}
                            style={{ marginRight: 4 }}
                        />
                        <Text className={`text-xs font-medium ${statusConfig.textColor}`}>
                            {getStatusLabel(task.status)}
                        </Text>
                    </View>

                    {task.dueDate && (
                        <View className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-full flex-row items-center">
                            <Ionicons name="calendar" size={12} color="#6B7280" style={{ marginRight: 4 }} />
                            <Text className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {new Date(task.dueDate).toLocaleDateString()}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Tags */}
                {task.tags.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mb-4">
                        {task.tags.map((tag) => (
                            <View key={tag} className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                                <Text className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                    #{tag}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Footer */}
                <View className="flex-row justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                        Updated {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                    </Text>
                    {totalSubtasks > 0 && (
                        <View className="flex-row items-center">
                            <Ionicons name="list" size={12} color="#6B7280" />
                            <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                {totalSubtasks} subtask{totalSubtasks !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    )
}
