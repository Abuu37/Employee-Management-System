import React from "react";
import { TaskComment } from "./types";

interface TaskCommentBubbleProps {
  comment: TaskComment;
  isOwn: boolean;
}

const TaskCommentBubble: React.FC<TaskCommentBubbleProps> = ({
  comment,
  isOwn,
}) => {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-xs rounded-lg px-4 py-2 text-sm shadow-sm ${isOwn ? "bg-green-50 text-right" : "bg-slate-100 text-left"}`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-xs font-bold ${comment.role === "manager" ? "text-orange-600" : "text-green-600"}`}
          >
            {comment.role === "manager" ? "Manager" : "Employee"}
          </span>
          <span className="text-xs text-slate-400">{comment.createdAt}</span>
        </div>
        <div>{comment.content}</div>
      </div>
    </div>
  );
};

export default TaskCommentBubble;
