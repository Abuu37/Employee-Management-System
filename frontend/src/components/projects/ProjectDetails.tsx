import ModalShell from "../user/ModalShell";
import type { ProjectItem, ProjectTask } from "./types";

interface ProjectDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem | null;
  tasks: ProjectTask[];
}

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

const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    complete: "Complete",
    completed: "Completed",
  };

  return map[status] || status;
};

function ProjectDetails({
  isOpen,
  onClose,
  project,
  tasks,
}: ProjectDetailsProps) {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Project Details"
      maxWidth="max-w-4xl"
    >
      {project ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
            <h3 className="text-xl font-semibold text-slate-900">
              {project.name}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {project.description || "No description"}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Manager
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {project.managerName}
                </p>
              </div>
              <div className="rounded-xl bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Start Date
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatDate(project.startDate)}
                </p>
              </div>
              <div className="rounded-xl bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  End Date
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatDate(project.endDate)}
                </p>
              </div>
              <div className="rounded-xl bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatStatus(project.status)}
                </p>
              </div>
            </div>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h4 className="text-sm font-semibold text-slate-900">
                Tasks (Read Only)
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Task Name</th>
                    <th className="px-5 py-3 font-medium">Assigned</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <tr key={task.id} className="border-t border-slate-100">
                        <td className="px-5 py-4 font-medium text-slate-900">
                          {task.title}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {task.assignedName}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {formatStatus(task.status)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-5 py-8 text-center text-sm text-slate-500"
                      >
                        No tasks found for this project.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}

export default ProjectDetails;
