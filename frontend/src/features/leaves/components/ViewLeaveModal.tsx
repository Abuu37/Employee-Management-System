import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  FiBriefcase,
  FiHash,
  FiUser,
  FiCalendar,
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiX,
  FiClock,
} from "react-icons/fi";
import RichTextEditor from "@/components/editor/RichTextEditor";

interface Leave {
  id: number;
  employeeName?: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  overallStatus: string;
  managerStatus?: string;
  managerComment?: string;
  managerApprovedAt?: string;
  hrStatus?: string;
  hrComment?: string;
  hrApprovedAt?: string;
  backupEmployeeName?: string;
  handoverNote?: string;
  userRole?: string;
}

interface ViewLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave: Leave | null;
  onApprove?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// ─── Status config ───────────────────────────────────────────────────────────
const overallStatusConfig: Record<string, { color: string; label: string }> = {
  pending_manager: {
    color: "border-yellow-200 bg-yellow-50 text-yellow-700",
    label: "leaves.statusLabels.pending_manager",
  },
  pending_hr: {
    color: "border-blue-200 bg-blue-50 text-blue-700",
    label: "leaves.statusLabels.pending_hr",
  },
  approved: {
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
    label: "leaves.approved",
  },
  rejected: {
    color: "border-red-200 bg-red-50 text-red-600",
    label: "leaves.rejected",
  },
  rejected_by_manager: {
    color: "border-red-200 bg-red-50 text-red-600",
    label: "leaves.statusLabels.rejected_by_manager",
  },
  rejected_by_hr: {
    color: "border-red-200 bg-red-50 text-red-600",
    label: "leaves.statusLabels.rejected_by_hr",
  },
};

// ─── Review status icon ───────────────────────────────────────────────────────
function ReviewIcon({ status }: { status?: string }) {
  if (status === "approved")
    return <FiCheckCircle className="h-4 w-4 text-emerald-600" />;
  if (status === "rejected")
    return <FiXCircle className="h-4 w-4 text-red-500" />;
  if (!status || status === "pending")
    return <FiAlertTriangle className="h-4 w-4 text-yellow-500" />;
  return <FiAlertCircle className="h-4 w-4 text-slate-400" />;
}

// ─── Tab definitions ──────────────────────────────────────────────────────────
type Tab = "overview" | "reason";

const TAB_ITEMS: { key: Tab; label: string; icon: ReactNode }[] = [
  {
    key: "overview",
    label: "Overview",
    icon: <FiBriefcase className="h-3.5 w-3.5" />,
  },
  {
    key: "reason",
    label: "Reason",
    icon: <FiFileText className="h-3.5 w-3.5" />,
  },
];

