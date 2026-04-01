import TaskComment from "../models/taskComment.js";
import Task from "../models/task.js";
import Project from "../models/project.js";
import User from "../models/user.js";
//add comment
export const addComment = async (req, res) => {
  try {
    const { message } = req.body;
    const taskId = req.params.taskId;

    // Check if task exists and include project
    const task = await Task.findByPk(taskId, {
      include: [{ model: Project, as: "project", attributes: ["managerId"] }],
    });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Access control: only assigned employee or project manager
    const isEmployee =
      req.user.role === "employee" &&
      Number(task.assignedTo) === Number(req.user.id);
    const isManager =
      req.user.role === "manager" &&
      task.project &&
      Number(task.project.managerId) === Number(req.user.id);
    if (!isEmployee && !isManager) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const comment = await TaskComment.create({
      taskId,
      userId: req.user.id,
      message,
    });

    res.status(201).json({ message: "Comment added successfully", comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

//get comments for a task
export const getComments = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    // Check if task exists and include project
    const task = await Task.findByPk(taskId, {
      include: [{ model: Project, as: "project", attributes: ["managerId"] }],
    });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    // Access control: only assigned employee or project manager
    const isEmployee =
      req.user.role === "employee" &&
      Number(task.assignedTo) === Number(req.user.id);

    const isManager =
      req.user.role === "manager" &&
      task.project &&
      Number(task.project.managerId) === Number(req.user.id);

    if (!isEmployee && !isManager) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const comments = await TaskComment.findAll({
      where: { taskId },
      order: [["createdAt", "ASC"]],
      include:[
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "role"],
        },
      ],
    });

    const mapped = comments.map((c) => ({
        id: c.id,
        authorId: c.userId,
        authorName: c.user?.name || "unknown",
        role: c.user?.role || "employee",
        content: c.message,
        createdAt: c.createdAt,
    }));

    return res.status(200).json(mapped);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get comments" });
  }
};
