import { FiEdit2, FiEye, FiPlus, FiTrash2, FiUsers } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { User } from "@/features/users/types/user.types";
import { useUser } from "@/context/UserContext";
import TablePagination from "@/components/common/TablePagination";
import SortArrow from "@/components/common/SortArrow";

interface UserTableProps {
  title: string;
  users: User[];
  totalRecords?: number;
  emptyMessage: string;
  onAdd: () => void;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  hideTitle?: boolean;
  hideAddButton?: boolean;
  // server-side pagination + sort
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
  onSort?: (column: string) => void;
}

function UserTable({
  title,
  users,
  totalRecords,
  emptyMessage,
  onAdd,
  onView,
  onEdit,
  onDelete,
  hideTitle = false,
  hideAddButton = false,
  page,
  totalPages,
  onPageChange,
  pageSize = 8,
  sortBy,
  sortOrder,
  onSort,
}: UserTableProps) {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";
  const { t } = useTranslation();

  const paginated = users;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {totalRecords ?? users.length} records
          </div>
          {isAdmin && !hideAddButton && (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <FiPlus className="h-4 w-4" />
              {t("employees.addUser")}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">S/N</th>
              <th
                className={
                  onSort
                    ? "cursor-pointer select-none px-5 py-3 font-medium"
                    : "px-5 py-3 font-medium"
                }
                onClick={() => onSort?.("name")}
              >
                {t("employees.name")}
                {onSort && (
                  <SortArrow
                    column="name"
                    sortBy={sortBy ?? ""}
                    sortOrder={sortOrder ?? ""}
                  />
                )}
              </th>
              <th
                className={
                  onSort
                    ? "cursor-pointer select-none px-5 py-3 font-medium"
                    : "px-5 py-3 font-medium"
                }
                onClick={() => onSort?.("email")}
              >
                {t("employees.email")}
                {onSort && (
                  <SortArrow
                    column="email"
                    sortBy={sortBy ?? ""}
                    sortOrder={sortOrder ?? ""}
                  />
                )}
              </th>
              <th className="px-5 py-3 font-medium">{t("employees.status")}</th>
              <th className="px-5 py-3 font-medium text-right">
                {t("employees.actions")}
              </th>
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? (
              paginated.map((user, index) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-5 py-4 text-slate-600">
                    {(page - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {user.name}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{user.email}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView(user)}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-500 transition hover:text-white"
                      >
                        <FiEye className="h-4 w-4" />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(user)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        <FiEdit2 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(user)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-500 transition hover:text-white"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <FiUsers className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </section>
  );
}

export default UserTable;
