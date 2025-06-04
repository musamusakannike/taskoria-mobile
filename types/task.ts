
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
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

export interface TaskFilter {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  tags: string[];
}
