import api from './api';

export const taskService = {
  getAll: (params) => api.get('/tasks', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/tasks/${id}`).then((r) => r.data),
  create: (data) => api.post('/tasks', data).then((r) => r.data),
  update: (id, data) => api.put(`/tasks/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/tasks/${id}`).then((r) => r.data),
  toggle: (id) => api.patch(`/tasks/${id}/toggle`).then((r) => r.data),
  clearCompleted: () => api.delete('/tasks/clear-completed').then((r) => r.data),
};
