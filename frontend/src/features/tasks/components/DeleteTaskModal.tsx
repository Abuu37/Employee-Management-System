import React from "react";
import ModalShell from "@/features/employees/components/ModalShell";

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle?: string;
  isDeleting?: boolean;
}

const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  isDeleting = false,
}) => {
  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Delete Task">
      <div className="p-6">
        <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-5 py-4">
          <span className="text-sm text-red-700 font-medium">
            Are you sure you want to delete the task
            <span className="font-bold">
              {" "}
              {taskTitle ? `"${taskTitle}"` : "this task"}
            </span>
            ?<span className="font-normal"> This action cannot be undone.</span>
          </span>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-red-300"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default DeleteTaskModal;
