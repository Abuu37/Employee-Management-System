import { NavLink, useNavigate } from "react-router-dom";
import { getNavItemsByRole } from "../../data/navItems";
import { useState } from "react";
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
} from "react-icons/fi";
// Map nav item keys to icons
const navIcons = {
  dashboard: <FiHome className="h-5 w-5" />,
  employee: <FiUsers className="h-5 w-5" />,
  employees: <FiUsers className="h-5 w-5" />,
  managers: <FiUserCheck className="h-5 w-5" />,
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
  const role = localStorage.getItem("user-role");
  const navItems = getNavItemsByRole(role);
  const [reportsHovered, setReportsHovered] = useState(false);

  const reportSubItems = [
    {
      name: "Attendance",
      path: "/reports/attendance",
      icon: <FiClock className="h-4 w-4" />,
    },
    {
      name: "Leave",
      path: "/reports/leave",
      icon: <FiUserMinus className="h-4 w-4" />,
    },
    {
      name: "Payroll",
      path: "/reports/payroll",
      icon: <FiCreditCard className="h-4 w-4" />,
    },
    {
      name: "Employee Summary",
      path: "/reports/employee-summary",
      icon: <FiPieChart className="h-4 w-4" />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user-role");
    localStorage.removeItem("user-id");
    localStorage.removeItem("user-name");
    localStorage.removeItem("user-email");
    navigate("/login");
  };

  const panelTitle = role
    ? `${role[0].toUpperCase()}${role.slice(1)} Panel`
    : "Panel";

  return (
    <aside
      className="hidden md:flex md:w-64 md:flex-col px-4 py-7"
      style={{ background: "#1e3a5f" }}
    >
      {/* Logo */}
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/20 text-white font-black text-sm tracking-tight">
          EMS
        </div>
        <div>
          <h1 className="font-bold text-white text-sm">{panelTitle}</h1>
          <p className="text-xs text-blue-300">Business Workspace</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) =>
          item.key === "logout" ? (
            <button
              key={item.key}
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm font-medium text-blue-200 transition-all hover:bg-white/10 hover:text-white"
            >
              {navIcons[item.key] || <span className="h-5 w-5" />}
              {item.name}
            </button>
          ) : item.key === "reports" ? (
            <div
              key={item.key}
              className="relative"
              onMouseEnter={() => setReportsHovered(true)}
              onMouseLeave={() => setReportsHovered(false)}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white text-[#1e3a5f] shadow-lg font-bold"
                      : "text-blue-200 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {navIcons[item.key] || <span className="h-5 w-5" />}
                <span className="flex-1">{item.name}</span>
                <FiChevronRight className="h-4 w-4 opacity-60" />
              </NavLink>

              {reportsHovered && (
                <div className="absolute left-full top-0 z-50 ml-2 w-52 rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                  <p className="px-4 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Report Types
                  </p>
                  {reportSubItems.map((sub) => (
                    <button
                      key={sub.path}
                      type="button"
                      onClick={() => navigate(sub.path)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      {sub.icon}
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-[#1e3a5f] shadow-lg font-bold"
                    : "text-blue-200 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {navIcons[item.key] || <span className="h-5 w-5" />}
              {item.name}
            </NavLink>
          ),
        )}
      </nav>

      <div className="mt-6 rounded-2xl bg-white/10 p-4 text-white border border-white/10">
        <p className="text-sm font-semibold">Workforce Report</p>
        <p className="mt-1 text-xs text-blue-300">
          Export employee and task metrics in one click.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
