import React, { useEffect, useState } from "react";
import { TaskItem, TaskComment } from "./types";
import TaskCommentSection from "./TaskCommentSection";
import RichTextEditor from "@/components/editor/RichTextEditor";

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem;
  comments: TaskComment[];
  onAddComment: (content: string) => void;
  currentUserId: number;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  task,
  comments,
  onAddComment,
  currentUserId,
}) => {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const t = setTimeout(() => setShown(true), 10);
      return () => clearTimeout(t);
    } else {
      setShown(false);
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${shown ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative transition-all duration-200 ${shown ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-2 opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold mb-4">Task Details</h2>
        <div className="mb-4">
          <div>
            <b>Title:</b> {task.title}
          </div>
          <div>
            <b>Status:</b> {task.status}
          </div>
          <div>
            <b>Assigned By:</b> {task.assignedByName}
          </div>
          <div>
            <b>Project:</b> {task.projectName}
          </div>
          <div>
            <b>Priority:</b> {task.priority}
          </div>
          <div>
            <b>Deadline:</b> {task.deadline}
          </div>
          <div>
            <b>Description:</b>
            <div className="mt-2">
              <RichTextEditor
                value={task.description || ""}
                onChange={() => {}}
                readOnly
                simple
                height="140px"
              />
            </div>
          </div>
        </div>

        <TaskCommentSection
          comments={comments}
          onAddComment={onAddComment}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
};

export default TaskDetailsModal;
