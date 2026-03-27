import { FiBell, FiSearch } from "react-icons/fi";

function Header({
  searchTerm,
  onSearchChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}) {
  const userName = localStorage.getItem("user-name") ?? "User";
  const userRole = localStorage.getItem("user-role") ?? "";
  const userEmail = localStorage.getItem("user-email") ?? "";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="mb-6 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees, tasks, reports..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none ring-blue-500 transition focus:ring-2"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between gap-3 md:justify-end">
          <button
            type="button"
            className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-100"
          >
            <FiBell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
          </button>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <div className="h-9 w-9 rounded-full bg-linear-to-tr from-slate-800 to-blue-600" />
            <div>
              <p className="text-sm font-semibold leading-none capitalize">
                {userRole}
              </p>
              <p className="text-xs text-slate-500">{userEmail}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-400 hidden lg:block">{today}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
