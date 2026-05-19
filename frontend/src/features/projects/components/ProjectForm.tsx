import { useEffect, useState } from "react";
import ModalShell from "@/features/users/components/ModalShell";
import { useTranslation } from "react-i18next";
import RichTextEditor from "@/components/editor/RichTextEditor";
import type {
  ManagerOption,
  ProjectFormValues,
  ProjectItem,
} from "@/features/projects/types/project.types";

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: ProjectFormValues) => Promise<void>;
  managers: ManagerOption[];
  isSaving: boolean;
  project?: ProjectItem | null;
}

// Helper function to convert date string to YYYY-MM-DD format for date input fields
const toDateInputValue = (value: string) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
};

// Main component for creating/editing a project, displayed inside a modal
function ProjectForm({
  isOpen,
  onClose,
  onSave,
  managers,
  isSaving,
  project,
}: ProjectFormProps) {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState<ProjectFormValues>({
    name: "",
    code: "",
    description: "",
    managerId: 0,
    startDate: "",
    endDate: "",
    status: "pending",
    priority: "medium",
  });

  useEffect(() => {
    if (project) {
      setFormValues({
        name: project.name,
        code: project.code ?? "",
        description: project.description,
        managerId: project.managerId,
        startDate: toDateInputValue(project.startDate),
        endDate: toDateInputValue(project.endDate),
        status: project.status,
        priority: project.priority ?? "medium",
      });
      return;
    }

    setFormValues({
      name: "",
      code: "",
      description: "",
      managerId: managers[0]?.id ?? 0,
      startDate: "",
      endDate: "",
      status: "pending",
      priority: "medium",
    });
  }, [project, managers, isOpen]);

  // Handle changes to form fields and update local state accordingly
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormValues((currentValues) => {
      if (name === "managerId") {
        return {
          ...currentValues,
          managerId: Number.parseInt(value, 10),
        };
      }

      return {
        ...currentValues,
        [name]: value,
      };
    });
  };

  // Handle form submission by calling the onSave prop with the current form values
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSave(formValues);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        project ? t("projects.editProject") : t("projects.createProjectTitle")
      }
      maxWidth="max-w-2xl"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4">
          {/* Row 1: Project Name + Project Code */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t("projects.projectName")}
              </span>
              <input
                type="text"
                name="name"
                value={formValues.name}
                onChange={handleChange}
                placeholder="e.g. Sokoni App"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Project Code
              </span>
              <input
                type="text"
                name="code"
                value={formValues.code ?? ""}
                onChange={handleChange}
                placeholder="e.g. PRJ-001"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>
          </div>

          {/* Description */}
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              {t("projects.description")}
            </span>
            <RichTextEditor
              value={formValues.description}
              onChange={(content) =>
                setFormValues((prev) => ({ ...prev, description: content }))
              }
              placeholder="Brief project description..."
              height="120px"
              simple
            />
          </label>

          {/* Row 3: Manager */}
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              {t("projects.manager")}
            </span>
            <select
              name="managerId"
              value={formValues.managerId || ""}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              required
            >
              <option value="" disabled>
                {t("projects.selectManager")}
              </option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
            </select>
          </label>

          {/* Row 4: Status + Priority */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t("projects.status")}
              </span>
              <select
                name="status"
                value={formValues.status ?? "pending"}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              >
                <option value="pending">{t("projects.pending")}</option>
                <option value="in_progress">{t("projects.inProgress")}</option>
                <option value="complete">{t("projects.complete")}</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Priority
              </span>
              <select
                name="priority"
                value={formValues.priority ?? "medium"}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          {/* Row 5: Start Date + End Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t("projects.startDate")}
              </span>
              <input
                type="date"
                name="startDate"
                value={formValues.startDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t("projects.endDate")}
              </span>
              <input
                type="date"
                name="endDate"
                value={formValues.endDate}
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
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSaving
              ? t("projects.saving")
              : project
                ? t("projects.saveChanges")
                : t("projects.createProject")}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export default ProjectForm;
