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
import Notification from "./Notification.js";
import Attendance from "./Attendance.js";
import Department from "./Department.js";

const nc = { constraints: false };

// Department <-> User (manager) relationship
Department.belongsTo(User, { foreignKey: "manager_id", as: "manager", ...nc });
User.hasOne(Department, {
  foreignKey: "manager_id",
  as: "managedDepartment",
  ...nc,
});

// User self-referential: reports_to (manager/supervisor chain)
User.belongsTo(User, { foreignKey: "reports_to", as: "supervisor", ...nc });
User.hasMany(User, { foreignKey: "reports_to", as: "directReports", ...nc });

// Department <-> User (employees) relationship
Department.hasMany(User, {
  foreignKey: "department_id",
  as: "employees",
  ...nc,
});
User.belongsTo(Department, { foreignKey: "department_id", as: "dept", ...nc });

// User <-> Attendance relationship
User.hasMany(Attendance, { foreignKey: "user_id", as: "attendances", ...nc });
Attendance.belongsTo(User, { foreignKey: "user_id", as: "user", ...nc });

// Leave <-> User relationship (employee who requested leave)
Leave.belongsTo(User, { foreignKey: "userId", as: "user", ...nc });
User.hasMany(Leave, { foreignKey: "userId", as: "leaves", ...nc });

// Leave <-> User relationship (backup / handover person)
Leave.belongsTo(User, {
  foreignKey: "backupEmployeeId",
  as: "backupEmployee",
  ...nc,
});

// User <-> Salary relationship
User.hasOne(Salary, { foreignKey: "user_id", as: "salary", ...nc });
Salary.belongsTo(User, { foreignKey: "user_id", as: "user", ...nc });

// User <-> Payroll relationship
User.hasMany(Payroll, { foreignKey: "user_id", as: "payrolls", ...nc });
Payroll.belongsTo(User, { foreignKey: "user_id", as: "user", ...nc });

// User <-> Document relationships
User.hasMany(Document, { foreignKey: "user_id", as: "documents", ...nc });
Document.belongsTo(User, { foreignKey: "user_id", as: "owner", ...nc });

User.hasMany(Document, {
  foreignKey: "uploaded_by",
  as: "uploadedDocuments",
  ...nc,
});
Document.belongsTo(User, { foreignKey: "uploaded_by", as: "uploader", ...nc });

// User <-> Project relationships
User.hasMany(Project, {
  foreignKey: "createdBy",
  as: "createdProjects",
  ...nc,
});
Project.belongsTo(User, { foreignKey: "createdBy", as: "creator", ...nc });

User.hasMany(Project, {
  foreignKey: "managerId",
  as: "managedProjects",
  ...nc,
});
Project.belongsTo(User, { foreignKey: "managerId", as: "manager", ...nc });

// Project <-> Task relationships
Project.hasMany(Task, { foreignKey: "projectId", as: "tasks", ...nc });
Task.belongsTo(Project, { foreignKey: "projectId", as: "project", ...nc });

// User <-> Task relationships (who assigned the task)
User.hasMany(Task, { foreignKey: "assignedBy", as: "assignedTasks", ...nc });
Task.belongsTo(User, { foreignKey: "assignedBy", as: "assigner", ...nc });

// User <-> Task relationships (who is responsible for the task)
TaskComment.belongsTo(User, { foreignKey: "userId", as: "user", ...nc });

User.hasMany(TaskComment, {
  foreignKey: "userId",
  as: "comments",
  ...nc,
});

// Task <-> TaskComment relationships
TaskComment.belongsTo(Task, { foreignKey: "taskId", as: "task", ...nc });
Task.hasMany(TaskComment, { foreignKey: "taskId", as: "comments", ...nc });

// Attendance <-> User relationships
User.hasMany(Attendance, { foreignKey: "user_id", ...nc });
// Notification <-> User
User.hasMany(Notification, {
  foreignKey: "user_id",
  as: "notifications",
  ...nc,
});
Notification.belongsTo(User, { foreignKey: "user_id", as: "user", ...nc });

Attendance.belongsTo(User, { foreignKey: "user_id", ...nc });

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
  Notification,
};
