import { usePagination } from "@/hooks/usePagination";
import { FiMessageCircle } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import ActionMenu from "@/components/common/ActionMenu";
import TablePagination from "@/components/common/TablePagination";
import type { TaskItem } from "@/features/tasks/types/task.types";
import { richTextToPlainText } from "@/utils/richText";
import {
  TABLE_HEADER_CELL_CLASS,
  useTableCountBadge,
} from "@/hooks/useTableCountBadge";
import TableCountBadge from "@/components/common/TableCountBadge";
// Re-export for any consumers that import TaskItem from this file
export type { TaskItem };

const PAGE_SIZE = 8;

interface TaskTableProps {
  title: string;
  tasks: TaskItem[];
  emptyMessage: string;
  loading?: boolean;
  updatingId?: number | null;
  onStatusChange: (id: number, status: TaskItem["status"]) => void;
  onViewTask: (task: TaskItem) => void; // callback to open task details modal
  isadmin?: boolean;
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
  onViewTask,
  isadmin = false,
}: TaskTableProps) {
  const { page, setPage, totalPages, paginated } = usePagination(
    tasks,
    PAGE_SIZE,
  );
  const { t } = useTranslation();
  const { count } = useTableCountBadge({ total: tasks.length });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <TableCountBadge count={count} />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#1e3a5f] text-blue-100">
            <tr>
              <th className={TABLE_HEADER_CELL_CLASS}>{t("tasks.task")}</th>
              <th className={TABLE_HEADER_CELL_CLASS}>{t("tasks.project")}</th>
              <th className={TABLE_HEADER_CELL_CLASS}>
                {t("tasks.assignedBy")}
              </th>
              <th className={TABLE_HEADER_CELL_CLASS}>
                {t("tasks.description")}
              </th>
              <th className={TABLE_HEADER_CELL_CLASS}>{t("tasks.priority")}</th>
              <th className={TABLE_HEADER_CELL_CLASS}>{t("tasks.deadline")}</th>
              <th className={TABLE_HEADER_CELL_CLASS}>{t("tasks.status")}</th>
              <th className={`${TABLE_HEADER_CELL_CLASS} text-center`}>
                {t("tasks.comments")}
              </th>
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
              paginated.map((task) => {
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
                      {richTextToPlainText(task.description) || "-"}
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

                    {!isadmin && (
                      <td className="px-5 py-4">
                        <ActionMenu
                          ariaLabel="Task actions"
                          align="center"
                          items={[
                            {
                              label: t("tasks.comment"),
                              icon: FiMessageCircle,
                              onClick: () => onViewTask(task),
                            },
                          ]}
                        />
                      </td>
                    )}
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
      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalRecords={tasks.length}
        pageSize={PAGE_SIZE}
      />
    </section>
  );
}

export default TaskTable;



