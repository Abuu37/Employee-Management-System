import { useState, useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import searchIcon from "@/assets/icons/search.json";
import { useTranslation } from "react-i18next";
import { FiX } from "react-icons/fi";
import { useUser } from "@/context/UserContext";
import NotificationDropdown from "@/components/ui/NotificationDropdown";
import ProfileDropdown from "@/components/ui/ProfileDropdown";

const NAVY = "#1e3a5f";

function Header({
  searchTerm,
  onSearchChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}) {
  const { user: currentUser } = useUser();
  const userName = currentUser?.name ?? "User";
  const { t } = useTranslation();

  const [focused, setFocused] = useState(false);
  const searchLottieRef = useRef<LottieRefCurrentProps>(null);

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
    if (h < 12) return t("header.goodMorning");
    if (h < 17) return t("header.goodAfternoon");
    return t("header.goodEvening");
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
        {/* ====================== Greeting ======================*/}
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

        {/* ===================== Right controls ===================== */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* =========== Animated Search Bar =========== */}
          <div
            className={`flex items-center gap-1 rounded-full border px-3 py-1.5 transition-all duration-200 bg-white ${
              focused
                ? "border-blue-500 shadow-sm shadow-blue-100 w-52"
                : "border-slate-200 w-40"
            }`}
            onMouseEnter={() => {
              searchLottieRef.current?.goToAndPlay(0, true);
            }}
            onMouseLeave={() => {
              if (!focused) searchLottieRef.current?.goToAndStop(0, true);
            }}
          >
            <Lottie
              lottieRef={searchLottieRef}
              animationData={searchIcon}
              loop={false}
              autoplay={false}
              style={{ width: 22, height: 22, flexShrink: 0 }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search..."
              className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none min-w-0"
            />
            {searchTerm && (
              <button onClick={() => onSearchChange("")}>
                <FiX className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>
          {/* Date / time pill */}
          <div className="hidden xl:flex flex-col items-end">
            <span className="text-[11px] font-semibold text-slate-700 leading-none">
              {timeStr}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">{dateStr}</span>
          </div>

          {/* divider */}
          <div className="hidden xl:block h-8 w-px bg-slate-200" />

          {/*============== Notification bell =================== */}
          <NotificationDropdown />

          {/* ========== Profile (trigger + dropdown) ========== */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}

export default Header;
