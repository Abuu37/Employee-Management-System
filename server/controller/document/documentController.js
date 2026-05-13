import Document from "../../models/document.js";
import User from "../../models/user.js";
import Notification from "../../models/Notification.js";
import { Op } from "sequelize";
import path from "path";
import fs from "fs";
import { createNotification } from "../notificationController.js";

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

    // Notify the document owner if someone else uploaded for them
    if (Number(user_id) !== uploaderId) {
      try {
        await createNotification({
          userId: Number(user_id),
          title: "New Document Uploaded",
          message: `A new ${file_type} document has been uploaded to your profile.`,
          type: "document",
          refId: doc.id,
        });
      } catch (err) {
        console.error("Notification error (owner):", err.message);
      }
    }

    // Notify admins, manager, and teammates when an employee uploads their own document
    if (uploaderRole === "employee") {
      try {
        const uploader = await User.findByPk(uploaderId, {
          attributes: ["id", "name", "manager_id"],
        });
        const uploaderName = uploader?.name ?? "An employee";
        const notifiedIds = new Set([uploaderId]); // never notify the uploader themselves

        // Notify all admins
        const admins = await User.findAll({
          where: { role: "admin" },
          attributes: ["id"],
        });
        for (const admin of admins) {
          if (notifiedIds.has(admin.id)) continue;
          notifiedIds.add(admin.id);
          await createNotification({
            userId: admin.id,
            title: "New Document Uploaded",
            message: `${uploaderName} uploaded a new ${file_type} document.`,
            type: "document",
            refId: doc.id,
          });
        }

        // Notify the employee's manager
        if (uploader?.manager_id && !notifiedIds.has(uploader.manager_id)) {
          notifiedIds.add(uploader.manager_id);
          await createNotification({
            userId: uploader.manager_id,
            title: "New Document Uploaded",
            message: `${uploaderName} uploaded a new ${file_type} document.`,
            type: "document",
            refId: doc.id,
          });
        }

        // Notify teammates (employees sharing the same manager)
        if (uploader?.manager_id) {
          const teammates = await User.findAll({
            where: { manager_id: uploader.manager_id, role: "employee" },
            attributes: ["id"],
          });
          for (const teammate of teammates) {
            if (notifiedIds.has(teammate.id)) continue;
            notifiedIds.add(teammate.id);
            await createNotification({
              userId: teammate.id,
              title: "New Team Document",
              message: `${uploaderName} uploaded a new ${file_type} document.`,
              type: "document",
              refId: doc.id,
            });
          }
        }
      } catch (err) {
        console.error("Notification error (employee upload):", err.message);
      }
    }

    // Notify team when a manager uploads a document for an employee
    if (uploaderRole === "manager" && Number(user_id) !== uploaderId) {
      try {
        const manager = await User.findByPk(uploaderId, {
          attributes: ["id", "name"],
        });
        const managerName = manager?.name ?? "Your manager";
        const notifiedIds = new Set([uploaderId, Number(user_id)]); // owner already notified above

        // Notify teammates of the document owner
        const teammates = await User.findAll({
          where: { manager_id: uploaderId, role: "employee" },
          attributes: ["id"],
        });
        for (const teammate of teammates) {
          if (notifiedIds.has(teammate.id)) continue;
          notifiedIds.add(teammate.id);
          await createNotification({
            userId: teammate.id,
            title: "New Team Document",
            message: `${managerName} uploaded a new ${file_type} document for your team.`,
            type: "document",
            refId: doc.id,
          });
        }

        // Notify admins
        const admins = await User.findAll({
          where: { role: "admin" },
          attributes: ["id"],
        });
        for (const admin of admins) {
          if (notifiedIds.has(admin.id)) continue;
          notifiedIds.add(admin.id);
          await createNotification({
            userId: admin.id,
            title: "New Document Uploaded",
            message: `${managerName} uploaded a new ${file_type} document for an employee.`,
            type: "document",
            refId: doc.id,
          });
        }
      } catch (err) {
        console.error("Notification error (manager upload):", err.message);
      }
    }

    // Notify admins (and team members if team-visibility) when a manager uploads for themselves
    if (uploaderRole === "manager" && Number(user_id) === uploaderId) {
      try {
        const manager = await User.findByPk(uploaderId, {
          attributes: ["id", "name"],
        });
        const managerName = manager?.name ?? "A manager";
        const notifiedIds = new Set([uploaderId]);

        // If it's a team document, notify every team member
        if (visibility === "team") {
          const teamMembers = await User.findAll({
            where: { manager_id: uploaderId, role: "employee" },
            attributes: ["id"],
          });
          for (const member of teamMembers) {
            if (notifiedIds.has(member.id)) continue;
            notifiedIds.add(member.id);
            await createNotification({
              userId: member.id,
              title: "New Team Document",
              message: `${managerName} uploaded a new ${file_type} document for the team.`,
              type: "document",
              refId: doc.id,
            });
          }
        }

        // Always notify admins
        const admins = await User.findAll({
          where: { role: "admin" },
          attributes: ["id"],
        });
        for (const admin of admins) {
          if (notifiedIds.has(admin.id)) continue;
          notifiedIds.add(admin.id);
          await createNotification({
            userId: admin.id,
            title: "New Document Uploaded",
            message: `${managerName} uploaded a new ${file_type} document.`,
            type: "document",
            refId: doc.id,
          });
        }
      } catch (err) {
        console.error("Notification error (manager self-upload):", err.message);
      }
    }

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
    const {
      search = "",
      status = "all",
      type = "all",
      page = "1",
      limit = "10",
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { file_name: { [Op.iLike]: `%${search}%` } },
        { file_type: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (status === "verified") where.is_verified = true;
    if (status === "pending") where.is_verified = false;
    if (type !== "all") where.file_type = type;

    const allowedSort = ["created_at", "file_name", "file_type", "visibility"];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : "created_at";
    const safeOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { count, rows } = await Document.findAndCountAll({
      where,
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
      order: [[safeSort, safeOrder]],
      limit: parsedLimit,
      offset,
    });

    res.status(200).json({
      documents: rows,
      total: count,
      page: parsedPage,
      totalPages: Math.max(1, Math.ceil(count / parsedLimit)),
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET MY DOCUMENTS (EMPLOYEE / ANY) =================
export const getMyDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      search = "",
      status = "all",
      type = "all",
      page = "1",
      limit = "10",
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const user = await User.findByPk(userId);
    let teamMemberIds = [userId];
    if (user && user.manager_id) {
      const teamMembers = await User.findAll({
        where: { manager_id: user.manager_id },
        attributes: ["id"],
      });
      teamMemberIds = teamMembers.map((u) => u.id);
      teamMemberIds.push(user.manager_id);
    } else {
      const teamMembers = await User.findAll({
        where: { manager_id: userId },
        attributes: ["id"],
      });
      teamMemberIds = teamMembers.map((u) => u.id);
      teamMemberIds.push(userId);
    }

    const baseWhere = {
      [Op.or]: [
        { user_id: userId },
        { visibility: "team", uploaded_by: { [Op.in]: teamMemberIds } },
      ],
    };

    if (search) {
      baseWhere[Op.and] = [
        {
          [Op.or]: [
            { file_name: { [Op.iLike]: `%${search}%` } },
            { file_type: { [Op.iLike]: `%${search}%` } },
          ],
        },
      ];
    }
    if (status === "verified") baseWhere.is_verified = true;
    if (status === "pending") baseWhere.is_verified = false;
    if (type !== "all") baseWhere.file_type = type;

    const allowedSort = ["created_at", "file_name", "file_type", "visibility"];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : "created_at";
    const safeOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { count, rows } = await Document.findAndCountAll({
      where: baseWhere,
      include: [
        {
          model: User,
          as: "uploader",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [[safeSort, safeOrder]],
      limit: parsedLimit,
      offset,
    });

    res.status(200).json({
      documents: rows,
      total: count,
      page: parsedPage,
      totalPages: Math.max(1, Math.ceil(count / parsedLimit)),
    });
  } catch (error) {
    console.error("Error fetching my documents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET TEAM DOCUMENTS (MANAGER) =================
export const getTeamDocuments = async (req, res) => {
  try {
    const managerId = req.user.id;
    const {
      search = "",
      status = "all",
      type = "all",
      page = "1",
      limit = "10",
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const teamMembers = await User.findAll({
      where: { manager_id: managerId },
      attributes: ["id"],
    });
    const teamIds = teamMembers.map((u) => u.id);
    teamIds.push(managerId);

    const baseWhere = {
      [Op.or]: [
        { user_id: { [Op.in]: teamIds } },
        { visibility: "team", uploaded_by: managerId },
      ],
    };

    if (search) {
      baseWhere[Op.and] = [
        {
          [Op.or]: [
            { file_name: { [Op.iLike]: `%${search}%` } },
            { file_type: { [Op.iLike]: `%${search}%` } },
          ],
        },
      ];
    }
    if (status === "verified") baseWhere.is_verified = true;
    if (status === "pending") baseWhere.is_verified = false;
    if (type !== "all") baseWhere.file_type = type;

    const allowedSort = ["created_at", "file_name", "file_type", "visibility"];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : "created_at";
    const safeOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { count, rows } = await Document.findAndCountAll({
      where: baseWhere,
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
      order: [[safeSort, safeOrder]],
      limit: parsedLimit,
      offset,
    });

    res.status(200).json({
      documents: rows,
      total: count,
      page: parsedPage,
      totalPages: Math.max(1, Math.ceil(count / parsedLimit)),
    });
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

    // Others can only delete their own uploads / Admin can delete anything
    if (userRole !== "admin" && doc.uploaded_by !== userId) {
      return res.status(403).json({
        message: "You can only delete documents you uploaded",
      });
    }

    // Delete file from disk
    if (fs.existsSync(doc.file_path)) {
      fs.unlinkSync(doc.file_path);
    }

    // Delete all notifications tied to this document
    await Notification.destroy({ where: { type: "document", refId: doc.id } });

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
    if (
      userRole === "employee" &&
      doc.user_id !== userId &&
      doc.uploaded_by !== userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (userRole === "manager") {
      const teamMembers = await User.findAll({
        where: { manager_id: userId },
        attributes: ["id"],
      });
      const teamIds = teamMembers.map((u) => u.id);
      teamIds.push(userId);

      if (!teamIds.includes(doc.user_id) && doc.uploaded_by !== userId) {
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
