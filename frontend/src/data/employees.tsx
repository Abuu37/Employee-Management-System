export type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "On Leave";
};

const employees: Employee[] = [
  {
    id: "EMP-1001",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "UI Engineer",
    status: "Active",
  },
  {
    id: "EMP-1002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Project Manager",
    status: "Active",
  },
  {
    id: "EMP-1003",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    role: "Backend Engineer",
    status: "On Leave",
  },
  {
    id: "EMP-1004",
    name: "Alice Williams",
    email: "alice.williams@example.com",
    role: "HR Specialist",
    status: "Active",
  },
  {
    id: "EMP-1005",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    role: "QA Engineer",
    status: "Active",
  },
];

export default employees;
