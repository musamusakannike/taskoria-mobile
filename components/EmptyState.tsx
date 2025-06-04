import React from "react"
import { View, Text } from "react-native"
import { CalendarCheck } from "lucide-react-native"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title = "No tasks found",
  description = "Get started by creating your first task",
  actionLabel = "Create Task",
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 h-[400px] items-center justify-center p-8 text-center">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <CalendarCheck size={32} className="dark:text-white" />
      </View>
      <Text className="mb-1 text-xl font-medium text-center dark:text-white">{title}</Text>
      <Text className="mb-4 max-w-xs text-center text-muted-foreground dark:text-white/70">
        {description}
      </Text>
      {onAction && (
        <Button onPress={onAction} className="bg-blue-500 w-full h-12" textClassName="text-white text-lg">
          {actionLabel}
        </Button>
      )}
    </View>
  )
}
