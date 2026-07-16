import api from './api';

export const studyPlanService = {
  getAll: () => api.get('/study-plans').then((r) => r.data),
  getActive: () => api.get('/study-plans/active').then((r) => r.data),
  getOne: (id) => api.get(`/study-plans/${id}`).then((r) => r.data),
  create: (data) => api.post('/study-plans', data).then((r) => r.data),
  update: (id, data) => api.put(`/study-plans/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/study-plans/${id}`).then((r) => r.data),
  addBlock: (id, data) => api.post(`/study-plans/${id}/blocks`, data).then((r) => r.data),
  updateBlock: (id, blockId, data) => api.put(`/study-plans/${id}/blocks/${blockId}`, data).then((r) => r.data),
  deleteBlock: (id, blockId) => api.delete(`/study-plans/${id}/blocks/${blockId}`).then((r) => r.data),
};
