// models/index.js

// Centralized model associations.
import Task from "./task.js";
import Project from "./project.js";
import TaskComment from "./taskComment.js";
import User from "./user.js";
import Holiday from "./Holiday.js";
import Salary from "./salary.js";
import Payroll from "./payroll.js";
import Document from "./document.js";
import Leave from "./Leave.js";
import LeaveBalance from "./LeaveBalance.js";
import Attendance from "./Attendance.js";

// User <-> Attendance relationship
User.hasMany(Attendance, { foreignKey: "user_id", as: "attendances" });
Attendance.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Leave <-> User relationship (employee who requested leave)
Leave.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Leave, { foreignKey: "userId", as: "leaves" });

// Leave <-> User relationship (manager who approved leave)
Leave.belongsTo(User, { foreignKey: "approvedBy", as: "approver" });

// User <-> Salary relationship
User.hasOne(Salary, { foreignKey: "user_id", as: "salary" });
Salary.belongsTo(User, { foreignKey: "user_id", as: "user" });

// User <-> Payroll relationship
User.hasMany(Payroll, { foreignKey: "user_id", as: "payrolls" });
Payroll.belongsTo(User, { foreignKey: "user_id", as: "user" });

// User <-> Document relationships
User.hasMany(Document, { foreignKey: "user_id", as: "documents" });
Document.belongsTo(User, { foreignKey: "user_id", as: "owner" });

User.hasMany(Document, { foreignKey: "uploaded_by", as: "uploadedDocuments" });
Document.belongsTo(User, { foreignKey: "uploaded_by", as: "uploader" });

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

// User <-> Task relationships (who is responsible for the task)
TaskComment.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(TaskComment, {
  foreignKey: "userId",
  as: "comments",
});

// Task <-> TaskComment relationships
TaskComment.belongsTo(Task, { foreignKey: "taskId", as: "task" });
Task.hasMany(TaskComment, { foreignKey: "taskId", as: "comments" });

// Attendance <-> User relationships
User.hasMany(Attendance, { foreignKey: "user_id" });
Attendance.belongsTo(User, { foreignKey: "user_id" });

export {
  User,
  Task,
  Project,
  Leave,
  LeaveBalance,
  Salary,
  Payroll,
  Document,
  TaskComment,
  Attendance,
};
