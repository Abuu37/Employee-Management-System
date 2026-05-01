import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import Header from "@/layouts/Header";
import Sidebar from "@/layouts/Sidebar";
import {
  FiPlus,
  FiGrid,
  FiCheckCircle,
  FiUserCheck,
  FiUsers,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiSearch,
} from "react-icons/fi";
import { departmentService } from "@/services/department.service";
import type { Department, DepartmentStats, DeptFormValues } from "./types";
import AddDepartmentModal from "./components/AddDepartmentModal";
import EditDepartmentModal from "./components/EditDepartmentModal";
import ViewDepartmentModal from "./components/ViewDepartmentModal";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState<DepartmentStats>({
    total: 0,
    active: 0,
    assigned: 0,
    totalEmployees: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Department | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [depts, st] = await Promise.all([
        departmentService.getAll(),
        departmentService.getStats(),
      ]);
      setDepartments(depts);
      setStats(st);
    } catch {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ─── Handlers ────────────────────────────────────────────────
  const handleAdd = async (values: DeptFormValues) => {
    setIsSaving(true);
    try {
      await departmentService.create({
        ...values,
        manager_id: values.manager_id || null,
      });
      toast.success("Department created");
      setAddOpen(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to create");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (values: DeptFormValues) => {
    if (!selected) return;
    setIsSaving(true);
    try {
      await departmentService.update(selected.id, {
        ...values,
        manager_id: values.manager_id || null,
      });
      toast.success("Department updated");
      setEditOpen(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (dept: Department) => {
    if (!confirm(`Delete department "${dept.name}"? This cannot be undone.`))
      return;
    try {
      await departmentService.delete(dept.id);
      toast.success("Department deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleToggle = async (dept: Department) => {
    try {
      const res = await departmentService.toggleStatus(dept.id);
      toast.success(`Department ${res.status}`);
      load();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const openView = async (dept: Department) => {
    try {
      const full = await departmentService.getById(dept.id);
      setSelected(full);
      setViewOpen(true);
    } catch {
      toast.error("Failed to load department details");
    }
  };

  const openEdit = (dept: Department) => {
    setSelected(dept);
    setEditOpen(true);
  };

  // ─── Stat cards ──────────────────────────────────────────────
  const statCards = [
    {
      label: "Total Departments",
      value: stats.total,
      icon: FiGrid,
      color: "text-white",
      cardBg: "bg-[#1e3a5f]",
      iconBg: "bg-white/20",
      textColor: "text-white",
      subTextColor: "text-blue-200",
    },
    {
      label: "Active",
      value: stats.active,
      icon: FiCheckCircle,
      color: "text-emerald-600",
      cardBg: "bg-white",
      iconBg: "bg-emerald-50",
      textColor: "text-slate-900",
      subTextColor: "text-slate-500",
    },
    {
      label: "Managers Assigned",
      value: stats.assigned,
      icon: FiUserCheck,
      color: "text-purple-600",
      cardBg: "bg-white",
      iconBg: "bg-purple-50",
      textColor: "text-slate-900",
      subTextColor: "text-slate-500",
    },
    {
      label: "Employees",
      value: stats.totalEmployees,
      icon: FiUsers,
      color: "text-amber-600",
      cardBg: "bg-white",
      iconBg: "bg-amber-50",
      textColor: "text-slate-900",
      subTextColor: "text-slate-500",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-auto">
        <Header searchTerm="" onSearchChange={() => {}} />

        <div className="p-6 space-y-5">
          {/* Page header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Departments Management
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage company departments and structure
              </p>
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700"
            >
              <FiPlus className="h-4 w-4" />
              Add Department
            </button>
          </div>

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`rounded-2xl px-5 py-4 shadow-sm border border-slate-100 ${card.cardBg}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-xl p-2.5 ${card.iconBg} ${card.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${card.textColor}`}>
                        {card.value}
                      </p>
                      <p className={`text-xs ${card.subTextColor}`}>
                        {card.label}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">
                All Departments
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
                Loading...
              </div>
            ) : departments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <FiGrid className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">
                  No departments yet. Add one to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="w-12 px-6 py-3 text-center">S/N</th>
                      <th className="px-6 py-3 text-left">Department</th>
                      <th className="px-6 py-3 text-left">Code</th>
                      <th className="px-6 py-3 text-left">Manager</th>
                      <th className="px-6 py-3 text-left">Employees</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {departments
                      .filter((dept) => {
                        const q = search.toLowerCase();
                        return (
                          !q ||
                          dept.name.toLowerCase().includes(q) ||
                          dept.code.toLowerCase().includes(q) ||
                          (dept.manager?.name ?? "")
                            .toLowerCase()
                            .includes(q) ||
                          dept.status.toLowerCase().includes(q)
                        );
                      })
                      .map((dept, idx) => (
                        <tr
                          key={dept.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-center text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800">
                            {dept.name}
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-semibold text-slate-600">
                              {dept.code}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {dept.manager?.name ?? (
                              <span className="text-slate-400 italic">
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {dept.employeeCount}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                dept.status === "active"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {dept.status === "active" ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openView(dept)}
                                className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-500 transition hover:text-white"
                              >
                                <FiEye className="h-3.5 w-3.5" />
                                View
                              </button>
                              <button
                                onClick={() => openEdit(dept)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200
                              bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                              >
                                <FiEdit2 className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(dept)}
                                className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-500 transition hover:text-white"
                              >
                                <FiTrash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modals */}
          <AddDepartmentModal
            isOpen={addOpen}
            onClose={() => setAddOpen(false)}
            onSave={handleAdd}
            isSaving={isSaving}
          />
          <EditDepartmentModal
            isOpen={editOpen}
            onClose={() => setEditOpen(false)}
            onSave={handleEdit}
            department={selected}
            isSaving={isSaving}
          />
          <ViewDepartmentModal
            isOpen={viewOpen}
            onClose={() => setViewOpen(false)}
            department={selected}
          />
        </div>
      </main>
    </div>
  );
}
