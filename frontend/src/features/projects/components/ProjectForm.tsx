import ModalShell from "@/features/users/components/ModalShell";
import { useTranslation } from "react-i18next";
import { FiFolder } from "react-icons/fi";
import RichTextEditor from "@/components/editor/RichTextEditor";
import type {
  ManagerOption,
  ProjectFormValues,
  ProjectItem,
} from "@/features/projects/types/project.types";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: ProjectFormValues) => Promise<void>;
  managers: ManagerOption[];
  isSaving: boolean;
  project?: ProjectItem | null;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Project name is required"),

  code: Yup.string().required("Project code is required"),

  description: Yup.string(),

  managerId: Yup.number()
    .typeError("Manager is required")
    .min(1, "Manager is required")
    .required("Manager is required"),

  status: Yup.string().required("status is required"),

  startDate: Yup.string().required("Start date is required"),

  endDate: Yup.string()
    .required("End date is required")
    .test(
      "is-after-start",
      "End date cannot be before start date",
      function (value) {
        const { startDate } = this.parent;

        if (!startDate || !value) {
          return true;
        }

        return new Date(value) >= new Date(startDate);
      },
    ),

  status: Yup.string().required("Status is required"),

  priority: Yup.string().required("Priority is required"),
});

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

  const initialValues: ProjectFormValues = {
    name: project?.name ?? "",
    code: project?.code ?? "",
    description: project?.description ?? "",
    managerId: project?.managerId ?? 0,
    startDate: toDateInputValue(project?.startDate ?? ""),
    endDate: toDateInputValue(project?.endDate ?? ""),
    status: project?.status ?? "",
    priority: project?.priority ?? "",
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <FiFolder className="h-4 w-4" />
          </span>
          {project
            ? t("projects.editProject")
            : t("projects.createProjectTitle")}
        </span>
      }
      maxWidth="max-w-2xl"
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          await onSave(values);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => (
          <Form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4">
              {/*============ Row 1: Project Name + Project Code ============*/}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Project Name */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    {t("projects.projectName")}{" "}
                    <span className="text-red-500">*</span>
                  </span>

                  <Field
                    type="text"
                    name="name"
                    placeholder="e.g. Sokoni App"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
                      ${
                        errors.name && touched.name
                          ? "border-red-500  focus:border-red-500"
                          : "border-slate-200 bg-slate-50 focus:border-blue-500"
                      }`}
                  />

                  <ErrorMessage
                    name="name"
                    component="div"
                    className="mt-1 text-xs text-red-500"
                  />
                </label>

                {/* Project Code */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Project Code {""}
                    <span className="text-red-500">*</span>
                  </span>

                  <Field
                    type="text"
                    name="code"
                    placeholder="e.g. PRJ-001"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
                      ${
                        errors.code && touched.code
                          ? "border-red-500  focus:border-red-500"
                          : "border-slate-200 bg-slate-50 focus:border-blue-500"
                      }`}
                  />

                  <ErrorMessage
                    name="code"
                    component="div"
                    className="mt-1 text-xs text-red-500"
                  />
                </label>
              </div>

              {/* Description */}
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  {t("projects.description")}
                </span>

                <div
                  className={`rounded-2xl border transition ${
                    errors.description && touched.description
                      ? "border-red-500"
                      : "border-slate-200"
                  }`}
                >
                  <RichTextEditor
                    value={values.description}
                    onChange={(content) =>
                      setFieldValue("description", content)
                    }
                    placeholder="Brief project description..."
                    height="120px"
                    simple
                  />
                </div>

                <ErrorMessage
                  name="description"
                  component="div"
                  className="mt-1 text-xs text-red-500"
                />
              </label>

              {/* Manager */}
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  {t("projects.manager")}{" "}
                  <span className="text-red-500">*</span>
                </span>

                <Field
                  as="select"
                  name="managerId"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
                    ${
                      errors.managerId && touched.managerId
                        ? "border-red-500  focus:border-red-500"
                        : "border-slate-200 bg-slate-50 focus:border-blue-500"
                    }`}
                >
                  <option value={0} disabled>
                    {t("projects.selectManager")}
                  </option>

                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </Field>

                <ErrorMessage
                  name="managerId"
                  component="div"
                  className="mt-1 text-xs text-red-500"
                />
              </label>

              {/* Row 4: Status + Priority */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Status */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    {t("projects.status")}{" "}
                    <span className="text-red-500">*</span>
                  </span>

                  <Field
                    as="select"
                    name="status"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
                      ${
                        errors.status && touched.status
                          ? "border-red-500  focus:border-red-500"
                          : "border-slate-200 bg-slate-50 focus:border-blue-500"
                      }`}
                  >
                    <option value="" disabled>
                      {t("projects.selectStatus")}
                    </option>

                    <option value="pending">{t("projects.pending")}</option>

                    <option value="in_progress">
                      {t("projects.inProgress")}
                    </option>

                    <option value="complete">{t("projects.complete")}</option>
                  </Field>

                  <ErrorMessage
                    name="status"
                    component="div"
                    className="mt-1 text-xs text-red-500"
                  />
                </label>

                {/* Priority */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Priority <span className="text-red-500">*</span>
                  </span>

                  <Field
                    as="select"
                    name="priority"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
                      ${
                        errors.priority && touched.priority
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-200 bg-slate-50 focus:border-blue-500"
                      }`}
                  >
                    <option value="" disabled>
                      Select Priority
                    </option>

                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Field>

                  <ErrorMessage
                    name="priority"
                    component="div"
                    className="mt-1 text-xs text-red-500"
                  />
                </label>
              </div>

              {/* Row 5: Start Date + End Date */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Start Date */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    {t("projects.startDate")}{" "}
                    <span className="text-red-500">*</span>
                  </span>

                  <Field
                    type="date"
                    name="startDate"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
                      ${
                        errors.startDate && touched.startDate
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-200 bg-slate-50 focus:border-blue-500"
                      }`}
                  />

                  <ErrorMessage
                    name="startDate"
                    component="div"
                    className="mt-1 text-xs text-red-500"
                  />
                </label>

                {/* End Date */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    {t("projects.endDate")}{" "}
                    <span className="text-red-500">*</span>
                  </span>

                  <Field
                    type="date"
                    name="endDate"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
                      ${
                        errors.endDate && touched.endDate
                          ? "border-red-500  focus:border-red-500"
                          : "border-slate-200 bg-slate-50 focus:border-blue-500"
                      }`}
                  />

                  <ErrorMessage
                    name="endDate"
                    component="div"
                    className="mt-1 text-xs text-red-500"
                  />
                </label>
              </div>
            </div>

            {/*========================  Actions =================== */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium
                text-slate-700 transition hover:bg-slate-100"
              >
                {t("common.cancel")}
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition
                hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isSaving
                  ? t("projects.saving")
                  : project
                    ? t("projects.saveChanges")
                    : t("projects.createProject")}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </ModalShell>
  );
}

export default ProjectForm;
