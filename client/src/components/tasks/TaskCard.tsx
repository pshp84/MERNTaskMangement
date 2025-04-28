import { Button } from "@/components/ui/button"
import { Task } from "@/types"
import moment from 'moment';

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
}

const priorityColors = {
  Low: "bg-blue-100 text-blue-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
} as const

const statusColors = {
  "To Do": "bg-gray-100 text-gray-800",
  "In Progress": "bg-purple-100 text-purple-800",
  "Done": "bg-green-100 text-green-800",
} as const

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <>
    <div className="rounded-lg border bg-card p-4 shadow-sm text-base">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{task.title}</h3>
          <p className="mt-1 text-base text-gray-600">{task.description}</p>
        </div>
        <div className="flex gap-2">
          <Button className="text-sm" variant="ghost" size="sm" onClick={() => onEdit(task)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            className="text-sm"
            size="sm"
            onClick={() => onDelete(task.id)}
          >
            Delete
          </Button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-base">
        <span
          className={`rounded-full px-2 py-1 font-medium ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </span>
        <span
          className={`rounded-full px-2 py-1 font-medium ${statusColors[task.status]}`}
        >
          {task.status}
        </span>
        <span className="rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-800">
          Due: {moment.utc(task.dueDate).format("MMM D, YYYY")}
          
        </span>
      </div>
    </div>
    </>
  )
}
