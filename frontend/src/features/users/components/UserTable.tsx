import {
  FiCheckCircle,
  FiUsers,
  FiEye,
  FiTrash2,
  FiSend,
  FiCheck,
  FiAlertCircle,
  FiMail,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { User } from "@/features/users/types/user.types";
import { useUser } from "@/context/UserContext";
import ActionMenu, {
  type ActionMenuItemConfig,
} from "@/components/common/ActionMenu";
import TablePagination from "@/components/common/TablePagination";
import SortArrow from "@/components/common/SortArrow";
import {
  TABLE_HEADER_CELL_CLASS,
  useTableCountBadge,
} from "@/hooks/useTableCountBadge";
import TableCountBadge from "@/components/common/TableCountBadge";
// ─── Invitation badge ──────────────────────────────────────────────────────────
function InvitationBadge({
  status,
}: {
  status?: "sent" | "failed" | "accepted" | null;
}) {
  if (!status) {
    return <span className="text-slate-400 text-xs">No data</span>;
  }

  const cfg = {
    sent: {
      cls: "bg-blue-50 text-blue-700 border border-blue-200",
      Icon: FiMail,
      label: "Sent",
    },
    failed: {
      cls: "bg-red-50 text-red-600 border border-red-200",
      Icon: FiAlertCircle,
      label: "Failed",
    },
    accepted: {
      cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      Icon: FiCheck,
      label: "Accepted",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.cls}`}
    >
      <cfg.Icon className="h-3 w-3 shrink-0" />
      {cfg.label}
    </span>
  );
}

// ─── Row action dropdown ───────────────────────────────────────────────────────
interface RowMenuProps {
  user: User;
  onView: (u: User) => void;
  onDelete: (u: User) => void;
  onResend: (u: User) => void;
}

function RowMenu({ user, onView, onDelete, onResend }: RowMenuProps) {
  const activated = user.invitation_status === "accepted";
  const pendingOrFailed =
    user.invitation_status === "sent" || user.invitation_status === "failed";

  const items: ActionMenuItemConfig[] = [
    {
      label: "View",
      icon: FiEye,
      onClick: () => onView(user),
      hidden: !activated,
    },
    {
      label: "Resend",
      icon: FiSend,
      onClick: () => onResend(user),
      hidden: !pendingOrFailed,
    },
    {
      label: "Delete",
      icon: FiTrash2,
      onClick: () => onDelete(user),
      danger: true,
    },
  ];

  return <ActionMenu ariaLabel="User actions" items={items} align="center" />;
}

// ─── UserTable ─────────────────────────────────────────────────────────────────
interface UserTableProps {
  title: string;
  users: User[];
  totalRecords?: number;
  emptyMessage: string;
  onAdd: () => void;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onResendInvitation?: (user: User) => void;
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
  onResendInvitation,
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
  const { count } = useTableCountBadge({
    total: totalRecords,
    fallbackTotal: users.length,
  });

  const paginated = users;

  const handleResend = (u: User) => {
    onResendInvitation?.(u);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <div className="flex items-center gap-3">
          <TableCountBadge count={count} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#1e3a5f] text-blue-100">
            <tr>
              <th className={TABLE_HEADER_CELL_CLASS}>S/N</th>
              <th
                className={
                  onSort
                    ? `${TABLE_HEADER_CELL_CLASS} cursor-pointer select-none`
                    : TABLE_HEADER_CELL_CLASS
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
                    ? `${TABLE_HEADER_CELL_CLASS} cursor-pointer select-none`
                    : TABLE_HEADER_CELL_CLASS
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
              <th
                className={
                  onSort
                    ? `${TABLE_HEADER_CELL_CLASS} cursor-pointer select-none`
                    : TABLE_HEADER_CELL_CLASS
                }
                onClick={() => onSort?.("department")}
              >
                Department
                {onSort && (
                  <SortArrow
                    column="department"
                    sortBy={sortBy ?? ""}
                    sortOrder={sortOrder ?? ""}
                  />
                )}
              </th>
              <th
                className={
                  onSort
                    ? `${TABLE_HEADER_CELL_CLASS} cursor-pointer select-none`
                    : TABLE_HEADER_CELL_CLASS
                }
                onClick={() => onSort?.("position")}
              >
                Position
                {onSort && (
                  <SortArrow
                    column="position"
                    sortBy={sortBy ?? ""}
                    sortOrder={sortOrder ?? ""}
                  />
                )}
              </th>
              <th
                className={
                  onSort
                    ? `${TABLE_HEADER_CELL_CLASS} cursor-pointer select-none`
                    : TABLE_HEADER_CELL_CLASS
                }
                onClick={() => onSort?.("employment_type")}
              >
                Employee Type
                {onSort && (
                  <SortArrow
                    column="employment_type"
                    sortBy={sortBy ?? ""}
                    sortOrder={sortOrder ?? ""}
                  />
                )}
              </th>
              <th
                className={
                  onSort
                    ? `${TABLE_HEADER_CELL_CLASS} cursor-pointer select-none`
                    : TABLE_HEADER_CELL_CLASS
                }
                onClick={() => onSort?.("office_branch")}
              >
                Office / Branch
                {onSort && (
                  <SortArrow
                    column="office_branch"
                    sortBy={sortBy ?? ""}
                    sortOrder={sortOrder ?? ""}
                  />
                )}
              </th>
              <th className={TABLE_HEADER_CELL_CLASS}>
                {t("employees.status")}
              </th>
              <th className={TABLE_HEADER_CELL_CLASS}>Invitation</th>
              <th className={`${TABLE_HEADER_CELL_CLASS} text-center`}>
                {t("employees.actions")}
              </th>
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? (
              paginated.map((rowUser, index) => (
                <tr
                  key={rowUser.id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50/60"
                >
                  <td className="px-5 py-4 text-slate-600">
                    {(page - 1) * pageSize + index + 1}
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {rowUser.name}
                  </td>

                  <td className="px-5 py-4 text-slate-600">{rowUser.email}</td>

                  <td className="px-5 py-4 text-slate-600">
                    {rowUser.department ?? "No data"}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {rowUser.position ?? "No data"}
                  </td>

                  <td className="px-5 py-4 text-slate-600 capitalize">
                    {rowUser.employment_type
                      ? rowUser.employment_type.replace(/_/g, " ")
                      : "No data"}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {rowUser.office_branch ?? rowUser.officeBranch ?? "No data"}
                  </td>

                  {/* Account Status */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        rowUser.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      <FiCheckCircle className="h-3 w-3 shrink-0" />
                      {rowUser.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Invitation Status */}
                  <td className="px-5 py-4">
                    <InvitationBadge status={rowUser.invitation_status} />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <RowMenu
                      user={rowUser}
                      onView={onView}
                      onDelete={onDelete}
                      onResend={handleResend}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-5 py-16 text-center">
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

      {/* Pagination */}
      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalRecords={totalRecords ?? users.length}
        pageSize={pageSize}
      />
    </section>
  );
}

export default UserTable;



