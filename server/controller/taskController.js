import Task from "../models/task.js";
import User from "../models/user.js";
import Project from "../models/project.js";

const toDbStatus = (status) => {
  if (!status) {
    return null;
  }

  const map = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
  };

  return map[String(status).toLowerCase()] || null;
};

const toApiStatus = (status) => {
  const map = {
    Pending: "pending",
    "In Progress": "in_progress",
    Completed: "completed",
  };

  return map[status] || "pending";
};

const toDbPriority = (priority) => {
  if (!priority) {
    return "Medium";
  }

  const map = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return map[String(priority).toLowerCase()] || null;
};

const toApiPriority = (priority) => {
  const map = {
    Low: "low",
    Medium: "medium",
    High: "high",
  };

  return map[priority] || "medium";
};

const normalizeTask = (task) => {
  const plain = task.toJSON();
  return {
    ...plain,
    status: toApiStatus(plain.status),
    priority: toApiPriority(plain.priority),
  };
};

// CREATE TASK
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, deadline, projectId } =
      req.body;

    if (req.user.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can create tasks" });
    }

    const assignedToId = Number.parseInt(String(assignedTo), 10);

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!Number.isInteger(assignedToId) || assignedToId <= 0) {
      return res
        .status(400)
        .json({ message: "assignedTo must be a valid user id" });
    }

    const assignee = await User.findByPk(assignedToId, {
      attributes: ["id", "role"],
    });

    if (!assignee) {
      return res.status(404).json({ message: "Assigned user not found" });
    }

    if (assignee.role !== "employee") {
      return res
        .status(400)
        .json({ message: "Tasks can only be assigned to employees" });
    }

    if (projectId === undefined || projectId === null || projectId === "") {
      return res
        .status(400)
        .json({ message: "projectId is required for task creation" });
    }

    const parsedProjectId = Number.parseInt(String(projectId), 10);
    if (!Number.isInteger(parsedProjectId) || parsedProjectId <= 0) {
      return res
        .status(400)
        .json({ message: "projectId must be a valid project id" });
    }

    const project = await Project.findByPk(parsedProjectId, {
      attributes: ["id", "managerId", "status"],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.status !== "in_progress") {
      return res
        .status(400)
        .json({
          message: "Tasks can only be created in projects that are in progress",
        });
    }

    if (project.managerId !== req.user.id) {
      return res.status(403).json({
        message: "Managers can only create tasks for their assigned projects",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ?? "",
      assignedTo: assignedToId,
      assignedBy: req.user.id, // Assuming you have user info in req.user
      projectId: parsedProjectId,
      priority: toDbPriority(priority) || "Medium",
      deadline: deadline ?? new Date(),
    });
    res.status(201).json(normalizeTask(task));
  } catch (error) {
    res.status(500).json({ message: "Failed to create task" });
  }
};

// GET ALL TASKS
export const getAllTasks = async (req, res) => {
  try {
    let tasks = [];

    if (req.user.role === "admin") {
      tasks = await Task.findAll({
        order: [["id", "DESC"]],
      });
    } else if (req.user.role === "manager") {
      tasks = await Task.findAll({
        include: [
          {
            model: Project,
            as: "project",
            required: true,
            attributes: ["id", "name", "managerId"],
            where: { managerId: req.user.id },
          },
        ],
        order: [["id", "DESC"]],
      });
    } else {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.status(200).json(tasks.map(normalizeTask));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

//GET MY Tasks
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { assignedTo: req.user.id },
    });
    res.status(200).json(tasks.map(normalizeTask));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

// UPDATE TASK STATUS
export const updateTask = async (req, res) => {
  try {
    const { status, employeeComment } = req.body;
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.assignedTo !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Employees can only update their own tasks" });
    }

    if (status !== undefined) {
      const mappedStatus = toDbStatus(status);
      if (!mappedStatus) {
        return res.status(400).json({ message: "Invalid task status" });
      }
      task.status = mappedStatus;
    }

    if (employeeComment !== undefined) {
      task.employeeComment = String(employeeComment);
    }

    await task.save();
    res.status(200).json({
      task: normalizeTask(task),
      message: "Task updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update task" });
  }
};

// DELETE TASK BY ADMIN AND MANAGER
export const deleteTask = async (req, res) => {
  try {
    return res.status(403).json({
      message: "Task deletion is disabled. Admin task access is read-only.",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task" });
  }
};
