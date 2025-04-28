'use client';
import { useState } from 'react';

type Task = {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Done';
  dueDate: string;
};


export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Tasks</h2>
      <ul className="space-y-4">
        {tasks.map(task => (
          <li key={task.id} className="border rounded p-4">
            <div className="font-semibold">{task.title}</div>
            <div>{task.description}</div>
            <div className="text-sm text-gray-600">Priority: {task.priority} | Status: {task.status}</div>
            <div className="text-sm">Due: {task.dueDate}</div>
          </li>
        ))}
      </ul>
      {/* TODO: Add CRUD operations */}
    </div>
  );
}
