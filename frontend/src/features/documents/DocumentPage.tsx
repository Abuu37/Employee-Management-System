import { useState, useEffect } from "react";
import Sidebar from "@/layouts/Sidebar";
import Header from "@/layouts/Header";
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
} from "react-icons/fi";

export default function DocumentPage() {
  const role = localStorage.getItem("user-role") || "employee";

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
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage and track all submitted documents
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Submitted"
              value={data.length}
              icon={<FiFileText />}
              color=""
              featured
              subtitle="All documents on record"
            />
            <StatCard
              label="Verified"
              value={data.filter((d) => d.is_verified).length}
              icon={<FiCheckCircle />}
              color="bg-emerald-100 text-emerald-600"
              subtitle="Documents approved"
            />
            <StatCard
              label="Pending"
              value={data.filter((d) => !d.is_verified).length}
              icon={<FiClock />}
              color="bg-amber-100 text-amber-600"
              subtitle="Awaiting verification"
            />
            {/* Suggestion card */}
            <article className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Suggestion
                </p>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <FiAlertCircle className="h-4 w-4" />
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-700 leading-snug">
                Keep documents up to date
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Upload contracts, IDs &amp; certificates regularly to ensure
                faster verification and HR compliance.
              </p>
            </article>
          </div>

          {/* Search bar */}
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by file name or type..."
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
