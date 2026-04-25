import { useState } from "react";
import DeleteTaskModal from "@/features/tasks/components/DeleteTaskModal";
import { FiPlus } from "react-icons/fi";
import { FiMessageCircle } from "react-icons/fi";
import ModalShell from "@/features/employees/components/ModalShell";
import TaskFormModal, { type TaskFormValues } from "@/features/tasks/components/TaskFormModal";
import TaskCommentPage from "@/features/tasks/TaskCommentPage";
import type { ProjectItem, ProjectTask } from "./types";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 8;

// Component for displaying project details and associated tasks in a read-only modal
interface ProjectDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem | null;
  tasks: ProjectTask[];
  assignees: Array<{ id: number; name: string }>;
  onCreateTask: (values: TaskFormValues) => Promise<void>;
  onDeleteTask?: (taskId: number) => Promise<void>;
}

// Helper function to format date strings for display in the project details modal
const formatDate = (value: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-GB");
};

// Helper function to format project/task status for display in the project details modal
const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    complete: "Complete",
    completed: "Completed",
  };
  return map[status] || status;
};

// Status color map for badge styling
const statusColorMap: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  in_progress: "bg-blue-100 text-blue-800 border border-blue-300",
  completed: "bg-green-100 text-green-800 border border-green-300",
};

// Main component for displaying project details and associated tasks in a read-only modal

function ProjectDetails({
  isOpen,
  onClose,
  project,
  tasks,
  assignees,
  onCreateTask,
  onDeleteTask,
  isAdmin,
}: ProjectDetailsProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const role = localStorage.getItem("user-role");
  const navigate = useNavigate();

  // Managers can always create tasks
  const canCreateTask = role === "manager";

  // constant that only MANAGER and project is IN_PROGRESS and onDeleteTask exists
  const canDeleteTask =
    role === "manager" && project?.status === "in_progress" && !!onDeleteTask;

  const handleTaskFormSubmit = async (values: TaskFormValues) => {
    await onCreateTask(values);
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

  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [taskPage, setTaskPage] = useState(1);
  const taskTotalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));
  const paginatedTasks = tasks.slice(
    (taskPage - 1) * PAGE_SIZE,
    taskPage * PAGE_SIZE,
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Project Details"
      maxWidth="max-w-4xl"
    >
      {project ? (
        <div className="space-y-6">
          {/* Static card style like user details */}
          <div className="rounded-2xl bg-linear-to-br from-blue-600 via-cyan-600 to-teal-500 p-px">
            <div className="rounded-2xl bg-white px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Project Snapshot
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">
                {project.name}
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {/* Only show Manager card for admin, otherwise show Description */}
                {(() => {
                  const isAdmin =
                    typeof window !== "undefined" &&
                    localStorage.getItem("user-role") === "admin";
                  if (isAdmin) {
                    return (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">
                          Manager
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {project.managerName || ""}
                        </p>
                      </div>
                    );
                  } else {
                    return (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">
                          Description
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {project.description || ""}
                        </p>
                      </div>
                    );
                  }
                })()}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">
                    Start Date
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(project.startDate)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">
                    End Date
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(project.endDate)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">
                    Status
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatStatus(project.status)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ====================== Tasks Table ======================= */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">Tasks</h4>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(true)}
                disabled={!canCreateTask}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition
                 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <FiPlus className="h-4 w-4" />
                Create Task
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Task Name</th>
                    <th className="px-5 py-3 font-medium">Description</th>
                    <th className="px-5 py-3 font-medium">Assigned To</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Deadline</th>
                    <th className="px-5 py-3 font-medium">Comment</th>
                    <th className="px-5 py-3 font-medium">Delete</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {tasks.length > 0 ? (
                    paginatedTasks.map((task) => (
                      <tr key={task.id} className="border-t border-slate-100">
                        <td className="px-5 py-4 font-medium text-slate-900">
                          {task.title}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {task.description}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {task.assignedName}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap
                               ${statusColorMap[task.status] || "bg-slate-100 text-slate-700 border border-slate-200"}`}
                          >
                            {formatStatus(task.status)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(task.deadline)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                            onClick={() => {
                              setSelectedTaskId(task.id);
                              setCommentModalOpen(true);
                            }}
                            title="Comment on Tasks"
                          >
                            <FiMessageCircle className="h-5 w-5" />
                            Comment
                          </button>
                        </td>
                          

                        <td className="px-5 py-4 text-right">
                          {canDeleteTask && (
                            <button
                              type="button"
                              className="rounded-xl bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200 hover:bg-red-100"
                              onClick={() => handleDeleteClick(task)}
                              title="Delete Task"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-8 text-center text-sm text-slate-500"
                      >
                        No tasks found for this project.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
              <button
                onClick={() => setTaskPage((p) => Math.max(1, p - 1))}
                disabled={taskPage === 1}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setTaskPage((p) => Math.min(taskTotalPages, p + 1))
                }
                disabled={taskPage === taskTotalPages}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                Next
              </button>
            </div>
          </section>

          {/* Comment Modal */}
          <ModalShell
            isOpen={commentModalOpen}
            onClose={() => setCommentModalOpen(false)}
            title="Task Comments"
            maxWidth="max-w-3xl"
          >
            {selectedTaskId && (
              <TaskCommentPage taskId={selectedTaskId.toString()} modalMode />
            )}
          </ModalShell>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium
               text-white transition hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

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
