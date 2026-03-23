import { useState } from "react";
import ModalShell from "./ModalShell";
import type { User, UserRole } from "./types";

interface EditUserFormValues {
  name: string;
  email: string;
  role: UserRole;
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
  const [formValues, setFormValues] = useState<EditUserFormValues>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "employee",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormValues((currentValues) => {
      if (name === "role") {
        return {
          ...currentValues,
          role: value as UserRole,
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
      title="Edit User"
      maxWidth="max-w-xl"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Full Name
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
              Email Address
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
              Role
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
