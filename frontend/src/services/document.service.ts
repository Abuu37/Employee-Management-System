import axios from "axios";

const token = () => localStorage.getItem("token");

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${token()}` },
});

const multipartHeaders = () => ({
  headers: {
    Authorization: `Bearer ${token()}`,
    "Content-Type": "multipart/form-data",
  },
});

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

export interface UploadDocumentPayload {
  file: File;
  user_id: number;
  file_type: string;
  visibility: string;
}

// Upload document
export const uploadDocument = async (data: UploadDocumentPayload) => {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("user_id", String(data.user_id));
  formData.append("file_type", data.file_type);
  formData.append("visibility", data.visibility);

  const res = await axios.post(
    "/api/documents/upload",
    formData,
    multipartHeaders(),
  );
  return res.data;
};

// Admin: get all documents
export const getAllDocuments = async (): Promise<DocumentRecord[]> => {
  const res = await axios.get("/api/documents/all", authHeaders());
  return res.data.documents;
};

// Any user: get own documents
export const getMyDocuments = async (): Promise<DocumentRecord[]> => {
  const res = await axios.get("/api/documents/my", authHeaders());
  return res.data.documents;
};

// Manager: get team documents
export const getTeamDocuments = async (): Promise<DocumentRecord[]> => {
  const res = await axios.get("/api/documents/team", authHeaders());
  return res.data.documents;
};

// Admin: verify document
export const verifyDocumentApi = async (id: number) => {
  const res = await axios.patch(
    `/api/documents/verify/${id}`,
    {},
    authHeaders(),
  );
  return res.data;
};

// Download document
export const downloadDocument = async (id: number, fileName: string) => {
  const res = await axios.get(`/api/documents/download/${id}`, {
    ...authHeaders(),
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Delete document
export const deleteDocumentApi = async (id: number) => {
  const res = await axios.delete(`/api/documents/${id}`, authHeaders());
  return res.data;
};
