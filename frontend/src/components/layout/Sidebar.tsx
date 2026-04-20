import { NavLink, useNavigate } from "react-router-dom";
import { getNavItemsByRole } from "../../data/navItems";
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
} from "react-icons/fi";
// Map nav item keys to icons
const navIcons = {
  dashboard: <FiHome className="h-5 w-5" />,
  employee: <FiUsers className="h-5 w-5" />,
  employees: <FiUsers className="h-5 w-5" />,
  managers: <FiUserCheck className="h-5 w-5" />,
  projects: <FiFolder className="h-5 w-5" />,
  leaves: <FiCalendar className="h-5 w-5" />,
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
    <aside className="hidden md:flex md:w-72 md:flex-col border-r border-slate-200 bg-white px-6 py-7">
      <div className="mb-10 flex items-center gap-3">
        <div className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-xl font-bold">
          EMS
        </div>
        <div>
          <h1 className="font-semibold text-slate-900">{panelTitle}</h1>
          <p className="text-xs text-slate-500">Business Workspace</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) =>
          item.key === "logout" ? (
            <button
              key={item.key}
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition-all hover:bg-slate-100"
            >
              {navIcons[item.key] || <span className="h-5 w-5" />}
              {item.name}
            </button>
          ) : (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {navIcons[item.key] || <span className="h-5 w-5" />}
              {item.name}
            </NavLink>
          ),
        )}
      </nav>

      <div className="mt-auto rounded-2xl bg-slate-900 p-4 text-white">
        <p className="text-sm font-semibold">Monthly workforce report</p>
        <p className="mt-1 text-xs text-slate-300">
          Export employee and task metrics in one click.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
