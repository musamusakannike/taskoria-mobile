import { TaskList } from "@/components/TaskList";
import { TaskModal } from "@/components/TaskModal";
import { SidebarToggleButton, TaskSidebar } from "@/components/TaskSidebar";
import { useTasks } from "@/hooks/useTasks";
import type { Task } from "@/types/task";
import React, { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const {
    tasks,
    isLoading,
    filter,
    setFilter,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    allTags,
  } = useTasks();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const handleAddTask = () => {
    setEditingTask(undefined);
    setModalVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      createTask(taskData);
    }
    setModalVisible(false);
    setEditingTask(undefined);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <TaskSidebar
        filter={filter}
        onFilterChange={setFilter}
        allTags={allTags}
        onAddTask={handleAddTask}
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />
      <SidebarToggleButton onPress={() => setSidebarVisible(true)} />
      <View className="flex-1 pt-10">
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          onEditTask={handleEditTask}
          onDeleteTask={deleteTask}
          onToggleTaskStatus={toggleTaskStatus}
          onCreateTask={handleAddTask}
        />
      </View>
      <TaskModal
        task={editingTask}
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingTask(undefined);
        }}
        onSave={handleSaveTask}
        availableTags={allTags}
      />
    </SafeAreaView>
  );
}
