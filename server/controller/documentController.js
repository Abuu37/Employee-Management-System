import Document from "../models/document.js";
import User from "../models/user.js";
import { Op } from "sequelize";
import path from "path";
import fs from "fs";

// Allowed file types per role
const ALLOWED_TYPES = {
  admin: [
    "contract",
    "id",
    "cv",
    "certificate",
    "performance_report",
    "evaluation",
  ],
  manager: ["performance_report", "evaluation"],
  employee: ["cv", "certificate"],
};

// ================= UPLOAD DOCUMENT =================
export const uploadDocument = async (req, res) => {
  try {
    const { user_id, file_type, visibility } = req.body;
    const uploaderRole = req.user.role;
    const uploaderId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!user_id || !file_type) {
      return res
        .status(400)
        .json({ message: "user_id and file_type are required" });
    }

    // Role-based file type restriction
    const allowed = ALLOWED_TYPES[uploaderRole];
    if (!allowed || !allowed.includes(file_type)) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        message: `Your role (${uploaderRole}) cannot upload '${file_type}' documents`,
      });
    }

    // Employee can only upload for themselves
    if (uploaderRole === "employee" && Number(user_id) !== uploaderId) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        message: "Employees can only upload documents for themselves",
      });
    }

    // Manager can only upload for their team members
    if (uploaderRole === "manager") {
      const targetUser = await User.findByPk(user_id);
      if (!targetUser || targetUser.manager_id !== uploaderId) {
        // Allow managers to upload for themselves too
        if (Number(user_id) !== uploaderId) {
          fs.unlinkSync(req.file.path);
          return res.status(403).json({
            message:
              "Managers can only upload documents for their team members",
          });
        }
      }
    }

    const doc = await Document.create({
      user_id: Number(user_id),
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_type,
      uploaded_by: uploaderId,
      visibility: visibility || "private",
      is_verified: uploaderRole === "admin",
    });

    res
      .status(201)
      .json({ message: "Document uploaded successfully", document: doc });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET ALL DOCUMENTS (ADMIN) =================
export const getAllDocuments = async (req, res) => {
  try {
    const docs = await Document.findAll({
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: User,
          as: "uploader",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    res.status(200).json({ documents: docs });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET MY DOCUMENTS (EMPLOYEE / ANY) =================
export const getMyDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const docs = await Document.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: "uploader",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    res.status(200).json({ documents: docs });
  } catch (error) {
    console.error("Error fetching my documents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET TEAM DOCUMENTS (MANAGER) =================
export const getTeamDocuments = async (req, res) => {
  try {
    const managerId = req.user.id;

    // Get team member IDs
    const teamMembers = await User.findAll({
      where: { manager_id: managerId },
      attributes: ["id"],
    });

    const teamIds = teamMembers.map((u) => u.id);
    // Include manager's own documents too
    teamIds.push(managerId);

    const docs = await Document.findAll({
      where: {
        [Op.or]: [
          { user_id: { [Op.in]: teamIds } },
          { visibility: "team", uploaded_by: managerId },
        ],
      },
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: User,
          as: "uploader",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({ documents: docs });
  } catch (error) {
    console.error("Error fetching team documents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= VERIFY DOCUMENT (ADMIN) =================
export const verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findByPk(id);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    doc.is_verified = true;
    await doc.save();

    res
      .status(200)
      .json({ message: "Document verified successfully", document: doc });
  } catch (error) {
    console.error("Error verifying document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= DELETE DOCUMENT =================
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    const doc = await Document.findByPk(id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Admin can delete anything
    // Others can only delete their own uploads
    if (userRole !== "admin" && doc.uploaded_by !== userId) {
      return res.status(403).json({
        message: "You can only delete documents you uploaded",
      });
    }

    // Delete file from disk
    if (fs.existsSync(doc.file_path)) {
      fs.unlinkSync(doc.file_path);
    }

    await doc.destroy();
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= DOWNLOAD DOCUMENT =================
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    const doc = await Document.findByPk(id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Access control
    if (userRole === "employee" && doc.user_id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (userRole === "manager") {
      const teamMembers = await User.findAll({
        where: { manager_id: userId },
        attributes: ["id"],
      });
      const teamIds = teamMembers.map((u) => u.id);
      teamIds.push(userId);

      if (!teamIds.includes(doc.user_id)) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    if (!fs.existsSync(doc.file_path)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.download(doc.file_path, doc.file_name);
  } catch (error) {
    console.error("Error downloading document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
