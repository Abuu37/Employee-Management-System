import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiCheck,
  FiTrash2,
  FiFileText,
  FiCheckSquare,
  FiCalendar,
  FiX,
} from "react-icons/fi";
import axios from "axios";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "leave" | "task" | "document";
  refId: number | null;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  leave: <FiCalendar className="h-4 w-4 text-yellow-600" />,
  task: <FiCheckSquare className="h-4 w-4 text-blue-600" />,
  document: <FiFileText className="h-4 w-4 text-emerald-600" />,
};

const TYPE_NAV: Record<string, string> = {
  leave: "/leaves",
  task: "/tasks",
  document: "/documents",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface NotificationDropdownProps {
  onCountChange?: (count: number) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onCountChange,
}) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false); // true when server is unreachable
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: Notification[] = Array.isArray(res.data) ? res.data : [];
      setNotifications(data);
      onCountChange?.(data.filter((n) => !n.isRead).length);
      pausedRef.current = false; // server reachable — resume polling
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && !err.response) {
        pausedRef.current = true; // ECONNREFUSED — pause interval ticks silently
      }
    }
  }, [onCountChange]);

  // Single interval that skips ticks while server is unreachable
  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    fetchNotifications(); // initial badge load
    const id = setInterval(() => {
      if (!pausedRef.current) fetchNotifications();
    }, 10000); // poll every 10s so other users see notifications quickly
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch immediately when user returns to this browser tab
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible" && !pausedRef.current) {
        fetchNotifications();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [fetchNotifications]);

  // Re-fetch whenever something external (e.g. document delete) signals a refresh
  useEffect(() => {
    const handler = () => fetchNotifications();
    window.addEventListener("notifications:refresh", handler);
    return () => window.removeEventListener("notifications:refresh", handler);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markOneRead = async (notif: Notification) => {
    const token = localStorage.getItem("token");
    if (!notif.isRead && token) {
      await axios.patch(
        `/api/notifications/${notif.id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
      );
    }
    setOpen(false);
    if (notif.type && TYPE_NAV[notif.type]) navigate(TYPE_NAV[notif.type]);
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    await axios.patch(
      "/api/notifications/read-all",
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    onCountChange?.(0);
  };

  const deleteOne = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return;
    await axios.delete(`/api/notifications/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    await axios.delete("/api/notifications/clear-all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications([]);
    onCountChange?.(0);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          // Re-fetch (and restart polling if server is back up) when opening
          if (next) fetchNotifications();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-slate-100"
        style={{ border: "1.5px solid #e2e8f0" }}
      >
        <FiBell className="h-4 w-4 text-slate-500" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-800">
              Notifications{" "}
              {unreadCount > 0 && (
                <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                  {unreadCount}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 transition"
                >
                  <FiCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 transition"
                >
                  <FiTrash2 className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
                <FiBell className="h-8 w-8 opacity-30" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markOneRead(n)}
                  className={`group flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-slate-50 border-b border-slate-50 ${
                    !n.isRead ? "bg-blue-50/40" : ""
                  }`}
                >
                  {/* Icon */}
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
                    {TYPE_ICON[n.type] ?? (
                      <FiBell className="h-4 w-4 text-slate-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p
                        className={`text-xs font-semibold leading-snug text-slate-800 ${!n.isRead ? "font-bold" : ""}`}
                      >
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-slate-500 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={(e) => deleteOne(e, n.id)}
                    className="mt-0.5 hidden shrink-0 rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 group-hover:flex transition"
                  >
                    <FiX className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
