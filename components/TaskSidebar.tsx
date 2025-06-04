import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    Image,
    Switch,
    Dimensions,
    StatusBar,
    Platform,
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

// You'll need to implement this context or pass theme as props
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
    const screenWidth = Dimensions.get('window').width;
    const sidebarWidth = Math.min(300, screenWidth * 0.8);

    const updateFilter = (partialFilter: Partial<TaskFilter>) => {
        onFilterChange({ ...filter, ...partialFilter });
    };

    const toggleTag = (tag: string) => {
        const tags = filter.tags.includes(tag)
            ? filter.tags.filter((t) => t !== tag)
            : [...filter.tags, tag];
        updateFilter({ tags });
    };

    const getSidebarLinks = () => [
        {
            title: "All Tasks",
            icon: "list-outline",
            onClick: () => updateFilter({ status: "all" }),
            isActive: filter.status === "all",
        },
        {
            title: "To Do",
            icon: "calendar-outline",
            onClick: () => updateFilter({ status: "todo" }),
            isActive: filter.status === "todo",
        },
        {
            title: "In Progress",
            icon: "checkmark-done-outline",
            onClick: () => updateFilter({ status: "in-progress" }),
            isActive: filter.status === "in-progress",
        },
        {
            title: "Completed",
            icon: "checkmark-circle-outline",
            onClick: () => updateFilter({ status: "completed" }),
            isActive: filter.status === "completed",
        },
        {
            title: "Upcoming",
            icon: "time-outline",
            onClick: () => console.log("Upcoming view not implemented yet"),
            isActive: false,
        },
    ];

    const priorityOptions = [
        { label: "All Priorities", value: "all" },
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
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
                <View className="bg-white dark:bg-gray-800 rounded-lg mx-8 py-2 shadow-lg">
                    {priorityOptions.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            onPress={() => {
                                updateFilter({ priority: option.value as TaskPriority | 'all' });
                                setShowPriorityDropdown(false);
                            }}
                            className={`px-4 py-3 ${filter.priority === option.value
                                    ? 'bg-blue-50 dark:bg-blue-900'
                                    : ''
                                }`}
                        >
                            <Text className={`${filter.priority === option.value
                                    ? 'text-blue-600 dark:text-blue-300 font-medium'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <>
            <Modal
                visible={visible}
                animationType="slide"
                presentationStyle="overFullScreen"
                onRequestClose={onClose}
            >
                <View className="flex-1 flex-row">
                    {/* Sidebar */}
                    <View
                        className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700`}
                        style={{ width: sidebarWidth }}
                    >
                        <View
                            className="pt-2"
                            style={{
                                paddingTop: Platform.OS === 'ios'
                                    ? (StatusBar.currentHeight || 0) + 44
                                    : (StatusBar.currentHeight || 0) + 16
                            }}
                        >
                            {/* Header */}
                            <View className="flex-row items-center justify-between px-4 pb-6">
                                <View className="flex-row items-center space-x-2">
                                    <Image
                                        source={{ uri: '/icon.png' }}
                                        className="w-10 h-10"
                                        resizeMode="contain"
                                    />
                                    <Text className="text-xl font-bold text-gray-900 dark:text-white">
                                        Taskoria
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={onClose}
                                    className="p-2"
                                >
                                    <Ionicons
                                        name="close"
                                        size={24}
                                        color={isDark ? '#fff' : '#000'}
                                    />
                                </TouchableOpacity>
                            </View>

                            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                                <View className="px-4">
                                    {/* New Task Button */}
                                    <TouchableOpacity
                                        onPress={() => {
                                            onAddTask();
                                            onClose();
                                        }}
                                        className="bg-blue-500 flex-row items-center justify-center p-3 rounded-lg mb-4"
                                    >
                                        <Ionicons name="add" size={20} color="white" />
                                        <Text className="text-white font-medium ml-2">New Task</Text>
                                    </TouchableOpacity>

                                    {/* Search */}
                                    <View className="relative mb-6">
                                        <View className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                                            <Ionicons
                                                name="search"
                                                size={20}
                                                color={isDark ? '#9CA3AF' : '#6B7280'}
                                            />
                                        </View>
                                        <TextInput
                                            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-3 text-gray-900 dark:text-white"
                                            placeholder="Search tasks..."
                                            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                            value={filter.search}
                                            onChangeText={(text) => updateFilter({ search: text })}
                                        />
                                    </View>

                                    {/* Views */}
                                    <View className="mb-6">
                                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Views
                                        </Text>
                                        <View className="space-y-1">
                                            {links.map((link) => (
                                                <TouchableOpacity
                                                    key={link.title}
                                                    onPress={link.onClick}
                                                    className={`flex-row items-center p-3 rounded-lg ${link.isActive
                                                            ? 'bg-blue-50 dark:bg-blue-900'
                                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        }`}
                                                >
                                                    <Ionicons
                                                        name={link.icon as any}
                                                        size={20}
                                                        color={
                                                            link.isActive
                                                                ? (isDark ? '#3B82F6' : '#2563EB')
                                                                : (isDark ? '#9CA3AF' : '#6B7280')
                                                        }
                                                    />
                                                    <Text className={`ml-3 ${link.isActive
                                                            ? 'text-blue-600 dark:text-blue-300 font-medium'
                                                            : 'text-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {link.title}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Priority Filter */}
                                    <View className="mb-6">
                                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Priority
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => setShowPriorityDropdown(true)}
                                            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex-row items-center justify-between"
                                        >
                                            <Text className="text-gray-900 dark:text-white">
                                                {priorityOptions.find(opt => opt.value === filter.priority)?.label || 'All Priorities'}
                                            </Text>
                                            <Ionicons
                                                name="chevron-down"
                                                size={20}
                                                color={isDark ? '#9CA3AF' : '#6B7280'}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Tags */}
                                    {allTags.length > 0 && (
                                        <View className="mb-6">
                                            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                Tags
                                            </Text>
                                            <View className="flex-row flex-wrap gap-2">
                                                {allTags.map((tag) => (
                                                    <TouchableOpacity
                                                        key={tag}
                                                        onPress={() => toggleTag(tag)}
                                                        className={`px-3 py-1 rounded-full border ${filter.tags.includes(tag)
                                                                ? 'bg-blue-500 border-blue-500'
                                                                : 'bg-transparent border-gray-300 dark:border-gray-600'
                                                            }`}
                                                    >
                                                        <Text className={`text-sm ${filter.tags.includes(tag)
                                                                ? 'text-white'
                                                                : 'text-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {tag}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {/* Theme Toggle - At bottom */}
                                <View className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-gray-700 dark:text-gray-300">Dark Mode</Text>
                                        <Switch
                                            value={theme === 'dark'}
                                            onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
                                            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                                            thumbColor={theme === 'dark' ? '#FFFFFF' : '#F3F4F6'}
                                        />
                                    </View>
                                </View>
                            </ScrollView>
                        </View>
                    </View>

                    {/* Backdrop */}
                    <TouchableOpacity
                        className="flex-1 bg-black/40"
                        activeOpacity={1}
                        onPress={onClose}
                    />
                </View>
            </Modal>

            <PriorityDropdown />
        </>
    );
}

// Floating Action Button Component (for when sidebar is closed)
export function SidebarToggleButton({ onPress }: { onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="absolute bottom-6 left-6 bg-blue-500 rounded-full p-4 shadow-lg z-50"
            style={{
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
            }}
        >
            <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
    );
}