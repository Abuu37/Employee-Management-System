import { useTranslation } from "react-i18next";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiPlus,
} from "react-icons/fi";
import Header from "@/layouts/Header";
import Sidebar from "@/layouts/Sidebar";
import StatCard from "@/features/attendance/components/StatCard";
import DocumentTable from "@/features/documents/components/DocumentTable";
import UploadDocumentModal from "@/features/documents/components/UploadDocumentModal";
import DeleteDocumentModal from "@/features/documents/components/DeleteDocumentModal";
import { AnimatedSearchIcon } from "@/components/common/AnimatedSearchIcon";
import { useDocumentPage } from "@/features/documents/hooks/useDocumentPage";

export default function DocumentPage() {
  const { t } = useTranslation();
  const {
    role,
    data,
    total,
    totalPages,
    stats,
    loading,
    saving,
    deleting,
    uploadOpen,
    deleteTarget,
    setUploadOpen,
    setDeleteTarget,
    page,
    search,
    status,
    type,
    sortBy,
    sortOrder,
    setPage,
    setSearch,
    setStatus,
    setType,
    handleSort,
    handleUpload,
    handleDeleteConfirm,
    handleView,
    handleVerify,
  } = useDocumentPage();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-auto">
        <Header searchTerm="" onSearchChange={() => {}} />

        <div className="p-6 space-y-5">
          {/* ── Page header ────────────────────────────────────────────── */}
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
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <FiPlus className="h-4 w-4" />
                {t("documents.uploadDocument")}
              </button>
            )}
          </div>

          {/* ── Stat cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t("documents.totalSubmitted")}
              value={stats.total}
              icon={<FiFileText />}
              color=""
              featured
              subtitle={t("documents.allOnRecord")}
            />
            <StatCard
              label={t("documents.verified")}
              value={stats.verified}
              icon={<FiCheckCircle />}
              color="bg-emerald-100 text-emerald-600"
              subtitle={t("documents.documentsApproved")}
            />
            <StatCard
              label={t("documents.pending")}
              value={stats.pending}
              icon={<FiClock />}
              color="bg-amber-100 text-amber-600"
              subtitle={t("documents.awaitingVerification")}
            />
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

          {/* ── Filters ────────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-sm">
              <AnimatedSearchIcon />
              <input
                type="text"
                placeholder={t("documents.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All Types</option>
              <option value="contract">Contract</option>
              <option value="id">ID Document</option>
              <option value="cv">CV / Resume</option>
              <option value="certificate">Certificate</option>
              <option value="performance_report">Performance Report</option>
              <option value="evaluation">Evaluation</option>
            </select>
          </div>

          {/* ── Table ──────────────────────────────────────────────────── */}
          <DocumentTable
            data={data}
            loading={loading}
            total={total}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            role={role}
            onAdd={() => setUploadOpen(true)}
            onDelete={setDeleteTarget}
            onView={handleView}
            onVerify={
              role === "admin" || role === "manager" ? handleVerify : undefined
            }
          />

          {/* ── Modals ─────────────────────────────────────────────────── */}
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
