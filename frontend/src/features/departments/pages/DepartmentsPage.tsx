import { useTranslation } from "react-i18next";
import {
  FiCheckCircle,
  FiEdit2,
  FiEye,
  FiGrid,
  FiPlus,
  FiTrash2,
  FiUserCheck,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import Header from "@/layouts/Header";
import Sidebar from "@/layouts/Sidebar";
import { AnimatedSearchIcon } from "@/components/common/AnimatedSearchIcon";
import SortArrow from "@/components/common/SortArrow";
import AddDepartmentModal from "@/features/departments/components/AddDepartmentModal";
import EditDepartmentModal from "@/features/departments/components/EditDepartmentModal";
import ViewDepartmentModal from "@/features/departments/components/ViewDepartmentModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { useDepartmentsPage } from "@/features/departments/hooks/useDepartmentsPage";
import useDeleteConfirmation from "@/hooks/useDeleteConfirmation";

export default function DepartmentsPage() {
  const { t } = useTranslation();
  const deleteConfirmation = useDeleteConfirmation();
  const {
    departments,
    stats,
    loading,
    search,
    statusFilter,
    sortBy,
    sortOrder,
    setSearch,
    setStatus,
    handleSort,
    addOpen,
    editOpen,
    selected,
    viewId,
    setAddOpen,
    isSaving,
    isDeleting,
    openView,
    closeView,
    openEdit,
    handleAdd,
    handleEdit,
    handleDelete,
    confirmDelete,
    closeDelete,
    handleToggle,
  } = useDepartmentsPage();

  const handleDeleteRequest = (dept: NonNullable<typeof selected>) => {
    handleDelete(dept);
    deleteConfirmation.requestDelete({
      title: t("common.delete"),
      message: t("departments.deleteConfirm", { name: dept.name }),
      confirmLabel: t("common.delete"),
      cancelLabel: t("common.cancel"),
      onConfirm: confirmDelete,
    });
  };

  const statCards = [
    {
      label: t("departments.totalDepartments"),
      value: stats.total,
      icon: FiGrid,
      color: "text-white",
      cardBg: "bg-[#1e3a5f]",
      iconBg: "bg-white/20",
    },
    {
      label: t("departments.activeLabel"),
      value: stats.active,
      icon: FiCheckCircle,
      color: "text-emerald-600",
      iconBg: "bg-emerald-50",
      tone: "border-emerald-200 ring-emerald-200/70",
    },
    {
      label: t("departments.assigned"),
      value: stats.assigned,
      icon: FiUserCheck,
      color: "text-purple-600",
      iconBg: "bg-purple-50",
      tone: "border-purple-200 ring-purple-200/70",
    },
    {
      label: t("departments.employees"),
      value: stats.totalEmployees,
      icon: FiUsers,
      color: "text-amber-600",
      iconBg: "bg-amber-50",
      tone: "border-amber-200 ring-amber-200/70",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-auto">
        <Header searchTerm="" onSearchChange={() => {}} />

        <div className="p-6 space-y-5">
          {/*===================== Page header ===================== */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {t("departments.title")}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {t("departments.subtitle")}
              </p>
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700"
            >
              <FiPlus className="h-4 w-4" />
              {t("departments.addDepartment")}
            </button>
          </div>

          {/*===================== Stat cards ===================== */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map((card, idx) => {
              const Icon = card.icon;
              if (idx === 0) {
                return (
                  <div
                    key={card.label}
                    className="rounded-2xl px-5 py-4 shadow-sm border border-slate-100"
                    style={{ background: "#1e3a5f" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-white/30 p-2.5 bg-white/20 text-white shadow-sm flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white leading-none">
                          {card.value}
                        </p>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-200 mt-0.5">
                          {card.label}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={card.label}
                  className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-2xl border ring-1 ring-inset p-2.5 shrink-0 shadow-sm flex items-center justify-center ${card.tone} ${card.iconBg} ${card.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 leading-none">
                        {card.value}
                      </p>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mt-0.5">
                        {card.label}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/*===================== Filters ===================== */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-sm">
              <AnimatedSearchIcon />
              <input
                type="text"
                placeholder={t("departments.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:w-45"
            >
              <option value="all">All Status</option>
              <option value="active">{t("departments.active")}</option>
              <option value="inactive">{t("departments.inactive")}</option>
            </select>
          </div>

          {/* ── Table ────────────────────────────────────────────────── */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">
                {t("departments.allDepartments")}
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
                {t("common.loading")}
              </div>
            ) : departments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <FiGrid className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">{t("departments.noData")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="w-12 px-6 py-3 text-center">
                        {t("departments.sn")}
                      </th>
                      <th
                        className="px-6 py-3 text-left cursor-pointer select-none hover:bg-slate-100"
                        onClick={() => handleSort("name")}
                      >
                        {t("departments.department")}
                        <SortArrow
                          column="name"
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th
                        className="px-6 py-3 text-left cursor-pointer select-none hover:bg-slate-100"
                        onClick={() => handleSort("code")}
                      >
                        {t("departments.code")}
                        <SortArrow
                          column="code"
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th
                        className="px-6 py-3 text-left cursor-pointer select-none"
                        onClick={() => handleSort("manager")}
                      >
                        {t("departments.manager")}
                        <SortArrow
                          column="manager"
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th
                        className="px-6 py-3 text-left cursor-pointer select-none"
                        onClick={() => handleSort("employees")}
                      >
                        {t("departments.employees")}
                        <SortArrow
                          column="employees"
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th
                        className="px-6 py-3 text-left cursor-pointer select-none"
                        onClick={() => handleSort("status")}
                      >
                        {t("common.status")}
                        <SortArrow
                          column="status"
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th className="px-6 py-3 text-left">
                        {t("common.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {departments.map((dept, idx) => (
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
                              {t("departments.unassigned")}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {dept.employeeCount}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-xs ${
                              dept.status === "active"
                                ? "border border-emerald-200 bg-emerald-50/90 text-emerald-700"
                                : "border border-red-200 bg-red-50/90 text-red-600"
                            }`}
                          >
                            <span
                              className={`rounded-full p-0.5 ${dept.status === "active" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
                            >
                              {dept.status === "active" ? (
                                <FiCheckCircle className="h-3 w-3" />
                              ) : (
                                <FiXCircle className="h-3 w-3" />
                              )}
                            </span>
                            {dept.status === "active"
                              ? t("departments.active")
                              : t("departments.inactive")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openView(dept)}
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-500 transition hover:text-white"
                            >
                              <FiEye className="h-3.5 w-3.5" />
                              {t("common.view")}
                            </button>
                            <button
                              onClick={() => openEdit(dept)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                              <FiEdit2 className="h-3.5 w-3.5" />
                              {t("common.edit")}
                            </button>
                            <button
                              onClick={() => handleDeleteRequest(dept)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-500 transition hover:text-white"
                            >
                              <FiTrash2 className="h-3.5 w-3.5" />
                              {t("common.delete")}
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

          {/* ── Modals ───────────────────────────────────────────────── */}
          <AddDepartmentModal
            isOpen={addOpen}
            onClose={() => setAddOpen(false)}
            onSave={handleAdd}
            isSaving={isSaving}
          />
          <EditDepartmentModal
            isOpen={editOpen}
            onClose={() => {}}
            onSave={handleEdit}
            department={selected}
            isSaving={isSaving}
          />
          <ViewDepartmentModal
            isOpen={!!viewId}
            onClose={closeView}
            department={selected}
          />
          <DeleteConfirmModal
            isOpen={deleteConfirmation.isOpen}
            title={deleteConfirmation.dialog?.title ?? t("common.delete")}
            message={
              deleteConfirmation.dialog?.message ??
              "Are you sure you want to delete this department?"
            }
            confirmLabel={
              deleteConfirmation.dialog?.confirmLabel ?? t("common.delete")
            }
            cancelLabel={
              deleteConfirmation.dialog?.cancelLabel ?? t("common.cancel")
            }
            isProcessing={isDeleting || deleteConfirmation.isProcessing}
            onClose={() => {
              deleteConfirmation.closeDialog();
              closeDelete();
            }}
            onConfirm={deleteConfirmation.confirmDelete}
          />
        </div>
      </main>
    </div>
  );
}
