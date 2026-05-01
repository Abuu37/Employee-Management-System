import axios from "@/services/axios";

const BASE = "/departments";

export const departmentService = {
  getStats: () => axios.get(`${BASE}/stats`).then((r) => r.data),

  getAll: () => axios.get(BASE).then((r) => r.data),
  getById: (id: number) => axios.get(`${BASE}/${id}`).then((r) => r.data),
  create: (data: object) => axios.post(BASE, data).then((r) => r.data),
  update: (id: number, data: object) =>
    axios.put(`${BASE}/${id}`, data).then((r) => r.data),
  delete: (id: number) => axios.delete(`${BASE}/${id}`).then((r) => r.data),
  toggleStatus: (id: number) =>
    axios.patch(`${BASE}/${id}/toggle-status`).then((r) => r.data),
  assignManager: (id: number, manager_id: number) =>
    axios
      .patch(`${BASE}/${id}/assign-manager`, { manager_id })
      .then((r) => r.data),
};
