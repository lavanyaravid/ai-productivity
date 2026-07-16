import api from './api';

export const noteService = {
  getAll: (params) => api.get('/notes', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/notes/${id}`).then((r) => r.data),
  create: (data) => api.post('/notes', data).then((r) => r.data),
  update: (id, data) => api.put(`/notes/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/notes/${id}`).then((r) => r.data),
  togglePin: (id) => api.patch(`/notes/${id}/pin`).then((r) => r.data),
  toggleArchive: (id) => api.patch(`/notes/${id}/archive`).then((r) => r.data),
  uploadAttachment: (id, formData) =>
    api.post(`/notes/${id}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  uploadPdf: (id, formData) =>
    api.post(`/notes/${id}/pdf`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  downloadSummary: (id) => api.get(`/notes/${id}/ai-summary/download`, { responseType: 'blob' }),
};
