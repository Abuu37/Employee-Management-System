import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Department } from "../types";
import {
  FiHash,
  FiUser,
  FiUsers,
  FiCheckCircle,
  FiBriefcase,
  FiX,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import axios from "@/services/axios";

interface ViewDepartmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
}

type DrawerTab = "overview" | "team";

type TeamMember = {
  id: number;
  name: string;
  email?: string;
  role?: string;
  position?: string;
  status?: string;
};

export default function ViewDepartmentModal({
  isOpen,
  onClose,
  department,
}: ViewDepartmentDrawerProps) {
  const { t } = useTranslation();
  const lastDepartmentRef = useRef<Department | null>(null);
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  if (department) lastDepartmentRef.current = department;
  const drawerData = department ?? lastDepartmentRef.current;

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
        const res = await axios.get<any[]>("/user/view-users");
        if (!alive) return;

        const members = Array.isArray(res.data)
          ? res.data
              .filter((row) => row.department_id === drawerData.id)
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
    if (!drawerData?.name) return "DP";
    return drawerData.name
      .split(" ")
      .map((chunk) => chunk[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [drawerData?.name]);

  const isActiveStatus =
    (drawerData?.status ?? "active").toLowerCase() === "active";

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
      {/* Drawer panel */}
      <div
        className={`absolute inset-y-0 right-0 w-full max-w-full sm:max-w-2xl lg:max-w-2xl bg-white shadow-2xl flex flex-col overflow-y-auto overflow-x-hidden transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {drawerData && (
          <>
            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-slate-800">
                {t("departments.viewTitle")}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close department details"
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
                      <p className="text-xs text-slate-500 mt-1">
                        Code:{" "}
                        <span className="font-mono">{drawerData.code}</span>
                      </p>
                      <div className="mt-2 space-y-1">
                        {drawerData.manager && (
                          <p className="flex items-center gap-1.5 text-xs text-slate-500">
                            <FiUser className="h-3.5 w-3.5" />
                            <span className="truncate">
                              Managed by {drawerData.manager.name}
                            </span>
                          </p>
                        )}
                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                          <FiUsers className="h-3.5 w-3.5" />
                          <span>{teamMembers.length} employee(s)</span>
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
                <section className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <StatCard
                      label="Department Code"
                      value={drawerData.code}
                      icon={<FiHash className="h-4 w-4" />}
                    />
                    <StatCard
                      label="Status"
                      value={
                        isActiveStatus
                          ? t("departments.active")
                          : t("departments.inactive")
                      }
                      icon={<FiCheckCircle className="h-4 w-4" />}
                    />
                    <StatCard
                      label="Department Manager"
                      value={
                        drawerData.manager?.name ?? t("departments.unassigned")
                      }
                      icon={<FiUser className="h-4 w-4" />}
                    />
                    <StatCard
                      label="Total Employees"
                      value={String(teamMembers.length)}
                      icon={<FiUsers className="h-4 w-4" />}
                    />
                  </div>
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
                      No employees found in this department.
                    </div>
                  ) : (
                    <div className="max-h-105 space-y-2 overflow-auto pr-1">
                      {teamMembers.map((member) => (
                        <TeamMemberCard key={member.id} member={member} />
                      ))}
                    </div>
                  )}
                </section>
              ) : null}
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-white p-2 text-slate-500 shadow-sm">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  const isActiveStatus = (member.status ?? "Active").toLowerCase() === "active";
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {member.name}
          </p>
          <p className="text-xs text-slate-500 truncate">{member.email}</p>
          {member.position && (
            <p className="mt-1 text-xs text-slate-600">{member.position}</p>
          )}
        </div>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-semibold whitespace-nowrap shrink-0 ${
            isActiveStatus
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {isActiveStatus ? "Active" : "Inactive"}
        </span>
      </div>
    </div>
  );
}
