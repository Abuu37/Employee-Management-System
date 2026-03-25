import Task from "../models/task.js";
import Project from "../models/project.js";
import User from "../models/user.js";

const toDbStatus = (status) => {
  if (!status) {
    return null;
  }

  const map = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    complete: "Completed",
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

// Create task (manager only)
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, deadline, projectId } =
      req.body;

    const assignedToId = Number.parseInt(String(assignedTo), 10);
    const parsedProjectId = Number.parseInt(String(projectId), 10);

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!Number.isInteger(assignedToId) || assignedToId <= 0) {
      return res
        .status(400)
        .json({ message: "assignedTo must be a valid user id" });
    }

    if (!Number.isInteger(parsedProjectId) || parsedProjectId <= 0) {
      return res
        .status(400)
        .json({ message: "projectId must be a valid project id" });
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

    const mappedPriority = toDbPriority(priority);
    if (!mappedPriority) {
      return res.status(400).json({ message: "Invalid task priority" });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ?? "",
      assignedTo: assignedToId,
      assignedBy: req.user.id,
      projectId: parsedProjectId,
      priority: mappedPriority,
      deadline: deadline ?? null,
    });

    return res.status(201).json(normalizeTask(task));
  } catch (error) {
    return res.status(500).json({ message: "Failed to create task" });
  }
};

// Get all tasks (admin and manager)
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

    return res.status(200).json(tasks.map(normalizeTask));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

// Get tasks by project
export const getTasksByProject = async (req, res) => {
  try {
    const projectId = Number.parseInt(String(req.params.project_id), 10);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({ message: "Invalid project id" });
    }

    const project = await Project.findByPk(projectId, {
      attributes: ["id", "managerId"],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (req.user.role === "manager" && project.managerId !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const tasks = await Task.findAll({
      where: { projectId },
      order: [["id", "DESC"]],
    });

    return res.status(200).json(tasks.map(normalizeTask));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

// Employee - get assigned tasks
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { assignedTo: req.user.id },
      order: [["id", "DESC"]],
    });

    return res.status(200).json(tasks.map(normalizeTask));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

// Manager - update task details
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: "project",
          required: false,
          attributes: ["id", "managerId"],
        },
      ],
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!task.project || task.project.managerId !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const { title, description, assignedTo, priority, deadline, status } =
      req.body;

    if (title !== undefined) {
      const nextTitle = String(title).trim();
      if (!nextTitle) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      task.title = nextTitle;
    }

    if (description !== undefined) {
      task.description = String(description);
    }

    if (assignedTo !== undefined) {
      const assignedToId = Number.parseInt(String(assignedTo), 10);
      if (!Number.isInteger(assignedToId) || assignedToId <= 0) {
        return res
          .status(400)
          .json({ message: "assignedTo must be a valid user id" });
      }

      const assignee = await User.findByPk(assignedToId, {
        attributes: ["id", "role"],
      });

      if (!assignee || assignee.role !== "employee") {
        return res
          .status(400)
          .json({ message: "Tasks can only be assigned to employees" });
      }

      task.assignedTo = assignedToId;
    }

    if (priority !== undefined) {
      const mappedPriority = toDbPriority(priority);
      if (!mappedPriority) {
        return res.status(400).json({ message: "Invalid task priority" });
      }
      task.priority = mappedPriority;
    }

    if (status !== undefined) {
      const mappedStatus = toDbStatus(status);
      if (!mappedStatus) {
        return res.status(400).json({ message: "Invalid task status" });
      }
      task.status = mappedStatus;
    }

    if (deadline !== undefined) {
      task.deadline = deadline || null;
    }

    await task.save();
    return res
      .status(200)
      .json({
        message: "Task updated successfully",
        task: normalizeTask(task),
      });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update task" });
  }
};

// Employee - update task status/comment
export const updateTaskStatus = async (req, res) => {
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
    return res
      .status(200)
      .json({
        message: "Task updated successfully",
        task: normalizeTask(task),
      });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update task" });
  }
};

// Delete task (admin or owning manager)
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: "project",
          required: false,
          attributes: ["id", "managerId"],
        },
      ],
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (
      req.user.role !== "admin" &&
      (!task.project || task.project.managerId !== req.user.id)
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await task.destroy();
    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete task" });
  }
};
