export type NavItem = {
  name: string;
  key: string;
  path: string;
};

export type AppRole = "admin" | "manager" | "employee";

const adminNavItems: NavItem[] = [
  { name: "Dashboard", key: "dashboard", path: "/dashboard" },
  { name: "Attendance", key: "attendance", path: "/attendance" },
  { name: "Employees", key: "employee", path: "/employee" },
  { name: "Managers", key: "managers", path: "/manager" },
  { name: "Documents", key: "documents", path: "/documents" },
  { name: "Projects", key: "projects", path: "/projects" },
  { name: "Leaves", key: "leaves", path: "/leaves"},
  { name: "Salary", key: "salary", path: "/salary" },
  { name: "Payroll", key: "payroll", path: "/payroll" },
  { name: "Reports", key: "reports", path: "/reports" },
  { name: "Settings", key: "settings", path: "/settings" },
  { name: "Logout", key: "logout", path: "/logout" },
];

const managerNavItems: NavItem[] = [
  { name: "Dashboard", key: "dashboard", path: "/dashboard" },
  { name: "Attendance", key: "attendance", path: "/attendance" },
  { name: "My Team", key: "employee", path: "/employee" },
  { name: "Team-Documents", key: "documents", path: "/documents" },
  { name: "Projects", key: "projects", path: "/projects" },
  { name: "Leaves", key: "leaves", path: "/leaves" },
  { name: "My Payslip", key: "pay slips", path: "/pay-slips" },
  { name: "Team Payroll", key: "payroll", path: "/payroll" },
  { name: "Reports", key: "reports", path: "/reports" },
  { name: "Settings", key: "settings", path: "/settings" },
  { name: "Logout", key: "logout", path: "/logout" },
];

const employeeNavItems: NavItem[] = [
  { name: "Dashboard", key: "dashboard", path: "/dashboard" },
  {name: "My Attendance", key: "my-attendance", path: "/my-attendance" },
  { name: "Tasks", key: "tasks", path: "/tasks" },
  { name: "My-Documents", key: "documents", path: "/documents" },
  { name: "Leaves", key: "leaves", path: "/leaves" },
  { name : "My Payslip", key: "pay slips", path: "/pay-slips" },
  { name: "Reports", key: "reports", path: "/reports" },
  { name: "Settings", key: "settings", path: "/settings" },
  { name: "Logout", key: "logout", path: "/logout" },
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
