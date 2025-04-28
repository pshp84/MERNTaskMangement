"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Task } from "@/types";
import { tasks, auth } from "@/lib/api";
import { toast } from "react-toastify";

export default function Dashboard() {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState({
    priority: "",
    status: "",
    dueDate: "",
  });
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const loadUsers = async () => {
    try {
      const response = await auth.users();

      if (response.data) {
        setAllUsers(response.data);
      }
    } catch (error) {
      setAllUsers([]);
    }
  };

  const loadTasks = async () => {
    try {
      const { priority, status, dueDate } = filter;
      const response = await tasks.getAll({ priority, status, dueDate });
      setTaskList(response.data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadTasks();
  }, [filter]);

  const handleCreateTask = async (data: Partial<Task>) => {
    try {
      const response = await tasks.create(data as any);
      if (response.data as any) {
        setIsFormOpen(false);
        loadTasks();
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleUpdateTask = async (data: Partial<Task>) => {
    if (!editingTask) return;
    try {
      await tasks.update(editingTask.id, data);
      setEditingTask(null);
      loadTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await tasks.delete(taskId);
      if (response.data) {
        setTaskList((prev) => prev.filter((t) => t.id !== taskId));
        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 md:px-8">
      <div className="mb-8 flex items-center justify-between flex-col sm:flex-row">
        <h1 className="text-3xl font-bold text-center sm:text-left">
          Task Dashboard
        </h1>
        <Button className="sm:mt-4 ml-auto" onClick={() => setIsFormOpen(true)}>Create Task</Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:text-base">
        <select
          className="rounded-md border p-2"
          value={filter.priority}
          onChange={(e) => {
            setFilter({ ...filter, priority: e.target.value });
            loadTasks();
          }}
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select
          className="rounded-md border p-2"
          value={filter.status}
          onChange={(e) => {
            setFilter({ ...filter, status: e.target.value });
            loadTasks();
          }}
        >
          <option value="">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <input
          type="date"
          className="rounded-md border p-2"
          value={filter.dueDate}
          onChange={(e) => {
            const selectedDate = e.target.value; 
            setFilter({ ...filter, dueDate: selectedDate });
            loadTasks();
          }}
        />
      </div>

      <div>
        {taskList.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {taskList.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center mt-8 text-xl">{"No tasks found."}</div>
        )}
      </div>

      {(isFormOpen || editingTask) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6">
            <h2 className="mb-4 sm:mt-4 text-xl font-bold text-center">
              {editingTask ? "Edit Task" : "Create Task"}
            </h2>
            <TaskForm
              defaultValues={editingTask || undefined}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              users={allUsers}
              onClose={() => {
                setIsFormOpen(false);
                setEditingTask(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
