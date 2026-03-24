import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import ProjectTable from "../components/projects/ProjectTable";
import ProjectForm from "../components/projects/ProjectForm";
import ProjectDetails from "../components/projects/ProjectDetails";
import DeleteProjectModal from "../components/projects/DeleteProjectModal";
import type {
  ManagerOption,
  ProjectFormValues,
  ProjectItem,
  ProjectTask,
} from "../components/projects/types";

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
  projectId?: number;
  project_id?: number;
  assignedTo: number;
  status: string;
};

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

  const userNameById = useMemo(() => {
    const map = new Map<number, string>();
    users.forEach((user) => {
      map.set(user.id, user.name);
    });
    return map;
  }, [users]);

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

  const closeAllModals = () => {
    setCreateOpen(false);
    setEditOpen(false);
    setViewOpen(false);
    setDeleteOpen(false);
    setActiveProject(null);
    setTasks([]);
  };

  const handleCreateOpen = () => {
    setFeedback(null);
    setCreateOpen(true);
  };

  const handleViewOpen = async (project: ProjectItem) => {
    setFeedback(null);
    setActiveProject(project);
    setViewOpen(true);

    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    try {
      const response = await axios.get(`${TASK_API}/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const allTasks = response.data as RawTask[];
      const filteredTasks = allTasks
        .filter((task) => {
          const projectId = task.projectId ?? task.project_id;
          return projectId === project.id;
        })
        .map((task) => ({
          id: task.id,
          title: task.title,
          assignedTo: task.assignedTo,
          assignedName: userNameById.get(task.assignedTo) || "Unknown User",
          status: task.status,
        }));

      setTasks(filteredTasks);
    } catch {
      setTasks([]);
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

      <main className="flex-1 p-6">
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {error ? (
          <p className="mb-4 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
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
        />
        <DeleteProjectModal
          isOpen={deleteOpen}
          onClose={closeAllModals}
          onConfirm={handleDelete}
          project={activeProject}
          isDeleting={isDeleting}
        />
      </main>
    </div>
  );
}

export default Projects;
