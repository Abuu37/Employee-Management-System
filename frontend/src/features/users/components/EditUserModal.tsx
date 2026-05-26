import { useEffect, useState } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import ModalShell from "./ModalShell";
import { useUser } from "@/context/UserContext";
import type {
  User,
  UserRole,
  EditUserFormValues,
} from "@/features/users/types/user.types";
import { FiUser } from "react-icons/fi";
import { userService } from "@/features/users/services/user.service";
import { departmentService } from "@/features/departments/services/department.service";
import ManagerFormSection from "./ManagerFormSection";
import EmployeeFormSection from "./EmployeeFormSection";

const employeeValidationSchema = Yup.object({
  name: Yup.string().trim().required("Full name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string().trim().required("Phone number is required"),
  gender: Yup.string()
    .oneOf(["male", "female"], "Please select a gender")
    .required("Gender is required"),
  date_of_birth: Yup.string().required("Date of birth is required"),
  department_id: Yup.number()
    .typeError("Department is required")
    .required("Department is required"),
  position: Yup.string().trim().required("Position is required"),
  employment_type: Yup.string()
    .oneOf(["full_time", "part_time", "contract", "intern"])
    .required("Employment type is required"),
  office_branch: Yup.string().trim().required("Office / Branch is required"),
});

const managerValidationSchema = Yup.object({
  name: Yup.string().trim().required("Full name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string().trim().required("Phone number is required"),
  gender: Yup.string()
    .oneOf(["male", "female"], "Please select a gender")
    .required("Gender is required"),
  date_of_birth: Yup.string().required("Date of birth is required"),
  department_id: Yup.number()
    .typeError("Department is required")
    .required("Department is required"),
  position: Yup.string().trim().required("Position is required"),
  employment_type: Yup.string()
    .oneOf(["full_time", "part_time", "contract", "intern"])
    .required("Employment type is required"),
  office_branch: Yup.string().trim().required("Office / Branch is required"),
});

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formValues: EditUserFormValues) => Promise<void>;
  user: User | null;
  roleOptions: UserRole[];
  isSaving: boolean;
}

function EditUserModal({
  isOpen,
  onClose,
  onSave,
  user,
  roleOptions,
  isSaving,
}: EditUserModalProps) {
  const { user: currentUser } = useUser();
  const currentUserRole = currentUser?.role ?? null;
  const isManagerMode =
    roleOptions.length === 1 && roleOptions[0] === "manager";

  const [managers, setManagers] = useState<{ id: number; name: string }[]>([]);
  const [supervisors, setSupervisors] = useState<
    { id: number; name: string }[]
  >([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [departments, setDepartments] = useState<
    { id: number; name: string }[]
  >([]);
  const [activeTab, setActiveTab] = useState<"personal" | "work">("personal");

  useEffect(() => {
    if (!isOpen || currentUserRole !== "admin") return;

    if (!isManagerMode) {
      setLoadingManagers(true);
      userService
        .getManagers()
        .then((data) =>
          setManagers(data.map((m) => ({ id: m.id, name: m.name }))),
        )
        .catch(() => {})
        .finally(() => setLoadingManagers(false));
    }

    if (isManagerMode) {
      userService
        .getAdmins()
        .then((admins) => setSupervisors(admins))
        .catch(() => {});
    }

    departmentService
      .getAll()
      .then((res) =>
        setDepartments(
          res.departments.map((d) => ({ id: d.id, name: d.name })),
        ),
      )
      .catch(() => {});
  }, [isOpen, isManagerMode, currentUserRole]);

  useEffect(() => {
    if (!isOpen) setActiveTab("personal");
  }, [isOpen]);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <FiUser className="h-4 w-4" />
          </span>
          {isManagerMode ? "Edit Manager" : "Edit Employee"}
        </span>
      }
      maxWidth="max-w-4xl"
      panelClassName="overflow-hidden"
    >
      {isManagerMode ? (
        <Formik
          enableReinitialize
          initialValues={{
            name: user?.name ?? "",
            email: user?.email ?? "",
            role: (user?.role ?? "manager") as UserRole,
            department: user?.department ?? "",
            department_id: user?.department_id,
            position: user?.position ?? "",
            phone: user?.phone ?? "",
            employee_id: user?.employee_id ?? "",
            gender: user?.gender ?? "",
            date_of_birth: user?.date_of_birth ?? "",
            address: user?.address ?? "",
            emergency_contact: user?.emergency_contact ?? "",
            employment_type: user?.employment_type ?? "full_time",
            join_date: user?.join_date ?? "",
            manager_id: user?.manager_id,
            status: user?.status ?? "active",
            reports_to: user?.reports_to,
            office_branch: user?.office_branch ?? "",
          }}
          validationSchema={managerValidationSchema}
          onSubmit={async (values) => {
            const payload = { ...values } as EditUserFormValues;
            delete payload.employee_id;
            delete payload.join_date;
            await onSave(payload);
          }}
        >
          <Form className="space-y-5">
            <ManagerFormSection
              departments={departments}
              supervisors={supervisors}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
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
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </Form>
        </Formik>
      ) : (
        <Formik
          enableReinitialize
          initialValues={{
            name: user?.name ?? "",
            email: user?.email ?? "",
            role: (user?.role ?? "employee") as UserRole,
            department: user?.department ?? "",
            department_id: user?.department_id,
            position: user?.position ?? "",
            phone: user?.phone ?? "",
            employee_id: user?.employee_id ?? "",
            gender: user?.gender ?? "",
            date_of_birth: user?.date_of_birth ?? "",
            address: user?.address ?? "",
            emergency_contact: user?.emergency_contact ?? "",
            employment_type: user?.employment_type ?? "full_time",
            join_date: user?.join_date ?? "",
            manager_id: user?.manager_id,
            status: user?.status ?? "active",
            reports_to: user?.reports_to,
            office_branch: user?.office_branch ?? "",
          }}
          validationSchema={employeeValidationSchema}
          onSubmit={async (values) => {
            const payload = { ...values } as EditUserFormValues;
            delete payload.employee_id;
            delete payload.join_date;
            await onSave(payload);
          }}
        >
          <Form className="space-y-5">
            <EmployeeFormSection
              departments={departments}
              managers={managers}
              loadingManagers={loadingManagers}
              managerError=""
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              currentUserRole={currentUserRole}
            />
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
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
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </Form>
        </Formik>
      )}
    </ModalShell>
  );
}

export type { EditUserFormValues };
export default EditUserModal;
