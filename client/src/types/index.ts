export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'To Do' | 'In Progress' | 'Done';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  createdBy: number;
  assignedTo?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskHistory {
  id: number;
  taskId: number;
  changeType: string;
  previousValue: any;
  newValue: any;
  timestamp: string;
  userId: number;
}

export interface TaskNotificationData {
  task : Task,
  userId: string,
  type: string,
}
