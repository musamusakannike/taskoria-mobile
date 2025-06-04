import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

// Types (you'll need to define these in your types file)
interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  tags: string[];
  subtasks: SubTask[];
  createdAt: string;
  updatedAt: string;
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

type TaskPriority = 'low' | 'medium' | 'high';
type TaskStatus = 'todo' | 'in-progress' | 'completed';

interface TaskModalProps {
  task?: Task;
  visible: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  availableTags: string[];
}

const defaultTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  dueDate: null,
  tags: [],
  subtasks: [],
};

export function TaskModal({ task, visible, onClose, onSave, availableTags }: TaskModalProps) {
  const [formState, setFormState] = useState<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>(defaultTask);
  const [newTag, setNewTag] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      setFormState(task);
    } else {
      setFormState(defaultTask);
    }
  }, [task]);

  const handleInputChange = (
    field: keyof Task,
    value: string | string[] | boolean | null | TaskPriority | TaskStatus
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formState.tags.includes(newTag.trim())) {
      setFormState((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormState((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const subtask: SubTask = {
        id: Date.now().toString() + Math.random().toString(),
        title: newSubtask.trim(),
        completed: false,
      };
      
      setFormState((prev) => ({
        ...prev,
        subtasks: [...prev.subtasks, subtask],
      }));
      
      setNewSubtask('');
    }
  };

  const handleSubtaskChange = (subtaskId: string, completed: boolean) => {
    setFormState((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed } : st
      ),
    }));
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    setFormState((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((st) => st.id !== subtaskId),
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleInputChange('dueDate', selectedDate.toISOString());
    }
  };

  const handleSubmit = () => {
    if (!formState.title.trim()) {
      Alert.alert('Error', 'Please enter a title for the task');
      return;
    }
    onSave(formState);
    onClose();
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white dark:bg-gray-900">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={onClose} className="p-2">
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditing ? "Edit Task" : "Create New Task"}
          </Text>
          <TouchableOpacity 
            onPress={handleSubmit}
            className="bg-blue-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">
              {isEditing ? "Save" : "Create"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={formState.title}
              onChangeText={(text) => handleInputChange('title', text)}
              placeholder="Enter task title"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              value={formState.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholder="Enter task description"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Priority and Status */}
          <View className="flex-row gap-4 mb-6">
            {/* Priority */}
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </Text>
              <View className="space-y-2">
                {(['low', 'medium', 'high'] as TaskPriority[]).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    onPress={() => handleInputChange('priority', priority)}
                    className="flex-row items-center space-x-2"
                  >
                    <View className={`w-5 h-5 rounded-full border-2 ${
                      formState.priority === priority 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    } items-center justify-center`}>
                      {formState.priority === priority && (
                        <View className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </View>
                    <Text className={`capitalize ${getPriorityColor(priority)}`}>
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status */}
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </Text>
              <View className="border border-gray-300 dark:border-gray-600 rounded-lg">
                {(['todo', 'in-progress', 'completed'] as TaskStatus[]).map((status, index) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => handleInputChange('status', status)}
                    className={`p-3 ${index > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''} ${
                      formState.status === status ? 'bg-blue-50 dark:bg-blue-900' : ''
                    }`}
                  >
                    <Text className={`${
                      formState.status === status 
                        ? 'text-blue-700 dark:text-blue-300 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {status === 'todo' ? 'To Do' : status === 'in-progress' ? 'In Progress' : 'Completed'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Due Date */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Due Date
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 flex-row items-center"
            >
              <Ionicons name="calendar" size={20} color="#666" />
              <Text className="ml-2 text-gray-900 dark:text-white">
                {formState.dueDate ? formatDate(formState.dueDate) : 'Pick a date'}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={formState.dueDate ? new Date(formState.dueDate) : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          {/* Tags */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </Text>
            <View className="flex-row gap-2 mb-3">
              <TextInput
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Add a tag"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={handleAddTag}
                className="bg-blue-500 px-4 py-3 rounded-lg justify-center"
              >
                <Text className="text-white font-medium">Add</Text>
              </TouchableOpacity>
            </View>

            {/* Available Tags */}
            {availableTags.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-3">
                {availableTags.filter(tag => !formState.tags.includes(tag)).map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => {
                      if (!formState.tags.includes(tag)) {
                        handleInputChange('tags', [...formState.tags, tag]);
                      }
                    }}
                    className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 text-sm">{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Selected Tags */}
            {formState.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {formState.tags.map((tag) => (
                  <View key={tag} className="bg-blue-500 px-3 py-1 rounded-full flex-row items-center">
                    <Text className="text-white text-sm mr-1">{tag}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Subtasks */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subtasks
            </Text>
            <View className="flex-row gap-2 mb-3">
              <TextInput
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                value={newSubtask}
                onChangeText={setNewSubtask}
                placeholder="Add a subtask"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={handleAddSubtask}
                className="bg-blue-500 px-4 py-3 rounded-lg justify-center items-center"
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Subtasks List */}
            {formState.subtasks.length > 0 && (
              <View className="space-y-2">
                {formState.subtasks.map((subtask) => (
                  <View key={subtask.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex-row items-center">
                    <TouchableOpacity
                      onPress={() => handleSubtaskChange(subtask.id, !subtask.completed)}
                      className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                        subtask.completed 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {subtask.completed && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                    <Text className={`flex-1 ${
                      subtask.completed 
                        ? 'line-through text-gray-500 dark:text-gray-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {subtask.title}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveSubtask(subtask.id)}>
                      <Ionicons name="trash" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}