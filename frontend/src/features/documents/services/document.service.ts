import api from "@/services/axios";
import type {
  DocumentListResponse,
  DocumentQueryParams,
  DocumentRecord,
  DocumentStats,
  UploadDocumentPayload,
} from "@/features/documents/types/document.types";

// Re-export types so consumers can import from this module if convenient
export type {
  DocumentRecord,
  DocumentQueryParams,
  DocumentListResponse,
  DocumentStats,
  UploadDocumentPayload,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const multipartHeaders = () => ({
  headers: { "Content-Type": "multipart/form-data" },
});

const buildParams = (params: DocumentQueryParams): Record<string, string> => {
  const p: Record<string, string> = {};
  if (params.search) p.search = params.search;
  if (params.status && params.status !== "all") p.status = params.status;
  if (params.type && params.type !== "all") p.type = params.type;
  if (params.page) p.page = String(params.page);
  if (params.limit) p.limit = String(params.limit);
  if (params.sortBy) p.sortBy = params.sortBy;
  if (params.sortOrder) p.sortOrder = params.sortOrder;
  return p;
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const documentService = {
  /** Admin: list all documents. */
  getAll: async (
    params: DocumentQueryParams = {},
  ): Promise<DocumentListResponse> => {
    const res = await api.get("/documents/all", {
      params: buildParams(params),
    });
    return res.data;
  },

  /** Any user: list own documents. */
  getMy: async (
    params: DocumentQueryParams = {},
  ): Promise<DocumentListResponse> => {
    const res = await api.get("/documents/my", { params: buildParams(params) });
    return res.data;
  },

  /** Manager: list team documents. */
  getTeam: async (
    params: DocumentQueryParams = {},
  ): Promise<DocumentListResponse> => {
    const res = await api.get("/documents/team", {
      params: buildParams(params),
    });
    return res.data;
  },

  /** Upload a new document. */
  upload: async (data: UploadDocumentPayload) => {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("user_id", String(data.user_id));
    formData.append("file_type", data.file_type);
    formData.append("visibility", data.visibility);
    const res = await api.post(
      "/documents/upload",
      formData,
      multipartHeaders(),
    );
    return res.data;
  },

  /** Admin: mark a document as verified. */
  verify: async (id: number) => {
    const res = await api.patch(`/documents/verify/${id}`, {});
    return res.data;
  },

  /** Open document in a new browser tab. */
  view: async (id: number) => {
    const res = await api.get(`/documents/download/${id}`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(
      new Blob([res.data], {
        type: res.headers["content-type"] ?? "application/octet-stream",
      }),
    );
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => window.URL.revokeObjectURL(url), 10_000);
  },

  /** Delete a document by id. */
  delete: async (id: number) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },

  /** Role-aware stats summary. */
  getStats: async (): Promise<DocumentStats> => {
    const res = await api.get("/documents/stats");
    return res.data;
  },
};
