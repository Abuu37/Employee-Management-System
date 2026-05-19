import { useCallback, useMemo, useRef, useState } from "react";
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
  ProjectQueryParams,
  RawUser,
} from "@/features/projects/types/project.types";
import { useProjectStats } from "@/features/projects/hooks/useProjectStats";
import { clearAuthSession } from "@/features/auth/services/authSession";

export const useProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [users, setUsers] = useState<RawUser[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { stats, setStats, refreshStats } = useProjectStats();

  // Cached user map — kept in a ref so fetchProjects can use it without it
  // appearing as a dependency (users are loaded once on mount)
  const userNameByIdRef = useRef<Map<number, string>>(new Map());

  const userNameById = useMemo(() => {
    const map = new Map<number, string>();
    users.forEach((u) => map.set(u.id, u.name));
    userNameByIdRef.current = map;
    return map;
  }, [users]);

  const employeeOptions = useMemo(
    () =>
      users
        .filter((u) => u.role === "employee")
        .map((u) => ({ id: u.id, name: u.name })),
    [users],
  );

  // ─── Load users + managers once on mount ────────────────────────────────
  const loadUsers = useCallback(async () => {
    const rawUsers = await projectService.getUsers();
    const usersData = normalizeUsers(rawUsers);
    setUsers(usersData);
    setManagers(
      usersData
        .filter((u) => u.role === "manager")
        .map((m) => ({ id: m.id, name: m.name })),
    );
    const map = new Map<number, string>(usersData.map((u) => [u.id, u.name]));
    userNameByIdRef.current = map;
    return map;
  }, []);

  // ─── Fetch projects with server-side filter/sort/page params ────────────
  const fetchProjects = useCallback(
    async (params: ProjectQueryParams, nameMap?: Map<number, string>) => {
      setLoading(true);
      try {
        const response = await projectService.getProjects(params);
        const map = nameMap ?? userNameByIdRef.current;
        setProjects(normalizeProjects(response.data, map));
        setTotalPages(response.totalPages);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ─── Initial load: users + stats + first page of projects ───────────────
  const loadInitial = useCallback(async () => {
    try {
      const [nameMap, statsPayload] = await Promise.all([
        loadUsers(),
        refreshStats(),
      ]);
      await fetchProjects(
        { page: 1, limit: 10, sortBy: "id", sortOrder: "DESC" },
        nameMap,
      );
      if (statsPayload) setStats(statsPayload);
      setError("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 400) {
          clearAuthSession();
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
  }, [loadUsers, fetchProjects, refreshStats, setStats, navigate]);

  // ─── Re-fetch projects (after CUD) with current params ──────────────────
  const reloadProjects = useCallback(
    async (params: ProjectQueryParams) => {
      await fetchProjects(params);
      await refreshStats();
    },
    [fetchProjects, refreshStats],
  );
  const createProject = useCallback(
    async (formValues: ProjectFormValues, params: ProjectQueryParams = {}) => {
      try {
        setIsCreating(true);
        setFeedback(null);
        await projectService.createProject(formValues);
        await reloadProjects(params);
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
    [reloadProjects],
  );

  const editProject = useCallback(
    async (
      activeProject: ProjectItem | null,
      formValues: ProjectFormValues,
      params: ProjectQueryParams = {},
    ) => {
      if (!activeProject) return false;
      try {
        setIsSaving(true);
        setFeedback(null);
        await projectService.updateProject(activeProject.id, formValues);
        await reloadProjects(params);
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
    [reloadProjects],
  );

  const removeProject = useCallback(
    async (
      activeProject: ProjectItem | null,
      params: ProjectQueryParams = {},
    ) => {
      if (!activeProject) return false;
      try {
        setIsDeleting(true);
        setFeedback(null);
        await projectService.deleteProject(activeProject.id);
        setFeedback({
          type: "success",
          message: `${activeProject.name} deleted successfully.`,
        });
        toast.success(`${activeProject.name} deleted successfully`);
        await reloadProjects(params);
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
    [reloadProjects],
  );

  const updateStatus = useCallback(
    async (
      project: ProjectItem,
      status: string,
      params: ProjectQueryParams = {},
    ) => {
      try {
        await projectService.updateProjectStatus(project.id, status);
        await reloadProjects(params);
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
    [reloadProjects],
  );

  return {
    projects,
    managers,
    stats,
    error,
    feedback,
    loading,
    isCreating,
    isSaving,
    isDeleting,
    totalPages,
    userNameById,
    employeeOptions,
    setFeedback,
    loadInitial,
    fetchProjects,
    reloadProjects,
    createProject,
    editProject,
    removeProject,
    updateStatus,
  };
};
