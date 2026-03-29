import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";

class TaskComment extends Model {}

TaskComment.init(
    {
        taskId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "task_id",
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "user_id",
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

    },

    {
        sequelize,
        modelName: "TaskComment",
        tableName: "task_comments",
    }
);

export default TaskComment;