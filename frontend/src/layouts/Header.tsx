import { useState } from "react";
import { FiBell, FiSearch, FiX, FiChevronDown } from "react-icons/fi";
import { useUser } from "@/context/UserContext";

const NAVY = "#1e3a5f";
const ROLE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  admin: { bg: "bg-violet-100", text: "text-violet-700", dot: "bg-violet-500" },
  manager: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  employee: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Header({
  searchTerm,
  onSearchChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}) {
  const { user: currentUser } = useUser();
  const userName =
    currentUser?.name ?? localStorage.getItem("user-name") ?? "User";
  const userRole = currentUser?.role ?? localStorage.getItem("user-role") ?? "";

  const [focused, setFocused] = useState(false);

  const roleStyle = ROLE_COLORS[userRole] ?? ROLE_COLORS.employee;

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const greeting = (() => {
    const h = now.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <header
      className="sticky top-0 z-30 w-full"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      {/* thin accent bar */}
      <div
        className="h-0.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${NAVY} 0%, #2563eb 50%, #7c3aed 100%)`,
        }}
      />

      <div className="flex items-center gap-4 px-5 py-3 md:px-7">
        {/* ── Greeting ──────────────────────────────────── */}
        <div className="hidden lg:flex flex-col min-w-max">
          <span className="text-[11px] font-medium text-slate-400 leading-none">
            {greeting},
          </span>
          <span
            className="text-sm font-bold leading-tight"
            style={{ color: NAVY }}
          >
            {userName.split(" ")[0]}
          </span>
        </div>

        {/* divider */}
        <div className="hidden lg:block h-8 w-px bg-slate-200 mx-1" />

        {/* ── Right controls ────────────────────────────── */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Date / time pill */}
          <div className="hidden xl:flex flex-col items-end">
            <span className="text-[11px] font-semibold text-slate-700 leading-none">
              {timeStr}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">{dateStr}</span>
          </div>

          {/* divider */}
          <div className="hidden xl:block h-8 w-px bg-slate-200" />

          {/* Notification bell */}
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-slate-100"
            style={{ border: "1.5px solid #e2e8f0" }}
          >
            <FiBell className="h-4.5 w-4.5 text-slate-500" />
            {/* pulse badge */}
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
            </span>
          </button>

          {/* User card */}
          <div
            className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 cursor-pointer transition-all"
            style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
          >
            {/* Avatar */}
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${NAVY} 0%, #2563eb 100%)`,
              }}
            >
              {getInitials(userName)}
            </div>

            {/* Info */}
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold leading-none text-slate-800 capitalize">
                {userName.split(" ")[0]}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`h-1.5 w-1.5 rounded-full ${roleStyle.dot}`} />
                <span
                  className={`text-[10px] font-semibold capitalize ${roleStyle.text}`}
                >
                  {userRole}
                </span>
              </div>
            </div>

            <FiChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
