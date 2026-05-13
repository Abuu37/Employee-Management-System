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
  FiChevronRight,
  FiClock,
  FiEdit2,
  FiFolder,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import axios from "@/services/axios";
import type { User } from "@/features/users/types/user.types";

interface ManagerViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onEdit: (manager: User) => void;
  onDeactivate: (manager: User) => void;
}

type DrawerTab = "overview" | "team" | "activity";

type TeamMember = {
  id: number;
  name: string;
  email?: string;
  role?: string;
  position?: string;
  status?: string;
};

type TimelineEvent = {
  id: number;
  title: string;
  detail: string;
  timestamp: string;
};

export default function ManagerViewDrawer({
  isOpen,
  onClose,
  user,
  onEdit,
  onDeactivate,
}: ManagerViewDrawerProps) {
  const lastUserRef = useRef<User | null>(null);
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

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
    const loadTeamMembers = async () => {
      try {
        setTeamLoading(true);
        const res = await axios.get<User[]>("/user/view-users");
        if (!alive) return;

        const members = Array.isArray(res.data)
          ? res.data
              .filter(
                (row) =>
                  row.role === "employee" && row.manager_id === drawerData.id,
              )
              .map((row) => ({
                id: row.id,
                name: row.name,
                email: row.email,
                role: row.role,
                position: row.position,
                status: row.status ?? "Active",
              }))
          : [];

        setTeamMembers(members);
      } catch {
        if (!alive) return;
        setTeamMembers([]);
      } finally {
        if (alive) setTeamLoading(false);
      }
    };

    loadTeamMembers();

    return () => {
      alive = false;
    };
  }, [isOpen, drawerData?.id]);

  const initials = useMemo(() => {
    if (!drawerData?.name) return "MG";
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

  const joinDateLabel = drawerData?.join_date
    ? new Date(drawerData.join_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : joinDate;
  const genderLabel = drawerData?.gender
    ? drawerData.gender
        .split("_")
        .map((c: string) => c.charAt(0).toUpperCase() + c.slice(1))
        .join(" ")
    : "Not set";
  const dobLabel = drawerData?.date_of_birth
    ? new Date(drawerData.date_of_birth).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not set";

  const timeline: TimelineEvent[] = [
    {
      id: 1,
      title: "Approved leave request",
      detail: "Approved annual leave for team member.",
      timestamp: "2h ago",
    },
    {
      id: 2,
      title: "Assigned project",
      detail: "Assigned team to Q2 Hiring Ops project.",
      timestamp: "Yesterday",
    },
    {
      id: 3,
      title: "Updated team settings",
      detail: "Adjusted team workflow and shift preferences.",
      timestamp: "2 days ago",
    },
  ];

  const isActiveStatus =
    (drawerData?.status ?? "Active").toLowerCase() === "active";

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
                Manager Details
              </h2>
              <button
                onClick={onClose}
                aria-label="Close manager details"
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
                        {drawerData.position ?? "Manager"}
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
                      <InfoItem label="Email" value={drawerData.email} />
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
                      <InfoItem label="Role" value={drawerData.role} />
                      <InfoItem label="Join Date" value={joinDateLabel} />
                      <InfoItem
                        label="Position"
                        value={drawerData.position ?? "Not set"}
                      />
                      <InfoItem
                        label="Employment Type"
                        value={
                          drawerData.employment_type
                            ? drawerData.employment_type
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase())
                            : "Not set"
                        }
                      />
                      <InfoItem
                        label="Department"
                        value={drawerData.department ?? "Not set"}
                      />
                      <InfoItem
                        label="Reports To"
                        value={drawerData.reportsTo ?? "Not assigned"}
                      />
                      <InfoItem
                        label="Office / Branch"
                        value={drawerData.office_branch ?? "Not set"}
                      />
                    </div>
                  </PanelCard>

                  <PanelCard
                    title="Team Stats"
                    icon={<FiUsers className="h-4 w-4" />}
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <StatCard
                        label="Team Members"
                        value={String(teamMembers.length)}
                        icon={<FiUsers className="h-4 w-4" />}
                      />
                      <StatCard
                        label="Pending Approvals"
                        value={String(
                          Math.max(1, Math.ceil(teamMembers.length / 3)),
                        )}
                        icon={<FiShield className="h-4 w-4" />}
                      />
                      <StatCard
                        label="Active Projects"
                        value={String(
                          Math.max(1, Math.ceil(teamMembers.length / 2)),
                        )}
                        icon={<FiFolder className="h-4 w-4" />}
                      />
                    </div>
                  </PanelCard>
                </section>
              ) : null}

              {activeTab === "team" ? (
                <section className="space-y-3">
                  {teamLoading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                      Loading team members...
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                      No assigned employees found for this manager.
                    </div>
                  ) : (
                    <div className="max-h-105 space-y-2 overflow-auto pr-1">
                      {teamMembers.map((member) => (
                        <TeamMemberCard key={member.id} member={member} />
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                  >
                    View full team
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                </section>
              ) : null}

              {activeTab === "activity" ? (
                <section className="space-y-3">
                  {timeline.length === 0 ? (
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
  { key: "team", label: "Team", icon: <FiUsers className="h-3.5 w-3.5" /> },
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
      {/* sliding background */}
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

function TeamMemberCard({ member }: { member: TeamMember }) {
  const initials = member.name
    .split(" ")
    .map((chunk) => chunk[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const isActive = (member.status ?? "Active").toLowerCase() === "active";

  return (
    <article className="rounded-xl border border-slate-200 bg-white px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/30">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-[#1e3a5f]">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {member.name}
            </p>
            <p className="truncate text-xs text-slate-500">
              {member.position ?? "Employee"}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
            isActive
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
    </article>
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
