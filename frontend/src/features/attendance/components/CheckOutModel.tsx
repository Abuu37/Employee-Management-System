//check out modal popout

import React from "react";
import { useEffect, useState } from "react";
import api from "@/services/axios";
import { FiX, FiLogOut, FiCheckCircle, FiClipboard } from "react-icons/fi";

type Task = {
  id: number;
  title: string;
  status: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (
    completedTaskIds: number[],
    summary: string,
    notes: string,
  ) => Promise<void>;
  role?: string;
};

export default function CheckOutModel({
  open,
  onClose,
  onConfirm,
  role = "employee",
}: Props) {
  const isEmployee = role === "employee";
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    setSummary("");
    setNotes("");
    if (!isEmployee) return;
    setLoading(true);
    api
      .get("/task/my-tasks")
      .then((res) => setTasks(res.data))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [open, isEmployee]);

  const toggleTask = (id: number) =>
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((taskId) => taskId !== id)
        : [...prev, id],
    );

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onConfirm(selected, summary, notes);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "completed")
      return {
        label: "Completed",
        dot: "bg-green-400",
        cls: "text-green-700 bg-green-50 border-green-200",
      };
    if (s === "in_progress" || s === "in progress")
      return {
        label: "In Progress",
        dot: "bg-blue-400",
        cls: "text-blue-700 bg-blue-50 border-blue-200",
      };
    return {
      label: "Pending",
      dot: "bg-amber-400",
      cls: "text-amber-700 bg-amber-50 border-amber-200",
    };
  };

  const progress =
    tasks.length > 0 ? Math.round((selected.length / tasks.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/8 overflow-hidden">
        {/* ── Gradient Header ── */}
        <div
          className="relative px-6 py-5"
          style={{
            background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <FiLogOut className="h-5 w-5 text-white" />
              </span>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">
                  End of Day Check-Out
                </h2>
                <p className="text-xs text-blue-200 mt-0.5">
                  {new Date().toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* ── Manager banner ── */}
          {!isEmployee && (
            <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
              <FiCheckCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-800">
                  Manager Check-Out
                </p>
                <p className="text-xs text-blue-500 mt-0.5">
                  Add your day summary and any carry-forward notes.
                </p>
              </div>
            </div>
          )}

          {/* ── Tasks section (employee only) ── */}
          {isEmployee && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <FiClipboard className="h-3.5 w-3.5 text-slate-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Today's Tasks
                  </p>
                </div>
                {tasks.length > 0 && (
                  <span className="text-[10px] font-semibold text-slate-400">
                    {selected.length}/{tasks.length} done
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {tasks.length > 0 && (
                <div className="mb-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, #1e3a5f, #2563eb)",
                    }}
                  />
                </div>
              )}

              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {loading ? (
                  <div className="flex items-center gap-2 px-4 py-4 text-sm text-slate-400">
                    <div className="h-3 w-3 rounded-full border-2 border-slate-300 border-t-slate-500 animate-spin" />
                    Loading tasks…
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-slate-400 text-center">
                    No tasks for today
                  </div>
                ) : (
                  <ul className="max-h-44 overflow-y-auto divide-y divide-slate-100">
                    {tasks.map((task) => {
                      const isSelected = selected.includes(task.id);
                      const badge = statusBadge(task.status);
                      return (
                        <li
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors
                            ${isSelected ? "bg-slate-50" : "bg-white hover:bg-slate-50/70"}`}
                        >
                          <span
                            className={`h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-all duration-150
                            ${isSelected ? "border-[#1e3a5f] bg-[#1e3a5f]" : "border-slate-300 bg-white"}`}
                          >
                            {isSelected && (
                              <svg
                                className="h-2.5 w-2.5 text-white"
                                viewBox="0 0 10 8"
                                fill="none"
                              >
                                <path
                                  d="M1 4l3 3 5-6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                          <span
                            className={`flex-1 text-sm transition-all ${isSelected ? "font-medium text-slate-400 line-through" : "text-slate-700"}`}
                          >
                            {task.title}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.cls}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}
                            />
                            {badge.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* ── Work Summary ── */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Work Summary{" "}
              <span className="text-red-400 normal-case font-bold">*</span>
            </p>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary of what you accomplished today…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 placeholder-slate-300
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all resize-none shadow-sm"
            />
          </div>

          {/* ── Notes ── */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Notes
            </p>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything to carry forward to tomorrow…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 placeholder-slate-300
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all resize-none shadow-sm"
            />
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-500 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !summary.trim()}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white
                disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90 shadow-sm"
              style={{
                background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
              }}
            >
              <FiLogOut className="h-4 w-4" />
              {submitting ? "Checking Out…" : "Check Out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
