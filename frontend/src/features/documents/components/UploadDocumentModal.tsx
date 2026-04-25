import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ModalShell from "@/features/employees/components/ModalShell";
import { FiUploadCloud } from "react-icons/fi";

interface UserOption {
  id: number;
  name: string;
}

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    file: File;
    user_id: number;
    file_type: string;
    visibility: string;
  }) => Promise<void>;
  isSaving: boolean;
}

const FILE_TYPES_BY_ROLE: Record<string, { value: string; label: string }[]> = {
  admin: [
    { value: "contract", label: "Contract" },
    { value: "id", label: "ID Document" },
    { value: "cv", label: "CV / Resume" },
    { value: "certificate", label: "Certificate" },
    { value: "performance_report", label: "Performance Report" },
    { value: "evaluation", label: "Evaluation" },
  ],
  manager: [
    { value: "performance_report", label: "Performance Report" },
    { value: "evaluation", label: "Evaluation" },
  ],
  employee: [
    { value: "cv", label: "CV / Resume" },
    { value: "certificate", label: "Certificate" },
  ],
};

export default function UploadDocumentModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: UploadDocumentModalProps) {
  const role = localStorage.getItem("user-role") || "employee";
  const currentUserId = Number(localStorage.getItem("user-id"));

  const [file, setFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<number>(0);
  const [fileType, setFileType] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [managerScope, setManagerScope] = useState<"" | "private" | "team">("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = FILE_TYPES_BY_ROLE[role] || FILE_TYPES_BY_ROLE.employee;

  useEffect(() => {
    if (!isOpen) return;

    // Reset form
    setFile(null);
    setFileType("");
    setUserId(0);
    setManagerScope("");

    if (role === "employee") {
      setUserId(currentUserId);
      setVisibility("private");
      return;
    }

    if (role === "manager") {
      setVisibility("private");
      // Pre-fetch team members for the private-scope employee dropdown
      const token = localStorage.getItem("token");
      axios
        .get("http://localhost:5000/api/user/view-users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data
            : (res.data.users ?? []);
          const teamList = list.filter(
            (u: any) => u.manager_id === currentUserId,
          );
          setUsers(teamList.map((u: any) => ({ id: u.id, name: u.name })));
        })
        .catch(console.error);
      return;
    }

    // Admin: fetch all users for dropdown
    setVisibility("private");
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/user/view-users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data.users ?? []);
        setUsers(list.map((u: any) => ({ id: u.id, name: u.name })));
      })
      .catch(console.error);
  }, [isOpen]);

  // Keep visibility in sync with manager scope
  useEffect(() => {
    if (role !== "manager") return;
    if (managerScope === "team") {
      setVisibility("team");
      setUserId(currentUserId);
    } else if (managerScope === "private") {
      setVisibility("private");
      setUserId(0);
    }
  }, [managerScope]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const effectiveUserId =
      role === "manager" && managerScope === "team" ? currentUserId : userId;
    if (!file || !effectiveUserId || !fileType) return;
    await onSave({
      file,
      user_id: effectiveUserId,
      file_type: fileType,
      visibility,
    });
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Document"
      maxWidth="max-w-2xl"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* ── MANAGER: Scope picker (Step 1) ── */}
        {role === "manager" && (
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Who is this document for?
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setManagerScope("private")}
                className={`rounded-2xl border-2 px-4 py-3 text-left transition ${
                  managerScope === "private"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-slate-50 hover:border-blue-300"
                }`}
              >
                <p className="text-sm font-semibold text-slate-800">
                  🔒 Private
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Single employee</p>
              </button>
              <button
                type="button"
                onClick={() => setManagerScope("team")}
                className={`rounded-2xl border-2 px-4 py-3 text-left transition ${
                  managerScope === "team"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-slate-50 hover:border-blue-300"
                }`}
              >
                <p className="text-sm font-semibold text-slate-800">👥 Team</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  All my employees
                </p>
              </button>
            </div>
          </div>
        )}

        {/* ── Employee select (admin always / manager private only) ── */}
        {(role === "admin" ||
          (role === "manager" && managerScope === "private")) && (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Select Employee
            </span>
            <select
              value={userId || ""}
              onChange={(e) => setUserId(Number(e.target.value))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              required
            >
              <option value="" disabled>
                Select Employee
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} (ID: {u.id})
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {/* File type */}
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Document Type
            </span>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              required
            >
              <option value="" disabled>
                Select Type
              </option>
              {allowedTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          {/*=========================== Visibility ============================== */}
          <div className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Visibility
            </span>
            {role === "manager" ? (
              <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                {managerScope === "team"
                  ? "Team — all employees under you"
                  : managerScope === "private"
                    ? "Private — selected employee only"
                    : "—"}
              </div>
            ) : (
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              >
                <option value="private">Private</option>
                <option value="team">Team</option>
                <option value="company">Company</option>
              </select>
            )}
          </div>
        </div>

        {/*========================== File drop zone ============================== */}
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 transition hover:border-blue-400 hover:bg-blue-50/30"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
        >
          <FiUploadCloud className="mb-3 h-10 w-10 text-slate-400" />
          {file ? (
            <p className="text-sm font-medium text-slate-700">{file.name}</p>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-700">
                Click or drag file to upload
              </p>
              <p className="mt-1 text-xs text-slate-400">
                PDF, JPEG, PNG, DOC, Excel — max 10MB
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) setFile(e.target.files[0]);
            }}
          />
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              isSaving || !file || (role === "manager" && !managerScope)
            }
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSaving ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
