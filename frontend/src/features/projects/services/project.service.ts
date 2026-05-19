import api from "@/services/axios";
import type {
  ProjectFormValues,
  ProjectListResponse,
  ProjectQueryParams,
  ProjectStats,
  ProjectStatus,
  RawUser,
} from "@/features/projects/types/project.types";

export const projectService = {
  // Fetch all users to populate manager and employee dropdowns in the UI
  getUsers: async () => {
    const res = await api.get(`/user/view-users`);
    return res.data;
  },

  // Fetch all projects with optional server-side filtering and pagination
  getProjects: async (
    params?: ProjectQueryParams,
  ): Promise<ProjectListResponse> => {
    const res = await api.get(`/project/all`, { params });
    return res.data as ProjectListResponse;
  },

  // Fetch project statistics for dashboard display
  getProjectStats: async () => {
    const res = await api.get(`/project/stats`);
    return res.data as ProjectStats;
  },

  // Create a new project with the provided form values
  createProject: async (payload: ProjectFormValues) => {
    const res = await api.post(`/project/create`, {
      name: payload.name,
      code: payload.code || undefined,
      description: payload.description,
      managerId: payload.managerId,
      startDate: payload.startDate,
      endDate: payload.endDate || undefined,
      status: payload.status,
      priority: payload.priority,
    });
    return res.data;
  },

  // Update an existing project with the provided form values
  updateProject: async (id: number, payload: ProjectFormValues) => {
    const res = await api.put(`/project/update/${id}`, {
      name: payload.name,
      code: payload.code || undefined,
      description: payload.description,
      managerId: payload.managerId,
      startDate: payload.startDate,
      endDate: payload.endDate || undefined,
      status: payload.status,
      priority: payload.priority,
    });
    return res.data;
  },

  // Update the status of an existing project
  updateProjectStatus: async (id: number, status: ProjectStatus | string) => {
    const res = await api.put(`/project/update/${id}`, { status });
    return res.data;
  },

  // Delete a project by its ID
  deleteProject: async (id: number) => {
    const res = await api.delete(`/project/delete/${id}`);
    return res.data;
  },
};
