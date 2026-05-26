import { useEffect, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import ModalShell from "@/features/users/components/ModalShell";
import { FiFile, FiUploadCloud } from "react-icons/fi";
import { useUser } from "@/context/UserContext";
import { getAccessToken } from "@/features/auth/services/authSession";

interface UserOption {
  id: number;
  name: string;
}

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    file: File;
    user_id: number;
    file_type: string;
    visibility: string;
  }) => Promise<void>;
  isSaving: boolean;
}

const FILE_TYPES_BY_ROLE: Record<string, { value: string; label: string }[]> = {
  admin: [
    { value: "contract", label: "Contract" },
    { value: "id", label: "ID Document" },
    { value: "cv", label: "CV / Resume" },
    { value: "certificate", label: "Certificate" },
    { value: "performance_report", label: "Performance Report" },
    { value: "evaluation", label: "Evaluation" },
  ],
  manager: [
    { value: "performance_report", label: "Performance Report" },
    { value: "evaluation", label: "Evaluation" },
  ],
  employee: [
    { value: "cv", label: "CV / Resume" },
    { value: "certificate", label: "Certificate" },
  ],
};

const fieldClass = (hasError: boolean) =>
  `w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
    hasError
      ? "border-red-500 bg-white focus:border-red-500"
      : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white"
  }`;

export default function UploadDocumentModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: UploadDocumentModalProps) {
  const { user } = useUser();
  const role = user?.role ?? "employee";
  const currentUserId = user?.id ?? 0;
  const [users, setUsers] = useState<UserOption[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = FILE_TYPES_BY_ROLE[role] ?? FILE_TYPES_BY_ROLE.employee;

  useEffect(() => {
    if (!isOpen || role === "employee") return;
    const token = getAccessToken();
    axios
      .get("http://localhost:5000/api/user/view-users", {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      })
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data.users ?? []);
        const filtered =
          role === "manager"
            ? list.filter((u: any) => u.manager_id === currentUserId)
            : list;
        setUsers(filtered.map((u: any) => ({ id: u.id, name: u.name })));
      })
      .catch(console.error);
  }, [isOpen]);

  const buildSchema = () => {
    const base = {
      fileType: Yup.string().required("Please select a document type"),
      file: Yup.mixed<File>().required("Please select a file"),
    };
    if (role === "manager") {
      return Yup.object({
        ...base,
        managerScope: Yup.string()
          .oneOf(["private", "team"])
          .required("Please select who this document is for"),
        userId: Yup.number().when("managerScope", {
          is: "private",
          then: (s) =>
            s
              .min(1, "Please select an employee")
              .required("Please select an employee"),
          otherwise: (s) => s,
        }),
      });
    }
    if (role === "admin") {
      return Yup.object({
        ...base,
        userId: Yup.number()
          .min(1, "Please select an employee")
          .required("Please select an employee"),
      });
    }
    return Yup.object(base);
  };

  const initialValues = {
    managerScope: "" as "" | "private" | "team",
    userId: role === "employee" ? currentUserId : 0,
    fileType: "",
    visibility: "private",
    file: null as File | null,
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <FiFile className="h-4 w-4" />
          </span>
          Upload Document
        </span>
      }
      maxWidth="max-w-2xl"
    >
      <Formik
        key={isOpen ? "open" : "closed"}
        initialValues={initialValues}
        validationSchema={buildSchema()}
        onSubmit={async (values) => {
          const effectiveUserId =
            role === "manager" && values.managerScope === "team"
              ? currentUserId
              : values.userId;
          await onSave({
            file: values.file!,
            user_id: effectiveUserId,
            file_type: values.fileType,
            visibility: values.visibility,
          });
        }}
      >
        {({ errors, touched, values, setFieldValue }) => (
          <Form className="space-y-5">
            {role === "manager" && (
              <div>
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Who is this document for?
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {(["private", "team"] as const).map((scope) => (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => {
                        setFieldValue("managerScope", scope);
                        setFieldValue(
                          "visibility",
                          scope === "team" ? "team" : "private",
                        );
                        setFieldValue(
                          "userId",
                          scope === "team" ? currentUserId : 0,
                        );
                      }}
                      className={`rounded-2xl border-2 px-4 py-3 text-left transition ${
                        values.managerScope === scope
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-slate-50 hover:border-blue-300"
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-800">
                        {scope === "private" ? "Lock Private" : "Team"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {scope === "private"
                          ? "Single employee"
                          : "All my employees"}
                      </p>
                    </button>
                  ))}
                </div>
                <ErrorMessage
                  name="managerScope"
                  component="p"
                  className="mt-1 text-xs text-red-500"
                />
              </div>
            )}

            {(role === "admin" ||
              (role === "manager" && values.managerScope === "private")) && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Select Employee
                </label>
                <select
                  value={values.userId || ""}
                  onChange={(e) =>
                    setFieldValue("userId", Number(e.target.value))
                  }
                  className={fieldClass(!!(errors.userId && touched.userId))}
                >
                  <option value="">Select Employee</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} (ID: {u.id})
                    </option>
                  ))}
                </select>
                <ErrorMessage
                  name="userId"
                  component="p"
                  className="mt-1 text-xs text-red-500"
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Document Type
                </label>
                <Field
                  as="select"
                  name="fileType"
                  className={fieldClass(
                    !!(errors.fileType && touched.fileType),
                  )}
                >
                  <option value="">Select Type</option>
                  {allowedTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="fileType"
                  component="p"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Visibility
                </span>
                {role === "manager" ? (
                  <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    {values.managerScope === "team"
                      ? "Team — all employees under you"
                      : values.managerScope === "private"
                        ? "Private — selected employee only"
                        : "—"}
                  </div>
                ) : (
                  <Field
                    as="select"
                    name="visibility"
                    className={fieldClass(false)}
                  >
                    <option value="private">Private</option>
                    <option value="team">Team</option>
                    <option value="company">Company</option>
                  </Field>
                )}
              </div>
            </div>

            <div>
              <div
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 transition ${
                  errors.file && touched.file
                    ? "border-red-400 bg-red-50/30"
                    : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/30"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile) setFieldValue("file", droppedFile);
                }}
              >
                <FiUploadCloud className="mb-3 h-10 w-10 text-slate-400" />
                {values.file ? (
                  <p className="text-sm font-medium text-slate-700">
                    {values.file.name}
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-700">
                      Click or drag file to upload
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      PDF, JPEG, PNG, DOC, Excel — max 10MB
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      setFieldValue("file", e.target.files[0]);
                  }}
                />
              </div>
              <ErrorMessage
                name="file"
                component="p"
                className="mt-1 text-xs text-red-500"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isSaving ? "Uploading..." : "Upload Document"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </ModalShell>
  );
}
