import React from "react"
import { View, Text, ScrollView } from "react-native"
import { Task, TaskStatus } from "@/types/task"
import { TaskItem } from "./TaskItem"
import { EmptyState } from "./EmptyState"

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
    if (isLoading) {
        return (
            <View className="h-[400px] justify-center items-center">
                <View className="space-y-4 w-full px-4">
                    <View className="h-16 w-full bg-muted rounded-lg animate-pulse" />
                    <View className="h-16 w-full bg-muted rounded-lg animate-pulse" />
                    <View className="h-16 w-full bg-muted rounded-lg animate-pulse" />
                </View>
            </View>
        )
    }

    if (tasks.length === 0) {
        return <EmptyState onAction={onCreateTask} />
    }

    const sections: { title: string; status: TaskStatus; tasks: Task[] }[] = [
        { title: "To Do", status: "todo", tasks: tasks.filter((t) => t.status === "todo") },
        { title: "In Progress", status: "in-progress", tasks: tasks.filter((t) => t.status === "in-progress") },
        { title: "Completed", status: "completed", tasks: tasks.filter((t) => t.status === "completed") },
    ]

    return (
        <ScrollView className="space-y-8 px-4">
            {sections.map((section) =>
                section.tasks.length > 0 ? (
                    <View key={section.title} className="space-y-4">
                        <Text className="text-lg font-semibold dark:text-white">{section.title}</Text>
                        <View className="space-y-4">
                            {section.tasks.map((task) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onEdit={onEditTask}
                                    onDelete={onDeleteTask}
                                    onToggleStatus={onToggleTaskStatus}
                                />
                            ))}
                        </View>
                    </View>
                ) : null
            )}
        </ScrollView>
    )
}
