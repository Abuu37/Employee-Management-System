import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FiClipboard } from "react-icons/fi";
import ModalShell from "@/features/users/components/ModalShell";
import { toast } from "react-hot-toast";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { isRichTextEmpty } from "@/utils/richText";
import type { TaskFormValues } from "@/features/tasks/types/task.types";

// Re-export for any consumers that import TaskFormValues from this file
export type { TaskFormValues };

type TaskFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  assignees: Array<{ id: number; name: string }>;
  onSubmit: (values: TaskFormValues) => void | Promise<void>;
};

const taskValidationSchema = Yup.object({
  title: Yup.string().trim().required("Task name is required"),
  assignedTo: Yup.number()
    .typeError("Please select an employee")
    .min(1, "Please select an employee")
    .required("Please select an employee"),
  priority: Yup.string()
    .oneOf(["low", "medium", "high"])
    .required("Priority is required"),
  deadline: Yup.string().optional(),
  description: Yup.string().optional(),
});

const fieldClass = (hasError: boolean) =>
  `w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
    hasError
      ? "border-red-500 bg-white focus:border-red-500"
      : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white"
  }`;

const initialValues = {
  title: "",
  description: "",
  assignedTo: 0,
  priority: "medium" as "low" | "medium" | "high",
  deadline: "",
};

export default function TaskFormModal({
  isOpen,
  onClose,
  assignees,
  onSubmit,
}: TaskFormModalProps) {
  if (!isOpen) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <FiClipboard className="h-4 w-4" />
          </span>
          Create Task
        </span>
      }
      maxWidth="max-w-2xl"
      overlayClassName="bg-slate-0/10 backdrop-blur-none"
      panelClassName="shadow-lg"
    >
      <Formik
        key={isOpen ? "open" : "closed"}
        initialValues={initialValues}
        validationSchema={taskValidationSchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            await onSubmit({
              title: values.title.trim(),
              description: isRichTextEmpty(values.description)
                ? undefined
                : values.description,
              assignedTo: values.assignedTo,
              priority: values.priority,
              deadline: values.deadline || undefined,
            });
            toast.success("Task created successfully");
            resetForm();
            onClose();
          } catch (error: any) {
            toast.error(
              error?.response?.data?.message || "Failed to submit task",
            );
          }
        }}
      >
        {({ errors, touched, values, setFieldValue, isSubmitting }) => (
          <Form className="space-y-5">
            <div className="grid gap-4">
              {/* Task Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Task Name <span className="text-red-500">*</span>
                </label>
                <Field
                  name="title"
                  placeholder="Task title"
                  className={fieldClass(!!(errors.title && touched.title))}
                />
                <ErrorMessage
                  name="title"
                  component="p"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>
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
                    placeholder="Task description"
                    height="120px"
                    simple
                  />
                </div>
              </div>

              {/* Assigned To */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Assigned To <span className="text-red-500">*</span>
                </label>
                <select
                  value={values.assignedTo || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "assignedTo",
                      e.target.value ? Number(e.target.value) : 0,
                    )
                  }
                  className={fieldClass(
                    !!(errors.assignedTo && touched.assignedTo),
                  )}
                >
                  <option value="" disabled>
                    Select employee
                  </option>
                  {assignees.map((assignee) => (
                    <option key={assignee.id} value={assignee.id}>
                      {assignee.name}
                    </option>
                  ))}
                </select>
                <ErrorMessage
                  name="assignedTo"
                  component="p"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/* Priority + Deadline */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Priority
                  </label>
                  <Field
                    as="select"
                    name="priority"
                    className={fieldClass(
                      !!(errors.priority && touched.priority),
                    )}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Field>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Deadline
                  </label>
                  <Field
                    type="date"
                    name="deadline"
                    min={new Date().toISOString().split("T")[0]}
                    className={fieldClass(
                      !!(errors.deadline && touched.deadline),
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isSubmitting ? "Creating..." : "Create Task"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </ModalShell>
  );
}
