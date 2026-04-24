import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import ProjectTable from "../components/projects/ProjectTable";
import ProjectForm from "../components/projects/ProjectForm";
import ProjectDetails from "../components/projects/ProjectDetails";
import DeleteProjectModal from "../components/projects/DeleteProjectModal";
import StatCard from "../components/attendance/StatCard";
import type { TaskFormValues } from "../components/tasks/TaskFormModal";
import type {
  ManagerOption,
  ProjectFormValues,
  ProjectItem,
  ProjectTask,
} from "../components/projects/types";
import {
  FiFolder,
  FiClock,
  FiCheckCircle,
  FiSearch,
  FiList,
} from "react-icons/fi";

const PROJECT_API = "http://localhost:5000/api/project";
const USER_API = "http://localhost:5000/api/user";
const TASK_API = "http://localhost:5000/api/task";

type RawProject = {
  id: number;
  name: string;
  description?: string | null;
  managerId?: number;
  manager_id?: number;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  status?: ProjectItem["status"];
};

type RawUser = {
  id: number;
  name: string;
  role: string;
};

type RawTask = {
  id: number;
  title: string;
  description?: string;
  projectId?: number;
  project_id?: number;
  assignedTo: number;
  status: string;
  deadline?: string;
};

// Helper function to normalize user data, ensuring consistent structure(ensure not return null or undefined)
const normalizeUsers = (payload: unknown): RawUser[] => {
  if (Array.isArray(payload)) {
    return payload as RawUser[];
  }

  if (payload && typeof payload === "object") {
    return [payload as RawUser];
  }

  return [];
};

