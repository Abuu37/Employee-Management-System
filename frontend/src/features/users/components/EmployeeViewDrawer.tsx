import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  FiActivity,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiFileText,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";
import axios from "@/services/axios";
import { useUser } from "@/context/UserContext";
import type {
  User,
  EmployeeInsightsResponse,
} from "@/features/users/types/user.types";
import { userService } from "@/features/users/services/user.service";

interface EmployeeViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onEdit: (employee: User) => void;
  onDeactivate: (employee: User) => void;
}

type DrawerTab = "overview" | "attendance" | "tasks" | "activity";

type AttendanceRecord = {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
};

type TaskItem = {
  id: number;
  title: string;
  status: "pending" | "in_progress" | "completed";
  dueLabel: string;
};

type TimelineEvent = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
};

export default function EmployeeViewDrawer({
  isOpen,
  onClose,
  user,
  onEdit,
  onDeactivate,
}: EmployeeViewDrawerProps) {
  const { user: currentUser } = useUser();
  const isManager = currentUser?.role === "manager";
  const lastUserRef = useRef<User | null>(null);
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");
  const [managerName, setManagerName] = useState<string>("Not assigned");
  const [insights, setInsights] = useState<EmployeeInsightsResponse | null>(
    null,
  );
  const [insightsLoading, setInsightsLoading] = useState(false);

  if (user) {
    lastUserRef.current = user;
  }
  const drawerData = user ?? lastUserRef.current;

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("overview");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !drawerData?.id) {
      return;
    }

    let alive = true;
    const loadInsights = async () => {
      try {
        setInsightsLoading(true);
        const payload = await userService.getInsights(drawerData.id);
        if (!alive) return;
        setInsights(payload);
      } catch {
        if (!alive) return;
        setInsights(null);
      } finally {
        if (alive) setInsightsLoading(false);
      }
    };

    loadInsights();

    return () => {
      alive = false;
    };
  }, [isOpen, drawerData?.id]);

  useEffect(() => {
    if (!isOpen || !drawerData?.manager_id) {
      setManagerName("Not assigned");
      return;
    }

    // If the logged-in user IS the manager, use their name directly
    if (currentUser && drawerData.manager_id === currentUser.id) {
      setManagerName(currentUser.name);
      return;
    }

    let alive = true;
    const loadManagerName = async () => {
      try {
        const res = await axios.get<User[]>("/user/view-users");
        if (!alive) return;

        const manager = Array.isArray(res.data)
          ? res.data.find((row) => row.id === drawerData.manager_id)
          : null;
        setManagerName(manager?.name ?? "Not assigned");
      } catch {
        if (!alive) return;
        setManagerName("Not assigned");
      }
    };

    loadManagerName();

    return () => {
      alive = false;
    };
  }, [isOpen, drawerData?.manager_id, currentUser]);

  const initials = useMemo(() => {
    if (!drawerData?.name) return "EM";
    return drawerData.name
      .split(" ")
      .map((chunk) => chunk[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [drawerData?.name]);

  const joinDate = drawerData?.createdAt
    ? new Date(drawerData.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const employmentTypeLabel = drawerData?.employment_type
    ? drawerData.employment_type
        .split("_")
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
        .join(" ")
    : "Full-Time";
  const joinDateLabel = drawerData?.join_date
    ? new Date(drawerData.join_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : joinDate;
  const dobLabel = drawerData?.date_of_birth
    ? new Date(drawerData.date_of_birth).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not set";
  const genderLabel = drawerData?.gender
    ? drawerData.gender
        .split("_")
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
        .join(" ")
    : "Not set";

  const isActiveStatus =
    (drawerData?.status ?? "active").toLowerCase() === "active";

  const attendanceSummary = insights?.attendanceSummary ?? {
    attendancePct: 0,
    lateArrivals: 0,
    leaveDays: 0,
    overtime: 0,
  };

  const attendanceRecords: AttendanceRecord[] =
    insights?.recentAttendance ?? [];
  const tasks: TaskItem[] = insights?.tasks ?? [];
  const taskSummary = {
    pending: insights?.taskSummary.pendingTasks ?? 0,
    in_progress: insights?.taskSummary.inProgressTasks ?? 0,
    completed: insights?.taskSummary.completedTasks ?? 0,
  };
  const timeline: TimelineEvent[] = insights?.timeline ?? [];

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
    >
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
        onClick={onClose}
      />

      <div
        className={`absolute inset-y-0 right-0 w-full max-w-full sm:max-w-2xl lg:max-w-2xl bg-white shadow-2xl flex flex-col overflow-y-auto overflow-x-hidden transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        {drawerData && (
          <>
            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-slate-800">
                Employee Details
              </h2>
              <button
                onClick={onClose}
                aria-label="Close employee details"
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="sticky top-17.25 z-20 border-b border-slate-100 bg-white px-5 pt-4 pb-3 sm:px-6">
              <div className="rounded-2xl bg-linear-to-br from-blue-600 via-cyan-600 to-teal-500 p-px shadow-md drop-shadow-sm">
                <div className="rounded-2xl bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-bold text-[#1e3a5f]">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-slate-900 truncate">
                          {drawerData.name}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                            isActiveStatus
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-red-200 bg-red-50 text-red-700"
                          }`}
                        >
                          <span
                            className={`rounded-full p-0.5 ${
                              isActiveStatus
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            <FiCheckCircle className="h-3 w-3" />
                          </span>
                          {isActiveStatus ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-medium text-slate-600">
                        {drawerData.position ?? "Employee"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {drawerData.department ?? "Department not set"}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                          <FiMail className="h-3.5 w-3.5" />
                          <span className="truncate">{drawerData.email}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                          <FiPhone className="h-3.5 w-3.5" />
                          <span>
                            {drawerData.phone ?? "Phone not available"}
                          </span>
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                          <FiClock className="h-3.5 w-3.5" />
                          <span>Joined {joinDate}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <SlidingTabBar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div className="flex-1 px-5 py-4 pb-24 sm:px-6">
              {activeTab === "overview" ? (
                <section className="space-y-4">
                  <PanelCard
                    title="Personal Information"
                    icon={<FiUser className="h-4 w-4" />}
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <InfoItem
                        label="Phone Number"
                        value={drawerData.phone ?? "Not set"}
                      />
                      <InfoItem
                        label="Email"
                        value={drawerData.email ?? "Not set"}
                      />
                      <InfoItem label="Gender" value={genderLabel} />
                      <InfoItem label="Date of Birth" value={dobLabel} />
                      <InfoItem
                        label="Address"
                        value={drawerData.address ?? "Not set"}
                      />
                      <InfoItem
                        label="Emergency Contact"
                        value={drawerData.emergency_contact ?? "Not set"}
                      />
                    </div>
                  </PanelCard>

                  <PanelCard
                    title="Work Information"
                    icon={<FiBriefcase className="h-4 w-4" />}
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <InfoItem
                        label="Employee ID"
                        value={drawerData.employee_id ?? String(drawerData.id)}
                      />
                      <InfoItem
                        label="Employment Type"
                        value={employmentTypeLabel}
                      />
                      <InfoItem
                        label="Position"
                        value={drawerData.position ?? "Not set"}
                      />
                      <InfoItem label="Join Date" value={joinDateLabel} />
                      <InfoItem
                        label="Status"
                        value={drawerData.status ?? "active"}
                      />
                      <InfoItem label="Role" value={drawerData.role} />
                      <InfoItem
                        label="Department"
                        value={drawerData.department ?? "Not assigned"}
                      />
                      <InfoItem label="Manager" value={managerName} />
                      <InfoItem
                        label="Office / Branch"
                        value={
                          drawerData.office_branch ??
                          drawerData.officeBranch ??
                          "Not set"
                        }
                      />
                    </div>
                  </PanelCard>
                </section>
              ) : null}

              {activeTab === "attendance" ? (
                <section className="space-y-4">
                  {insightsLoading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                      Loading attendance insights...
                    </div>
                  ) : null}

                  <PanelCard
                    title="Attendance Summary"
                    icon={<FiClock className="h-4 w-4" />}
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      <StatCard
                        label="Attendance %"
                        value={`${attendanceSummary.attendancePct}%`}
                        icon={<FiCheckCircle className="h-4 w-4" />}
                      />
                      <StatCard
                        label="Late Arrivals"
                        value={String(attendanceSummary.lateArrivals)}
                        icon={<FiClock className="h-4 w-4" />}
                      />
                      <StatCard
                        label="Leave Days"
                        value={String(attendanceSummary.leaveDays)}
                        icon={<FiCalendar className="h-4 w-4" />}
                      />
                      <StatCard
                        label="Overtime"
                        value={`${attendanceSummary.overtime}h`}
                        icon={<FiActivity className="h-4 w-4" />}
                      />
                    </div>
                  </PanelCard>

                  <PanelCard
                    title="Recent Attendance"
                    icon={<FiCalendar className="h-4 w-4" />}
                  >
                    {attendanceRecords.length === 0 ? (
                      <div className="text-sm text-slate-500">
                        No attendance records found.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead className="text-slate-500">
                            <tr>
                              <th className="px-2 py-2 font-medium">Date</th>
                              <th className="px-2 py-2 font-medium">
                                Check In
                              </th>
                              <th className="px-2 py-2 font-medium">
                                Check Out
                              </th>
                              <th className="px-2 py-2 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendanceRecords.map((record) => (
                              <tr
                                key={record.id}
                                className="border-t border-slate-100"
                              >
                                <td className="px-2 py-2.5 text-slate-700">
                                  {record.date}
                                </td>
                                <td className="px-2 py-2.5 text-slate-700">
                                  {record.checkIn}
                                </td>
                                <td className="px-2 py-2.5 text-slate-700">
                                  {record.checkOut}
                                </td>
                                <td className="px-2 py-2.5">
                                  <span
                                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                                      record.status === "Present"
                                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : record.status === "Late"
                                          ? "border border-amber-200 bg-amber-50 text-amber-700"
                                          : "border border-slate-200 bg-slate-50 text-slate-700"
                                    }`}
                                  >
                                    {record.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </PanelCard>
                </section>
              ) : null}

              {activeTab === "tasks" ? (
                <section className="space-y-4">
                  {insightsLoading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                      Loading task insights...
                    </div>
                  ) : null}

                  <PanelCard
                    title="Task Summary"
                    icon={<FiFileText className="h-4 w-4" />}
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <StatCard
                        label="Pending"
                        value={String(taskSummary.pending)}
                        icon={<FiShield className="h-4 w-4" />}
                      />
                      <StatCard
                        label="In Progress"
                        value={String(taskSummary.in_progress)}
                        icon={<FiBriefcase className="h-4 w-4" />}
                      />
                      <StatCard
                        label="Completed"
                        value={String(taskSummary.completed)}
                        icon={<FiCheckCircle className="h-4 w-4" />}
                      />
                    </div>
                  </PanelCard>

                  <div className="space-y-2">
                    {tasks.length === 0 ? (
                      <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-500">
                        No task records found.
                      </div>
                    ) : (
                      tasks.map((task) => (
                        <article
                          key={task.id}
                          className="rounded-xl border border-slate-200 bg-white px-3.5 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {task.title}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {task.dueLabel}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                                task.status === "completed"
                                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : task.status === "in_progress"
                                    ? "border border-blue-200 bg-blue-50 text-blue-700"
                                    : "border border-amber-200 bg-amber-50 text-amber-700"
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              ) : null}

              {activeTab === "activity" ? (
                <section className="space-y-3">
                  {insightsLoading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                      Loading activity timeline...
                    </div>
                  ) : timeline.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                      No recent activity available.
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      {timeline.map((event, index) => (
                        <TimelineItem
                          key={event.id}
                          event={event}
                          isLast={index === timeline.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </section>
              ) : null}
            </div>

            {!isManager && (
              <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white px-5 py-3 sm:px-6">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!drawerData) return;
                      onEdit(drawerData);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <FiEdit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!drawerData) return;
                      onDeactivate(drawerData);
                    }}
                    className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                  >
                    {isActiveStatus ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const TAB_ITEMS: { key: DrawerTab; label: string; icon: ReactNode }[] = [
  {
    key: "overview",
    label: "Overview",
    icon: <FiBriefcase className="h-3.5 w-3.5" />,
  },
  {
    key: "attendance",
    label: "Attendance",
    icon: <FiClock className="h-3.5 w-3.5" />,
  },
  {
    key: "tasks",
    label: "Tasks",
    icon: <FiFileText className="h-3.5 w-3.5" />,
  },
  {
    key: "activity",
    label: "Activity",
    icon: <FiActivity className="h-3.5 w-3.5" />,
  },
];

function SlidingTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: DrawerTab;
  onTabChange: (tab: DrawerTab) => void;
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

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-slate-500">{icon}</span>
        <span className="text-lg font-bold text-slate-900">{value}</span>
      </div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

function TimelineItem({
  event,
  isLast,
}: {
  event: TimelineEvent;
  isLast: boolean;
}) {
  return (
    <div className="relative pl-8">
      {!isLast ? (
        <span className="absolute left-2.75 top-6 h-[calc(100%-6px)] w-px bg-slate-200" />
      ) : null}
      <span className="absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[#1e3a5f]">
        <FiActivity className="h-3.5 w-3.5" />
      </span>
      <div className="pb-4">
        <p className="text-sm font-semibold text-slate-800">{event.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{event.detail}</p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
          <FiCalendar className="h-3 w-3" />
          {event.timestamp}
        </p>
      </div>
    </div>
  );
}
