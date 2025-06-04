import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/types/task";
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { Text, View } from "react-native";

interface TaskItemProps {
    task: Task
    onEdit: (task: Task) => void
    onDelete: (id: string) => void
    onToggleStatus: (id: string) => void
}

export function TaskItem({ task, onEdit, onDelete, onToggleStatus }: TaskItemProps) {
    const getPriorityClass = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            case "medium":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            case "low":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            default:
                return ""
        }
    }

    const getStatusClass = (status: string) => {
        switch (status) {
            case "todo":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            case "in-progress":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
            case "completed":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            default:
                return ""
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

    const completedSubtasks = task.subtasks.filter(st => st.completed).length
    const totalSubtasks = task.subtasks.length
    const subtasksProgress = totalSubtasks > 0 ? `${completedSubtasks}/${totalSubtasks}` : 'No subtasks'

    return (
        <View className={`rounded-md border border-border p-4 mb-4 ${task.status === 'completed' ? 'opacity-75' : ''}`}>
            <View className="flex-row justify-between items-start">
                <View className="flex-row items-center gap-3 flex-1 pr-2">
                    <Checkbox
                        checked={task.status === 'completed'}
                        onChange={() => onToggleStatus(task.id)}
                    />
                    <Text className={`text-lg font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                    </Text>
                </View>
                <View className="flex-row gap-2">
                    <Button variant="outline" size="icon" onPress={() => onEdit(task)}>
                        <Feather name="edit-2" size={16} color="#6366f1" />
                    </Button>
                    <Button variant="outline" size="icon" onPress={() => onDelete(task.id)}>
                        <Feather name="trash-2" size={16} color="#ef4444" />
                    </Button>
                </View>
            </View>

            {task.description ? (
                <Text className="mt-2 text-sm text-muted-foreground">
                    {task.description}
                </Text>
            ) : null}

            <View className="mt-4 flex-row flex-wrap gap-2">
                <Badge className={getPriorityClass(task.priority)} variant="outline">
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </Badge>

                <Badge className={getStatusClass(task.status)} variant="outline">
                    {getStatusLabel(task.status)}
                </Badge>

                {task.subtasks.length > 0 && (
                    <Badge variant="outline" className="flex-row items-center">
                        <Feather name="check-square" size={12} color="#22c55e" style={{ marginRight: 4 }} />
                        {subtasksProgress}
                    </Badge>
                )}

                {task.dueDate && (
                    <Badge variant="outline" className="flex-row items-center">
                        <MaterialCommunityIcons name="calendar" size={12} color="#6366f1" style={{ marginRight: 4 }} />
                        {new Date(task.dueDate).toLocaleDateString()}
                    </Badge>
                )}
            </View>

            {task.tags.length > 0 && (
                <View className="mt-3 flex-row flex-wrap gap-2">
                    {task.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                </View>
            )}

            <Text className="mt-4 text-xs text-muted-foreground">
                Updated {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
            </Text>
        </View>
    )
}
