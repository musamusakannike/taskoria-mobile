import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    Switch,
    Dimensions,
    StatusBar,
    Platform,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface TaskFilter {
    status: 'all' | 'todo' | 'in-progress' | 'completed';
    priority: 'all' | 'high' | 'medium' | 'low';
    search: string;
    tags: string[];
}

type TaskPriority = 'low' | 'medium' | 'high';

interface TaskSidebarProps {
    filter: TaskFilter;
    onFilterChange: (filter: TaskFilter) => void;
    allTags: string[];
    onAddTask: () => void;
    visible: boolean;
    onClose: () => void;
}

interface ThemeContextType {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

// Theme hook
const useTheme = (): ThemeContextType => {
    const [theme, setThemeState] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme) {
                setThemeState(savedTheme as 'light' | 'dark');
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    };

    const setTheme = async (newTheme: 'light' | 'dark') => {
        try {
            await AsyncStorage.setItem('theme', newTheme);
            setThemeState(newTheme);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    return { theme, setTheme };
};

export function TaskSidebar({
    filter,
    onFilterChange,
    allTags,
    onAddTask,
    visible,
    onClose
}: TaskSidebarProps) {
    const { theme, setTheme } = useTheme();
    const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
    const [slideAnim] = useState(new Animated.Value(-300));
    const screenWidth = Dimensions.get('window').width;
    const sidebarWidth = Math.min(320, screenWidth * 0.85);

    const updateFilter = (partialFilter: Partial<TaskFilter>) => {
        onFilterChange({ ...filter, ...partialFilter });
    };

    const toggleTag = (tag: string) => {
        const tags = filter.tags.includes(tag)
            ? filter.tags.filter((t) => t !== tag)
            : [...filter.tags, tag];
        updateFilter({ tags });
    };

    // Animate sidebar
    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -sidebarWidth,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim, sidebarWidth]);

    const getSidebarLinks = () => [
        {
            title: "All Tasks",
            icon: "list-outline",
            onClick: () => updateFilter({ status: "all" }),
            isActive: filter.status === "all",
            count: 0, // You can pass actual counts here
        },
        {
            title: "To Do",
            icon: "radio-button-off-outline",
            onClick: () => updateFilter({ status: "todo" }),
            isActive: filter.status === "todo",
            count: 0,
        },
        {
            title: "In Progress",
            icon: "time-outline",
            onClick: () => updateFilter({ status: "in-progress" }),
            isActive: filter.status === "in-progress",
            count: 0,
        },
        {
            title: "Completed",
            icon: "checkmark-circle-outline",
            onClick: () => updateFilter({ status: "completed" }),
            isActive: filter.status === "completed",
            count: 0,
        },
    ];

    const priorityOptions = [
        { label: "All Priorities", value: "all", color: "#6B7280" },
        { label: "High Priority", value: "high", color: "#EF4444" },
        { label: "Medium Priority", value: "medium", color: "#F59E0B" },
        { label: "Low Priority", value: "low", color: "#10B981" },
    ];

    const links = getSidebarLinks();
    const isDark = theme === 'dark';

