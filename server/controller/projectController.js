import Project from "../models/project.js";
import User from "../models/user.js";

const allowedStatuses = new Set(["pending", "in_progress", "complete"]);

const parseDate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildProjectPayload = async (body, { partial = false } = {}) => {
  const payload = {};

  if (!partial || body.name !== undefined) {
    const name = String(body.name ?? "").trim();
    if (!name) {
      return { error: "Project name is required" };
    }
    payload.name = name;
  }

  if (body.description !== undefined) {
    payload.description = String(body.description ?? "").trim();
  }

  const rawManagerId = body.managerId ?? body.manager_id;
  if (!partial || rawManagerId !== undefined) {
    const managerId = Number.parseInt(String(rawManagerId), 10);
    if (!Number.isInteger(managerId) || managerId <= 0) {
      return { error: "managerId must be a valid manager user id" };
    }

    const manager = await User.findByPk(managerId, {
      attributes: ["id", "role"],
    });

    if (!manager) {
      return { error: "Manager not found" };
    }

    if (manager.role !== "manager") {
      return { error: "managerId must belong to a manager user" };
    }

    payload.managerId = managerId;
  }

  const rawStartDate = body.startDate ?? body.start_date;
  if (!partial || rawStartDate !== undefined) {
    const startDate = parseDate(rawStartDate);
    if (!startDate) {
      return { error: "startDate must be a valid date" };
    }
    payload.startDate = startDate;
  }

  const rawEndDate = body.endDate ?? body.end_date;
  if (rawEndDate !== undefined) {
    const endDate = parseDate(rawEndDate);
    if (!endDate) {
      return { error: "endDate must be a valid date" };
    }
    payload.endDate = endDate;
  }

  if (body.status !== undefined) {
    const status = String(body.status).trim().toLowerCase();
    if (!allowedStatuses.has(status)) {
      return {
        error: "status must be one of: pending, in_progress, complete",
      };
    }
    payload.status = status;
  }

  const effectiveStartDate = payload.startDate;
  const effectiveEndDate = payload.endDate;
  if (
    effectiveStartDate &&
    effectiveEndDate &&
    effectiveEndDate < effectiveStartDate
  ) {
    return { error: "endDate must be greater than or equal to startDate" };
  }

  return { payload };
};

// Create project by admin only
export const createProject = async (req, res) => {
  try {
    const { payload, error } = await buildProjectPayload(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const project = await Project.create({
      ...payload,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      project,
      message: "Project created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create project" });
  }
};

// Get all projects
export const getProjects = async (req, res) => {
  try {
    const where = req.user.role === "manager" ? { managerId: req.user.id } : {};
    const projects = await Project.findAll({
      where,
      order: [["id", "DESC"]],
    });

    return res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch projects" });
  }
};

// Get single project
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (req.user.role === "manager" && project.managerId !== req.user.id) {
      return res.status(403).json({ message: "Not allowed." });
    }

    return res.status(200).json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch project" });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const { payload, error } = await buildProjectPayload(req.body, {
      partial: true,
    });

    if (error) {
      return res.status(400).json({ message: error });
    }

    const nextStartDate = payload.startDate ?? project.startDate;
    const nextEndDate = payload.endDate ?? project.endDate;
    if (nextStartDate && nextEndDate && nextEndDate < nextStartDate) {
      return res.status(400).json({
        message: "endDate must be greater than or equal to startDate",
      });
    }

    await project.update(payload);

    return res.status(200).json({
      project,
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update project" });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await project.destroy();

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete project" });
  }
};
