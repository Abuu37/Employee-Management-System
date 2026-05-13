import { useCallback, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { projectService } from "@/features/projects/services/project.service";
import { normalizeUsers } from "@/features/projects/utils/normalizeUsers";
import { normalizeProjects } from "@/features/projects/utils/normalizeProjects";
import type {
  FeedbackState,
  ManagerOption,
  ProjectFormValues,
  ProjectItem,
  RawProject,
  RawUser,
} from "@/features/projects/types/project.types";
import { useProjectStats } from "@/features/projects/hooks/useProjectStats";

export const useProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [users, setUsers] = useState<RawUser[]>([]);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { stats, setStats, refreshStats } = useProjectStats();

  const userNameById = useMemo(() => {
    const map = new Map<number, string>();
    users.forEach((u) => map.set(u.id, u.name));
    return map;
  }, [users]);

  const employeeOptions = useMemo(
    () =>
      users
        .filter((u) => u.role === "employee")
        .map((u) => ({ id: u.id, name: u.name })),
    [users],
  );

  //====== Load projects, users, and stats when the component mounts=====
  const loadProjects = useCallback(async () => {
    // Fetch users, projects, and stats in parallel to optimize loading time
    const [rawUsers, rawProjects, statsPayload] = await Promise.all([
      projectService.getUsers(),
      projectService.getProjects(),
      refreshStats(),
    ]);

    // Normalize and set users, managers, projects, and stats in state
    const usersData = normalizeUsers(rawUsers);
    setUsers(usersData);
    setManagers(
      usersData
        .filter((u) => u.role === "manager")
        .map((m) => ({ id: m.id, name: m.name })),
    );

    const freshNameById = new Map<number, string>(
      usersData.map((u) => [u.id, u.name]),
    );
    const projectsPayload = Array.isArray(rawProjects)
      ? (rawProjects as RawProject[])
      : [];
    setProjects(normalizeProjects(projectsPayload, freshNameById));
    setStats(
      statsPayload ?? {
        total: projectsPayload.length,
        inProgress: projectsPayload.filter((p) => p.status === "in_progress")
          .length,
        completed: projectsPayload.filter((p) => p.status === "complete")
          .length,
        pending: projectsPayload.filter((p) => p.status === "pending").length,
      },
    );
  }, [refreshStats, setStats]);

  const loadInitial = useCallback(async () => {
    try {
      await loadProjects();
      setError("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 400) {
          localStorage.removeItem("token");
          localStorage.removeItem("user-role");
          navigate("/login");
          return;
        }

        const msg = err.response?.data?.message || "Failed to load projects";
        setError(msg);
        toast.error(msg);
        return;
      }

      setError("Failed to load projects");
      toast.error("Failed to load projects");
    }
  }, [loadProjects, navigate]);

  const createProject = useCallback(
    async (formValues: ProjectFormValues) => {
      try {
        setIsCreating(true);
        setFeedback(null);
        await projectService.createProject(formValues);
        await loadProjects();
        setFeedback({
          type: "success",
          message: `${formValues.name} created successfully.`,
        });
        toast.success(`${formValues.name} created successfully`);
        return true;
      } catch (err) {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.message || "Failed to create project."
          : "Failed to create project.";
        setFeedback({ type: "error", message: msg });
        toast.error(msg);
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [loadProjects],
  );

  const editProject = useCallback(
    async (
      activeProject: ProjectItem | null,
      formValues: ProjectFormValues,
    ) => {
      if (!activeProject) return false;

      try {
        setIsSaving(true);
        setFeedback(null);
        await projectService.updateProject(activeProject.id, formValues);
        await loadProjects();
        setFeedback({
          type: "success",
          message: `${formValues.name} updated successfully.`,
        });
        toast.success(`${formValues.name} updated successfully`);
        return true;
      } catch (err) {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.message || "Failed to update project."
          : "Failed to update project.";
        setFeedback({ type: "error", message: msg });
        toast.error(msg);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [loadProjects],
  );

  const removeProject = useCallback(
    async (activeProject: ProjectItem | null) => {
      if (!activeProject) return false;

      try {
        setIsDeleting(true);
        setFeedback(null);
        await projectService.deleteProject(activeProject.id);
        setProjects((current) =>
          current.filter((p) => p.id !== activeProject.id),
        );
        setFeedback({
          type: "success",
          message: `${activeProject.name} deleted successfully.`,
        });
        toast.success(`${activeProject.name} deleted successfully`);
        await refreshStats();
        return true;
      } catch (err) {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.message || "Failed to delete project."
          : "Failed to delete project.";
        setFeedback({ type: "error", message: msg });
        toast.error(msg);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [refreshStats],
  );

  const updateStatus = useCallback(
    async (project: ProjectItem, status: string) => {
      try {
        await projectService.updateProjectStatus(project.id, status);
        await loadProjects();
        setFeedback({
          type: "success",
          message: `Status updated for ${project.name}.`,
        });
        toast.success(`Status updated for ${project.name}`);
      } catch (err) {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.message || "Failed to update status."
          : "Failed to update status.";
        setFeedback({ type: "error", message: msg });
        toast.error(msg);
      }
    },
    [loadProjects],
  );

  return {
    projects,
    managers,
    users,
    stats,
    error,
    feedback,
    isCreating,
    isSaving,
    isDeleting,
    userNameById,
    employeeOptions,
    setFeedback,
    loadInitial,
    loadProjects,
    createProject,
    editProject,
    removeProject,
    updateStatus,
  };
};