    const PriorityDropdown = () => (
        <Modal
            visible={showPriorityDropdown}
            transparent
            animationType="fade"
            onRequestClose={() => setShowPriorityDropdown(false)}
        >
            <TouchableOpacity
                className="flex-1 bg-black/50 justify-center items-center"
                activeOpacity={1}
                onPress={() => setShowPriorityDropdown(false)}
            >
                <Animated.View 
                    className="bg-white dark:bg-gray-800 rounded-xl mx-8 py-2 shadow-2xl"
                    style={{
                        transform: [{
                            scale: showPriorityDropdown ? 1 : 0.9
                        }]
                    }}
                >
                    {priorityOptions.map((option, index) => (
                        <TouchableOpacity
                            key={option.value}
                            onPress={() => {
                                updateFilter({ priority: option.value as TaskPriority | 'all' });
                                setShowPriorityDropdown(false);
                            }}
                            className={`px-6 py-4 flex-row items-center ${
                                index > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''
                            } ${filter.priority === option.value
                                    ? 'bg-blue-50 dark:bg-blue-900/50'
                                    : ''
                                }`}
                        >
                            <View 
                                className="w-3 h-3 rounded-full mr-3"
                                style={{ backgroundColor: option.color }}
                            />
                            <Text className={`flex-1 ${filter.priority === option.value
                                    ? 'text-blue-600 dark:text-blue-300 font-semibold'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                {option.label}
                            </Text>
                            {filter.priority === option.value && (
                                <Ionicons 
                                    name="checkmark" 
                                    size={20} 
                                    color={isDark ? '#60A5FA' : '#2563EB'} 
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );

    if (!visible) return <PriorityDropdown />;

    return (
        <>
            <Modal
                visible={visible}
                animationType="none"
                transparent
                onRequestClose={onClose}
            >
                <View className="flex-1 flex-row">
                    {/* Animated Sidebar */}
                    <Animated.View
                        className="bg-white dark:bg-gray-900 shadow-2xl"
                        style={{
                            width: sidebarWidth,
                            transform: [{ translateX: slideAnim }],
                            paddingTop: Platform.OS === 'ios'
                                ? (StatusBar.currentHeight || 0) + 44
                                : (StatusBar.currentHeight || 0) + 16
                        }}
                    >
                        {/* Header */}
                        <View className="flex-row items-center justify-between px-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-blue-500 rounded-xl items-center justify-center mr-3">
                                    <Ionicons name="checkmark-done" size={24} color="white" />
                                </View>
                                <View>
                                    <Text className="text-xl font-bold text-gray-900 dark:text-white">
                                        Taskoria
                                    </Text>
                                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                                        Task Manager
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
                            >
                                <Ionicons
                                    name="close"
                                    size={20}
                                    color={isDark ? '#9CA3AF' : '#6B7280'}
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            <View className="px-6 py-6">
                                {/* New Task Button */}
                                <TouchableOpacity
                                    onPress={() => {
                                        onAddTask();
                                        onClose();
                                    }}
                                    className="bg-blue-500 flex-row items-center justify-center p-4 rounded-xl mb-6 shadow-lg"
                                    style={{
                                        shadowColor: '#3B82F6',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 8,
                                        elevation: 8,
                                    }}
                                >
                                    <Ionicons name="add-circle" size={24} color="white" />
                                    <Text className="text-white font-semibold text-lg ml-2">
                                        Create New Task
                                    </Text>
                                </TouchableOpacity>

                                {/* Search */}
                                <View className="relative mb-8">
                                    <View className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                                        <Ionicons
                                            name="search"
                                            size={20}
                                            color={isDark ? '#9CA3AF' : '#6B7280'}
                                        />
                                    </View>
                                    <TextInput
                                        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-4 text-gray-900 dark:text-white text-base"
                                        placeholder="Search tasks..."
                                        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                        value={filter.search}
                                        onChangeText={(text) => updateFilter({ search: text })}
                                    />
                                </View>

                                {/* Views */}
                                <View className="mb-8">
                                    <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
                                        Views
                                    </Text>
                                    <View className="space-y-2">
                                        {links.map((link) => (
                                            <TouchableOpacity
                                                key={link.title}
                                                onPress={link.onClick}
                                                className={`flex-row items-center p-4 rounded-xl transition-all ${
                                                    link.isActive
                                                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                                                        : 'bg-gray-50 dark:bg-gray-800/50'
                                                }`}
                                            >
                                                <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${
                                                    link.isActive 
                                                        ? 'bg-blue-500' 
                                                        : 'bg-gray-200 dark:bg-gray-700'
                                                }`}>
                                                    <Ionicons
                                                        name={link.icon as any}
                                                        size={20}
                                                        color={link.isActive ? 'white' : (isDark ? '#9CA3AF' : '#6B7280')}
                                                    />
                                                </View>
                                                <Text className={`flex-1 font-medium ${
                                                    link.isActive
                                                        ? 'text-blue-600 dark:text-blue-300'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                }`}>
                                                    {link.title}
                                                </Text>
                                                {link.count > 0 && (
                                                    <View className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                                                        <Text className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                            {link.count}
                                                        </Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Priority Filter */}
                                <View className="mb-8">
                                    <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
                                        Priority Filter
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setShowPriorityDropdown(true)}
                                        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex-row items-center justify-between"
                                    >
                                        <View className="flex-row items-center">
                                            <View 
                                                className="w-4 h-4 rounded-full mr-3"
                                                style={{ 
                                                    backgroundColor: priorityOptions.find(opt => opt.value === filter.priority)?.color || '#6B7280'
                                                }}
                                            />
                                            <Text className="text-gray-900 dark:text-white font-medium">
                                                {priorityOptions.find(opt => opt.value === filter.priority)?.label || 'All Priorities'}
                                            </Text>
                                        </View>
                                        <Ionicons
                                            name="chevron-down"
                                            size={20}
                                            color={isDark ? '#9CA3AF' : '#6B7280'}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Tags */}
                                {allTags.length > 0 && (
                                    <View className="mb-8">
                                        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
                                            Filter by Tags
                                        </Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {allTags.map((tag) => (
                                                <TouchableOpacity
                                                    key={tag}
                                                    onPress={() => toggleTag(tag)}
                                                    className={`px-4 py-2 rounded-full border-2 ${
                                                        filter.tags.includes(tag)
                                                            ? 'bg-blue-500 border-blue-500'
                                                            : 'bg-transparent border-gray-300 dark:border-gray-600'
                                                    }`}
                                                >
                                                    <Text className={`text-sm font-medium ${
                                                        filter.tags.includes(tag)
                                                            ? 'text-white'
                                                            : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                        #{tag}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        {/* Theme Toggle - At bottom */}
                        <View className="px-6 py-6 border-t border-gray-100 dark:border-gray-800">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Ionicons 
                                        name={theme === 'dark' ? 'moon' : 'sunny'} 
                                        size={20} 
                                        color={isDark ? '#9CA3AF' : '#6B7280'} 
                                    />
                                    <Text className="text-gray-700 dark:text-gray-300 font-medium ml-3">
                                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                    </Text>
                                </View>
                                <Switch
                                    value={theme === 'dark'}
                                    onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
                                    trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                                    thumbColor={theme === 'dark' ? '#FFFFFF' : '#F3F4F6'}
                                    ios_backgroundColor="#E5E7EB"
                                />
                            </View>
                        </View>
                    </Animated.View>

                    {/* Backdrop */}
                    <TouchableOpacity
                        className="flex-1 bg-black/50"
                        activeOpacity={1}
                        onPress={onClose}
                    />
                </View>
            </Modal>

            <PriorityDropdown />
        </>
    );
}

// Enhanced Floating Action Button
export function SidebarToggleButton({ onPress }: { onPress: () => void }) {
    const [scaleAnim] = useState(new Animated.Value(1));

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
        onPress();
    };

    return (
        <Animated.View
            className="absolute bottom-8 left-6 z-50"
            style={{ transform: [{ scale: scaleAnim }] }}
        >
            <TouchableOpacity
                onPress={handlePress}
                className="bg-blue-500 rounded-2xl p-4 flex-row items-center shadow-2xl"
                style={{
                    shadowColor: '#3B82F6',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 12,
                }}
            >
                <Ionicons name="menu" size={24} color="white" />
                <Text className="text-white font-semibold ml-2">Menu</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}