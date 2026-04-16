export type NavItem = {
  name: string;
  key: string;
  path: string;
};

export type AppRole = "admin" | "manager" | "employee";

const adminNavItems: NavItem[] = [
  { name: "Dashboard", key: "dashboard", path: "/dashboard" },
  { name: "Employees", key: "employee", path: "/employee" },
  { name: "Managers", key: "managers", path: "/manager" },
  { name: "Projects", key: "projects", path: "/projects" },
  { name: "leaves", key: "leaves", path: "/leaves"},
  { name: "Reports", key: "reports", path: "/reports" },
  { name: "Settings", key: "settings", path: "/settings" },
  { name: "Logout", key: "logout", path: "/logout" },
];

const managerNavItems: NavItem[] = [
  { name: "Dashboard", key: "dashboard", path: "/dashboard" },
  { name: "My Team", key: "employee", path: "/employee" },
  { name: "Projects", key: "projects", path: "/projects" },
  { name: "Leaves ", key: "leaves", path: "/leaves" },
  { name: "Reports", key: "reports", path: "/reports" },
  { name: "Settings", key: "settings", path: "/settings" },
  { name: "Logout", key: "logout", path: "/logout" },
];

const employeeNavItems: NavItem[] = [
  { name: "Dashboard", key: "dashboard", path: "/dashboard" },
  { name: "Tasks", key: "tasks", path: "/tasks" },
  { name: "Leaves", key: "leaves", path: "/leaves" },
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
