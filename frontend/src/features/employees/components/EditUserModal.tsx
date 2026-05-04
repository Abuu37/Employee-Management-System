import { useEffect, useState } from "react";
import axios from "axios";
import ModalShell from "./ModalShell";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/UserContext";
import type { User, UserRole } from "./types";

interface EditUserFormValues {
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  manager_id?: number;
}

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

  const [formValues, setFormValues] = useState<EditUserFormValues>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "employee",
    department: user?.department ?? "",
    manager_id: user?.manager_id,
  });

  const [managers, setManagers] = useState<{ id: number; name: string }[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  useEffect(() => {
    if (
      isOpen &&
      formValues.role === "employee" &&
      currentUserRole === "admin"
    ) {
      setLoadingManagers(true);
      const token = localStorage.getItem("token");
      axios
        .get("http://localhost:5000/api/user/view-users", {
          headers: { Authorization: `Bearer ${token}` },
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
  }, [isOpen, formValues.role, currentUserRole]);

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

      return {
        ...currentValues,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSave(formValues);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t("employees.editUser")}
      maxWidth="max-w-xl"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              {t("employees.fullName")}
            </span>
            <input
              type="text"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              {t("employees.emailAddress")}
            </span>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              {t("employees.role")}
            </span>
            <select
              name="role"
              value={formValues.role}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm capitalize text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
            >
              {roleOptions.map((roleOption) => (
                <option
                  key={roleOption}
                  value={roleOption}
                  className="capitalize"
                >
                  {roleOption}
                </option>
              ))}
            </select>
          </label>

          {formValues.role === "employee" && currentUserRole === "admin" && (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t("employees.assignManager")}
              </span>
              {loadingManagers ? (
                <div className="text-xs text-slate-500">
                  {t("employees.loadingManagers")}
                </div>
              ) : (
                <select
                  name="manager_id"
                  value={formValues.manager_id ?? ""}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                >
                  <option value="">{t("employees.noManager")}</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              )}
            </label>
          )}

          {formValues.role === "manager" && (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t("employees.department")}
              </span>
              <input
                type="text"
                name="department"
                value={formValues.department ?? ""}
                onChange={handleChange}
                placeholder="e.g. Engineering, HR, Finance"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>
          )}
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
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export type { EditUserFormValues };
export default EditUserModal;
