import api from './api';

export const goalService = {
  getAll: (params) => api.get('/goals', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/goals/${id}`).then((r) => r.data),
  create: (data) => api.post('/goals', data).then((r) => r.data),
  update: (id, data) => api.put(`/goals/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/goals/${id}`).then((r) => r.data),
  addMilestone: (id, data) => api.post(`/goals/${id}/milestones`, data).then((r) => r.data),
  toggleMilestone: (id, milestoneId) => api.patch(`/goals/${id}/milestones/${milestoneId}`).then((r) => r.data),
  deleteMilestone: (id, milestoneId) => api.delete(`/goals/${id}/milestones/${milestoneId}`).then((r) => r.data),
};
