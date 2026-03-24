// Centralized model associations.
import User from "./user.js";
import Task from "./task.js";
import Project from "./project.js";

// User <-> Project relationships
User.hasMany(Project, { foreignKey: "createdBy", as: "createdProjects" });
Project.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

User.hasMany(Project, { foreignKey: "managerId", as: "managedProjects" });
Project.belongsTo(User, { foreignKey: "managerId", as: "manager" });

// Project <-> Task relationships
Project.hasMany(Task, { foreignKey: "projectId", as: "tasks" });
Task.belongsTo(Project, { foreignKey: "projectId", as: "project" });

export { User, Task, Project };
