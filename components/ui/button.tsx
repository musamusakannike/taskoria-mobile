import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  onPress?: () => void;
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  textClassName?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  onPress,
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  className = '',
  textClassName = '',
  style,
  textStyle,
}: ButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border border-gray-300 dark:border-gray-600 bg-transparent';
      case 'ghost':
        return 'bg-transparent';
      case 'destructive':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2';
      case 'lg':
        return 'px-6 py-4';
      case 'icon':
        return 'p-2 w-10 h-10';
      default:
        return 'px-4 py-3';
    }
  };

  const getTextClasses = () => {
    const baseClasses = 'font-medium text-center';
    switch (variant) {
      case 'outline':
        return `${baseClasses} text-gray-700 dark:text-gray-300`;
      case 'ghost':
        return `${baseClasses} text-gray-700 dark:text-gray-300`;
      case 'destructive':
        return `${baseClasses} text-white`;
      default:
        return `${baseClasses} text-white`;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        rounded-lg
        items-center
        justify-center
        ${disabled || loading ? 'opacity-50' : ''}
        ${className}
      `}
      style={style}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? '#6B7280' : 'white'} 
        />
      ) : (
        <Text 
          className={`${getTextClasses()} ${textClassName}`}
          style={textStyle}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}