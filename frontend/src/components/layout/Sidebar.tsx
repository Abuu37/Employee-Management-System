import { NavLink } from "react-router-dom";
import navItems from "../../data/navItems";

function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-72 md:flex-col border-r border-slate-200 bg-white px-6 py-7">
      <div className="mb-10 flex items-center gap-3">
        <div className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-xl font-bold">
          EMS
        </div>
        <div>
          <h1 className="font-semibold text-slate-900">Admin Panel</h1>
          <p className="text-xs text-slate-500">Business Workspace</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
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
            <span className="h-2 w-2 rounded-full bg-current" />
            {item.name}
          </NavLink>
        ))}
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
