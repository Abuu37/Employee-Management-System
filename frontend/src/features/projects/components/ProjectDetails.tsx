import { useState } from "react";
import { usePagination } from "@/Hook/usePagination";
import DeleteTaskModal from "@/features/tasks/components/DeleteTaskModal";
import { FiPlus, FiMessageCircle, FiTrash2, FiClock } from "react-icons/fi";
import ModalShell from "@/features/users/components/ModalShell";
import { useTranslation } from "react-i18next";
import TaskFormModal, {
  type TaskFormValues,
} from "@/features/tasks/components/TaskFormModal";
import TaskCommentPage from "@/features/tasks/pages/TaskCommentPage";
import type {
  ProjectItem,
  ProjectTask,
} from "@/features/projects/types/project.types";
import { useUser } from "@/context/UserContext";
import TablePagination from "@/components/common/TablePagination";

const PAGE_SIZE = 8;

interface ProjectDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem | null;
  tasks: ProjectTask[];
  assignees: Array<{ id: number; name: string }>;
  onCreateTask: (values: TaskFormValues) => Promise<void>;
  onDeleteTask?: (taskId: number) => Promise<void>;
}

const formatDate = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusMeta: Record<string, { label: string; cls: string; dot: string }> =
  {
    pending: {
      label: "Pending",
      cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      dot: "bg-amber-400",
    },
    in_progress: {
      label: "In Progress",
      cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
      dot: "bg-blue-500",
    },
    completed: {
      label: "Completed",
      cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      dot: "bg-emerald-500",
    },
    complete: {
      label: "Complete",
      cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      dot: "bg-emerald-500",
    },
  };

const priorityMeta: Record<string, { label: string; cls: string }> = {
  low: { label: "Low", cls: "bg-slate-100 text-slate-500" },
  medium: { label: "Medium", cls: "bg-orange-50 text-orange-600" },
  high: { label: "High", cls: "bg-red-50 text-red-600" },
};

const avatarColor = (name: string) => {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31;
  return colors[Math.abs(hash) % colors.length];
};

function StatusBadge({ status }: { status: string }) {
  const m = statusMeta[status] ?? {
    label: status,
    cls: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${m.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function ProjectDetails({
  isOpen,
  onClose,
  project,
  tasks,
  assignees,
  onCreateTask,
  onDeleteTask,
}: ProjectDetailsProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const {
    page: taskPage,
    setPage: setTaskPage,
    totalPages: taskTotalPages,
    paginated: paginatedTasks,
  } = usePagination(tasks, PAGE_SIZE);
  const { user } = useUser();
  const role = user?.role ?? null;
  const { t } = useTranslation();

  const canCreateTask = role === "manager" && project?.status === "in_progress";
  const canDeleteTask =
    role === "manager" && project?.status === "in_progress" && !!onDeleteTask;

  const handleTaskFormSubmit = async (values: TaskFormValues) => {
    if (!project) return;
    await onCreateTask({ ...values, projectId: project.id });
  };

  const handleDeleteClick = (task: ProjectTask) => {
    setSelectedTask(task);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTask || !onDeleteTask) return;
    setIsDeleting(true);
    try {
      await onDeleteTask(selectedTask.id);
      setDeleteModalOpen(false);
      setSelectedTask(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t("projects.projectSnapshot") || "Project Snapshot"}
      maxWidth="max-w-4xl"
    >
      {project ? (
        <div className="space-y-5">
          {/* -- Project Info Card -- */}
          <div className="rounded-2xl bg-linear-to-br from-blue-600 via-cyan-600 to-teal-500 p-px shadow-sm">
            <div className="rounded-2xl bg-white px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Project Snapshot
              </p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <h3 className="text-xl font-bold text-slate-900">
                  {project.name}
                </h3>
                <StatusBadge status={project.status} />
              </div>

              {project.description && (
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  {project.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                {role === "admin" && project.managerName && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Manager
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                      {project.managerName}
                    </p>
                  </div>
                )}
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Start Date
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {formatDate(project.startDate)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    End Date
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {formatDate(project.endDate)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Tasks
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {tasks.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* -- Tasks Table -- */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Table header bar */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800">
                  Tasks
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                  {tasks.length}
                </span>
              </div>
              {canCreateTask && (
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <FiPlus className="h-3.5 w-3.5" />
                  Create Task
                </button>
              )}
            </div>

            {tasks.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <FiPlus className="h-8 w-8 text-slate-200" />
                <p className="text-sm text-slate-400">No tasks yet.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <th className="px-5 py-3">Task</th>
                        <th className="px-4 py-3">Assigned To</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Deadline</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {paginatedTasks.map((task) => {
                        const priority = (task as any).priority ?? "medium";
                        const pMeta =
                          priorityMeta[priority] ?? priorityMeta["medium"];
                        const initials = task.assignedName
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase();

                        return (
                          <tr
                            key={task.id}
                            className="hover:bg-slate-50/60 transition-colors"
                          >
                            {/* Task name + description + priority */}
                            <td className="px-5 py-3.5 max-w-50">
                              <p className="font-semibold text-slate-900 leading-snug">
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                                  {task.description}
                                </p>
                              )}
                              <span
                                className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${pMeta.cls}`}
                              >
                                {pMeta.label}
                              </span>
                            </td>

                            {/* Assignee */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${avatarColor(task.assignedName)}`}
                                >
                                  {initials}
                                </div>
                                <span className="text-xs text-slate-700 whitespace-nowrap">
                                  {task.assignedName}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5">
                              <StatusBadge status={task.status} />
                            </td>

                            {/* Deadline */}
                            <td className="px-4 py-3.5">
                              {task.deadline ? (
                                <div className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                                  <FiClock className="h-3 w-3 shrink-0" />
                                  {formatDate(task.deadline)}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-300">
                                  —
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTaskId(task.id);
                                    setCommentModalOpen(true);
                                  }}
                                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                  title="Comments"
                                >
                                  <FiMessageCircle className="h-3.5 w-3.5" />
                                  <span>Comment</span>
                                </button>
                                {canDeleteTask && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteClick(task)}
                                    className="flex items-center justify-center rounded-lg border border-red-100 bg-red-50 p-1.5 text-red-500 hover:bg-red-100 transition-colors"
                                    title="Delete Task"
                                  >
                                    <FiTrash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {taskTotalPages > 1 && (
                  <TablePagination
                    page={taskPage}
                    totalPages={taskTotalPages}
                    onPageChange={setTaskPage}
                  />
                )}
              </>
            )}
          </section>

          {/* -- Close -- */}
          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {/* Comment Modal */}
      <ModalShell
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        title={t("tasks.comments") || "Task Comments"}
        maxWidth="max-w-3xl"
      >
        {selectedTaskId && (
          <TaskCommentPage taskId={selectedTaskId.toString()} modalMode />
        )}
      </ModalShell>

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        assignees={assignees}
        onSubmit={handleTaskFormSubmit}
      />
      <DeleteTaskModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        taskTitle={selectedTask?.title}
        isDeleting={isDeleting}
      />
    </ModalShell>
  );
}

export default ProjectDetails;
