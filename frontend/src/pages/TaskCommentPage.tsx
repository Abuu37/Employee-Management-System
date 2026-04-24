import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { FiArrowLeft, FiPlus, FiSend } from "react-icons/fi";

const TASK_API = "http://localhost:5000/api/task";
const COMMENT_API = "http://localhost:5000/api/tasks_comments";

const TaskCommentPage: React.FC<{ 
  modalMode?: boolean;
  taskId?: number;
}> = ({ modalMode = false, taskId: propTaskId }) => {


  const navigate = useNavigate();

  const [task, setTask] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const currentUserId = Number(localStorage.getItem("user-id") || 0);
  const userName = localStorage.getItem("user-name") ?? "You";

  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);


  const { id } = useParams();
  const taskId = propTaskId ?? id;

  useEffect(() => {
    // Basic validation to ensure we have a task ID to work with before making API calls 
    if (!taskId) {
      console.log("No task ID provided");
      setError("No task ID provided");
      setLoading(false);
      return;
    }


    // Fetch task details
    const fetchTask = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${TASK_API}/${taskId}`, {
          headers: { 
            Authorization: `Bearer ${token}` },
        });
        setTask(res.data);

      } catch {
        console.log("Failed to load task");
        setError("Failed to load task");
      }
    };

    // Fetch comments separately to ensure task loads even if comments fail

    const fetchComments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${COMMENT_API}/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setComments(
          res.data.map((c: any) => ({
            id: c.id,
            authorId: c.authorId,
            authorName: c.authorName,
            role: c.role,
            content: c.content,
            createdAt: new Date(c.createdAt).toLocaleTimeString(),
          })),
        );

      } catch {
        console.log("Failed to load comments");
        setError("Failed to load comments");
      }
    };

    setLoading(true);
    Promise.all([fetchTask(), fetchComments()]).finally(() =>
      setLoading(false),
    );
  }, [taskId]);

  // Handle sending new comment
  const handleSend = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${COMMENT_API}/${taskId}`,
        { message },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMessage("");

      const res = await axios.get(`${COMMENT_API}/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setComments(
        res.data.map((c: any) => ({
          id: c.id,
          authorId: c.authorId,
          authorName: c.authorName,
          role: c.role,
          content: c.content,
          createdAt: new Date(c.createdAt).toLocaleTimeString(),
        })),
      );
    } finally {
      setSending(false);
    }
  };

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

  // Only render the comment card if in modalMode
  if (modalMode) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-sm flex flex-col h-[70vh] overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b px-6 py-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <span className="font-semibold text-slate-700">
                {task?.title}
              </span>
            </div>
          </div>
          {/* Chat */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-4 
            scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50"
            style={{ minHeight: 0 }}
          >
            {comments.map((c) => {
              const isOwn = c.authorId === currentUserId;
              return (
                <div
                  key={c.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex ${isOwn ? "flex-row-reverse" : ""} items-end gap-2 max-w-2xl w-full`}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.authorName || "U")}
                      &background=E0E7FF&color=3730A3&size=64`}
                      alt={c.authorName || "U"}
                      className="w-9 h-9 rounded-full border border-blue-200 object-cover"
                    />
                    <div
                      className={`rounded-2xl px-5 py-3 shadow-sm ${
                        isOwn
                          ? "bg-blue-600 text-white ml-auto"
                          : "bg-blue-50 text-slate-800"
                      } flex flex-col min-w-55 max-w-xl relative`}
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
                      <div className="text-base whitespace-pre-line wrap-break-word
                           max-w-xs md:max-w-sm lg:max-w-md overflow-x-auto">
                        {c.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Input */}
          <div className="bg-white border-t px-6 py-3 flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-slate-100">
              <FiPlus />
            </button>
            <input
              className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !sending) handleSend();
              }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="bg-blue-600 text-white p-3 rounded-full"
            >
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: full page mode
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header searchTerm="" onSearchChange={() => {}} />
        <div className="flex-1 p-10" style={{ width: "80%", margin: "0 auto" }}>
          <div className="bg-white rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
            {/* 🔹 MINIMAL HEADER */}
            <div className="bg-white border-b px-6 py-4 space-y-3">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
               
                <span>/</span>
                <span>{task?.projectName || "Project"}</span>
                <span>/</span>
                <span className="font-semibold text-slate-700">
                  {task?.title}
                </span>
              </div>

              {/* Meta Info Inline */}
              <div className="flex flex-wrap items-center gap-4 text-base mb-2"></div>
            </div>

            {/* 🔹 COMMENT CARD WRAPPER */}

            {/* 🔹 CHAT */}
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto px-6 py-4 space-y-4 
              scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50"
            >
              {comments.map((c) => {
                const isOwn = c.authorId === currentUserId;
                return (
                  <div
                    key={c.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex ${isOwn ? "flex-row-reverse" : ""} items-end gap-2 max-w-2xl w-full`}
                    >
                      {/* Avatar */}
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.authorName || "U")}
                        &background=E0E7FF&color=3730A3&size=64`}
                        alt={c.authorName || "U"}
                        className="w-9 h-9 rounded-full border border-blue-200 object-cover"
                      />
                      {/* Card */}
                      <div
                        className={`rounded-2xl px-5 py-3 shadow-sm ${
                          isOwn
                            ? "bg-blue-600 text-white ml-auto"
                            : "bg-blue-50 text-slate-800"
                        } flex flex-col min-w-55 max-w-xl relative`}
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
                        <div className="text-base whitespace-pre-line wrap-break-word max-w-xs md:max-w-sm lg:max-w-md overflow-x-auto">
                          {c.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 🔹 INPUT */}
            <div className="bg-white border-t px-6 py-3 flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-slate-100">
                <FiPlus />
              </button>

              <input
                className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !sending) handleSend();
                }}
              />
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="bg-blue-600 text-white p-3 rounded-full"
              >
                <FiSend />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskCommentPage;
