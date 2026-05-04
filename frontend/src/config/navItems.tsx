export type NavItem = {
  name: string;
  key: string;
  path: string;
  nameKey: string;
};

export type AppRole = "admin" | "manager" | "employee";

const adminNavItems: NavItem[] = [
  {
    name: "Dashboard",
    key: "dashboard",
    path: "/dashboard",
    nameKey: "nav.dashboard",
  },
  {
    name: "Attendance",
    key: "attendance",
    path: "/attendance",
    nameKey: "nav.attendance",
  },
  {
    name: "Departments",
    key: "departments",
    path: "/departments",
    nameKey: "nav.departments",
  },
  {
    name: "Managers",
    key: "managers",
    path: "/manager",
    nameKey: "nav.managers",
  },
  {
    name: "Employees",
    key: "employee",
    path: "/employee",
    nameKey: "nav.employees",
  },
  {
    name: "Documents",
    key: "documents",
    path: "/documents",
    nameKey: "nav.documents",
  },
  {
    name: "Projects",
    key: "projects",
    path: "/projects",
    nameKey: "nav.projects",
  },
  { name: "Leaves", key: "leaves", path: "/leaves", nameKey: "nav.leaves" },
  { name: "Salary", key: "salary", path: "/salary", nameKey: "nav.salary" },
  { name: "Payroll", key: "payroll", path: "/payroll", nameKey: "nav.payroll" },
  { name: "Reports", key: "reports", path: "/reports", nameKey: "nav.reports" },
  {
    name: "Settings",
    key: "settings",
    path: "/settings",
    nameKey: "nav.settings",
  },
  { name: "Logout", key: "logout", path: "/logout", nameKey: "nav.logout" },
];

const managerNavItems: NavItem[] = [
  {
    name: "Dashboard",
    key: "dashboard",
    path: "/dashboard",
    nameKey: "nav.dashboard",
  },
  {
    name: "Attendance",
    key: "attendance",
    path: "/attendance",
    nameKey: "nav.attendance",
  },
  {
    name: "My Team",
    key: "employee",
    path: "/employee",
    nameKey: "nav.myTeam",
  },
  {
    name: "Team-Documents",
    key: "documents",
    path: "/documents",
    nameKey: "nav.teamDocuments",
  },
  {
    name: "Projects",
    key: "projects",
    path: "/projects",
    nameKey: "nav.projects",
  },
  { name: "Leaves", key: "leaves", path: "/leaves", nameKey: "nav.leaves" },
  {
    name: "My Payslip",
    key: "pay slips",
    path: "/pay-slips",
    nameKey: "nav.payslips",
  },
  { name: "Reports", key: "reports", path: "/reports", nameKey: "nav.reports" },
  {
    name: "Settings",
    key: "settings",
    path: "/settings",
    nameKey: "nav.settings",
  },
  { name: "Logout", key: "logout", path: "/logout", nameKey: "nav.logout" },
];

const employeeNavItems: NavItem[] = [
  {
    name: "Dashboard",
    key: "dashboard",
    path: "/dashboard",
    nameKey: "nav.dashboard",
  },
  {
    name: "My Attendance",
    key: "my-attendance",
    path: "/my-attendance",
    nameKey: "nav.myAttendance",
  },
  { name: "Tasks", key: "tasks", path: "/tasks", nameKey: "nav.tasks" },
  {
    name: "My-Documents",
    key: "documents",
    path: "/documents",
    nameKey: "nav.myDocuments",
  },
  { name: "Leaves", key: "leaves", path: "/leaves", nameKey: "nav.leaves" },
  {
    name: "My Payslip",
    key: "pay slips",
    path: "/pay-slips",
    nameKey: "nav.payslips",
  },
  { name: "Reports", key: "reports", path: "/reports", nameKey: "nav.reports" },
  {
    name: "Settings",
    key: "settings",
    path: "/settings",
    nameKey: "nav.settings",
  },
  { name: "Logout", key: "logout", path: "/logout", nameKey: "nav.logout" },
];

export const getNavItemsByRole = (role: string | null): NavItem[] => {
  if (role === "admin") {
    return adminNavItems;
  }

  if (role === "manager") {
    return managerNavItems;
  }

  if (role === "employee") {
    return employeeNavItems;
  }

  return employeeNavItems;
};
