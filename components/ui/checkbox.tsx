import React from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: number;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  size = 20,
  className = '',
}: CheckboxProps) {
  const [scaleAnim] = React.useState(new Animated.Value(1));

  const handlePress = () => {
    if (disabled) return;
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onChange(!checked);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      className={`${disabled ? 'opacity-50' : ''} ${className}`}
    >
      <Animated.View
        className={`
          border-2 rounded items-center justify-center
          ${checked 
            ? 'bg-blue-500 border-blue-500' 
            : 'bg-transparent border-gray-300 dark:border-gray-600'
          }
        `}
        style={{
          width: size,
          height: size,
          transform: [{ scale: scaleAnim }],
        }}
      >
        {checked && (
          <Ionicons 
            name="checkmark" 
            size={size * 0.7} 
            color="white" 
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}