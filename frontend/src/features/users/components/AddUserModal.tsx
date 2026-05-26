import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import ModalShell from "./ModalShell";
import { useTranslation } from "react-i18next";
import type {
  UserRole,
  AddUserFormValues,
} from "@/features/users/types/user.types";
import { useUser } from "@/context/UserContext";
import { userService } from "@/features/users/services/user.service";
import { departmentService } from "@/features/departments/services/department.service";
import { FiUser } from "react-icons/fi";
import ManagerFormSection from "./ManagerFormSection";
import EmployeeFormSection from "./EmployeeFormSection";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formValues: AddUserFormValues) => Promise<void>;
  roleOptions: UserRole[];
  isSaving: boolean;
}

type ActiveTab = "personal" | "work";

const employeeInitialValues: AddUserFormValues = {
  name: "",
  email: "",
  role: "employee",
  manager_id: undefined,
  department: "",
  department_id: undefined,
  position: "",
  phone: "",
  gender: "",
  date_of_birth: "",
  address: "",
  emergency_contact: "",
  employee_id: "",
  employment_type: "full_time",
  join_date: "",
  status: "active",
  reports_to: undefined,
  office_branch: "",
};

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

const managerInitialValues: AddUserFormValues = {
  name: "",
  email: "",
  role: "manager",
  manager_id: undefined,
  department: "",
  department_id: undefined,
  position: "",
  phone: "",
  gender: "",
  date_of_birth: "",
  address: "",
  emergency_contact: "",
  employee_id: "",
  employment_type: "full_time",
  join_date: "",
  status: "active",
  reports_to: undefined,
  office_branch: "",
};

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

const AddUserModal = ({
  isOpen,
  onClose,
  onSave,
  roleOptions,
  isSaving,
}: AddUserModalProps) => {
  const { user: currentUser } = useUser();
  const currentUserRole = currentUser?.role ?? null;
  const { t } = useTranslation();
  const isManagerMode =
    roleOptions.length === 1 && roleOptions[0] === "manager";

  const [managers, setManagers] = useState<
    { id: number; name: string; department?: string }[]
  >([]);
  const [departments, setDepartments] = useState<
    { id: number; name: string }[]
  >([]);
  const [supervisors, setSupervisors] = useState<
    { id: number; name: string }[]
  >([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [managerError, setManagerError] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("personal");

  useEffect(() => {
    if (!isOpen) return;

    if (!isManagerMode && currentUserRole === "admin") {
      setLoadingManagers(true);
      setManagerError("");
      userService
        .getManagers()
        .then((res) =>
          setManagers(
            res.data.map((m) => ({
              id: m.id,
              name: m.name,
              department: m.department ?? undefined,
            })),
          ),
        )
        .catch(() => setManagerError("Failed to load managers"))
        .finally(() => setLoadingManagers(false));
    }

    if (currentUserRole === "admin") {
      departmentService
        .getAll()
        .then((res) =>
          setDepartments(
            res.departments.map((d) => ({ id: d.id, name: d.name })),
          ),
        )
        .catch(() => {});

      userService
        .getAdmins()
        .then((admins) => setSupervisors(admins))
        .catch(() => {});
    }
  }, [isOpen, isManagerMode, currentUserRole]);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("personal");
    }
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
          {isManagerMode ? "Add Manager" : "Add Employee"}
        </span>
      }
      maxWidth="max-w-2xl"
      panelClassName="overflow-hidden"
    >
      {isManagerMode ? (
        <Formik
          key={isOpen ? "open" : "closed"}
          initialValues={managerInitialValues}
          validationSchema={managerValidationSchema}
          onSubmit={async (values) => {
            const payload = { ...values };
            delete payload.manager_id;
            delete payload.employee_id;
            delete payload.join_date;
            await onSave(payload);
          }}
        >
          <Form className="space-y-3">
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
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isSaving ? "Creating..." : "Create Manager"}
              </button>
            </div>
          </Form>
        </Formik>
      ) : (
        <Formik
          key={isOpen ? "open" : "closed"}
          initialValues={employeeInitialValues}
          validationSchema={employeeValidationSchema}
          onSubmit={async (values) => {
            const payload = { ...values };
            delete payload.manager_id;
            delete payload.employee_id;
            delete payload.join_date;
            await onSave(payload);
          }}
        >
          <Form className="space-y-3">
            <EmployeeFormSection
              departments={departments}
              managers={managers}
              loadingManagers={loadingManagers}
              managerError={managerError}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              currentUserRole={currentUserRole}
            />
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium
                 text-white hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isSaving ? "Creating..." : "Create Employee"}
              </button>
            </div>
          </Form>
        </Formik>
      )}
    </ModalShell>
  );
};

export type { AddUserFormValues };
export default AddUserModal;
