import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  uploadDocument,
  getAllDocuments,
  getMyDocuments,
  getTeamDocuments,
  verifyDocument,
  deleteDocument,
  downloadDocument,
} from "../controller/documentController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import { checkRole } from "../Middlewares/roleMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads", "documents");
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF, JPEG, PNG, DOC, and Excel files are allowed"),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = express.Router();

// Upload document (all authenticated roles — controller enforces type restrictions)
router.post("/upload", verifyToken, upload.single("file"), uploadDocument);

// Admin: get all documents
router.get("/all", verifyToken, checkRole("admin"), getAllDocuments);

// Logged-in user: get own documents
router.get("/my", verifyToken, getMyDocuments);

// Manager: get team documents
router.get("/team", verifyToken, checkRole("manager"), getTeamDocuments);

// Admin: verify document
router.patch("/verify/:id", verifyToken, checkRole("admin"), verifyDocument);

// Download document (access-controlled in controller)
router.get("/download/:id", verifyToken, downloadDocument);

// Delete document (access-controlled in controller)
router.delete("/:id", verifyToken, deleteDocument);

export default router;
