import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiSettings,
  FiMoon,
  FiGlobe,
  FiLogOut,
  FiChevronDown,
  FiChevronRight,
  FiCheck,
  FiLock,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type LangCode } from "@/i18n";
import { useUser } from "@/context/UserContext";
import LogoutConfirmModal from "@/components/ui/LogoutConfirmModal";
import ProfileModal from "@/features/profile/ProfileModal";

const NAVY = "#1e3a5f";

const ROLE_COLORS: Record<string, { dot: string; text: string }> = {
  admin: { dot: "bg-violet-500", text: "text-violet-700" },
  manager: { dot: "bg-blue-500", text: "text-blue-700" },
  employee: { dot: "bg-emerald-500", text: "text-emerald-700" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfileDropdown() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [open, setOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const name = user?.name ?? "User";
  const email = user?.email ?? "";
  const role = user?.role ?? "employee";
  const roleStyle = ROLE_COLORS[role] ?? ROLE_COLORS.employee;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setLangMenuOpen(false);
        setSettingsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div className="relative" ref={ref}>
        {/* Trigger */}
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 transition-all"
          style={{
            border: "1.5px solid #e2e8f0",
            background: open ? "#f1f5f9" : "#f8fafc",
          }}
        >
          {/* Avatar */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white shadow-sm overflow-hidden"
            style={{
              background: user?.avatar
                ? undefined
                : `linear-gradient(135deg, ${NAVY} 0%, #2563eb 100%)`,
            }}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(name)
            )}
          </div>

          {/* Name + role */}
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold leading-none text-slate-800 capitalize">
              {name.split(" ")[0]}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`h-1.5 w-1.5 rounded-full ${roleStyle.dot}`} />
              <span
                className={`text-[10px] font-semibold capitalize ${roleStyle.text}`}
              >
                {role}
              </span>
            </div>
          </div>

          <FiChevronDown
            className={`hidden sm:block h-3.5 w-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown panel */}
        <div
          className={`absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-100 z-50 overflow-hidden
            transition-all duration-200 ease-out origin-top-right
            ${
              open
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
            }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-800">{name}</p>
            <p className="text-xs text-slate-400 truncate">{email}</p>
          </div>

          {/* Navigation */}
          <div className="py-1">
            <Item
              icon={<FiUser />}
              label={t("profile.myProfile")}
              onClick={() => {
                setOpen(false);
                setShowProfile(true);
              }}
            />
            <div>
              <button
                onClick={() => setSettingsMenuOpen((p) => !p)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <span className="text-base">
                  <FiSettings />
                </span>
                <span className="flex-1 text-left">
                  {t("profile.accountSettings")}
                </span>
                <FiChevronRight
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform ${settingsMenuOpen ? "rotate-90" : ""}`}
                />
              </button>

              {settingsMenuOpen && (
                <div
                  className="mx-3 mb-1 rounded-xl overflow-hidden"
                  style={{ background: "#1e3a5f" }}
                >
                  <button
                    onClick={() => go("/settings")}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-200 transition hover:bg-white/10 hover:text-white"
                  >
                    <FiLock className="h-4 w-4" />
                    <span className="flex-1 text-left">
                      {t("profile.changePassword")}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 py-1">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen((p) => !p)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <span className="text-base">
                  <FiGlobe />
                </span>
                <span className="flex-1 text-left">
                  {t("profile.language")}
                </span>
                <span className="text-xs text-slate-400 mr-1">
                  {SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language)
                    ?.flag ?? "🌐"}
                </span>
                <FiChevronRight
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform ${langMenuOpen ? "rotate-90" : ""}`}
                />
              </button>

              {/* Inline language list */}
              {langMenuOpen && (
                <div
                  className="mx-3 mb-1 rounded-xl overflow-hidden"
                  style={{ background: "#1e3a5f" }}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const active =
                      (i18n.language ?? "en").split("-")[0] === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code as LangCode);
                          if (user?.id) {
                            localStorage.setItem(
                              `ems_language_${user.id}`,
                              lang.code,
                            );
                          }
                          setLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition hover:bg-white/10 hover:text-white
                            ${active ? "text-white font-semibold" : "text-blue-200"}`}
                      >
                        <img
                          src={(lang as any).flagImg}
                          alt={lang.label}
                          className="w-6 h-4 rounded-sm object-cover shadow-sm"
                        />
                        <span className="flex-1 text-left">{lang.label}</span>
                        {active && (
                          <FiCheck className="h-3.5 w-3.5 text-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <Item
              icon={<FiMoon />}
              label={t("profile.darkMode")}
              onClick={() => {}}
            />
          </div>

          <div className="border-t border-slate-100 py-1">
            <Item
              icon={<FiLogOut />}
              label={t("profile.logout")}
              onClick={() => {
                setOpen(false);
                setShowLogout(true);
              }}
              danger
            />
          </div>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogoutConfirm}
      />
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
}

function Item({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition hover:bg-slate-50
        ${danger ? "text-red-500" : "text-slate-700"}`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}
