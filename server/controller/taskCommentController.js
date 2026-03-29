import TaskComment from "../models/taskComment.js";
import Task from "../models/task.js";

//add comment
export const addComment = async (req,res) => {
    try {
        const { message } = req.body;
        const taskId = req.params.taskId;

        // Check if task exists
        const task = await Task.findByPk(taskId);
        if(!task) {
            return res.status(404).json({ message: "Task not found" });
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
export const getComments = async (req,res) => {
    try {
        const taskId = req.params.taskId;
        
        const comments = await TaskComment.findAll({
            where: { taskId },
            order: [["createdAt", "ASC"]],
        });

        return res.status(200).json(comments);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to get comments" });
    
    }
}
