import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export type taskSchema = {
    id: number;
    title: string;
    status: "To Do" | "In Progress" | "Done";
    priority: "Low" | "Medium" | "High";
    description?: string;
    dueDate?: string;
    createdBy?: number;
    assignedTo?: number;
    createdAt?: string;
    updatedAt?: string;
  };

export type Task = taskSchema