import { useState } from "react";
import ModalShell from "../user/ModalShell";

export type TaskFormValues = {
  title: string;
  description?: string;
  assignedTo: number;
  priority: "low" | "medium" | "high";
  deadline?: string;
};

type TaskFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  assignees: Array<{ id: number; name: string }>;
  onSubmit: (values: TaskFormValues) => void | Promise<void>;
};


// Component for creating a new task within a project, displayed as a modal form
export default function TaskFormModal({
  isOpen,
  onClose,
  assignees,
  onSubmit,
}: TaskFormModalProps) {
  const [form, setForm] = useState<{
    title: string;
    description: string;
    assignedTo: string;
    priority: "low" | "medium" | "high";
    deadline: string;
  }>({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    deadline: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignedToId = Number(form.assignedTo);

    if (
      !form.title.trim() ||
      !Number.isInteger(assignedToId) ||
      assignedToId <= 0
    ) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        assignedTo: assignedToId,
        priority: form.priority,
        deadline: form.deadline || undefined,
      });

      setForm({
        title: "",
        description: "",
        assignedTo: "",
        priority: "medium",
        deadline: "",
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Create Task"
      maxWidth="max-w-2xl"
      overlayClassName="bg-slate-0/10 backdrop-blur-none"
      panelClassName="shadow-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Task Name
            </span>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Task title"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm
               text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Task description"
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Assigned To
            </span>
            <select
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
            >
              <option value="">Select employee</option>
              {assignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Priority
              </span>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Deadline
              </span>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {submitting ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
