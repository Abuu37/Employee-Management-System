import { useTranslation } from "react-i18next";
import {
  FiCheckCircle,
  FiEye,
  FiPlus,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import Header from "@/layouts/Header";
import Sidebar from "@/layouts/Sidebar";
import { AnimatedSearchIcon } from "@/components/common/AnimatedSearchIcon";
import TablePagination from "@/components/common/TablePagination";
import SortArrow from "@/components/common/SortArrow";
import AddUserModal from "@/features/users/components/AddUserModal";
import EditUserModal from "@/features/users/components/EditUserModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import ManagerViewDrawer from "@/features/users/components/ManagerViewDrawer";
import { useManagersPage } from "@/features/users/hooks/useManagersPage";
import useDeleteConfirmation from "@/hooks/useDeleteConfirmation";

export default function ManagerPage() {
  const { t } = useTranslation();
  const deleteConfirmation = useDeleteConfirmation();
  const {
    managers,
    totalRecords,
    totalPages,
    loading,
    selected,
    isAdmin,
    PAGE_SIZE,
    page,
    search,
    statusFilter,
    sortBy,
    sortOrder,
    setPage,
    setSearch,
    setStatus,
    handleSort,
    addOpen,
    editOpen,
    deleteOpen,
    viewId,
    setAddOpen,
    isCreating,
    isSaving,
    isDeleting,
    openView,
    closeView,
    openEdit,
    openDelete,
    handleDrawerEdit,
    handleDrawerDeactivate,
    handleCreate,
    handleEdit,
    handleDelete,
    closeAllModals,
  } = useManagersPage();

  const handleDeleteRequest = (manager: NonNullable<typeof selected>) => {
    openDelete(manager);
    deleteConfirmation.requestDelete({
      title: t("common.delete"),
      message: t("employees.deleteConfirm", { name: manager.name }),
      confirmLabel: t("common.delete"),
      cancelLabel: t("common.cancel"),
      onConfirm: handleDelete,
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-auto">
        <Header searchTerm="" onSearchChange={() => {}} />

        <div className="p-6 space-y-5">
          {/* ── Page header ──────────────────────────────────────────── */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
              >
                <FiPlus className="h-4 w-4" />
                {t("nav.addManager") === "nav.addManager"
                  ? "Add Manager"
                  : t("nav.addManager")}
              </button>
            )}
          </div>

          {/* ── Filters ──────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-sm">
              <AnimatedSearchIcon />
              <input
                type="text"
                placeholder={t("employees.searchManagers")}
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
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-semibold text-slate-800">
                {t("employees.allManagers")}
              </h3>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {totalRecords} records
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
                {t("common.loading")}
              </div>
            ) : managers.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <FiUsers className="mb-3 h-12 w-12 opacity-30" />
                  <p className="text-sm">No managers found.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">S/N</th>
                      <th
                        className="cursor-pointer select-none px-5 py-3 font-medium"
                        onClick={() => handleSort("name")}
                      >
                        {t("employees.name")}
                        <SortArrow
                          column="name"
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th
                        className="cursor-pointer select-none px-5 py-3 font-medium"
                        onClick={() => handleSort("email")}
                      >
                        {t("employees.email")}
                        <SortArrow
                          column="email"
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th
                        className="cursor-pointer select-none px-5 py-3 font-medium"
                        onClick={() => handleSort("department")}
                      >
                        {t("employees.department")}
                        <SortArrow
                          column="department"
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th
                        className="cursor-pointer select-none px-5 py-3 font-medium"
                        onClick={() => handleSort("position")}
                      >
                        Position
                        <SortArrow
                          column="position"
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th className="px-5 py-3 font-medium">Employment Type</th>
                      <th className="px-5 py-3 font-medium">Office / Branch</th>
                      <th className="px-5 py-3 font-medium">
                        {t("employees.status")}
                      </th>
                      <th className="px-5 py-3 font-medium text-right">
                        {t("employees.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {managers.map((manager, index) => (
                      <tr
                        key={manager.id}
                        className="border-t border-slate-100"
                      >
                        <td className="px-5 py-4 text-slate-600">
                          {(page - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {manager.name}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {manager.email}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {manager.department ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {manager.position ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {manager.employment_type
                            ? manager.employment_type
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase())
                            : "—"}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {manager.office_branch ?? "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <span className="rounded-full bg-emerald-100 p-0.5 text-emerald-600">
                              <FiCheckCircle className="h-3 w-3" />
                            </span>
                            Active
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openView(manager)}
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-500 hover:text-white"
                            >
                              <FiEye className="h-4 w-4" />
                              {t("common.view")}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(manager)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-500 hover:text-white"
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
            <TablePagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </section>
        </div>
      </main>

      <AddUserModal
        key={addOpen ? "add-manager-open" : "add-manager-closed"}
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleCreate}
        roleOptions={["manager"]}
        isSaving={isCreating}
      />
      <ManagerViewDrawer
        isOpen={!!viewId}
        onClose={closeView}
        user={selected}
        onEdit={handleDrawerEdit}
        onDeactivate={handleDrawerDeactivate}
      />
      <EditUserModal
        key={selected?.id}
        isOpen={editOpen}
        onClose={closeAllModals}
        onSave={handleEdit}
        user={selected}
        roleOptions={["manager"]}
        isSaving={isSaving}
      />
      <DeleteConfirmModal
        isOpen={deleteConfirmation.isOpen}
        title={deleteConfirmation.dialog?.title ?? t("common.delete")}
        message={
          deleteConfirmation.dialog?.message ??
          "Are you sure you want to delete this manager?"
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
          closeAllModals();
        }}
        onConfirm={deleteConfirmation.confirmDelete}
      />
    </div>
  );
}
