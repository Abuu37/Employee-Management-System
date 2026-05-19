import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ModalShell from "./ModalShell";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/UserContext";
import type {
  User,
  UserRole,
  EditUserFormValues,
} from "@/features/users/types/user.types";
import { FiBriefcase, FiUser } from "react-icons/fi";
import { getAccessToken } from "@/features/auth/services/authSession";

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
  const { t } = useTranslation();
  const isManagerMode =
    roleOptions.length === 1 && roleOptions[0] === "manager";

  const [formValues, setFormValues] = useState<EditUserFormValues>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "employee",
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
  });

  const [managers, setManagers] = useState<{ id: number; name: string }[]>([]);
  const [supervisors, setSupervisors] = useState<
    { id: number; name: string }[]
  >([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [departments, setDepartments] = useState<
    { id: number; name: string }[]
  >([]);
  const [editTab, setEditTab] = useState<"personal" | "work">("personal");

  const managerInitials = useMemo(() => {
    if (!formValues.name.trim()) return "MG";
    return formValues.name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [formValues.name]);

  const selectedDepartmentName =
    departments.find((d) => d.id === formValues.department_id)?.name ??
    formValues.department ??
    "Department not assigned";

  const inputClassName =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white";

  // Sync form when user prop changes (e.g. drawer opens a different manager)
  useEffect(() => {
    if (user) {
      setFormValues({
        name: user.name ?? "",
        email: user.email ?? "",
        role: user.role ?? "employee",
        department: user.department ?? "",
        department_id: user.department_id,
        position: user.position ?? "",
        phone: user.phone ?? "",
        employee_id: user.employee_id ?? "",
        gender: user.gender ?? "",
        date_of_birth: user.date_of_birth ?? "",
        address: user.address ?? "",
        emergency_contact: user.emergency_contact ?? "",
        employment_type: user.employment_type ?? "full_time",
        join_date: user.join_date ?? "",
        manager_id: user.manager_id,
        status: user.status ?? "active",
        reports_to: user.reports_to,
        office_branch: user.office_branch ?? "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (
      isOpen &&
      formValues.role === "employee" &&
      currentUserRole === "admin"
    ) {
      setLoadingManagers(true);
      const token = getAccessToken();
      axios
        .get("http://localhost:5000/api/user/view-users", {
          headers: { Authorization: `Bearer ${token ?? ""}` },
        })
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data.filter((u: any) => u.role === "manager")
            : [];
          setManagers(list.map((m: any) => ({ id: m.id, name: m.name })));
        })
        .catch(() => {})
        .finally(() => setLoadingManagers(false));
    }

    if (isOpen && isManagerMode && currentUserRole === "admin") {
      axios
        .get("http://localhost:5000/api/user/view-users", {
          headers: { Authorization: `Bearer ${getAccessToken() ?? ""}` },
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
  }, [isOpen, formValues.role, currentUserRole, isManagerMode]);

  useEffect(() => {
    if (!isOpen) setEditTab("personal");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || currentUserRole !== "admin") return;
    const token = getAccessToken();
    axios
      .get("http://localhost:5000/api/departments", {
        headers: { Authorization: `Bearer ${token ?? ""}` },
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
  }, [isOpen, currentUserRole]);

  useEffect(() => {
    if (
      !isOpen ||
      !formValues.department ||
      formValues.department_id ||
      departments.length === 0
    ) {
      return;
    }

    const matched = departments.find(
      (d) =>
        d.name.trim().toLowerCase() ===
        formValues.department?.trim().toLowerCase(),
    );

    if (matched) {
      setFormValues((currentValues) => ({
        ...currentValues,
        department_id: matched.id,
      }));
    }
  }, [isOpen, departments, formValues.department, formValues.department_id]);

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
        };
      }

      if (name === "manager_id") {
        return {
          ...currentValues,
          manager_id: value ? Number(value) : undefined,
        };
      }

      if (name === "reports_to") {
        return {
          ...currentValues,
          reports_to: value ? Number(value) : undefined,
        };
      }

      if (name === "status") {
        return {
          ...currentValues,
          status: value,
        };
      }

      if (name === "department_id") {
        const dept = departments.find((d) => d.id === Number(value));
        return {
          ...currentValues,
          department_id: value ? Number(value) : undefined,
          department: dept?.name ?? currentValues.department,
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
    const {
      employee_id: _employeeId,
      join_date: _joinDate,
      ...payload
    } = formValues;
    await onSave(payload);
  };

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
      <form className="space-y-5" onSubmit={handleSubmit}>
        {isManagerMode ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
            <section className="space-y-4">
              {/* Sliding tab switcher */}
              <div className="relative flex rounded-full border border-slate-200 bg-slate-100 p-1">
                <div
                  className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-blue-600 shadow-sm transition-all duration-300 ease-in-out"
                  style={{
                    left: editTab === "personal" ? "4px" : "50%",
                    width: "calc(50% - 4px)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setEditTab("personal")}
                  className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300"
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] transition-colors duration-300 ${editTab === "personal" ? "border-white bg-white text-blue-600" : "border-slate-300 bg-slate-200 text-slate-600"}`}
                  >
                    <FiUser className="h-3 w-3" />
                  </span>
                  <span
                    className={`transition-colors duration-300 ${editTab === "personal" ? "text-white" : "text-slate-600"}`}
                  >
                    Personal Info
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditTab("work")}
                  className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300"
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] transition-colors duration-300 ${editTab === "work" ? "border-white bg-white text-blue-600" : "border-slate-300 bg-slate-200 text-slate-600"}`}
                  >
                    <FiBriefcase className="h-3 w-3" />
                  </span>
                  <span
                    className={`transition-colors duration-300 ${editTab === "work" ? "text-white" : "text-slate-600"}`}
                  >
                    Work Info
                  </span>
                </button>
              </div>

              {editTab === "personal" && (
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
                            Date of Birth
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
              )}

              {editTab === "work" && (
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
                              {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
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
                              placeholder="e.g. HQ Office / Samora Branch"
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
              )}
            </section>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
            <section className="space-y-4">
              <div className="relative flex rounded-full border border-slate-200 bg-slate-100 p-1">
                <div
                  className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-blue-600 shadow-sm transition-all duration-300 ease-in-out"
                  style={{
                    left: editTab === "personal" ? "4px" : "50%",
                    width: "calc(50% - 4px)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setEditTab("personal")}
                  className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300"
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] transition-colors duration-300 ${editTab === "personal" ? "border-white bg-white text-blue-600" : "border-slate-300 bg-slate-200 text-slate-600"}`}
                  >
                    <FiUser className="h-3 w-3" />
                  </span>
                  <span
                    className={`transition-colors duration-300 ${editTab === "personal" ? "text-white" : "text-slate-600"}`}
                  >
                    Personal Info
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditTab("work")}
                  className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300"
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] transition-colors duration-300 ${editTab === "work" ? "border-white bg-white text-blue-600" : "border-slate-300 bg-slate-200 text-slate-600"}`}
                  >
                    <FiBriefcase className="h-3 w-3" />
                  </span>
                  <span
                    className={`transition-colors duration-300 ${editTab === "work" ? "text-white" : "text-slate-600"}`}
                  >
                    Work Info
                  </span>
                </button>
              </div>

              {editTab === "personal" && (
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
                            Date of Birth
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
              )}

              {editTab === "work" && (
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
                          <td className="px-2 py-3 font-medium text-slate-700">
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
                              {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
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
                              ) : (
                                <select
                                  name="manager_id"
                                  value={formValues.manager_id ?? ""}
                                  onChange={handleChange}
                                  className={inputClassName}
                                >
                                  <option value="">
                                    {t("employees.noManager")}
                                  </option>
                                  {managers.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.name}
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
                            Office / Branch
                          </td>
                          <td className="px-2 py-3">
                            <input
                              type="text"
                              name="office_branch"
                              value={formValues.office_branch ?? ""}
                              onChange={handleChange}
                              className={inputClassName}
                              placeholder="e.g. HQ Office / Samora Branch"
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
              )}
            </section>
          </div>
        )}

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
      </form>
    </ModalShell>
  );
}

export type { EditUserFormValues };
export default EditUserModal;
