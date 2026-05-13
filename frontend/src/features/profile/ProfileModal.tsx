import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import {
  FiX,
  FiMail,
  FiBriefcase,
  FiLayers,
  FiUsers,
  FiCalendar,
  FiLock,
  FiCamera,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "@/services/axios";
import { useUser } from "@/context/UserContext";

const NAVY = "#1e3a5f";

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin: { bg: "bg-violet-100", text: "text-violet-700" },
  manager: { bg: "bg-blue-100", text: "text-blue-700" },
  employee: { bg: "bg-emerald-100", text: "text-emerald-700" },
};

type ProfileData = {
  id: number;
  name: string;
  email: string;
  role: string;
  department?: string | null;
  position?: string | null;
  managerName?: string | null;
  createdAt?: string | null;
  avatar?: string | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-800 truncate">
          {value || <span className="text-slate-400 font-normal">—</span>}
        </p>
      </div>
    </div>
  );
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user: ctxUser, refetch } = useUser();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animation: mounted controls DOM presence, shown controls CSS classes
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // tiny delay so the browser registers the initial CSS state before transition
      const t = setTimeout(() => setShown(true), 10);
      return () => clearTimeout(t);
    } else {
      setShown(false);
      const t = setTimeout(() => setMounted(false), 250); // match transition duration
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (mounted) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mounted, onClose]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Local preview
    setAvatarPreview(URL.createObjectURL(file));
    // Upload
    setUploading(true);
    const form = new FormData();
    form.append("avatar", file);
    try {
      const res = await api.post("/auth/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((p) => (p ? { ...p, avatar: res.data.avatar } : p));
      toast.success("Profile photo updated");
      await refetch(); // update the header avatar in real-time
    } catch {
      // revert preview on error
      setAvatarPreview(null);
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api
      .get("/auth/me")
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const data = profile ?? ctxUser;
  const role = data?.role ?? "employee";
  const roleStyle = ROLE_COLORS[role] ?? ROLE_COLORS.employee;

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  if (!mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-9999 flex items-center justify-center p-4"
      style={{
        backdropFilter: "blur(4px)",
        backgroundColor: shown ? "rgba(15,23,42,0.45)" : "rgba(15,23,42,0)",
        transition: "background-color 250ms ease, backdrop-filter 250ms ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown
            ? "scale(1) translateY(0)"
            : "scale(0.94) translateY(16px)",
          transition: "opacity 250ms ease, transform 250ms ease",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">My Profile</h2>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Avatar header */}
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="relative group">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-black text-white shadow-lg cursor-pointer overflow-hidden"
                    style={{
                      background:
                        avatarPreview || profile?.avatar
                          ? undefined
                          : `linear-gradient(135deg, ${NAVY} 0%, #2563eb 100%)`,
                    }}
                  >
                    {avatarPreview || profile?.avatar ? (
                      <img
                        src={avatarPreview ?? profile!.avatar!}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(data?.name ?? "U")
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-md ring-2 ring-white transition hover:bg-blue-700"
                    title="Change photo"
                  >
                    {uploading ? (
                      <div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <FiCamera className="h-3 w-3" />
                    )}
                  </button>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-800 capitalize">
                    {data?.name}
                  </h3>
                  <span
                    className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${roleStyle.bg} ${roleStyle.text}`}
                  >
                    {role}
                  </span>
                </div>
              </div>

              {/* Info rows */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4">
                <InfoRow
                  icon={<FiMail className="h-4 w-4" />}
                  label="Email"
                  value={data?.email}
                />
                {role !== "admin" && role !== "employee" && (
                  <InfoRow
                    icon={<FiBriefcase className="h-4 w-4" />}
                    label="Position"
                    value={profile?.position}
                  />
                )}
                {role !== "admin" && (
                  <InfoRow
                    icon={<FiLayers className="h-4 w-4" />}
                    label="Department"
                    value={profile?.department}
                  />
                )}
                {role === "employee" && (
                  <InfoRow
                    icon={<FiUsers className="h-4 w-4" />}
                    label="Manager"
                    value={profile?.managerName}
                  />
                )}
                <InfoRow
                  icon={<FiCalendar className="h-4 w-4" />}
                  label="Member Since"
                  value={joinedDate}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    navigate("/settings");
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <FiLock className="h-4 w-4" />
                  Change Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
