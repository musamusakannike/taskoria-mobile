import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'default', 
  className = '' 
}: BadgeProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100 dark:bg-gray-800';
      case 'outline':
        return 'border border-gray-300 dark:border-gray-600 bg-transparent';
      case 'destructive':
        return 'bg-red-100 dark:bg-red-900';
      default:
        return 'bg-blue-100 dark:bg-blue-900';
    }
  };

  const getTextClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'text-gray-700 dark:text-gray-300';
      case 'outline':
        return 'text-gray-700 dark:text-gray-300';
      case 'destructive':
        return 'text-red-800 dark:text-red-200';
      default:
        return 'text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <View className={`
      ${getVariantClasses()}
      px-2 py-1 rounded-full flex-row items-center
      ${className}
    `}>
      <Text className={`text-xs font-medium ${getTextClasses()}`}>
        {children}
      </Text>
    </View>
  );
}