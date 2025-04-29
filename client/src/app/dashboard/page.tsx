"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Task } from "@/types";
import { tasks, auth } from "@/lib/api";
import { toast } from "react-toastify";
import { DataTable } from "@/components/data-table";
import { TaskFormModal } from "@/components/tasks/TaskFormModel";
import { taskscolumns } from "@/components/columns";
import { taskSchema } from "@/data/schems";
import { taskFilters } from "@/jotai";
import { useAtom } from "jotai";

export default function Dashboard() {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filter] = useAtom(taskFilters);

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
      const { priority, status, dueDateTo, dueDateFrom } = filter;
      const response = await tasks.getAll({
        priority: priority.join(","),
        status: status.join(","),
        dueDateTo,
        dueDateFrom,
      });
      setTaskList(response.data);
    } catch (error: any) {
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
      if (confirm("Are you sure you want to delete this record?")) {
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
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const data: taskSchema[] = taskList.map((task) => {
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      description: task.description,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      createdBy: task.createdBy,
      updatedAt: task.updatedAt,
      assignedTo: task.assignedTo,
    };
  });

  const handleEdit = (task: any) => {
    setEditingTask(task);
  };

  if (allUsers.length <= 0) {
    return <div className="text-2xl text-center mt-16">Loading....</div>;
  }

  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
     
        <div className="flex items-center justify-between space-y-2">
          
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your tasks!
            </p>
          </div>
          <div className="ml-auto">
          <Button
            className="w-full md:w-auto"
            onClick={() => setIsFormOpen(true)}
          >
            Create Task
          </Button>
        </div>
        </div>
       
        <DataTable
          data={data}
          columns={taskscolumns(handleEdit, handleDeleteTask)}
          type={"tasks"}
        />
      </div>
      {(isFormOpen || editingTask) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6">
            <h2 className="mb-4 sm:mt-4 text-xl font-bold text-center">
              {editingTask ? "Edit Task" : "Create Task"}
            </h2>
            <TaskFormModal
              open={isFormOpen || !!editingTask}
              defaultValues={editingTask || undefined}
              onClose={() => {
                setIsFormOpen(false);
                setEditingTask(null);
              }}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              users={allUsers}
            />
          </div>
        </div>
      )}
    </>
  );
}
