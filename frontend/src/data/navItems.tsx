export type NavItem = {
  name: string;
  key: string;
  path: string;
};

const navItems: NavItem[] = [
  { name: "Dashboard", key: "dashboard", path: "/dashboard" },
  { name: "Employees", key: "employee", path: "/employee" },
  { name: "Managers", key: "managers", path: "/manager" },
  { name: "Tasks", key: "tasks", path: "/tasks" },
  { name: "Reports", key: "reports", path: "/reports" },
  { name: "Settings", key: "settings", path: "/settings" },
  { name: "Logout", key: "logout", path: "/logout" },
];

export default navItems;
