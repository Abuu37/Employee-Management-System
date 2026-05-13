import ModalShell from "@/features/users/components/ModalShell";
import { useTranslation } from "react-i18next";
import type { ProjectItem } from "@/features/projects/types/project.types";

// Modal component for confirming project deletion, displaying project details and asking the user to confirm the action
interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  project: ProjectItem | null;
  isDeleting: boolean;
}

// Main component for confirming project deletion, displayed inside a modal
function DeleteProjectModal({
  isOpen,
  onClose,
  onConfirm,
  project,
  isDeleting,
}: DeleteProjectModalProps) {
  const { t } = useTranslation();
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t("projects.deleteProject")}
      maxWidth="max-w-lg"
    >
      {project ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
            <p className="text-sm font-medium text-red-700">
              {t("projects.deleteConfirm", { name: project.name })}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">
                {t("projects.manager")}:
              </span>{" "}
              {project.managerName}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-900">
                {t("projects.status")}:
              </span>{" "}
              {project.status}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {isDeleting
                ? t("projects.deleting")
                : t("projects.deleteProject")}
            </button>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}

export default DeleteProjectModal;
