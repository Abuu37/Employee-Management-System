import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import DocumentTable from "../../components/documents/DocumentTable";
import UploadDocumentModal from "../../components/documents/UploadDocumentModal";
import DeleteDocumentModal from "../../components/documents/DeleteDocumentModal";
import {
  getAllDocuments,
  getMyDocuments,
  getTeamDocuments,
  uploadDocument,
  deleteDocumentApi,
  downloadDocument,
  verifyDocumentApi,
  type DocumentRecord,
} from "../../services/documentService";

export default function DocumentPage() {
  const role = localStorage.getItem("user-role") || "employee";

  const [data, setData] = useState<DocumentRecord[]>([]);
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

      <main className="flex-1 p-6">
        <Header searchTerm="" onSearchChange={() => {}} />

        <div className="space-y-6">
          <DocumentTable
            data={data}
            role={role}
            onAdd={() => setUploadOpen(true)}
            onDelete={setDeleteTarget}
            onDownload={handleDownload}
            onVerify={role === "admin" ? handleVerify : undefined}
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
      </main>
    </div>
  );
}
