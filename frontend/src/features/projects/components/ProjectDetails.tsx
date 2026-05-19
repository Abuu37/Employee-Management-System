import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { usePagination } from "@/hooks/usePagination";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import {
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiEdit2,
  FiFileText,
  FiFolder,
  FiMessageCircle,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";
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
import useDeleteConfirmation from "@/hooks/useDeleteConfirmation";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { richTextToPlainText } from "@/utils/richText";

const PAGE_SIZE = 8;
type DrawerTab = "info" | "tasks";
const TAB_ITEMS: { key: DrawerTab; label: string }[] = [
  { key: "info", label: "Overview" },
  { key: "tasks", label: "Tasks" },
];

interface ProjectDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem | null;
  tasks: ProjectTask[];
  assignees: Array<{ id: number; name: string }>;
  onCreateTask: (values: TaskFormValues) => Promise<void>;
  onDeleteTask?: (taskId: number) => Promise<void>;
  onEdit?: () => void;
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

function PanelCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-lg bg-slate-100 p-1.5 text-slate-500">
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </article>
  );
}

function InfoItem({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 ${fullWidth ? "sm:col-span-2" : ""}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function SlidingTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: DrawerTab;
  onTabChange: (tab: DrawerTab) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [slider, setSlider] = useState({ left: 0, width: 0 });

  const updateSlider = useCallback(() => {
    const idx = TAB_ITEMS.findIndex((t) => t.key === activeTab);
    const btn = buttonRefs.current[idx];
    const wrap = containerRef.current;
    if (!btn || !wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setSlider({ left: btnRect.left - wrapRect.left, width: btnRect.width });
  }, [activeTab]);

  useLayoutEffect(() => {
    updateSlider();
  }, [updateSlider]);
  useEffect(() => {
    window.addEventListener("resize", updateSlider);
    return () => window.removeEventListener("resize", updateSlider);
  }, [updateSlider]);

  return (
    <div
      ref={containerRef}
      className="relative mt-3 inline-flex items-center overflow-x-auto rounded-full border border-slate-200 bg-white p-1"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-[#1e3a5f] shadow-sm transition-all duration-300 ease-in-out"
        style={{ left: slider.left, width: slider.width }}
      />
      {TAB_ITEMS.map((tab, i) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            ref={(el) => {
              buttonRefs.current[i] = el;
            }}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${isActive ? "text-white" : "text-slate-600 hover:text-slate-800"}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
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
  onEdit,
}: ProjectDetailsProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<DrawerTab>("info");
  const deleteConfirmation = useDeleteConfirmation();

  const lastProjectRef = useRef<ProjectItem | null>(null);
  if (project) lastProjectRef.current = project;
  const drawerProject = project ?? lastProjectRef.current;

  const {
    page: taskPage,
    setPage: setTaskPage,
    totalPages: taskTotalPages,
    paginated: paginatedTasks,
  } = usePagination(tasks, PAGE_SIZE);
  const { user } = useUser();
  const role = user?.role ?? null;
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) setActiveTab("info");
  }, [isOpen]);

  const canCreateTask =
    role === "manager" && drawerProject?.status === "in_progress";
  const canDeleteTask =
    role === "manager" &&
    drawerProject?.status === "in_progress" &&
    !!onDeleteTask;

  const handleTaskFormSubmit = async (values: TaskFormValues) => {
    if (!drawerProject) return;
    await onCreateTask({ ...values, projectId: drawerProject.id });
  };

  const handleDeleteClick = (task: ProjectTask) => {
    setSelectedTask(task);
    deleteConfirmation.requestDelete({
      title: t("common.delete"),
      message: `Are you sure you want to delete the task ${task.title}?`,
      confirmLabel: t("common.delete"),
      cancelLabel: t("common.cancel"),
      onConfirm: handleConfirmDelete,
    });
  };

  const handleConfirmDelete = async () => {
    if (!selectedTask || !onDeleteTask) return;
    setIsDeleting(true);
    try {
      await onDeleteTask(selectedTask.id);
      setSelectedTask(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const initials = drawerProject?.name
    ? drawerProject.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "PR";

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
          style={{ pointerEvents: isOpen ? "auto" : "none" }}
          onClick={onClose}
        />

        {/* Slide panel */}
        <div
          className={`absolute inset-y-0 right-0 w-full max-w-full sm:max-w-4xl bg-white shadow-2xl flex flex-col overflow-y-auto overflow-x-hidden transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {drawerProject && (
            <>
              {/* Sticky header */}
              <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <FiFolder className="h-5 w-5 text-slate-600" />
                  <h2 className="text-lg font-semibold text-slate-800">
                    Project Details
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close project details"
                  className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>

              {/* Sticky hero + tabs */}
              <div className="sticky top-15.25 z-20 border-b border-slate-100 bg-white px-5 pt-4 pb-3 sm:px-6">
                <div className="rounded-2xl bg-linear-to-br from-blue-600 via-cyan-600 to-teal-500 p-px shadow-md drop-shadow-sm">
                  <div className="rounded-2xl bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#1e3a5f]">
                        <FiBriefcase className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-slate-900 truncate">
                            {drawerProject.name}
                          </p>
                          <StatusBadge status={drawerProject.status} />
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">
                          Project Name
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <SlidingTabBar
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>

              {/* Scrollable content */}
              <div className="flex-1 px-5 py-4 pb-24 sm:px-6 space-y-4">
                {" "}
                {/* Overview */}
                {activeTab === "info" && (
                  <section className="space-y-4">
                    {/* Project Information */}
                    <PanelCard
                      title="Project Information"
                      icon={<FiBriefcase className="h-4 w-4" />}
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <InfoItem
                          label="Project Code"
                          value={(drawerProject as any).code ?? "�"}
                        />
                        <InfoItem
                          label={t("projects.manager") || "Manager"}
                          value={drawerProject.managerName ?? "Not assigned"}
                        />
                        <InfoItem
                          label="Total Tasks"
                          value={String(tasks.length)}
                        />
                        {(() => {
                          const p = (drawerProject as any).priority ?? "medium";
                          const pm = priorityMeta[p] ?? priorityMeta["medium"];
                          return (
                            <InfoItem
                              label="Priority"
                              value={
                                <span
                                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${pm.cls}`}
                                >
                                  {pm.label}
                                </span>
                              }
                            />
                          );
                        })()}
                      </div>
                    </PanelCard>

                    {/* Schedule */}
                    <PanelCard
                      title="Schedule"
                      icon={<FiCalendar className="h-4 w-4" />}
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <InfoItem
                          label={t("projects.startDate") || "Start Date"}
                          value={formatDate(drawerProject.startDate)}
                        />
                        <InfoItem
                          label={t("projects.endDate") || "End Date"}
                          value={formatDate(drawerProject.endDate)}
                        />
                      </div>
                    </PanelCard>

                    {/* Description */}
                    {drawerProject.description && (
                      <PanelCard
                        title={t("projects.description") || "Description"}
                        icon={<FiFileText className="h-4 w-4" />}
                      >
                        <RichTextEditor
                          value={drawerProject.description}
                          onChange={() => {}}
                          readOnly
                          simple
                          height="140px"
                        />
                      </PanelCard>
                    )}
                  </section>
                )}
                {/* Tasks */}
                {activeTab === "tasks" && (
                  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">
                          {t("projects.tasks") || "Tasks"}
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
                          <FiPlus className="h-3.5 w-3.5" /> Create Task
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
                                <th className="px-4 py-3 text-right">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {paginatedTasks.map((task) => {
                                const priority =
                                  (task as any).priority ?? "medium";
                                const pMeta =
                                  priorityMeta[priority] ??
                                  priorityMeta["medium"];
                                const taskInitials = task.assignedName
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
                                    <td className="px-5 py-3.5 max-w-45">
                                      <p className="font-semibold text-slate-900 leading-snug">
                                        {task.title}
                                      </p>
                                      {task.description && (
                                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                                          {richTextToPlainText(
                                            task.description,
                                          )}
                                        </p>
                                      )}
                                      <span
                                        className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${pMeta.cls}`}
                                      >
                                        {pMeta.label}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${avatarColor(task.assignedName)}`}
                                        >
                                          {taskInitials}
                                        </div>
                                        <span className="text-xs text-slate-700 whitespace-nowrap">
                                          {task.assignedName}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                      <StatusBadge status={task.status} />
                                    </td>
                                    <td className="px-4 py-3.5">
                                      {task.deadline ? (
                                        <div className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                                          <FiClock className="h-3 w-3 shrink-0" />
                                          {formatDate(task.deadline)}
                                        </div>
                                      ) : (
                                        <span className="text-xs text-slate-300">
                                          �
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3.5">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedTaskId(task.id);
                                            setCommentModalOpen(true);
                                          }}
                                          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                        >
                                          <FiMessageCircle className="h-3.5 w-3.5" />
                                          <span>Comment</span>
                                        </button>
                                        {canDeleteTask && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDeleteClick(task)
                                            }
                                            className="flex items-center justify-center rounded-lg border border-red-100 bg-red-50 p-1.5 text-red-500 hover:bg-red-100 transition-colors"
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
                )}
              </div>

              {/* Sticky footer */}
              {onEdit && role === "admin" && (
                <div className="sticky bottom-0 z-30 flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-5 py-3 sm:px-6">
                  <button
                    type="button"
                    onClick={onEdit}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
                  >
                    <FiEdit2 className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Portalled modals */}
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
      <DeleteConfirmModal
        isOpen={deleteConfirmation.isOpen}
        title={deleteConfirmation.dialog?.title ?? t("common.delete")}
        message={
          deleteConfirmation.dialog?.message ??
          "Are you sure you want to delete this task?"
        }
        confirmLabel={
          deleteConfirmation.dialog?.confirmLabel ?? t("common.delete")
        }
        cancelLabel={
          deleteConfirmation.dialog?.cancelLabel ?? t("common.cancel")
        }
        isProcessing={isDeleting || deleteConfirmation.isProcessing}
        onClose={() => {
          deleteConfirmation.closeDialog();
          setSelectedTask(null);
        }}
        onConfirm={deleteConfirmation.confirmDelete}
      />
    </>
  );
}

export default ProjectDetails;
