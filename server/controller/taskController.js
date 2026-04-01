import Task from "../models/task.js";
import Project from "../models/project.js";
import User from "../models/user.js";

const toDbStatus = (status) => {
  if (!status) return null;

  const value = String(status).toLowerCase().trim();

  if (value === "pending") return "pending";
  if (value === "in_progress" || value === "in progress") return "in_progress";
  if (value === "completed") return "completed";

  return null;
};

const toApiStatus = (status) => {
  if (!status) return "pending";
  return status;
};

// Priority is always lowercase: "low", "medium", "high"
const toDbPriority = (priority) => {
  if (!priority) return "medium";
  const p = String(priority).toLowerCase();
  if (["low", "medium", "high"].includes(p)) return p;
  return null;
};

// Priority is always lowercase: "low", "medium", "high"
const toApiPriority = (priority) => {
  if (!priority) return "medium";
  const p = String(priority).toLowerCase();
  if (["low", "medium", "high"].includes(p)) return p;
  return "medium";
};

// Normalize task object for API response
const normalizeTask = (task) => {
  const plain = task.toJSON();
  return {
    ...plain,
    status: toApiStatus(plain.status),
    priority: toApiPriority(plain.priority), // always lowercase now
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
      return res.status(400).json({
        message: "Tasks can only be created in projects that are in progress",
      });
    }

    if (project.managerId !== req.user.id) {
      return res.status(403).json({
        message: "Managers can only create tasks for their assigned projects",
      });
    }

    // Always set a valid status (default to 'pending')
    let statusValue = toDbStatus(req.body.status) || "pending";
    if (!["pending", "in_progress", "completed"].includes(statusValue)) {
      return res.status(400).json({ message: "Invalid task status" });
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
      priority: mappedPriority, // always lowercase
      deadline: deadline ?? null,
      status: statusValue,
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
      include: [
        {
          model: Project,
          as: "project",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "assigner",
          attributes: ["id", "name"],
        },
      ],
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
      task.priority = mappedPriority; // always lowercase
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
    return res.status(200).json({
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

    console.log("Incoming status:", status); // Debug log
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (Number(task.assignedTo) !== Number(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Employees can only update their own tasks" });
    }

    if (status !== undefined) {
      const mappedStatus = toDbStatus(status);

      console.log("Mapped status:", mappedStatus); // Debug log

      if (!mappedStatus) {
        return res.status(400).json({ message: "Invalid task status" });
      }
      task.status = mappedStatus;
    }

    if (employeeComment !== undefined) {
      task.employeeComment = String(employeeComment);
    }

    await task.save();

    console.log("Saved status in DB:", task.status); // Debug log

    return res.status(200).json({
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

// Get a single task by ID (employee or manager)
export const getTaskByIdForUser = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: "project",
          required: false,
          attributes: ["id", "name", "managerId"],
        },
      ],
    });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    // Allow if the user is assigned to this task (employee) or is the project manager (manager)
    const isEmployee = req.user.role === "employee" &&  Number(task.assignedTo) === Number(req.user.id);
    const isManager =  req.user.role === "manager" && task.project && Number(task.project.managerId) === Number(req.user.id);

    if (!isEmployee && !isManager) {
      return res.status(403).json({ message: "Not allowed" });
    }
    
    return res.json({
      id: task.id,
      title: task.title,
      description: task.description,
      status: toApiStatus(task.status),
      priority: toApiPriority(task.priority),
      deadline: task.deadline,
      project: task.project
        ? { id: task.project.id, name: task.project.name }
        : null,
      assigner: task.project ? { id: task.project.managerId } : null,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
