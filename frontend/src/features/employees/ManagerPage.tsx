import Header from "@/layouts/Header";
import Sidebar from "@/layouts/Sidebar";
import UserManagementSection from "@/features/employees/components/UserManagementSection";
import { useState } from "react";
import { FiSearch, FiPlus } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { User } from "@/features/employees/components/types";
import { useUser } from "@/context/UserContext";

function Managers() {
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [addTrigger, setAddTrigger] = useState(0);
  const { user } = useUser();
  const isAdmin = user?.role === "admin";
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-auto">
        <Header searchTerm="" onSearchChange={() => {}} />

        <div className="p-6 space-y-5">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {t("employees.managersTitle")}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {t("employees.managersSubtitle")}
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setAddTrigger((c) => c + 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <FiPlus className="h-4 w-4" />
                {t("nav.addManager") || "Add Manager"}
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t("employees.searchManagers")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm
              text-slate-700 shadow-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Manager table */}
          <UserManagementSection
            title={t("employees.allManagers")}
            filterRole="manager"
            emptyMessage="No managers found."
            roleOptions={["manager"]}
            searchTerm={search}
            onFilteredUsers={setFilteredUsers}
            hideTitle
            triggerAddCount={addTrigger}
            hideTableAddButton
          />
        </div>
      </main>
    </div>
  );
}

export default Managers;
