import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/context/UserContext";
import { useTableQueryParams } from "@/Hook/useTableQueryParams";
import { documentService } from "@/features/documents/services/document.service";
import type {
  DocumentRecord,
  DocumentStats,
} from "@/features/documents/types/document.types";

const PAGE_SIZE = 10;

/**
 * Orchestrates all data-fetching, loading states, and CRUD handlers for the
 * Documents page. The page component calls this hook and renders only JSX.
 */
export const useDocumentPage = () => {
  const { user } = useUser();
  const role = user?.role ?? "employee";

  const {
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
  } = useTableQueryParams({
    defaultSortBy: "created_at",
    defaultSortOrder: "DESC",
  });

  const [data, setData] = useState<DocumentRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    verified: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DocumentRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ─── Fetch ─────────────────────────────────────────────────────────────────

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search,
        status,
        type,
        page,
        limit: PAGE_SIZE,
        sortBy,
        sortOrder,
      };

      let result;
      if (role === "admin") result = await documentService.getAll(params);
      else if (role === "manager")
        result = await documentService.getTeam(params);
      else result = await documentService.getMy(params);

      setData(result.documents);
      setTotal(result.total);
      setTotalPages(result.totalPages);

      const st = await documentService.getStats();
      setStats(st);
    } catch {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [role, search, status, type, page, sortBy, sortOrder]);

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleUpload = async (payload: {
    file: File;
    user_id: number;
    file_type: string;
    visibility: string;
  }) => {
    setSaving(true);
    try {
      await documentService.upload(payload);
      toast.success("Document uploaded successfully");
      setUploadOpen(false);
      void fetchDocuments();
    } catch {
      toast.error("Failed to upload document");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await documentService.delete(deleteTarget.id);
      toast.success("Document deleted");
      setDeleteTarget(null);
      void fetchDocuments();
      window.dispatchEvent(new CustomEvent("notifications:refresh"));
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setDeleting(false);
    }
  };

  const handleView = async (doc: DocumentRecord) => {
    try {
      await documentService.view(doc.id);
    } catch {
      toast.error("Failed to open document");
    }
  };

  const handleVerify = async (doc: DocumentRecord) => {
    try {
      await documentService.verify(doc.id);
      toast.success("Document verified");
      void fetchDocuments();
    } catch {
      toast.error("Failed to verify document");
    }
  };

  return {
    // ── Data ───────────────────────────────────────────────────────────────
    role,
    data,
    total,
    totalPages,
    stats,
    loading,
    saving,
    deleting,

    // ── Modal state ────────────────────────────────────────────────────────
    uploadOpen,
    deleteTarget,
    setUploadOpen,
    setDeleteTarget,

    // ── Query params ───────────────────────────────────────────────────────
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

    // ── Handlers ──────────────────────────────────────────────────────────
    handleUpload,
    handleDeleteConfirm,
    handleView,
    handleVerify,
  };
};
