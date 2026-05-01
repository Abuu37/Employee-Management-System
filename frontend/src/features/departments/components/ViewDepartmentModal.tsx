import type { Department } from "../types";
import { FiHash, FiUser, FiUsers, FiCheckCircle } from "react-icons/fi";
import ModalShell from "../../employees/components/ModalShell";

interface ViewDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
}

export default function ViewDepartmentModal({
  isOpen,
  onClose,
  department,
}: ViewDepartmentModalProps) {
  const infoCards = department
    ? [
        { icon: FiHash, label: "Department Code", value: department.code },
        {
          icon: FiUser,
          label: "Manager",
          value: department.manager?.name ?? "Unassigned",
        },
        {
          icon: FiUsers,
          label: "Total Employees",
          value: String(department.employeeCount),
        },
        {
          icon: FiCheckCircle,
          label: "Status",
          value: department.status === "active" ? "Active" : "Inactive",
        },
      ]
    : [];

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Department Details"
      maxWidth="max-w-xl"
    >
      {department ? (
        <div className="space-y-5">
          {/* Profile snapshot */}
          <div className="rounded-2xl bg-linear-to-br from-blue-600 via-cyan-600 to-teal-500 p-px">
            <div className="rounded-2xl bg-white px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Profile Snapshot
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">
                {department.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{department.code}</p>
              <div
                className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  department.status === "active"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {department.status === "active" ? "Active" : "Inactive"}
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {infoCards.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2 text-slate-500 shadow-sm">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                      {value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