function Projects() {
  // Handler to update project status
  const handleUpdateStatus = async (project: ProjectItem, status: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.put(
        `${PROJECT_API}/update/${project.id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      await fetchUsersAndProjects();
      setFeedback({
        type: "success",
        message: `Status updated for ${project.name}.`,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFeedback({
          type: "error",
          message: err.response?.data?.message || "Failed to update status.",
        });
      } else {
        setFeedback({ type: "error", message: "Failed to update status." });
      }
    }
  };
  // Delete a specific task by id
  const handleDeleteTask = async (taskId: number) => {
    const token = localStorage.getItem("token");
    if (!token || !activeProject) {
      navigate("/login");
      return;
    }
    try {
      await axios.delete(`${TASK_API}/delete/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchTasks(activeProject.id);
      setFeedback({ type: "success", message: "Task deleted successfully." });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFeedback({
          type: "error",
          message: err.response?.data?.message || "Failed to delete task.",
        });
      } else {
        setFeedback({ type: "error", message: "Failed to delete task." });
      }
    }
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [users, setUsers] = useState<RawUser[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const employeeOptions = users
    .filter((user) => user.role === "employee")
    .map((user) => ({ id: user.id, name: user.name }));

  // Build a map of userId to userName for quick lookup when normalizing projects and tasks
  const userNameById = useMemo(() => {
    const map = new Map<number, string>();
    users.forEach((user) => {
      map.set(user.id, user.name);
    });
    return map;
  }, [users]);

  // Normalize projects to ensure consistent field naming and to enrich with managerName
  const normalizeProjects = (data: RawProject[]): ProjectItem[] => {
    return data.map((project) => {
      const managerId = project.managerId ?? project.manager_id ?? 0;
      return {
        id: project.id,
        name: project.name,
        description: project.description ?? "",
        managerId,
        managerName: userNameById.get(managerId) || "Unknown Manager",
        startDate: project.startDate ?? project.start_date ?? "",
        endDate: project.endDate ?? project.end_date ?? "",
        status: project.status ?? "pending",
      };
    });
  };

  // Fetch users and projects in parallel, then normalize and set state
  const fetchUsersAndProjects = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const [usersResponse, projectsResponse] = await Promise.all([
      axios.get(`${USER_API}/view-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      axios.get(`${PROJECT_API}/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ]);

    // Normalize users and set state first so that we have the latest user data available when normalizing projects
    const usersData = normalizeUsers(usersResponse.data);
    setUsers(usersData);
    setManagers(
      usersData
        .filter((user) => user.role === "manager")
        .map((manager) => ({ id: manager.id, name: manager.name })),
    );

    // Build the name map directly from the fresh usersData so that
    // normalizeProjects does not read from the stale userNameById useMemo
    // (which still reflects the previous render's users state at this point).
    const freshNameById = new Map<number, string>(
      usersData.map((user) => [user.id, user.name]),
    );

    // Normalize projects using the fresh name map to ensure we display the most up-to-date manager names
    const normalizeWithFreshUsers = (data: RawProject[]): ProjectItem[] =>
      data.map((project) => {
        const managerId = project.managerId ?? project.manager_id ?? 0;
        return {
          id: project.id,
          name: project.name,
          description: project.description ?? "",
          managerId,
          managerName: freshNameById.get(managerId) || "Unknown Manager",
          startDate: project.startDate ?? project.start_date ?? "",
          endDate: project.endDate ?? project.end_date ?? "",
          status: project.status ?? "pending",
          deadline: project.deadline ?? project.deadline_date ?? "",
        };
      });

    setProjects(normalizeWithFreshUsers(projectsResponse.data as RawProject[]));
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchUsersAndProjects();
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401 || err.response?.status === 400) {
            localStorage.removeItem("token");
            localStorage.removeItem("user-role");
            navigate("/login");
            return;
          }

          setError(err.response?.data?.message || "Failed to load projects");
          return;
        }

        setError("Failed to load projects");
      }
    };

    load();
  }, [navigate]);

  const fetchTasks = async (projectId: number) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const response = await axios.get(`${TASK_API}/project/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const projectTasks = (response.data as RawTask[]).map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      assignedName: userNameById.get(task.assignedTo) || "Unknown User",
      status: task.status,
      deadline: task.deadline,
    }));

    setTasks(projectTasks);
  };

  //
  const closeAllModals = () => {
    setCreateOpen(false);
    setEditOpen(false);
    setViewOpen(false);
    setDeleteOpen(false);
    setActiveProject(null);
    setTasks([]);
  };

  // Handlers for opening modals and performing CRUD operations
  const handleCreateOpen = () => {
    setFeedback(null);
    setCreateOpen(true);
  };

  const handleViewOpen = async (project: ProjectItem) => {
    setFeedback(null);
    setActiveProject(project);
    setViewOpen(true);

    try {
      await fetchTasks(project.id);
    } catch {
      setTasks([]);
    }
  };

  const handleCreateTask = async (values: TaskFormValues) => {
    if (!activeProject) {
      throw new Error("No active project selected");
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      throw new Error("Missing token");
    }

    try {
      setFeedback(null);

      await axios.post(
        `${TASK_API}/create`,
        {
          title: values.title,
          description: values.description,
          assignedTo: values.assignedTo,
          priority: values.priority,
          deadline: values.deadline || null,
          projectId: activeProject.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchTasks(activeProject.id);
      setFeedback({
        type: "success",
        message: "Task created successfully.",
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFeedback({
          type: "error",
          message: err.response?.data?.message || "Failed to create task.",
        });
      } else {
        setFeedback({ type: "error", message: "Failed to create task." });
      }

      throw err;
    }
  };

  const handleEditOpen = (project: ProjectItem) => {
    setFeedback(null);
    setActiveProject(project);
    setEditOpen(true);
  };

  const handleDeleteOpen = (project: ProjectItem) => {
    setFeedback(null);
    setActiveProject(project);
    setDeleteOpen(true);
  };

  const handleCreate = async (formValues: ProjectFormValues) => {
    try {
      setIsCreating(true);
      setFeedback(null);

      const token = localStorage.getItem("token");

      await axios.post(
        `${PROJECT_API}/create`,
        {
          name: formValues.name,
          description: formValues.description,
          managerId: formValues.managerId,
          startDate: formValues.startDate,
          endDate: formValues.endDate || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchUsersAndProjects();
      setFeedback({
        type: "success",
        message: `${formValues.name} created successfully.`,
      });
      closeAllModals();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFeedback({
          type: "error",
          message: err.response?.data?.message || "Failed to create project.",
        });
      } else {
        setFeedback({ type: "error", message: "Failed to create project." });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = async (formValues: ProjectFormValues) => {
    if (!activeProject) {
      return;
    }

    try {
      setIsSaving(true);
      setFeedback(null);

      const token = localStorage.getItem("token");

      await axios.put(
        `${PROJECT_API}/update/${activeProject.id}`,
        {
          name: formValues.name,
          description: formValues.description,
          managerId: formValues.managerId,
          startDate: formValues.startDate,
          endDate: formValues.endDate || undefined,
          status: formValues.status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchUsersAndProjects();
      setFeedback({
        type: "success",
        message: `${formValues.name} updated successfully.`,
      });
      closeAllModals();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFeedback({
          type: "error",
          message: err.response?.data?.message || "Failed to update project.",
        });
      } else {
        setFeedback({ type: "error", message: "Failed to update project." });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeProject) {
      return;
    }

    try {
      setIsDeleting(true);
      setFeedback(null);

      const token = localStorage.getItem("token");

      await axios.delete(`${PROJECT_API}/delete/${activeProject.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProjects((current) =>
        current.filter((project) => project.id !== activeProject.id),
      );
      setFeedback({
        type: "success",
        message: `${activeProject.name} deleted successfully.`,
      });
      closeAllModals();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFeedback({
          type: "error",
          message: err.response?.data?.message || "Failed to delete project.",
        });
      } else {
        setFeedback({ type: "error", message: "Failed to delete project." });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const displayedProjects = projects.filter((project) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) {
      return true;
    }

    return (
      project.name.toLowerCase().includes(query) ||
      project.managerName.toLowerCase().includes(query) ||
      project.status.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-auto">
        <Header searchTerm="" onSearchChange={() => {}} />

        <div className="p-6 space-y-5">
          {/* Page header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage and track all ongoing projects
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Projects"
              value={projects.length}
              icon={<FiFolder />}
              color=""
              featured
              subtitle="All projects"
            />
            <StatCard
              label="In Progress"
              value={
                projects.filter(
                  (p) =>
                    p.status === "in_progress" || p.status === "in progress",
                ).length
              }
              icon={<FiClock />}
              color="bg-blue-100 text-blue-600"
              subtitle="Currently active"
            />
            <StatCard
              label="Completed"
              value={projects.filter((p) => p.status === "completed").length}
              icon={<FiCheckCircle />}
              color="bg-emerald-100 text-emerald-600"
              subtitle="Finished projects"
            />
            <StatCard
              label="Pending"
              value={projects.filter((p) => p.status === "pending").length}
              icon={<FiList />}
              color="bg-amber-100 text-amber-600"
              subtitle="Not yet started"
            />
          </div>

          {/* Search bar */}
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {error ? (
            <p className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </p>
          ) : null}
          {feedback ? (
            <p
              className={`mb-4 rounded-2xl px-5 py-4 text-sm ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {feedback.message}
            </p>
          ) : null}

          <ProjectTable
            title="Projects"
            projects={displayedProjects}
            emptyMessage="No projects found."
            onAdd={handleCreateOpen}
            onView={handleViewOpen}
            onEdit={handleEditOpen}
            onDelete={handleDeleteOpen}
            onUpdateStatus={handleUpdateStatus}
          />

          <ProjectForm
            isOpen={createOpen}
            onClose={closeAllModals}
            onSave={handleCreate}
            managers={managers}
            isSaving={isCreating}
          />
          <ProjectForm
            isOpen={editOpen}
            onClose={closeAllModals}
            onSave={handleEdit}
            managers={managers}
            isSaving={isSaving}
            project={activeProject}
          />
          <ProjectDetails
            isOpen={viewOpen}
            onClose={closeAllModals}
            project={activeProject}
            tasks={tasks}
            assignees={employeeOptions}
            onCreateTask={handleCreateTask}
            onDeleteTask={handleDeleteTask}
          />
          <DeleteProjectModal
            isOpen={deleteOpen}
            onClose={closeAllModals}
            onConfirm={handleDelete}
            project={activeProject}
            isDeleting={isDeleting}
          />
        </div>
      </main>
    </div>
  );
}

export default Projects;
