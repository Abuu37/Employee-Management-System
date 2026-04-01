import React from "react";
import TaskCommentBubble from "./TaskCommentBubble";
import TaskCommentInput from "./TaskCommentInput";
import { TaskComment } from "./types";

interface TaskCommentSectionProps {
  comments: TaskComment[];
  onAddComment: (content: string) => void;
  currentUserId: number;
}

const TaskCommentSection: React.FC<TaskCommentSectionProps> = ({
  comments,
  onAddComment,
  currentUserId,
}) => {
  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Discussion</h3>
      <div className="bg-slate-50 rounded-lg p-3 min-h-[120px] mb-2 max-h-60 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-slate-400 text-sm">No comments yet.</div>
        ) : (
          comments.map((comment) => (
            <TaskCommentBubble
              key={comment.id}
              comment={comment}
              isOwn={comment.authorId === currentUserId}
            />
          ))
        )}
      </div>
      <TaskCommentInput onSend={onAddComment} />
    </div>
  );
};

export default TaskCommentSection;