// ─── Sliding tab bar (same pattern as EmployeeViewDrawer) ─────────────────────
function SlidingTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [slider, setSlider] = useState({ left: 0, width: 0 });

  const updateSlider = useCallback(() => {
    const idx = TAB_ITEMS.findIndex((t) => t.key === activeTab);
    const btn = buttonRefs.current[idx];
    const wrap = containerRef.current;
    if (!btn || !wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setSlider({ left: btnRect.left - wrapRect.left, width: btnRect.width });
  }, [activeTab]);

  useLayoutEffect(() => {
    updateSlider();
  }, [updateSlider]);

  useEffect(() => {
    window.addEventListener("resize", updateSlider);
    return () => window.removeEventListener("resize", updateSlider);
  }, [updateSlider]);

  return (
    <div
      ref={containerRef}
      className="relative mt-3 inline-flex items-center overflow-x-auto rounded-full border border-slate-200 bg-white p-1"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-[#1e3a5f] shadow-sm transition-all duration-300 ease-in-out"
        style={{ left: slider.left, width: slider.width }}
      />
      {TAB_ITEMS.map((tab, i) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            ref={(el) => {
              buttonRefs.current[i] = el;
            }}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`relative z-10 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
              isActive ? "text-white" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors duration-200 ${
                isActive ? "bg-white/20" : "bg-slate-100 text-slate-500"
              }`}
            >
              {tab.icon}
            </span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── PanelCard (same as EmployeeViewDrawer) ────────────────────────────────────
function PanelCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-lg bg-slate-100 p-1.5 text-slate-500">
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </article>
  );
}

// ─── InfoItem (same as EmployeeViewDrawer) ────────────────────────────────────
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ViewLeaveModal({
  isOpen,
  onClose,
  leave,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}: ViewLeaveModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Reset tab when a new leave is opened
  useEffect(() => {
    if (isOpen) setActiveTab("overview");
  }, [isOpen, leave?.id]);

  const initials = leave?.employeeName
    ? leave.employeeName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const displayedOverallStatus =
    leave?.userRole === "manager" &&
    leave.overallStatus === "rejected_by_manager"
      ? "rejected_by_hr"
      : leave?.overallStatus;

  const statusCfg = leave
    ? (overallStatusConfig[displayedOverallStatus ?? leave.overallStatus] ?? {
        color: "border-slate-200 bg-slate-100 text-slate-600",
        label: "",
      })
    : null;

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

      {/* Slide panel */}
      <div
        className={`absolute inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-out ${
          isOpen && leave ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {leave && (
          <>
            {/* ── Sticky header ── */}
            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-slate-800">
                {t("leaves.leaveDetails")}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close leave details"
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            {/* ── Sticky profile card + tabs ── */}
            <div className="sticky top-14.25 z-20 border-b border-slate-100 bg-white px-5 pt-4 pb-3 sm:px-6">
              {/* Profile card — gradient border, avatar initials */}
              <div className="rounded-2xl bg-linear-to-br from-blue-600 via-cyan-600 to-teal-500 p-px shadow-md drop-shadow-sm">
                <div className="rounded-2xl bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-bold text-[#1e3a5f]">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-900 truncate">
                          {leave.employeeName ?? "Employee"}
                        </p>
                        {statusCfg && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusCfg.color}`}
                          >
                            {statusCfg.label
                              ? t(statusCfg.label)
                              : (displayedOverallStatus ?? leave.overallStatus)}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500 capitalize">
                        {leave.type} {t("leaves.leaveWord")}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                        <FiClock className="h-3.5 w-3.5" />
                        <span>
                          {leave.startDate} → {leave.endDate} &nbsp;·&nbsp;{" "}
                          {leave.days} {t("leaves.days")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sliding tab bar */}
              <SlidingTabBar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* ── Static content ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth px-5 py-4 pb-28 pr-2 sm:px-6 sm:pr-3 space-y-4 [scrollbar-width:thin] [scrollbar-color:transparent_transparent] hover:[scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb:hover]:bg-slate-400">
              {/* ── OVERVIEW TAB ── */}
              {activeTab === "overview" && (
                <>
                  <PanelCard
                    title="Leave Information"
                    icon={<FiCalendar className="h-4 w-4" />}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <InfoItem
                        label={t("leaves.leaveId")}
                        value={String(leave.id)}
                      />
                      <InfoItem label={t("leaves.type")} value={leave.type} />
                      <InfoItem
                        label={t("leaves.startDate")}
                        value={leave.startDate}
                      />
                      <InfoItem
                        label={t("leaves.endDate")}
                        value={leave.endDate}
                      />
                      <InfoItem
                        label={t("leaves.days")}
                        value={String(leave.days)}
                      />
                      <InfoItem
                        label={t("leaves.backupPerson")}
                        value={leave.backupEmployeeName ?? "-"}
                      />
                    </div>
                  </PanelCard>

                  <PanelCard
                    title="Review Status"
                    icon={<FiCheckCircle className="h-4 w-4" />}
                  >
                    {leave.userRole === "manager" ? (
                      /* Manager's own leave — HR is the sole reviewer */
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          {displayedOverallStatus === "approved" ? (
                            <FiCheckCircle className="h-4 w-4 text-emerald-600" />
                          ) : displayedOverallStatus?.startsWith("rejected") ? (
                            <FiXCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <FiAlertCircle className="h-4 w-4 text-slate-400" />
                          )}
                          <p className="text-xs font-semibold text-slate-700">
                            {t("leaves.hrReview")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {(leave.hrApprovedAt ?? leave.managerApprovedAt) && (
                            <span className="text-[11px] text-slate-400">
                              {new Date(
                                (leave.hrApprovedAt ??
                                  leave.managerApprovedAt)!,
                              ).toLocaleDateString()}
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                              displayedOverallStatus === "approved"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : displayedOverallStatus?.startsWith("rejected")
                                  ? "border-red-200 bg-red-50 text-red-600"
                                  : "border-slate-200 bg-slate-100 text-slate-500"
                            }`}
                          >
                            {displayedOverallStatus === "approved"
                              ? t("leaves.approved")
                              : displayedOverallStatus === "rejected_by_hr"
                                ? t("leaves.statusLabels.rejected_by_hr")
                                : displayedOverallStatus?.startsWith("rejected")
                                  ? t("leaves.rejected")
                                  : t("leaves.notReviewed")}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Employee leave — two-stage: manager + HR */
                      <div className="grid grid-cols-2 gap-3">
                        {/* Manager Review */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <ReviewIcon status={leave.managerStatus} />
                            <p className="text-xs font-semibold text-slate-700">
                              {t("leaves.managerReview")}
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {t("leaves.status")}:{" "}
                            <span className="font-semibold text-slate-800 capitalize">
                              {leave.managerStatus ?? t("leaves.pending")}
                            </span>
                          </p>
                          {leave.managerApprovedAt && (
                            <p className="text-[11px] text-slate-500">
                              {t("leaves.date")}:{" "}
                              <span className="font-semibold text-slate-800">
                                {new Date(
                                  leave.managerApprovedAt,
                                ).toLocaleDateString()}
                              </span>
                            </p>
                          )}
                        </div>

                        {/* HR Review */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 space-y-1.5">
                          <div className="flex items-center gap-2">
                            {leave.hrStatus === "approved" ? (
                              <FiCheckCircle className="h-4 w-4 text-emerald-600" />
                            ) : leave.hrStatus === "rejected" ? (
                              <FiXCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <FiAlertCircle className="h-4 w-4 text-slate-400" />
                            )}
                            <p className="text-xs font-semibold text-slate-700">
                              {t("leaves.hrReview")}
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {t("leaves.status")}:{" "}
                            <span className="font-semibold text-slate-800 capitalize">
                              {leave.hrStatus ?? t("leaves.notReviewed")}
                            </span>
                          </p>
                          {leave.hrApprovedAt && (
                            <p className="text-[11px] text-slate-500">
                              {t("leaves.date")}:{" "}
                              <span className="font-semibold text-slate-800">
                                {new Date(
                                  leave.hrApprovedAt,
                                ).toLocaleDateString()}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </PanelCard>

                  {/* Rejection Reason — shown for any rejected leave */}
                  {leave.overallStatus.startsWith("rejected") &&
                    (leave.hrComment ?? leave.managerComment) && (
                      <PanelCard
                        title="Rejection Reason"
                        icon={<FiXCircle className="h-4 w-4 text-red-500" />}
                      >
                        <RichTextEditor
                          value={leave.hrComment ?? leave.managerComment ?? ""}
                          onChange={() => {}}
                          readOnly
                          simple
                          height="120px"
                        />
                      </PanelCard>
                    )}
                </>
              )}

              {/* ── REASON TAB ── */}
              {activeTab === "reason" && (
                <>
                  <PanelCard
                    title={t("leaves.reason")}
                    icon={<FiFileText className="h-4 w-4" />}
                  >
                    {leave.reason ? (
                      <RichTextEditor
                        value={leave.reason}
                        onChange={() => {}}
                        readOnly
                        simple
                        height="120px"
                      />
                    ) : (
                      <span className="text-sm text-slate-400 italic">
                        No reason provided.
                      </span>
                    )}
                  </PanelCard>

                  {leave.handoverNote && (
                    <PanelCard
                      title={t("leaves.handoverNotes")}
                      icon={<FiHash className="h-4 w-4" />}
                    >
                      <RichTextEditor
                        value={leave.handoverNote}
                        onChange={() => {}}
                        readOnly
                        simple
                        height="115px"
                      />
                    </PanelCard>
                  )}
                </>
              )}
            </div>

            {/* ── Sticky footer — shown only when actions available ── */}
            {(onApprove || onReject || onEdit || onDelete) && (
              <div className="sticky bottom-0 z-30 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
                <div className="flex gap-3">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onClose();
                        onEdit();
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition"
                    >
                      <FiFileText className="h-4 w-4" />
                      {t("leaves.editRequest")}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onClose();
                        onDelete();
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      <FiXCircle className="h-4 w-4" />
                      {t("common.delete")}
                    </button>
                  )}
                  {onApprove && (
                    <button
                      onClick={() => {
                        onApprove();
                        onClose();
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                    >
                      <FiCheckCircle className="h-4 w-4" />
                      {t("leaves.approve")}
                    </button>
                  )}
                  {onReject && (
                    <button
                      onClick={() => {
                        onClose();
                        onReject();
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      <FiXCircle className="h-4 w-4" />
                      {t("leaves.reject")}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
