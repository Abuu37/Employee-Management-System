import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FiPlus, FiSend } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import Sidebar from "@/layouts/Sidebar";
import Header from "@/layouts/Header";
import { useUser } from "@/context/UserContext";
import { taskService } from "@/features/tasks/services/task.service";
import type { TaskComment } from "@/features/tasks/types/task.types";

interface TaskCommentPageProps {
  modalMode?: boolean;
  taskId?: number;
}

const normalizeComments = (raw: unknown[]): TaskComment[] =>
  raw.map((c: any) => ({
    id: c.id,
    authorId: c.authorId,
    authorName: c.authorName,
    role: c.role,
    content: c.content,
    createdAt: new Date(c.createdAt).toLocaleTimeString(),
  }));

const TaskCommentPage: React.FC<TaskCommentPageProps> = ({
  modalMode = false,
  taskId: propTaskId,
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const taskId = propTaskId ?? (paramId ? Number(paramId) : undefined);

  const { user: currentUser } = useUser();
  const currentUserId = currentUser?.id ?? 0;
  const userName = currentUser?.name ?? "You";
  const { t } = useTranslation();

  const [task, setTask] = useState<any>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [comments, scrollToBottom]);

  const loadComments = useCallback(async () => {
    if (!taskId) return;
    const raw = await taskService.getComments(taskId);
    setComments(normalizeComments(raw));
  }, [taskId]);

  useEffect(() => {
    if (!taskId) {
      setError("No task ID provided");
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        const [taskData] = await Promise.all([
          taskService.getTaskById(taskId),
          loadComments(),
        ]);
        setTask(taskData);
      } catch {
        setError("Failed to load task");
      } finally {
        setLoading(false);
      }
    };

    void fetchAll();
  }, [taskId, loadComments]);

  const handleSend = async () => {
    if (!message.trim() || !taskId) return;
    setSending(true);
    try {
      await taskService.addComment(taskId, message);
      setMessage("");
      await loadComments();
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !sending) void handleSend();
  };

  const ChatBubble = ({ c }: { c: TaskComment }) => {
    const isOwn = c.authorId === currentUserId;
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
        <div
          className={`flex ${isOwn ? "flex-row-reverse" : ""} items-end gap-2 max-w-2xl w-full`}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.authorName || "U")}&background=E0E7FF&color=3730A3&size=64`}
            alt={c.authorName || "U"}
            className="w-9 h-9 rounded-full border border-blue-200 object-cover"
          />
          <div
            className={`rounded-2xl px-5 py-3 shadow-sm ${
              isOwn
                ? "bg-blue-600 text-white ml-auto"
                : "bg-blue-50 text-slate-800"
            } flex flex-col min-w-[14rem] max-w-xl relative`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-base">
                {c.authorName || userName}
              </span>
              {c.role && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    c.role === "Manager"
                      ? "bg-yellow-300 text-yellow-900"
                      : "bg-blue-200 text-blue-900"
                  }`}
                >
                  {c.role}
                </span>
              )}
              <span
                className={`ml-auto text-xs ${isOwn ? "text-blue-100" : "text-slate-400"}`}
              >
                {c.createdAt}
              </span>
            </div>
            <div className="text-base whitespace-pre-line break-words max-w-xs md:max-w-sm lg:max-w-md overflow-x-auto">
              {c.content}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ChatInput = () => (
    <div className="bg-white border-t px-6 py-3 flex items-center gap-3">
      <button type="button" className="p-2 rounded-full hover:bg-slate-100">
        <FiPlus />
      </button>
      <input
        className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-300"
        placeholder={t("tasks.typePlaceholder")}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        onClick={() => void handleSend()}
        disabled={sending || !message.trim()}
        className="bg-blue-600 text-white p-3 rounded-full disabled:opacity-50"
      >
        <FiSend />
      </button>
    </div>
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        {error}
      </div>
    );

  if (!task)
    return (
      <div className="flex items-center justify-center h-64">
        Task not found
      </div>
    );

  if (modalMode) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-sm flex flex-col h-[70vh] overflow-hidden">
          <div className="bg-white border-b px-6 py-4">
            <span className="font-semibold text-slate-700">{task?.title}</span>
          </div>
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50"
            style={{ minHeight: 0 }}
          >
            {comments.map((c) => (
              <ChatBubble key={c.id} c={c} />
            ))}
          </div>
          <ChatInput />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header searchTerm="" onSearchChange={() => {}} />
        <div className="flex-1 p-10" style={{ width: "80%", margin: "0 auto" }}>
          <div className="bg-white rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
            <div className="bg-white border-b px-6 py-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <span>/</span>
                <span>{task?.projectName || "Project"}</span>
                <span>/</span>
                <span className="font-semibold text-slate-700">
                  {task?.title}
                </span>
              </div>
            </div>
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50"
            >
              {comments.map((c) => (
                <ChatBubble key={c.id} c={c} />
              ))}
            </div>
            <ChatInput />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskCommentPage;
