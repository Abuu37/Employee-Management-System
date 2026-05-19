import { useTranslation } from "react-i18next";
import { FiPlus } from "react-icons/fi";
import Header from "@/layouts/Header";
import Sidebar from "@/layouts/Sidebar";
import { AnimatedSearchIcon } from "@/components/common/AnimatedSearchIcon";
import UserTable from "@/features/users/components/UserTable";
import UserForm from "@/features/users/components/UserForm";
import UserDetails from "@/features/users/components/UserDetails";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { useUsers } from "@/features/users/hooks/useUsers";
import useDeleteConfirmation from "@/hooks/useDeleteConfirmation";

export default function Users() {
  const { t } = useTranslation();
  const deleteConfirmation = useDeleteConfirmation();
  const {
    users,
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
  } = useUsers();

  const handleDeleteRequest = (user: NonNullable<typeof selected>) => {
    openDelete(user);
    deleteConfirmation.requestDelete({
      title: t("common.delete"),
      message: t("employees.deleteConfirm", { name: user.name }),
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
                {t("employees.title")}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {t("employees.subtitle")}
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
              >
                <FiPlus className="h-4 w-4" />
                {t("employees.addEmployee")}
              </button>
            )}
          </div>

          {/* ── Filters ──────────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <AnimatedSearchIcon />
              <input
                type="text"
                placeholder={t("employees.searchEmployees")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-sm rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All Status</option>
              <option value="active">{t("departments.active")}</option>
              <option value="inactive">{t("departments.inactive")}</option>
            </select>
          </div>

          {/* ── Table ────────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-slate-400 text-sm shadow-sm">
              {t("common.loading")}
            </div>
          ) : (
            <UserTable
              title={t("employees.allEmployees")}
              users={users}
              totalRecords={totalRecords}
              emptyMessage="No users found."
              onAdd={() => setAddOpen(true)}
              onView={openView}
              onEdit={openEdit}
              onDelete={handleDeleteRequest}
              hideAddButton={!isAdmin}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={PAGE_SIZE}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          )}
        </div>
      </main>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      <UserForm
        key={addOpen ? "user-form-add-open" : "user-form-add-closed"}
        mode="add"
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleCreate}
        roleOptions={["employee"]}
        isSaving={isCreating}
      />
      <UserDetails
        isOpen={!!viewId}
        onClose={closeView}
        user={selected}
        onEdit={handleDrawerEdit}
        onDeactivate={handleDrawerDeactivate}
      />
      <UserForm
        key={selected?.id}
        mode="edit"
        isOpen={editOpen}
        onClose={closeAllModals}
        onSave={handleEdit}
        user={selected}
        roleOptions={["employee"]}
        isSaving={isSaving}
      />
      <DeleteConfirmModal
        isOpen={deleteConfirmation.isOpen}
        title={deleteConfirmation.dialog?.title ?? t("common.delete")}
        message={
          deleteConfirmation.dialog?.message ??
          "Are you sure you want to delete this user?"
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
