"use client"

import { useEffect, useState } from "react"
import { View, Text, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title = "No tasks found",
  description = "Get started by creating your first task and boost your productivity!",
  actionLabel = "Create Your First Task",
  onAction,
}: EmptyStateProps) {
  const [fadeAnim] = useState(new Animated.Value(0))
  const [scaleAnim] = useState(new Animated.Value(0.8))
  const [bounceAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start()
  }, [fadeAnim, scaleAnim, bounceAnim])

  return (
    <Animated.View
      className="flex-1 items-center justify-center p-8"
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Animated.View
        className="items-center mb-8"
        style={{
          transform: [{ translateY: bounceAnim }],
        }}
      >
        {/* Animated Icon Container */}
        <View className="relative mb-6">
          <View className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center">
            <Ionicons name="checkmark-done" size={48} color="#3B82F6" />
          </View>

          {/* Floating particles */}
          <View className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full opacity-80" />
          <View className="absolute -bottom-1 -left-3 w-3 h-3 bg-green-400 rounded-full opacity-60" />
          <View className="absolute top-1/2 -right-4 w-2 h-2 bg-purple-400 rounded-full opacity-70" />
        </View>

        <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">{title}</Text>

        <Text className="text-base text-gray-600 dark:text-gray-400 text-center leading-6 max-w-sm">{description}</Text>
      </Animated.View>

      {onAction && (
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Button
            onPress={onAction}
            className="bg-blue-500 px-8 py-4 rounded-2xl shadow-lg"
            style={{
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center">
              <Ionicons name="add-circle" size={20} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white text-lg font-semibold">{actionLabel}</Text>
            </View>
          </Button>
        </Animated.View>
      )}

      {/* Decorative Elements */}
      <View className="absolute top-20 left-10 w-1 h-1 bg-blue-400 rounded-full opacity-40" />
      <View className="absolute top-32 right-16 w-1 h-1 bg-purple-400 rounded-full opacity-50" />
      <View className="absolute bottom-40 left-20 w-1 h-1 bg-green-400 rounded-full opacity-30" />
      <View className="absolute bottom-60 right-12 w-1 h-1 bg-yellow-400 rounded-full opacity-60" />
    </Animated.View>
  )
}
