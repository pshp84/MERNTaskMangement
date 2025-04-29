import { Task } from "@/types";
import { TaskForm } from "./TaskForm"; // Adjust this import if needed
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => Promise<void>;
  defaultValues?: Partial<Task>;
  users?: { id: number; username: string }[];
}

export function TaskFormModal({
  open,
  onClose,
  onSubmit,
  defaultValues,
  users = [],
}: TaskFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[100vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>
        <TaskForm
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          users={users}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
