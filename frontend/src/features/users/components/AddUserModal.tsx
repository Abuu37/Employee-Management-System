import { useEffect, useState } from "react";
import axios from "axios";
import ModalShell from "./ModalShell";
import { useTranslation } from "react-i18next";
import type {
  UserRole,
  AddUserFormValues,
} from "@/features/users/types/user.types";
import { useUser } from "@/context/UserContext";
import { FiBriefcase, FiUser } from "react-icons/fi";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formValues: AddUserFormValues) => Promise<void>;
  roleOptions: UserRole[];
  isSaving: boolean;
}

type EmployeeTab = "personal" | "work";

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

  const [formValues, setFormValues] = useState<AddUserFormValues>({
    name: "",
    email: "",
    role: roleOptions[0] ?? "employee",
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
  });

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
  const [employeeTab, setEmployeeTab] = useState<EmployeeTab>("personal");

  const inputClassName =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white";

  useEffect(() => {
    if (
      isOpen &&
      formValues.role === "employee" &&
      currentUserRole === "admin"
    ) {
      setLoadingManagers(true);
      setManagerError("");
      const token = localStorage.getItem("token");
      axios
        .get("http://localhost:5000/api/user/view-users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const managersList = Array.isArray(res.data)
            ? res.data.filter((u: any) => u.role === "manager")
            : [];

          setManagers(
            managersList.map((m: any) => ({
              id: m.id,
              name: m.name,
              department: m.department ?? undefined,
            })),
          );
        })
        .catch(() => setManagerError("Failed to load managers"))
        .finally(() => setLoadingManagers(false));
    }

    if (isOpen && currentUserRole === "admin") {
      const token = localStorage.getItem("token");
      axios
        .get("http://localhost:5000/api/departments", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setDepartments(
            (Array.isArray(res.data) ? res.data : []).map((d: any) => ({
              id: d.id,
              name: d.name,
            })),
          );
        })
        .catch(() => {});

      axios
        .get("http://localhost:5000/api/user/view-users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => {
          setSupervisors(
            (Array.isArray(res.data) ? res.data : [])
              .filter((u: any) => u.role === "admin")
              .map((u: any) => ({ id: u.id, name: u.name })),
          );
        })
        .catch(() => {});
    }
  }, [isOpen, formValues.role, currentUserRole]);

  useEffect(() => {
    if (!isOpen) {
      setEmployeeTab("personal");
    }
  }, [isOpen]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormValues((currentValues) => {
      if (name === "role") {
        return {
          ...currentValues,
          role: value as UserRole,
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
      }

      if (name === "reports_to") {
        return {
          ...currentValues,
          reports_to: value ? Number(value) : undefined,
        };
      }

      if (name === "manager_id") {
        return {
          ...currentValues,
          manager_id: value ? Number(value) : undefined,
        };
      }

      if (name === "department_id") {
        const dept = departments.find((d) => d.id === Number(value));
        return {
          ...currentValues,
          department_id: value ? Number(value) : undefined,
          department: dept?.name ?? "",
        };
      }

      return {
        ...currentValues,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = { ...formValues };

    if (payload.role !== "employee") {
      delete payload.manager_id;
      delete payload.employee_id;
      delete payload.join_date;
    }

    if (payload.role !== "manager") {
      delete payload.reports_to;
      delete payload.office_branch;
    }

    await onSave(payload);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={isManagerMode ? "Add Manager" : "Add Employee"}
      maxWidth="max-w-4xl"
      panelClassName="overflow-hidden"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {isManagerMode ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
            <section className="space-y-4">
              {/* Sliding tab switcher */}
              <div className="relative flex rounded-full border border-slate-200 bg-slate-100 p-1">
                <div
                  className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-blue-600 shadow-sm transition-all duration-300 ease-in-out"
                  style={{
                    left: employeeTab === "personal" ? "4px" : "50%",
                    width: "calc(50% - 4px)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setEmployeeTab("personal")}
                  className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300"
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] transition-colors duration-300 ${
                      employeeTab === "personal"
                        ? "border-white bg-white text-blue-600"
                        : "border-slate-300 bg-slate-200 text-slate-600"
                    }`}
                  >
                    <FiUser className="h-3 w-3" />
                  </span>
                  <span
                    className={`transition-colors duration-300 ${employeeTab === "personal" ? "text-white" : "text-slate-600"}`}
                  >
                    Personal Info
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setEmployeeTab("work")}
                  className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300"
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] transition-colors duration-300 ${
                      employeeTab === "work"
                        ? "border-white bg-white text-blue-600"
                        : "border-slate-300 bg-slate-200 text-slate-600"
                    }`}
                  >
                    <FiBriefcase className="h-3 w-3" />
                  </span>
                  <span
                    className={`transition-colors duration-300 ${employeeTab === "work" ? "text-white" : "text-slate-600"}`}
                  >
                    Work Info
                  </span>
                </button>
              </div>

              {employeeTab === "personal" ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <FiUser className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        Personal Information
                      </h4>
                      <p className="text-sm text-slate-500">
                        Basic identity and contact details.
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-sm">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="w-52 px-2 py-3 font-medium text-slate-700">
                            {t("employees.fullName")}
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="text"
                              name="name"
                              value={formValues.name}
                              onChange={handleChange}
                              className={inputClassName}
                              placeholder="e.g. John Doe"
                              required
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            {t("employees.emailAddress")}
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="email"
                              name="email"
                              value={formValues.email}
                              onChange={handleChange}
                              className={inputClassName}
                              placeholder="e.g. john.doe@gmail.com"
                              required
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Phone Number
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="tel"
                              name="phone"
                              value={formValues.phone ?? ""}
                              onChange={handleChange}
                              className={inputClassName}
                              placeholder="e.g. +255 7178 128 45"
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Gender
                          </td>
                          <td className="px-2 py-3">
                            <select
                              name="gender"
                              value={formValues.gender ?? ""}
                              onChange={handleChange}
                              className={inputClassName}
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                              <option value="prefer_not_to_say">
                                Prefer not to say
                              </option>
                            </select>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Date of Birth (optional)
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="date"
                              name="date_of_birth"
                              value={formValues.date_of_birth ?? ""}
                              onChange={handleChange}
                              className={inputClassName}
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Address
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="text"
                              name="address"
                              value={formValues.address ?? ""}
                              onChange={handleChange}
                              className={inputClassName}
                              placeholder="e.g. 123 Main St, City, State"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Emergency Contact
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="text"
                              name="emergency_contact"
                              value={formValues.emergency_contact ?? ""}
                              onChange={handleChange}
                              className={inputClassName}
                              placeholder="e.g. Jane Doe — +255 7178 128 46"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {employeeTab === "work" ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
                      <FiBriefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        Work Information
                      </h4>
                      <p className="text-sm text-slate-500">
                        Leadership profile and assignment details.
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-sm">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="w-52 px-2 py-3 font-medium text-slate-700">
                            {t("employees.department")}
                          </td>
                          <td className="px-2 py-3">
                            <select
                              name="department_id"
                              value={formValues.department_id ?? ""}
                              onChange={handleChange}
                              className={inputClassName}
                            >
                              <option value="">Select department</option>
                              {departments.map((department) => (
                                <option
                                  key={department.id}
                                  value={department.id}
                                >
                                  {department.name}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            {t("employees.position")}
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="text"
                              name="position"
                              value={formValues.position ?? ""}
                              onChange={handleChange}
                              className={inputClassName}
                              placeholder="e.g. Engineering Manager"
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Employment Type
                          </td>
                          <td className="px-2 py-3">
                            <select
                              name="employment_type"
                              value={formValues.employment_type ?? "full_time"}
                              onChange={handleChange}
                              className={inputClassName}
                            >
                              <option value="full_time">Full-Time</option>
                              <option value="part_time">Part-Time</option>
                              <option value="contract">Contract</option>
                              <option value="intern">Intern</option>
                            </select>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Reports To
                          </td>
                          <td className="px-2 py-3">
                            <select
                              name="reports_to"
                              value={formValues.reports_to ?? ""}
                              onChange={handleChange}
                              className={inputClassName}
                            >
                              <option value="">Select supervisor</option>
                              {supervisors.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Office / Branch
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="text"
                              name="office_branch"
                              value={formValues.office_branch ?? ""}
                              onChange={handleChange}
                              className={inputClassName}
                              placeholder="e.g. New York HQ"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Status
                          </td>
                          <td className="px-2 py-3">
                            <select
                              name="status"
                              value={formValues.status ?? "active"}
                              onChange={handleChange}
                              className={inputClassName}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Credentials are auto-generated and sent immediately after this
                manager is created.
              </div>
            </section>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
            <section className="space-y-4">
              {/* Sliding tab switcher */}
              <div className="relative flex rounded-full border border-slate-200 bg-slate-100 p-1">
                {/* Sliding pill */}
                <div
                  className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-blue-600 shadow-sm transition-all duration-300 ease-in-out"
                  style={{
                    left: employeeTab === "personal" ? "4px" : "50%",
                    width: "calc(50% - 4px)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setEmployeeTab("personal")}
                  className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300"
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] transition-colors duration-300 ${
                      employeeTab === "personal"
                        ? "border-white bg-white text-blue-600"
                        : "border-slate-300 bg-slate-200 text-slate-600"
                    }`}
                  >
                    <FiUser className="h-3 w-3" />
                  </span>
                  <span
                    className={`transition-colors duration-300 ${employeeTab === "personal" ? "text-white" : "text-slate-600"}`}
                  >
                    Personal Info
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setEmployeeTab("work")}
                  className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300"
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] transition-colors duration-300 ${
                      employeeTab === "work"
                        ? "border-white bg-white text-blue-600"
                        : "border-slate-300 bg-slate-200 text-slate-600"
                    }`}
                  >
                    <FiBriefcase className="h-3 w-3" />
                  </span>
                  <span
                    className={`transition-colors duration-300 ${employeeTab === "work" ? "text-white" : "text-slate-600"}`}
                  >
                    Work Info
                  </span>
                </button>
              </div>

              {employeeTab === "personal" ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <FiUser className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        Personal Information
                      </h4>
                      <p className="text-sm text-slate-500">
                        Basic identity and contact details.
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-sm">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="w-52 px-2 py-3 font-medium text-slate-700">
                            {t("employees.fullName")}
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="text"
                              name="name"
                              value={formValues.name}
                              onChange={handleChange}
                              className={inputClassName}
                              placeholder="e.g. John Doe"
                              required
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            {t("employees.emailAddress")}
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="email"
                              name="email"
                              value={formValues.email}
                              onChange={handleChange}
                              className={inputClassName}
                              placeholder="e.g. john.doe@gmail.com"
                              required
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Phone Number
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="tel"
                              name="phone"
                              value={formValues.phone ?? ""}
                              onChange={handleChange}
                              className={inputClassName}
                              placeholder="e.g. +255 7178 128 45"
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Gender
                          </td>
                          <td className="px-2 py-3">
                            <select
                              name="gender"
                              value={formValues.gender ?? ""}
                              onChange={handleChange}
                              className={inputClassName}
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                              <option value="prefer_not_to_say">
                                Prefer not to say
                              </option>
                            </select>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Date of Birth (optional)
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="date"
                              name="date_of_birth"
                              value={formValues.date_of_birth ?? ""}
                              onChange={handleChange}
                              className={inputClassName}
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Address
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="text"
                              name="address"
                              value={formValues.address ?? ""}
                              onChange={handleChange}
                              className={inputClassName}
                              placeholder="e.g. 123 Main St, City, State"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Emergency Contact
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="text"
                              name="emergency_contact"
                              value={formValues.emergency_contact ?? ""}
                              onChange={handleChange}
                              className={inputClassName}
                              placeholder="e.g. Jane Doe — +255 7178 128 46"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {employeeTab === "work" ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
                      <FiBriefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        Work Information
                      </h4>
                      <p className="text-sm text-slate-500">
                        Company-related assignment details.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-sm">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="w-52 px-2 py-3 font-medium text-slate-700">
                            Employee ID
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="text"
                              name="employee_id"
                              value={formValues.employee_id ?? ""}
                              disabled
                              className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed"
                              placeholder="Auto-generated by system"
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Department
                          </td>
                          <td className="px-2 py-3">
                            <select
                              name="department_id"
                              value={formValues.department_id ?? ""}
                              onChange={handleChange}
                              className={inputClassName}
                            >
                              <option value="">Select department</option>
                              {departments.map((department) => (
                                <option
                                  key={department.id}
                                  value={department.id}
                                >
                                  {department.name}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            {t("employees.position")}
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="text"
                              name="position"
                              value={formValues.position ?? ""}
                              onChange={handleChange}
                              className={inputClassName}
                              placeholder="e.g. Software Engineer"
                            />
                          </td>
                        </tr>

                        {/*========== Only show manager assignment if current user is admin ==== */}

                        {currentUserRole === "admin" && (
                          <tr className="border-b border-slate-200">
                            <td className="px-2 py-3 font-medium text-slate-700">
                              {t("employees.assignManager")}
                            </td>
                            <td className="px-2 py-3">
                              {loadingManagers ? (
                                <div className="text-xs text-slate-500">
                                  {t("employees.loadingManagers")}
                                </div>
                              ) : managerError ? (
                                <div className="text-xs text-red-500">
                                  {managerError}
                                </div>
                              ) : (
                                <select
                                  name="manager_id"
                                  value={formValues.manager_id ?? ""}
                                  onChange={handleChange}
                                  className={inputClassName}
                                >
                                  <option value="">
                                    {t("employees.selectManager")}
                                  </option>
                                  {managers.map((manager) => (
                                    <option key={manager.id} value={manager.id}>
                                      {manager.name}
                                      {manager.department
                                        ? ` (${manager.department})`
                                        : ""}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </td>
                          </tr>
                        )}
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Employment Type
                          </td>
                          <td className="px-2 py-3">
                            <select
                              name="employment_type"
                              value={formValues.employment_type ?? "full_time"}
                              onChange={handleChange}
                              className={inputClassName}
                            >
                              <option value="full_time">Full-Time</option>
                              <option value="part_time">Part-Time</option>
                              <option value="contract">Contract</option>
                              <option value="intern">Intern</option>
                            </select>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Join Date
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="text"
                              name="join_date"
                              value={formValues.join_date ?? ""}
                              disabled
                              className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed"
                              placeholder="Auto-generated by system"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-3 font-medium text-slate-700">
                            Status
                          </td>
                          <td className="px-2 py-3">
                            <select
                              name="status"
                              value={formValues.status ?? "active"}
                              onChange={handleChange}
                              className={inputClassName}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Credentials are auto-generated and sent immediately after this
                employee is created.
              </div>
            </section>
          </div>
        )}

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
            {isSaving
              ? "Creating..."
              : isManagerMode
                ? "Create Manager"
                : "Create Employee"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export type { AddUserFormValues };
export default AddUserModal;
