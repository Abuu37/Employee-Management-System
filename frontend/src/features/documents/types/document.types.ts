// ─── Entity ───────────────────────────────────────────────────────────────────

export interface DocumentRecord {
  id: number;
  user_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_by: number;
  visibility: "private" | "team" | "admin";
  is_verified: boolean;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  owner?: { id: number; name: string; email: string; role: string };
  uploader?: { id: number; name: string; email: string; role: string };
}

// ─── Query / response shapes ──────────────────────────────────────────────────

export interface DocumentQueryParams {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface DocumentListResponse {
  documents: DocumentRecord[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DocumentStats {
  total: number;
  verified: number;
  pending: number;
}

// ─── Mutation payloads ────────────────────────────────────────────────────────

export interface UploadDocumentPayload {
  file: File;
  user_id: number;
  file_type: string;
  visibility: string;
}
