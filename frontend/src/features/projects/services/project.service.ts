import api from "@/services/axios";
import type {
  ProjectFormValues,
  ProjectStats,
  ProjectStatus,
  RawProject,
  RawUser,
} from "@/features/projects/types/project.types";

export const projectService = {
  // Fetch all users to populate manager and employee dropdowns in the UI
  getUsers: async () => {
    const res = await api.get(`/user/view-users`);
    return res.data;
  },

  // Fetch all projects
  getProjects: async () => {
    const res = await api.get(`/project/all`);
    return res.data;
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
      description: payload.description,
      managerId: payload.managerId,
      startDate: payload.startDate,
      endDate: payload.endDate || undefined,
    });
    return res.data;
  },

  // Update an existing project with the provided form values
  updateProject: async (id: number, payload: ProjectFormValues) => {
    const res = await api.put(`/project/update/${id}`, {
      name: payload.name,
      description: payload.description,
      managerId: payload.managerId,
      startDate: payload.startDate,
      endDate: payload.endDate || undefined,
      status: payload.status,
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
