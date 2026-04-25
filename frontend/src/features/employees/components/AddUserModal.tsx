import { useEffect, useState } from "react";
import axios from "axios";
import ModalShell from "./ModalShell";
import type { UserRole } from "./types";

// ✅ FIXED: Proper interface
interface AddUserFormValues {
  name: string;
  email: string;
  role: UserRole;
  manager_id?: number;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formValues: AddUserFormValues) => Promise<void>;
  roleOptions: UserRole[];
  isSaving: boolean;
}

// ✅ FIXED: Proper component declaration
const AddUserModal = ({
  isOpen,
  onClose,
  onSave,
  roleOptions,
  isSaving,
}: AddUserModalProps) => {
  // Get current user role from localStorage
  const currentUserRole = typeof window !== 'undefined' ? localStorage.getItem("user-role") : null;
  const [formValues, setFormValues] = useState<AddUserFormValues>({
    name: "",
    email: "",
    role: roleOptions[0] ?? "employee",
    manager_id: undefined,
  });

  const [managers, setManagers] = useState<{ id: number; name: string }[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [managerError, setManagerError] = useState("");

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
            }))
          );
        })
        .catch(() => {
          setManagerError("Failed to load managers");
        })
        .finally(() => setLoadingManagers(false));
    }
  }, [isOpen, formValues.role, currentUserRole]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
    }

    await onSave(payload);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Add User"
      maxWidth="max-w-xl"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-700">
          New users receive an auto-generated password by email after creation.
        </div>

        <div className="grid gap-4">
          {/* Name */}
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Full Name
            </span>
            <input
              type="text"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm
               text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
              required
            />
          </label>

          {/* Email */}
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Email Address
            </span>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm
               text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
              required
            />
          </label>

          {/* Role */}
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Role
            </span>
            <select
              name="role"
              value={formValues.role}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm capitalize
               text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
            >
              {roleOptions.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleOption}
                </option>
              ))}
            </select>
          </label>

          {/* Manager Dropdown - only for admin creating employee */}
          {formValues.role === "employee" && currentUserRole === "admin" && (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Manager
              </span>
              {loadingManagers ? (
                <div className="text-xs text-slate-500">Loading managers...</div>
              ) : managerError ? (
                <div className="text-xs text-red-500">{managerError}</div>
              ) : (
                <select
                  name="manager_id"
                  value={formValues.manager_id ?? ""}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  required
                >
                  <option value="">Select manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              )}
            </label>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium
             text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white
             hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isSaving ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export type { AddUserFormValues };
export default AddUserModal;