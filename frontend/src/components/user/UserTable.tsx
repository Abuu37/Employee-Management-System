import { useState } from "react";
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import type { User } from "./types";

const PAGE_SIZE = 8;

interface UserTableProps {
  title: string;
  users: User[];
  emptyMessage: string;
  onAdd: () => void;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  hideTitle?: boolean;
}

function UserTable({
  title,
  users,
  emptyMessage,
  onAdd,
  onView,
  onEdit,
  onDelete,
  hideTitle = false,
}: UserTableProps) {
  // Only show Add User button for admin
  const isAdmin =
    typeof window !== "undefined" &&
    localStorage.getItem("user-role") === "admin";

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const paginated = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        {!hideTitle && (
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        )}
        <div
          className={`flex items-center gap-3 ${hideTitle ? "ml-auto" : ""}`}
        >
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {users.length} records
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <FiPlus className="h-4 w-4" />
              Add User
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">S/N</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? (
              paginated.map((user, index) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-5 py-4 text-slate-600">
                    {(page - 1) * PAGE_SIZE + index + 1}
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
                        className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
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
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          Previous
        </button>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          Next
        </button>
      </div>
    </section>
  );
}

export default UserTable;
