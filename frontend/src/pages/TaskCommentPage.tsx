import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { FiArrowLeft, FiPlus } from "react-icons/fi";

const TASK_API = "http://localhost:5000/api/task";
const COMMENT_API = "http://localhost:5000/api/tasks_comments";

const TaskCommentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>("");
  const currentUserId = Number(localStorage.getItem("user-id") || 0);
  const userName = localStorage.getItem("user-name") ?? "You";

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${TASK_API}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTask(res.data);
        setError("");
      } catch (err) {
        setTask(null);
        setError(
          "Failed to load task. " +
            (err?.response?.data?.message || err?.message || ""),
        );
        console.error("Task fetch error:", err);
      }
    };
    const fetchComments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${COMMENT_API}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(
          res.data.map((c: any) => ({
          id: c.id,
          authorId: c.authorId,       // ✅ FIX
          authorName: c.authorName,   // ✅ FIX
          role: c.role,
          content: c.content,         // ✅ FIX
            createdAt: new Date(c.createdAt).toLocaleTimeString(),
         })),
        );
        
      } catch (err) {
        setComments([]);
        setError(
          "Failed to load comments. " +
            (err?.response?.data?.message || err?.message || ""),
        );
        console.error("Comments fetch error:", err);
      }
    };
    setLoading(true);
    Promise.all([fetchTask(), fetchComments()]).finally(() =>
      setLoading(false),
    );
  }, [id]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${COMMENT_API}/${id}`,
          { message },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMessage("");
      // Refresh comments
      const res = await axios.get(`${COMMENT_API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
       setComments(
       res.data.map((c: any) => ({
       id: c.id,
       authorId: c.authorId,     // ✅ FIXED
       authorName: c.authorName, // ✅ FIXED
       role: c.role,
       content: c.content,       // ✅ FIXED
      createdAt: new Date(c.createdAt).toLocaleTimeString(),
  }))
);
    } finally {
      setSending(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        {error}
      </div>
    );
  if (!task)
    return (
      <div className="flex items-center justify-center h-screen">
        Task not found.
      </div>
    );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header searchTerm="" onSearchChange={() => {}} />
        <div className="px-6 pt-2 pb-4">
          <nav className="flex items-center gap-3 text-sm mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 border 
               border-blue-600 text-blue-600 rounded-full 
               hover:bg-blue-50 transition"
            >
              <FiArrowLeft size={16} />
              Back to Tasks
            </button>
            <span className="text-slate-700 text-2xl">/</span>
            <span className="text-slate-700 font-semibold text-1xl">
              {task?.title || "Task"}
            </span>
          </nav>

          <div className="bg-white rounded-2xl shadow p-6 flex flex-col h-[60vh]">
            <div className="font-bold text-lg mb-4 flex items-center gap-2">
              <span role="img" aria-label="chat">
                💬
              </span>{" "}
              Discussion
            </div>
            <div className="flex-1 min-h-[200px] overflow-y-auto flex flex-col gap-4 pr-2">
              {comments.length === 0 && (
                <div className="text-slate-400">No messages yet.</div>
              )}

              { comments.map((c) => {

                const isOwn = c.authorId === currentUserId;

                 console.log("currentUserId:", currentUserId);
                 console.log("comment authorId:", c.authorId);

                return (
                  <div key={c.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>

                    <div  className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`} >

                      <div  className={`rounded-xl px-4 py-2 max-w-xs break-words shadow-sm ${isOwn ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"}` } >
                        <div className="flex items-center gap-2 mb-1">

                          <span className={`text-xs font-bold ${c.role === "manager" ? "text-yellow-700" : "text-blue-100"}`}>
                            {c.authorName || (isOwn ? userName : "Manager")}
                          </span>

                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.role === "manager" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" : "bg-blue-100 text-blue-700 border border-blue-200"}`}>
                            {c.role === "manager" ? "Manager" : "You"}
                          </span>

                          <span className="text-xs text-slate-400 ml-2">
                            {c.createdAt}
                          </span>
                          
                        </div>

                        <div>{c.content}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t bg-white px-6 py-4 flex items-center gap-2 mt-auto">
          <button className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100">
            <FiPlus size={20} />
          </button>
          <input
            className="flex-1 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !sending) handleSend();
            }}
            disabled={sending}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition"
            onClick={handleSend}
            disabled={sending || !message.trim()}
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
};

export default TaskCommentPage;
