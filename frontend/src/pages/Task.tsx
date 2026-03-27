import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import TaskTable, { type TaskItem } from "../components/tasks/TaskTable";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TASK_API = "http://localhost:5000/api/task";

type RawTask = {
  id: number;
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  deadline?: string;
  project?: { id: number; name: string } | null;
  assigner?: { id: number; name: string } | null;
};

const normalizeStatus = (status?: string): TaskItem["status"] => {
  if (status === "in_progress") {
    return "in_progress";
  }

  if (status === "completed" || status === "complete") {
    return "completed";
  }

  return "pending";
};

const normalizePriority = (priority?: string): TaskItem["priority"] => {
  if (!priority) return "medium";

  const p = priority.toLowerCase();
  if (p === "low" || p === "medium" || p === "high") {
    return p;
  }
  return "medium";
};


function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const fetchMyTasks = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("user-role");

    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "employee") {
      setError("Only employees can view this page.");
      setTasks([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${TASK_API}/mytasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const normalized = (response.data as RawTask[]).map((task) => ({
        id: task.id,
        title: task.title,
        projectName: task.project?.name ?? "-",
        assignedByName: task.assigner?.name ?? "-",
        description: task.description ?? "",
        status: normalizeStatus(task.status),
        priority: normalizePriority(task.priority),
        deadline: task.deadline ?? "",
      }));

      setTasks(normalized);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user-role");
          navigate("/login");
          return;
        }

        setError(err.response?.data?.message || "Failed to load tasks.");
      } else {
        setError("Failed to load tasks.");
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    taskId: number,
    newStatus: TaskItem["status"],
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setUpdatingId(taskId);
    try {
      await axios.put(
        `${TASK_API}/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
      );
      await fetchMyTasks();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to update status.");
      } else {
        setError("Failed to update status.");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const displayedTasks = tasks.filter((task) => {
    const query = searchTerm.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.status.toLowerCase().includes(query) ||
      task.priority.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6">
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {error ? (
          <p className="mb-4 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <TaskTable
          title="My Assigned Tasks"
          tasks={displayedTasks}
          loading={loading}
          updatingId={updatingId}
          emptyMessage="No assigned tasks found."
          onStatusChange={handleStatusChange}
        />
      </main>
    </div>
  );
}

export default Tasks;
