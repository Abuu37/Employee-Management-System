// Centralized model associations.
import User from "./user.js";
import Task from "./task.js";
import Project from "./project.js";
import TaskComment from "./taskComment.js";


// User <-> Project relationships
User.hasMany(Project, { foreignKey: "createdBy", as: "createdProjects" });
Project.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

User.hasMany(Project, { foreignKey: "managerId", as: "managedProjects" });
Project.belongsTo(User, { foreignKey: "managerId", as: "manager" });

// Project <-> Task relationships
Project.hasMany(Task, { foreignKey: "projectId", as: "tasks" });
Task.belongsTo(Project, { foreignKey: "projectId", as: "project" });

// User <-> Task relationships (who assigned the task)
User.hasMany(Task, { foreignKey: "assignedBy", as: "assignedTasks" });
Task.belongsTo(User, { foreignKey: "assignedBy", as: "assigner" });


TaskComment.belongsTo(User,
  {foreignKey: "userId", 
    as: "user"
});

User.hasMany(TaskComment, 
    {
        foreignKey: "userId", 
        as: "comments"
    });

TaskComment.belongsTo(Task, {foreignKey: "taskId", as: "task"});
Task.hasMany(TaskComment, {foreignKey: "taskId", as: "comments"});


export { User, Task, Project };
