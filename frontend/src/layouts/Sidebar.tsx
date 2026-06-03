import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNavItemsByRole } from "@/config/navItems";
import { useEffect, useState } from "react";
import LogoutConfirmModal from "@/components/ui/LogoutConfirmModal";
import { useUser } from "@/context/UserContext";
import toast from "react-hot-toast";
import {
  FiHome,
  FiUsers,
  FiUserCheck,
  FiFolder,
  FiCalendar,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiClipboard,
  FiDollarSign,
  FiFileText,
  FiFile,
  FiChevronRight,
  FiClock,
  FiUserMinus,
  FiCreditCard,
  FiPieChart,
  FiWatch,
  FiGrid,
  FiLock,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
// Map nav item keys to icons
const navIcons = {
  dashboard: <FiHome className="h-5 w-5" />,
  employee: <FiUsers className="h-5 w-5" />,
  employees: <FiUsers className="h-5 w-5" />,
  managers: <FiUserCheck className="h-5 w-5" />,
  departments: <FiGrid className="h-5 w-5" />,
  projects: <FiFolder className="h-5 w-5" />,
  leaves: <FiCalendar className="h-5 w-5" />,
  attendance: <FiWatch className="h-5 w-5" />,
  "my-attendance": <FiWatch className="h-5 w-5" />,
  tasks: <FiClipboard className="h-5 w-5" />,
  documents: <FiFile className="h-5 w-5" />,
  payroll: <FiDollarSign className="h-5 w-5" />,
  salary: <FiFileText className="h-5 w-5" />,
  "pay slips": <FiFileText className="h-5 w-5" />,
  reports: <FiBarChart2 className="h-5 w-5" />,
  settings: <FiSettings className="h-5 w-5" />,
  logout: <FiLogOut className="h-5 w-5" />,
};

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const { t } = useTranslation();
  // Only trust role from authenticated user state
  const role = user?.role ?? null;
  const navItems = getNavItemsByRole(role);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isSettingsRoute = location.pathname === "/settings";
  const isReportsRoute =
    location.pathname === "/reports" ||
    location.pathname.startsWith("/reports/");

  const settingsSubItems = [
    {
      nameKey: "settings.changePassword",
      path: "/settings",
      icon: <FiLock className="h-4 w-4" />,
    },
  ];

  const reportSubItems = [
    {
      nameKey: "nav.reportAttendance",
      path: "/reports/attendance",
      icon: <FiClock className="h-4 w-4" />,
    },
    {
      nameKey: "nav.reportLeave",
      path: "/reports/leave",
      icon: <FiUserMinus className="h-4 w-4" />,
    },
    {
      nameKey: "nav.reportPayroll",
      path: "/reports/payroll",
      icon: <FiCreditCard className="h-4 w-4" />,
    },
    {
      nameKey: "nav.reportEmployeeSummary",
      path: "/reports/employee-summary",
      icon: <FiPieChart className="h-4 w-4" />,
    },
  ].filter((item) => {
    if (item.path === "/reports/payroll" && role !== "admin") {
      return false;
    }
    if (item.path === "/reports/employee-summary" && role === "employee") {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (!collapsed && isReportsRoute) {
      setReportsOpen(true);
    }
  }, [collapsed, isReportsRoute]);

  useEffect(() => {
    if (!collapsed && isSettingsRoute) {
      setSettingsOpen(true);
    }
  }, [collapsed, isSettingsRoute]);

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
      setLogoutModalOpen(false);
    }
  };

  const panelTitle = role
    ? `${role[0].toUpperCase()}${role.slice(1)} Panel`
    : "Panel";

  return (
    <aside
      className={`hidden md:flex md:flex-col px-3 py-7 h-screen sticky top-0 overflow-visible shrink-0 transition-all duration-300 ${
        collapsed ? "md:w-18" : "md:w-64"
      }`}
      style={{ background: "#1e3a5f" }}
    >
      {/* Logo + collapse toggle */}
      <div
        className={`mb-10 flex items-center px-1 ${collapsed ? "justify-center" : "gap-3 px-2"}`}
      >
        <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-white/20 text-white font-black text-sm tracking-tight">
          EMS
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white text-sm">{panelTitle}</h1>
            <p className="text-xs text-blue-300">Business Workspace</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            setCollapsed((c) => !c);
            setReportsOpen(false);
            setSettingsOpen(false);
          }}
          className={`flex items-center justify-center rounded-xl p-1.5 text-blue-300 hover:bg-white/10 hover:text-white transition ${collapsed ? "mt-0" : ""}`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <FiChevronsRight className="h-4 w-4" />
          ) : (
            <FiChevronsLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) =>
          item.key === "logout" ? (
            <button
              key={item.key}
              type="button"
              onClick={handleLogout}
              title={collapsed ? t(item.nameKey) : undefined}
              className={`flex w-full items-center rounded-2xl py-2.5 text-left text-sm font-medium text-blue-200 transition-all hover:bg-white/10 hover:text-white ${
                collapsed ? "justify-center px-0" : "gap-3 px-4"
              }`}
            >
              {navIcons[item.key] || <span className="h-5 w-5" />}
              {!collapsed && t(item.nameKey)}
            </button>
          ) : item.key === "settings" ? (
            <div key={item.key} className="relative">
              <button
                type="button"
                onClick={() => {
                  if (collapsed) {
                    setCollapsed(false);
                    setReportsOpen(false);
                    setSettingsOpen(true);
                    return;
                  }
                  setSettingsOpen((p) => !p);
                }}
                title={collapsed ? t(item.nameKey) : undefined}
                className={`flex w-full items-center rounded-2xl py-2.5 text-left text-sm font-medium transition-all ${
                  collapsed ? "justify-center px-0" : "gap-3 px-4"
                } ${
                  settingsOpen || isSettingsRoute
                    ? "bg-white text-[#1e3a5f] shadow-lg font-bold"
                    : "text-blue-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                {navIcons[item.key] || <span className="h-5 w-5" />}
                {!collapsed && (
                  <>
                    <span className="flex-1">{t(item.nameKey)}</span>
                    <FiChevronRight
                      className={`h-4 w-4 opacity-60 transition-transform ${settingsOpen ? "rotate-90" : ""}`}
                    />
                  </>
                )}
              </button>
              {settingsOpen && !collapsed && (
                <div className="mt-1 ml-8 space-y-1 rounded-xl border border-white/10 bg-white/5 p-2">
                  <p className="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-widest text-blue-200/80">
                    {t("settings.accountSettings")}
                  </p>
                  {settingsSubItems.map((sub) => (
                    <button
                      key={sub.path}
                      type="button"
                      onClick={() => {
                        navigate(sub.path);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition ${
                        location.pathname === sub.path
                          ? "bg-white text-[#1e3a5f]"
                          : "text-blue-100 hover:bg-white/15 hover:text-white"
                      }`}
                    >
                      {sub.icon}
                      {t(sub.nameKey)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : item.key === "reports" ? (
            <div key={item.key} className="relative">
              <button
                type="button"
                onClick={() => {
                  if (collapsed) {
                    setCollapsed(false);
                    setSettingsOpen(false);
                    setReportsOpen(true);
                    return;
                  }
                  setReportsOpen((p) => !p);
                }}
                title={collapsed ? t(item.nameKey) : undefined}
                className={`flex w-full items-center rounded-2xl py-2.5 text-left text-sm font-medium transition-all ${
                  collapsed ? "justify-center px-0" : "gap-3 px-4"
                } ${
                  reportsOpen || isReportsRoute
                    ? "bg-white text-[#1e3a5f] shadow-lg font-bold"
                    : "text-blue-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                {navIcons[item.key] || <span className="h-5 w-5" />}
                {!collapsed && (
                  <>
                    <span className="flex-1">{t(item.nameKey)}</span>
                    <FiChevronRight
                      className={`h-4 w-4 opacity-60 transition-transform ${reportsOpen ? "rotate-90" : ""}`}
                    />
                  </>
                )}
              </button>
              {reportsOpen && !collapsed && (
                <div className="mt-1 ml-8 space-y-1 rounded-xl border border-white/10 bg-white/5 p-2">
                  <p className="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-widest text-blue-200/80">
                    {t("nav.reportTypes")}
                  </p>
                  {reportSubItems.map((sub) => (
                    <button
                      key={sub.path}
                      type="button"
                      onClick={() => {
                        navigate(sub.path);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition ${
                        location.pathname === sub.path
                          ? "bg-white text-[#1e3a5f]"
                          : "text-blue-100 hover:bg-white/15 hover:text-white"
                      }`}
                    >
                      {sub.icon}
                      {t(sub.nameKey)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink
              key={item.key}
              to={item.path}
              title={collapsed ? t(item.nameKey) : undefined}
              className={({ isActive }) =>
                `flex w-full items-center rounded-2xl py-2.5 text-left text-sm font-medium transition-all ${
                  collapsed ? "justify-center px-0" : "gap-3 px-4"
                } ${
                  isActive
                    ? "bg-white text-[#1e3a5f] shadow-lg font-bold"
                    : "text-blue-200 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {navIcons[item.key] || <span className="h-5 w-5" />}
              {!collapsed && t(item.nameKey)}
            </NavLink>
          ),
        )}
      </nav>

      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />

      {!collapsed && (
        <div className="mt-6 rounded-2xl bg-white/10 p-4 text-white border border-white/10">
          <p className="text-sm font-semibold">Workforce Report</p>
          <p className="mt-1 text-xs text-blue-300">
            Export employee and task metrics in one click.
          </p>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
