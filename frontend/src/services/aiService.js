import api from './api';

export const aiService = {
  getConversations: (params) => api.get('/ai/conversations', { params }).then((r) => r.data),
  getConversation: (id) => api.get(`/ai/conversations/${id}`).then((r) => r.data),
  renameConversation: (id, title) => api.patch(`/ai/conversations/${id}`, { title }).then((r) => r.data),
  deleteConversation: (id) => api.delete(`/ai/conversations/${id}`).then((r) => r.data),
  sendMessage: (payload) => api.post('/ai/chat', payload).then((r) => r.data),
};
