import { FiBriefcase, FiHash, FiMail, FiUser } from "react-icons/fi";
import type { IconType } from "react-icons";
import ModalShell from "./ModalShell";
import type { User } from "./types";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

interface DetailItem {
  key: keyof Pick<User, "id" | "name" | "email" | "role">;
  label: string;
  icon: IconType;
}

const detailItems: DetailItem[] = [
  { key: "id", label: "User ID", icon: FiHash },
  { key: "name", label: "Full Name", icon: FiUser },
  { key: "email", label: "Email Address", icon: FiMail },
  { key: "role", label: "Role", icon: FiBriefcase },
];

function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="User Details"
      maxWidth="max-w-xl"
    >
      {user ? (
        <div className="space-y-5">
          <div className="rounded-2xl bg-linear-to-br from-blue-600 via-cyan-600 to-teal-500 p-px">
            <div className="rounded-2xl bg-white px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Profile Snapshot
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">
                {user.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{user.email}</p>
              <div className="mt-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {user.status}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {detailItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white p-2 text-slate-500 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                        {String(user[item.key])}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}

export default ViewUserModal;
