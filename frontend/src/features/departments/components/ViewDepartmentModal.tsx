import { useRef, useEffect } from "react";
import type { Department } from "../types";
import { FiHash, FiUser, FiUsers, FiCheckCircle, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface ViewDepartmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
}

export default function ViewDepartmentModal({
  isOpen,
  onClose,
  department,
}: ViewDepartmentDrawerProps) {
  const { t } = useTranslation();
  const lastDepartmentRef = useRef<Department | null>(null);
  if (department) lastDepartmentRef.current = department;
  const drawerData = department ?? lastDepartmentRef.current;

  const infoCards = drawerData
    ? [
        {
          icon: FiHash,
          label: t("departments.departmentCode"),
          value: drawerData.code,
        },
        {
          icon: FiUser,
          label: t("departments.manager"),
          value: drawerData.manager?.name ?? t("departments.unassigned"),
        },
        {
          icon: FiUsers,
          label: t("departments.employees"),
          value: String(drawerData.employeeCount),
        },
        {
          icon: FiCheckCircle,
          label: t("common.status"),
          value:
            drawerData.status === "active"
              ? t("departments.active")
              : t("departments.inactive"),
        },
      ]
    : [];

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
        onClick={onClose}
      />
      {/* Drawer panel */}
      <div
        className={`absolute inset-y-0 right-0 w-full max-w-sm sm:max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto overflow-x-hidden transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {drawerData && (
          <>
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-800">
                {t("departments.viewTitle")}
              </h2>
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-4">
              {/* Profile snapshot card */}
              <div className="rounded-2xl bg-linear-to-br from-blue-600 via-cyan-600 to-teal-500 p-0.5">
                <div className="rounded-[14px] bg-white px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                    {t("departments.profileSnapshot")}
                  </p>
                  <p className="text-xl font-bold text-slate-900 leading-tight">
                    {drawerData.name}
                  </p>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    {drawerData.code}
                  </p>
                  <div
                    className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      drawerData.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {drawerData.status === "active"
                      ? t("departments.active")
                      : t("departments.inactive")}
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 gap-3">
                {infoCards.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white p-2 text-slate-500 shadow-sm">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
