import { useState, useEffect } from "react";
import Sidebar from "@/layouts/Sidebar";
import Header from "@/layouts/Header";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/UserContext";
import DocumentTable from "@/features/documents/components/DocumentTable";
import UploadDocumentModal from "@/features/documents/components/UploadDocumentModal";
import DeleteDocumentModal from "@/features/documents/components/DeleteDocumentModal";
import StatCard from "@/features/attendance/components/StatCard";
import {
  getAllDocuments,
  getMyDocuments,
  getTeamDocuments,
  uploadDocument,
  deleteDocumentApi,
  downloadDocument,
  verifyDocumentApi,
  type DocumentRecord,
} from "@/services/document.service";
import {
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiSearch,
  FiPlus,
} from "react-icons/fi";

export default function DocumentPage() {
  const { user } = useUser();
  const role = user?.role ?? "employee";
  const { t } = useTranslation();

  const [data, setData] = useState<DocumentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DocumentRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchDocuments = async () => {
    try {
      let docs: DocumentRecord[] = [];
      if (role === "admin") {
        docs = await getAllDocuments();
      } else if (role === "manager") {
        docs = await getTeamDocuments();
      } else {
        docs = await getMyDocuments();
      }
      setData(docs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (payload: {
    file: File;
    user_id: number;
    file_type: string;
    visibility: string;
  }) => {
    setSaving(true);
    try {
      await uploadDocument(payload);
      setUploadOpen(false);
      fetchDocuments();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDocumentApi(deleteTarget.id);
      setDeleteTarget(null);
      fetchDocuments();
      // Tell the notification bell to refresh immediately
      window.dispatchEvent(new CustomEvent("notifications:refresh"));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (doc: DocumentRecord) => {
    try {
      await downloadDocument(doc.id, doc.file_name);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerify = async (doc: DocumentRecord) => {
    try {
      await verifyDocumentApi(doc.id);
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-auto">
        <Header searchTerm="" onSearchChange={() => {}} />

        <div className="p-6 space-y-5">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {t("documents.title")}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {t("documents.subtitle")}
              </p>
            </div>
            {role !== "admin" && (
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                disabled={data.length >= 20}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPlus className="h-4 w-4" />
                {t("documents.uploadDocument")}
              </button>
            )}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t("documents.totalSubmitted")}
              value={data.length}
              icon={<FiFileText />}
              color=""
              featured
              subtitle={t("documents.allOnRecord")}
            />
            <StatCard
              label={t("documents.verified")}
              value={data.filter((d) => d.is_verified).length}
              icon={<FiCheckCircle />}
              color="bg-emerald-100 text-emerald-600"
              subtitle={t("documents.documentsApproved")}
            />
            <StatCard
              label={t("documents.pending")}
              value={data.filter((d) => !d.is_verified).length}
              icon={<FiClock />}
              color="bg-amber-100 text-amber-600"
              subtitle={t("documents.awaitingVerification")}
            />
            {/* Suggestion card */}
            <article className="rounded-2xl border border-violet-100 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-2.5 shrink-0 flex items-center justify-center bg-violet-100 text-violet-600">
                  <FiAlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t("documents.suggestion")}
                  </p>
                  <p className="text-sm font-semibold text-slate-700 leading-snug mt-0.5">
                    {t("documents.keepUpToDate")}
                  </p>
                </div>
              </div>
            </article>
          </div>

          {/* Search bar */}
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t("documents.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Document table */}
          <div className="space-y-6">
            <DocumentTable
              data={
                search
                  ? data.filter(
                      (d) =>
                        d.file_name
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        d.file_type
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                    )
                  : data
              }
              role={role}
              onAdd={() => setUploadOpen(true)}
              onDelete={setDeleteTarget}
              onDownload={handleDownload}
              onVerify={
                role === "admin" || role === "manager"
                  ? handleVerify
                  : undefined
              }
            />
          </div>

          <UploadDocumentModal
            isOpen={uploadOpen}
            onClose={() => setUploadOpen(false)}
            onSave={handleUpload}
            isSaving={saving}
          />

          <DeleteDocumentModal
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDeleteConfirm}
            document={deleteTarget}
            isDeleting={deleting}
          />
        </div>
      </main>
    </div>
  );
}
