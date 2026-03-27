import { FiEye } from "react-icons/fi";

export interface TaskItem {
  id: number;
  title: string;
  projectName: string;
  assignedByName: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  deadline: string;
}

interface TaskTableProps {
  title: string;
  tasks: TaskItem[];
  emptyMessage: string;
  loading?: boolean;
  updatingId?: number | null;
  onStatusChange: (id: number, status: TaskItem["status"]) => void;
}

const formatDate = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB");
};

const priorityClassMap: Record<TaskItem["priority"], string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-orange-50 text-orange-700",
  high: "bg-red-50 text-red-700",
};

const statusSelectClassMap: Record<TaskItem["status"], string> = {
  pending: "border-amber-400 bg-amber-50 text-amber-800",
  in_progress: "border-blue-400 bg-blue-50 text-blue-800",
  completed: "border-emerald-400 bg-emerald-50 text-emerald-800",
};

function TaskTable({
  title,
  tasks,
  emptyMessage,
  loading = false,
  updatingId = null,
  onStatusChange,
}: TaskTableProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {tasks.length} records
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Task</th>
              <th className="px-5 py-3 font-medium">Project</th>
              <th className="px-5 py-3 font-medium">Assigned By</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Deadline</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">View</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  Loading tasks...
                </td>
              </tr>
            ) : tasks.length > 0 ? (
              tasks.map((task) => {
                const isUpdating = updatingId === task.id;
                return (
                  <tr key={task.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {task.title}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {task.projectName || "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {task.assignedByName || "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {task.description || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium
                         ${priorityClassMap[task.priority]}`}
                      >
                        {task.priority[0].toUpperCase() +
                          task.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(task.deadline)}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={task.status}
                        disabled={isUpdating}
                        onChange={(e) =>
                          onStatusChange(
                            task.id,
                            e.target.value as TaskItem["status"],
                          )
                        }
                        className={`rounded-xl border px-3 py-1.5 text-xs font-medium outline-none transition disabled:cursor-wait disabled:opacity-60 ${statusSelectClassMap[task.status]}`}
                      >
                        <option value="pending">🟡 Pending</option>
                        <option value="in_progress">🔵 In Progress</option>
                        <option value="completed">🟢 Completed</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        <FiEye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TaskTable;
