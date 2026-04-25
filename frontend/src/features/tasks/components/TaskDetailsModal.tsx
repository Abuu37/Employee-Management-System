import React from "react";
import { TaskItem, TaskComment } from "./types";
import TaskCommentSection from "./TaskCommentSection";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold mb-4">Task Details</h2>
        <div className="mb-4">
          <div><b>Title:</b> {task.title}</div>
          <div><b>Status:</b> {task.status}</div>
          <div><b>Assigned By:</b> {task.assignedByName}</div>
          <div><b>Project:</b> {task.projectName}</div>
          <div><b>Priority:</b> {task.priority}</div>
          <div><b>Deadline:</b> {task.deadline}</div>
          <div><b>Description:</b> {task.description}</div>
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