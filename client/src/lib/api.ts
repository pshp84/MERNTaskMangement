import axios, { InternalAxiosRequestConfig } from "axios";
import { Task, Priority, Status, User, TaskHistory } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface AuthResponse {
  token: string;
  user: User;
  message?:string
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface CreateTaskData {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  assignedTo: number;
}

type UpdateTaskData = Partial<{
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  assignedTo: number;
}>;

// Auth API
export const auth = {
  register(data: RegisterData) {
    return api.post<AuthResponse>("/auth/register", data);
  },
  login(data: LoginData) {
    return api.post<AuthResponse>("/auth/login", data);
  },
  users() {
    return api.get<User[]>("/auth/users");
  },
};

// Tasks API
export const tasks = {
  getAll(filters: { priority?: string; status?: string; dueDateFrom?:string, dueDateTo?:string } = {}) {
    return api.get<Task[]>("/tasks", { params: filters });
  },
  create(data: CreateTaskData) {
    return api.post<Task>("/tasks", data);
  },
  update(id: number, data: UpdateTaskData) {
    return api.put<Task>(`/tasks/${id}`, data);
  },
  delete(id: number) {
    return api.delete(`/tasks/${id}`);
  },
  getHistory(id: number) {
    return api.get<TaskHistory[]>(`/tasks/${id}/history`);
  },
};

export default api;
