import api from './api';

export const sessionService = {
  getAll: (params) => api.get('/study-sessions', { params }).then((r) => r.data),
  create: (data) => api.post('/study-sessions', data).then((r) => r.data),
  remove: (id) => api.delete(`/study-sessions/${id}`).then((r) => r.data),
};

export const pomodoroService = {
  getAll: (params) => api.get('/pomodoro', { params }).then((r) => r.data),
  log: (data) => api.post('/pomodoro', data).then((r) => r.data),
  today: () => api.get('/pomodoro/today').then((r) => r.data),
};
