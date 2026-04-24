import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import UserManagementSection from "../components/user/UserManagementSection";
import { useState } from "react";
import { FiSearch, FiDownload } from "react-icons/fi";
import type { User } from "../components/user/types";

function Managers() {
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  function handleExportCSV() {
    const headers = ["S/N", "Name", "Email", "Role", "Status"];
    const rows = filteredUsers.map((u, i) => [
      i + 1,
      u.name,
      u.email,
      u.role,
      u.status,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `managers_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

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
                Managers Management
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage all manager accounts and information
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow transition-all duration-200 hover:shadow-lg hover:scale-[1.03] active:scale-95"
              style={{
                background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)";
              }}
            >
              <FiDownload className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search managers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm
              text-slate-700 shadow-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Manager table */}
          <UserManagementSection
            title="Managers Management"
            filterRole="manager"
            emptyMessage="No managers found."
            roleOptions={["manager"]}
            searchTerm={search}
            onFilteredUsers={setFilteredUsers}
            hideTitle
          />
        </div>
      </main>
    </div>
  );
}

export default Managers;
